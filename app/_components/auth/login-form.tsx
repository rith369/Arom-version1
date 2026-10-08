"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LockKeyhole, Mail } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  loginSchema,
  type AuthErrorBody,
  type AuthErrorCode,
  type LoginValues,
} from "@/lib/auth";
import { AuthInput, FormAlert } from "./auth-input";
import { useAuth } from "../auth-provider";

const loginErrors: Partial<Record<AuthErrorCode, string>> = {
  invalid_credentials: "That email and password do not match an AROM account.",
  email_not_confirmed: "Please confirm your email first. Check your inbox for the link.",
  rate_limited: "Too many attempts. Please wait a moment and try again.",
};

/** Only same site paths, so `?next=` cannot send users off AROM. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function SocialMark({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={20}
      height={20}
      className="size-5 shrink-0 object-contain"
      unoptimized
    />
  );
}

export function LoginForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const [notice, setNotice] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    setNotice(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as AuthErrorBody | null;
        const code = body?.error.code;
        setError("root", {
          type: code ?? "server_error",
          message:
            (code && loginErrors[code]) ?? "We could not log you in. Please try again.",
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

    await refresh();
    router.replace(safeNext(searchParams.get("next")));
    router.refresh();
  });

  return (
    <div>
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-arom-accent">
          Welcome back
        </p>
        <h2 className="mt-2 text-[2rem] font-bold leading-tight tracking-[-0.045em] text-arom sm:text-[2.35rem]">
          Welcome Back
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted sm:text-[0.95rem]">
          Log in to continue your journey towards a healthier, happier you.
        </p>
      </header>

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-0.5">
        <AuthInput
          {...register("email")}
          id="login-email"
          label="Email"
          icon={Mail}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
        />

        <AuthInput
          {...register("password")}
          id="login-password"
          label="Password"
          icon={LockKeyhole}
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          revealable
          error={errors.password?.message}
        />

        <div className="-mt-1 flex items-center justify-end gap-4 pb-4">
          <button
            type="button"
            onClick={() => setNotice("Password reset is coming soon.")}
            className="rounded-md text-sm font-semibold text-arom transition-colors duration-150 hover:text-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
          >
            Forgot password?
          </button>
        </div>

        {errors.root?.message && <FormAlert tone="error">{errors.root.message}</FormAlert>}
        {notice && <FormAlert tone="success">{notice}</FormAlert>}
        {isSubmitSuccessful && !errors.root && (
          <FormAlert tone="success">
            <span className="flex items-center gap-2">
              <CheckCircle2 aria-hidden="true" size={18} /> Login successful. Opening your home…
            </span>
          </FormAlert>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={shouldReduceMotion || isSubmitting ? undefined : { scale: 0.985 }}
          transition={{ duration: 0.14 }}
          className="mt-4 flex h-[3.2rem] w-full items-center justify-center rounded-xl bg-arom px-5 text-[0.95rem] font-bold text-white shadow-[0_12px_28px_rgba(31,111,91,0.2)] transition-[background-color,box-shadow] duration-150 hover:bg-arom-deep hover:shadow-[0_14px_32px_rgba(31,111,91,0.26)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:opacity-65"
        >
          {isSubmitting ? "Checking your details…" : "Log In"}
        </motion.button>
      </form>

      <div className="my-6 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-arom-border" />
        <span className="text-xs font-medium text-ink-muted">Or continue with</span>
        <span className="h-px flex-1 bg-arom-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setNotice("Google sign in is coming soon.")}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-arom-border bg-white text-sm font-semibold text-ink shadow-sm transition-colors duration-150 hover:border-arom/35 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
        >
          <SocialMark src="/google.svg" /> Google
        </button>
        <button
          type="button"
          onClick={() => setNotice("Apple sign in is coming soon.")}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-arom-border bg-white text-sm font-semibold text-ink shadow-sm transition-colors duration-150 hover:border-arom/35 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
        >
          <SocialMark src="/Apple_light.svg" /> Apple
        </button>
      </div>

      <p className="mt-7 text-center text-sm text-ink-muted">
        New to AROM?{" "}
        <Link
          href="/signup"
          className="font-bold text-arom underline decoration-arom-border underline-offset-4 hover:text-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-6 text-center text-xs font-medium text-ink-muted/80">
        You’re not alone. A brighter tomorrow is possible.
      </p>
    </div>
  );
}
