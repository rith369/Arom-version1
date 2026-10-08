import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "../../_components/auth/auth-shell";
import { ConfirmEmailForm } from "../../_components/auth/confirm-email-form";

export const metadata: Metadata = {
  title: "Confirm your email",
  description: "Confirm your email to activate your AROM account.",
};

export default function ConfirmEmailPage() {
  return (
    <AuthShell mode="confirm">
      <Suspense>
        <ConfirmEmailForm />
      </Suspense>
    </AuthShell>
  );
}
