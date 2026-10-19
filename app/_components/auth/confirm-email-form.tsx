"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Inbox, KeyRound, LogIn, Mail, MailCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  PENDING_CONFIRMATION_KEY,
  resendSchema,
  verifyCodeSchema,
  type AuthErrorBody,
  type ResendValues,
  type VerifyCodeValues,
} from "@/lib/auth";
import { AuthInput, FormAlert } from "./auth-input";
import { useAuth } from "../auth-provider";

const RESEND_COOLDOWN_SECONDS = 60;

const steps = [
  "Open the email from AROM in your inbox.",
  "Tap the confirmation link, or type the 6 digit code below.",
  "You will be signed in and taken home.",
];

/**
 * The 6 digit code from the email, for people who open the email on another
 * device. Typing it here signs them in on this device.
 */
function CodeForm() {
  const { refresh } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyCodeValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { email: "", code: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    try {
      const pending = window.sessionStorage.getItem(PENDING_CONFIRMATION_KEY);
      if (pending) reset({ email: pending, code: "" });
    } catch {
      // Storage can be blocked. The user can type the email instead.
    }
  }, [reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as AuthErrorBody | null;
        setError("root", {
          message:
            body?.error.code === "rate_limited"
              ? "Too many attempts. Please wait a moment and try again."
              : "That code is not right or has expired. Check the newest email, or send a new one below.",
        });
        return;
      }
    } catch {
      setError("root", { message: "You seem to be offline. Check your connection and try again." });
      return;
    }

    try {
      window.sessionStorage.removeItem(PENDING_CONFIRMATION_KEY);
    } catch {
      // Not critical.
    }
    await refresh();
    // A full page load, not a client side move, so every part of the app that
    // saw the visitor as signed out (the plan, mood, care plan) loads again.
    window.location.replace("/");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-7 space-y-0.5 rounded-2xl border border-arom-border p-4">
      <p className="flex items-center gap-2 pb-3 text-sm font-semibold text-ink">
        <KeyRound aria-hidden="true" size={16} className="text-arom" />
        Have a code from the email?
      </p>
      <AuthInput
        {...register("email")}
        id="code-email"
        label="Email"
        icon={Mail}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
      />
      <AuthInput
        {...register("code")}
        id="confirm-code"
        label="6 digit code"
        icon={KeyRound}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="123456"
        error={errors.code?.message}
      />
      {errors.root?.message && <FormAlert tone="error">{errors.root.message}</FormAlert>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-xl border border-arom bg-white px-5 text-[0.95rem] font-bold text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:opacity-65"
      >
        {isSubmitting ? "Checking…" : "Confirm and log in"}
      </button>
    </form>
  );
}

export function ConfirmEmailForm() {
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const linkExpired = searchParams.get("status") === "expired";
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResendValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    try {
      const pending = window.sessionStorage.getItem(PENDING_CONFIRMATION_KEY);
      if (pending) reset({ email: pending });
    } catch {
      // Storage can be blocked. The user can type the email instead.
    }
  }, [reset]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const onSubmit = handleSubmit(async (values) => {
    setSent(false);

    try {
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as AuthErrorBody | null;
        if (body?.error.code === "rate_limited") setCooldown(RESEND_COOLDOWN_SECONDS);
        setError("root", {
          type: body?.error.code ?? "server_error",
          message:
            body?.error.code === "rate_limited"
              ? "Please wait a moment before asking for another email."
              : "We could not send the email. Please try again.",
        });
        return;
      }
    } catch {
      setError("root", {
        type: "network",
        message: "You seem to be offline. Check your connection and try again.",
      });
      return;
    }

    try {
      window.sessionStorage.setItem(PENDING_CONFIRMATION_KEY, values.email);
    } catch {
      // Not critical. Only used to prefill this field.
    }
    setSent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  });

  const resendDisabled = isSubmitting || cooldown > 0;

  return (
    <div>
      <header>
        <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-arom-wash text-arom">
          <MailCheck aria-hidden="true" size={26} />
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-arom-accent">
          {linkExpired ? "Link used or expired" : "One last step"}
        </p>
        <h2 className="mt-2 text-[2rem] font-bold leading-tight tracking-[-0.045em] text-arom sm:text-[2.35rem]">
          {linkExpired ? "This Link Can’t Be Used" : "Check Your Email"}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted sm:text-[0.95rem]">
          {linkExpired
            ? "Confirmation links work once and expire after a while. If you already confirmed your email, just log in. If not, send yourself a new link."
            : "We sent you an email with a confirmation link and a code. Open it to activate your account and keep your space private."}
        </p>
      </header>

      {linkExpired && (
        <Link
          href="/login"
          className="mt-7 flex h-[3.2rem] w-full items-center justify-center gap-2 rounded-xl bg-arom px-5 text-[0.95rem] font-bold text-white shadow-[0_12px_28px_rgba(31,111,91,0.2)] transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
        >
          <LogIn aria-hidden="true" size={18} />
          I already confirmed, log in
        </Link>
      )}

      {!linkExpired && (
        <ol className="mt-7 space-y-3 rounded-2xl border border-arom-border bg-arom-wash/60 p-4">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm leading-6 text-ink">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-arom shadow-sm">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      )}

      {!linkExpired && <CodeForm />}

      {linkExpired && (
        <p className="mt-7 text-sm font-semibold text-ink">Not confirmed yet? Get a new link.</p>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-0.5">
        <AuthInput
          {...register("email")}
          id="confirm-email"
          label="Email"
          icon={Mail}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
        />

        <p className="-mt-1 flex items-center gap-2 pb-4 text-xs leading-5 text-ink-muted">
          <Inbox aria-hidden="true" size={14} className="shrink-0" />
          Not there? Check your spam or promotions folder.
        </p>

        {errors.root?.message && <FormAlert tone="error">{errors.root.message}</FormAlert>}
        {sent && !errors.root && (
          <FormAlert tone="success">
            <span className="flex items-center gap-2">
              <CheckCircle2 aria-hidden="true" size={18} /> If this email needs confirming, a new
              link is on its way.
            </span>
          </FormAlert>
        )}

        <motion.button
          type="submit"
          disabled={resendDisabled}
          whileTap={shouldReduceMotion || resendDisabled ? undefined : { scale: 0.985 }}
          transition={{ duration: 0.14 }}
          className={`mt-4 flex h-[3.2rem] w-full items-center justify-center rounded-xl px-5 text-[0.95rem] font-bold transition-[background-color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:opacity-65 ${
            linkExpired
              ? "border border-arom bg-white text-arom hover:bg-arom-wash"
              : "bg-arom text-white shadow-[0_12px_28px_rgba(31,111,91,0.2)] hover:bg-arom-deep hover:shadow-[0_14px_32px_rgba(31,111,91,0.26)]"
          }`}
        >
          {isSubmitting
            ? "Sending…"
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : linkExpired
                ? "Send a New Link"
                : "Resend Email"}
        </motion.button>
      </form>

      {!linkExpired && (
      <p className="mt-7 text-center text-sm text-ink-muted">
        Already confirmed?{" "}
        <Link
          href="/login"
          className="font-bold text-arom underline decoration-arom-border underline-offset-4 hover:text-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
        >
          Log in
        </Link>
      </p>
      )}

      <p className="mt-3 text-center text-sm text-ink-muted">
        Wrong email?{" "}
        <Link
          href="/signup"
          className="font-semibold text-arom underline decoration-arom-border underline-offset-4 hover:text-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
        >
          Sign up again
        </Link>
      </p>
    </div>
  );
}
