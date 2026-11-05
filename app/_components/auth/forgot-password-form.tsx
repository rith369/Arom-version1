"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { resendSchema, type AuthErrorBody, type ResendValues } from "@/lib/auth";
import { AuthInput, FormAlert } from "./auth-input";

/** Asks for a reset link. The answer is the same for every email, so nobody can test which have accounts. */
export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResendValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as AuthErrorBody | null;
        setError("root", { message: body?.error.message ?? "We could not send the link. Please try again." });
        return;
      }
      setSentTo(values.email);
    } catch {
      setError("root", { message: "You seem to be offline. Check your connection and try again." });
    }
  });

  return (
    <div>
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-arom-accent">Password help</p>
        <h2 className="mt-2 text-[2rem] font-bold leading-tight tracking-[-0.045em] text-arom sm:text-[2.35rem]">
          Forgot your password?
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted sm:text-[0.95rem]">
          Enter your email and we will send you a link to choose a new one.
        </p>
      </header>

      {sentTo ? (
        <div className="mt-7 space-y-3">
          <FormAlert tone="success">
            If {sentTo} has an AROM account, a link is on its way. It can take a few minutes, so check your spam folder too.
          </FormAlert>
          <p className="text-sm leading-6 text-ink-muted">
            The link works once. If you usually log in with Google, you can keep doing that without a password.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-7 space-y-1">
          <AuthInput
            {...register("email")}
            id="forgot-email"
            label="Email"
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
          />
          {searchParams.get("expired") === "1" && !errors.root && (
            <FormAlert tone="error">That link has expired or was already used. Please ask for a new one.</FormAlert>
          )}
          {errors.root?.message && <FormAlert tone="error">{errors.root.message}</FormAlert>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex h-[3.2rem] w-full items-center justify-center rounded-xl bg-arom px-5 text-[0.95rem] font-bold text-white transition-colors hover:bg-arom-deep disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-7 text-center text-sm text-ink-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-bold text-arom underline decoration-arom-border underline-offset-4 hover:text-arom-deep">
          Log in
        </Link>
      </p>
    </div>
  );
}
