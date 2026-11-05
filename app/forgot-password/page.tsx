import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "../_components/auth/auth-shell";
import { ForgotPasswordForm } from "../_components/auth/forgot-password-form";
import { ForgotPasswordHelp } from "../_components/auth/forgot-password-help";
import { PASSWORD_RESET_EMAIL_ON } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Get back into your AROM account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell mode="login">
      {PASSWORD_RESET_EMAIL_ON ? (
        <Suspense>
          <ForgotPasswordForm />
        </Suspense>
      ) : (
        <ForgotPasswordHelp />
      )}
    </AuthShell>
  );
}
