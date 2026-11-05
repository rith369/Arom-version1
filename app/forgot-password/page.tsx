import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "../_components/auth/auth-shell";
import { ForgotPasswordForm } from "../_components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Get a link to choose a new AROM password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell mode="login">
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
