import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "../_components/auth/auth-shell";
import { LoginForm } from "../_components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to continue your AROM wellbeing journey.",
};

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
