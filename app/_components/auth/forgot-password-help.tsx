"use client";

import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SupportContact } from "../support-contacts";

/**
 * Shown instead of the reset email form while AROM has no email service of its
 * own: Supabase's built in email only reaches the team, so a form would promise
 * an email that never comes (BACKEND-HANDOFF.md section 40).
 */
export function ForgotPasswordHelp() {
  const [support, setSupport] = useState<SupportContact | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/crisis-resources")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { supportContact?: SupportContact } | null) => {
        if (active && data?.supportContact) setSupport(data.supportContact);
      })
      .catch(() => {
        // The page still explains what to do without the contact details.
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-arom-accent">Password help</p>
        <h2 className="mt-2 text-[2rem] font-bold leading-tight tracking-[-0.045em] text-arom sm:text-[2.35rem]">
          Forgot your password?
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted sm:text-[0.95rem]">
          We cannot send reset emails yet, but you can still get back into your account.
        </p>
      </header>

      <div className="mt-7 space-y-5 text-sm leading-6 text-ink">
        <section>
          <h3 className="font-bold">If your email is a Google or Gmail account</h3>
          <p className="mt-1 text-ink-muted">
            Go back to the login page and choose <strong className="font-semibold text-ink">Google</strong>. You will not
            need your AROM password.
          </p>
        </section>

        <section>
          <h3 className="font-bold">If it is not</h3>
          <p className="mt-1 text-ink-muted">Contact AROM support from the email address on your account.</p>
          {(support?.email || support?.phone) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {support.email && (
                <a
                  href={`mailto:${support.email}`}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-arom-border px-3 font-semibold text-arom hover:bg-arom-wash"
                >
                  <Mail size={16} aria-hidden="true" />
                  {support.email}
                </a>
              )}
              {support.phone && (
                <a
                  href={`tel:${support.phone}`}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-arom-border px-3 font-semibold text-arom hover:bg-arom-wash"
                >
                  <Phone size={16} aria-hidden="true" />
                  {support.phone}
                </a>
              )}
            </div>
          )}
        </section>
      </div>

      <Link
        href="/login"
        className="mt-7 flex h-[3.2rem] w-full items-center justify-center rounded-xl bg-arom px-5 text-[0.95rem] font-bold text-white transition-colors hover:bg-arom-deep"
      >
        Back to log in
      </Link>
    </div>
  );
}
