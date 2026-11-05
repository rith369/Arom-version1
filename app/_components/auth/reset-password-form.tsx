"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  newPasswordSchema,
  type AuthErrorBody,
  type LoginResponse,
  type NewPasswordValues,
} from "@/lib/auth";
import { AuthInput, FormAlert } from "./auth-input";
import { PasswordStrengthMeter } from "./password-strength";

/**
 * Chooses a new password from the emailed link. The one time token is only
 * used when this form is sent, so email scanners that open links cannot use it up.
 */
export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  // Kept here because the address is cleaned below.
  const [tokenHash] = useState(() => searchParams.get("token_hash"));

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });
  const password = useWatch({ control, name: "password" }) ?? "";

  // The token should not stay in the address bar or browser history.
  useEffect(() => {
    window.history.replaceState(null, "", "/reset-password");
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, tokenHash }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as AuthErrorBody | null;
        if (body?.error.code === "mfa_required") {
          // Accounts with an authenticator confirm a code, then change it in Profile.
          window.location.replace("/mfa?next=/profile");
          return;
        }
        setError("root", { message: body?.error.message ?? "Your password could not be saved. Please try again." });
        return;
      }
      const body = (await response.json().catch(() => null)) as LoginResponse | null;
      const role = body?.user.role;
      // A full page load, so every part of the app sees the signed in person.
      window.location.replace(role === "admin" ? "/admin" : role === "professional" ? "/pro" : "/");
    } catch {
      setError("root", { message: "You seem to be offline. Check your connection and try again." });
    }
  });

  return (
    <div>
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-arom-accent">Password help</p>
        <h2 className="mt-2 text-[2rem] font-bold leading-tight tracking-[-0.045em] text-arom sm:text-[2.35rem]">
          Choose a new password
        </h2>
      </header>

      {tokenHash ? (
        <form onSubmit={onSubmit} noValidate className="mt-7 space-y-0.5">
          <AuthInput
            {...register("password")}
            id="reset-password"
            label="New password"
            icon={LockKeyhole}
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            revealable
            invalid={Boolean(errors.password)}
            hint={<PasswordStrengthMeter value={password} />}
            error={errors.password?.message}
          />
          <AuthInput
            {...register("confirmPassword")}
            id="reset-confirm-password"
            label="Confirm new password"
            icon={LockKeyhole}
            type="password"
            autoComplete="new-password"
            placeholder="Type it again"
            revealable
            error={errors.confirmPassword?.message}
          />
          {errors.root?.message && <FormAlert tone="error">{errors.root.message}</FormAlert>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex h-[3.2rem] w-full items-center justify-center rounded-xl bg-arom px-5 text-[0.95rem] font-bold text-white transition-colors hover:bg-arom-deep disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Save new password"}
          </button>
        </form>
      ) : (
        <div className="mt-7">
          <FormAlert tone="error">This page only opens from the link in your email.</FormAlert>
        </div>
      )}

      <p className="mt-7 text-center text-sm text-ink-muted">
        Need a new link?{" "}
        <Link href="/forgot-password" className="font-bold text-arom underline decoration-arom-border underline-offset-4 hover:text-arom-deep">
          Ask for one
        </Link>
      </p>
    </div>
  );
}
