import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "../_components/auth/auth-shell";
import { MfaForm } from "../_components/auth/mfa-form";

export const metadata: Metadata = {
  title: "Confirm it's you",
  robots: { index: false, follow: false },
};

// Admins pass through here before /admin (lib/supabase/proxy.ts). Their first
// visit sets up an authenticator app, later visits ask for its code.
export default function MfaPage() {
  return (
    <AuthShell mode="login">
      <Suspense>
        <MfaForm />
      </Suspense>
    </AuthShell>
  );
}
