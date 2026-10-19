"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { safeNextPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

// Log in or sign up with Google. The same button does both: Supabase creates
// the account the first time (the sign up trigger makes the profile with the
// Google name). People come back to /auth/confirm, which signs them in and
// takes them to the page they came from, or their start page.

export function useGoogleSignIn() {
  const searchParams = useSearchParams();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "google" ? "Google sign in did not finish. Please try again." : null,
  );

  async function start() {
    if (starting) return;
    setError(null);
    setStarting(true);
    const next = searchParams.get("next");
    const back = new URL("/auth/confirm", window.location.origin);
    back.searchParams.set("provider", "google");
    if (next) back.searchParams.set("next", safeNextPath(next));
    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: back.toString() },
    });
    if (oauthError) {
      setStarting(false);
      setError("Google sign in is not available right now. Please use your email instead.");
    }
  }

  return { start, starting, error };
}

export function GoogleButton({ onClick, starting }: { onClick: () => void; starting: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={starting}
      aria-busy={starting}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-arom-border bg-white text-sm font-semibold text-ink shadow-sm transition-colors duration-150 hover:border-arom/35 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:opacity-65"
    >
      <Image src="/google.svg" alt="" width={20} height={20} className="size-5 shrink-0 object-contain" unoptimized />
      {starting ? "Opening Google…" : "Google"}
    </button>
  );
}
