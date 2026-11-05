"use client";

import { KeyRound } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { safeNextPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { AuthInput, FormAlert } from "./auth-input";

type Step =
  | { kind: "loading" }
  | { kind: "setup"; factorId: string; qrCode: string; secret: string }
  | { kind: "confirm"; factorId: string }
  | { kind: "failed"; reason: string };

/**
 * Admin second step. Without an authenticator app yet, this shows a QR code to
 * set one up. With one, it asks for the current 6 digit code. Either way a
 * right code upgrades the session to `aal2`, which the admin area requires.
 * English only: only the AROM team sees it.
 */
export function MfaForm() {
  const searchParams = useSearchParams();
  const destination = safeNextPath(searchParams.get("next"), "/admin");
  const [step, setStep] = useState<Step>({ kind: "loading" });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  // Enrolling is not repeatable, and React runs effects twice in development.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function begin() {
      const { mfa } = createClient().auth;

      const level = await mfa.getAuthenticatorAssuranceLevel();
      if (level.data?.currentLevel === "aal2") {
        window.location.replace(destination);
        return;
      }

      const factors = await mfa.listFactors();
      if (factors.error) {
        setStep({ kind: "failed", reason: factors.error.message });
        return;
      }

      const verified = factors.data.totp[0];
      if (verified) {
        setStep({ kind: "confirm", factorId: verified.id });
        return;
      }

      // A setup that was started and never finished cannot be finished now.
      for (const factor of factors.data.all) {
        if (factor.status === "unverified") await mfa.unenroll({ factorId: factor.id });
      }

      // The issuer is the name shown in the authenticator app. Without it, Supabase
      // works it out from the project's Site URL and fails if that has no https://.
      const enrolled = await mfa.enroll({
        factorType: "totp",
        issuer: "AROM",
        friendlyName: `AROM admin ${Date.now()}`,
      });
      if (enrolled.error) {
        setStep({ kind: "failed", reason: enrolled.error.message });
        return;
      }
      setStep({
        kind: "setup",
        factorId: enrolled.data.id,
        qrCode: enrolled.data.totp.qr_code,
        secret: enrolled.data.totp.secret,
      });
    }

    begin().catch(() => setStep({ kind: "failed", reason: "The connection failed." }));
  }, [destination]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "setup" && step.kind !== "confirm") return;

    const typed = code.trim();
    if (!/^\d{6}$/.test(typed)) {
      setError("Enter the 6 digit code from your authenticator app.");
      return;
    }

    setError(null);
    setChecking(true);
    const { error: verifyError } = await createClient().auth.mfa.challengeAndVerify({
      factorId: step.factorId,
      code: typed,
    });
    if (verifyError) {
      setChecking(false);
      setCode("");
      setError("That code did not work. Check your app and try the newest code.");
      return;
    }

    // A full page load, so the server sees the upgraded session.
    window.location.replace(destination);
  }

  return (
    <div>
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-arom-accent">Admin security</p>
        <h2 className="mt-2 text-[2rem] font-bold leading-tight tracking-[-0.045em] text-arom sm:text-[2.35rem]">
          {step.kind === "setup" ? "Set up your authenticator app" : "Confirm it's you"}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted sm:text-[0.95rem]">
          {step.kind === "setup"
            ? "Admin accounts can see private information about people, so they need a second step at login, not only a password."
            : "Enter the code from your authenticator app to open the admin area."}
        </p>
      </header>

      {step.kind === "loading" && (
        <p role="status" className="mt-8 text-sm text-ink-muted">
          Loading…
        </p>
      )}

      {step.kind === "failed" && (
        <div className="mt-8">
          <FormAlert tone="error">
            This could not be loaded: {step.reason} Refresh the page. If it keeps happening, tell the person who manages
            AROM's Supabase project.
          </FormAlert>
        </div>
      )}

      {step.kind === "setup" && (
        <ol className="mt-6 space-y-5 text-sm leading-6 text-ink">
          <li>
            <strong>1. Scan this code</strong> with an authenticator app, such as Google Authenticator or Microsoft
            Authenticator.
            <div className="mt-3 w-fit rounded-2xl border border-arom-border bg-white p-3">
              <Image src={step.qrCode} alt="QR code for your authenticator app" width={176} height={176} unoptimized />
            </div>
            <p className="mt-3 text-xs text-ink-muted">Cannot scan it? Type this key into the app instead:</p>
            <code className="mt-1 block break-all rounded-lg bg-arom-wash px-3 py-2 text-xs text-ink">{step.secret}</code>
          </li>
          <li>
            <strong>2. Enter the 6 digit code</strong> the app shows.
          </li>
        </ol>
      )}

      {(step.kind === "setup" || step.kind === "confirm") && (
        <form onSubmit={(event) => void submit(event)} noValidate className="mt-6 space-y-4">
          <AuthInput
            id="mfa-code"
            label="6 digit code"
            icon={KeyRound}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoFocus
          />
          {error && <FormAlert tone="error">{error}</FormAlert>}
          <button
            type="submit"
            disabled={checking}
            className="flex h-[3.2rem] w-full items-center justify-center rounded-xl bg-arom px-5 text-[0.95rem] font-bold text-white transition-colors hover:bg-arom-deep disabled:opacity-60"
          >
            {checking ? "Checking…" : "Continue"}
          </button>
        </form>
      )}

      <form action="/api/auth/logout" method="post" className="mt-6 text-center">
        <button type="submit" className="text-sm font-semibold text-arom underline-offset-4 hover:underline">
          Log out
        </button>
      </form>
      <p className="mt-3 text-center text-xs leading-5 text-ink-muted">
        Lost your phone? Another AROM admin with Supabase access can reset your second step.
      </p>
    </div>
  );
}
