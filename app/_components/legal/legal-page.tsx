"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher, useLanguage } from "../language-provider";
import {
  CRISIS_NOTE,
  LEGAL_EMAIL,
  LEGAL_UPDATED,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  PRIVACY_TITLE,
  TERMS_INTRO,
  TERMS_SECTIONS,
  TERMS_TITLE,
} from "./legal-content";

/** The public Terms and Privacy pages. Text lives in legal-content.ts. */
export function LegalPage({ page }: { page: "privacy" | "terms" }) {
  const { language } = useLanguage();
  const km = language === "km";
  const pick = (text: { km: string; en: string }) => (km ? text.km : text.en);

  const title = page === "privacy" ? PRIVACY_TITLE : TERMS_TITLE;
  const intro = page === "privacy" ? PRIVACY_INTRO : TERMS_INTRO;
  const sections = page === "privacy" ? PRIVACY_SECTIONS : TERMS_SECTIONS;
  const other =
    page === "privacy"
      ? { href: "/terms", label: TERMS_TITLE }
      : { href: "/privacy", label: PRIVACY_TITLE };

  return (
    <div className="min-h-[100svh] bg-white">
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-arom hover:text-arom-deep">
            <ArrowLeft size={16} aria-hidden="true" />
            {km ? "ទំព័រដើម" : "Home"}
          </Link>
          <LanguageSwitcher />
        </div>

        <h1 className="mt-8 text-3xl font-bold leading-tight tracking-[-0.03em] text-arom sm:text-4xl">{pick(title)}</h1>
        <p className="mt-2 text-xs text-ink-muted">
          {km ? "ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ " : "Last updated: "}
          {pick(LEGAL_UPDATED)}
        </p>
        <p className="mt-5 text-[0.95rem] leading-7 text-ink">{pick(intro)}</p>

        <p role="note" className="mt-5 rounded-2xl bg-arom-danger-soft p-4 text-sm leading-6 text-ink">
          {pick(CRISIS_NOTE)}
        </p>

        {sections.map((section) => (
          <section key={section.title.en} className="mt-8">
            <h2 className="text-lg font-bold text-ink">{pick(section.title)}</h2>
            {section.body?.map((text) => (
              <p key={text.en} className="mt-2 text-sm leading-7 text-ink">
                {pick(text)}
              </p>
            ))}
            {section.items && (
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-ink">
                {section.items.map((text) => (
                  <li key={text.en}>{pick(text)}</li>
                ))}
              </ul>
            )}
            {section.after?.map((text) => (
              <p key={text.en} className="mt-2 text-sm leading-7 text-ink">
                {pick(text)}
              </p>
            ))}
          </section>
        ))}

        <a
          href={`mailto:${LEGAL_EMAIL}`}
          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-arom-border px-4 text-sm font-semibold text-arom hover:bg-arom-wash"
        >
          <Mail size={16} aria-hidden="true" />
          {LEGAL_EMAIL}
        </a>

        <p className="mt-10 border-t border-arom-border/60 pt-5 text-sm">
          <Link href={other.href} className="font-semibold text-arom underline decoration-arom-border underline-offset-4">
            {pick(other.label)}
          </Link>
        </p>
      </main>
    </div>
  );
}
