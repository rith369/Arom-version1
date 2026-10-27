"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bookmark, Wind } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "../language-provider";
import { toggleSaved } from "../saved/saved-store";
import { useSavedIds } from "../saved/use-saved";
import type { TipItem } from "./tips-data";

type TipCompleteViewProps = {
  tip: TipItem;
  onTryBreathing: () => void;
  onBackToTips: () => void;
  onViewSaved?: () => void;
};

export function TipCompleteView({
  tip,
  onTryBreathing,
  onBackToTips,
  onViewSaved,
}: TipCompleteViewProps) {
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const km = language === "km";
  const saved = useSavedIds("tip").includes(tip.id);

  const handleSaveToggle = () => {
    toggleSaved("tip", tip.id);
  };

  return (
    <main className="min-h-screen bg-canvas px-4 pb-28 pt-4 sm:px-8 sm:pt-6 lg:px-12">
      <div className="mx-auto w-full max-w-md">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToTips}
            aria-label={km ? "ត្រឡប់ក្រោយ" : "Back to tips"}
            className="flex size-11 items-center justify-center rounded-full text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
          >
            <ArrowLeft aria-hidden="true" size={24} />
          </button>

          <button
            type="button"
            onClick={handleSaveToggle}
            aria-label={saved ? (km ? "លុបចេញពីចំណាំ" : "Remove bookmark") : km ? "រក្សាទុកគន្លឹះ" : "Bookmark tips"}
            className={`flex size-11 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom ${
              saved ? "bg-arom text-white" : "text-arom hover:bg-arom-wash"
            }`}
          >
            <Bookmark aria-hidden="true" size={20} className={saved ? "fill-current" : ""} />
          </button>
        </div>

        {/* Completion Card */}
        <div className="mt-4 rounded-3xl border border-arom-border bg-white p-6 text-center shadow-sm sm:p-8">
          <motion.div
            initial={{ opacity: 0, transform: shouldReduceMotion ? "scale(1)" : "scale(0.95)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          >
            <Image
              src="/booking/booking-complete.png"
              alt=""
              width={160}
              height={160}
              className="mx-auto size-36 object-contain"
              priority
            />
          </motion.div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-arom">
            {km ? "ធ្វើបានល្អណាស់!" : "Great Job!"}
          </h1>

          <p className="mx-auto mt-2 max-w-[19rem] text-sm leading-relaxed text-ink-muted">
            {km
              ? `អ្នកបានអានចប់ ${tip.kmFormat || tip.format} នៃ «${tip.kmTitle || tip.title}»។`
              : `You completed reading the ${tip.format.toLowerCase()} for "${tip.title}".`}
          </p>

          <div className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-arom-soft px-4 py-1.5 text-sm font-semibold text-arom">
            <span>+15 XP</span>
            <span className="text-arom/60">•</span>
            <span>{km ? "បានកត់ត្រាទុក" : "Recorded"}</span>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={onTryBreathing}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-arom text-base font-semibold text-white shadow-sm transition-all hover:bg-arom-deep active:scale-[0.98]"
            >
              <Wind aria-hidden="true" size={18} />
              <span>{km ? "សាកល្បងហាត់ដកដង្ហើម (Breathing)" : "Try Breathing Exercise"}</span>
            </button>

            <button
              type="button"
              onClick={onBackToTips}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-arom-border bg-white text-base font-semibold text-arom transition-all hover:bg-arom-wash active:scale-[0.98]"
            >
              {km ? "ស្វែងរកគន្លឹះផ្សេងទៀត (More Tips)" : "Explore More Tips"}
            </button>

            {onViewSaved && (
              <button
                type="button"
                onClick={onViewSaved}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-arom-border/70 bg-white text-sm font-medium text-arom transition-all hover:bg-arom-wash active:scale-[0.98]"
              >
                <Bookmark aria-hidden="true" size={16} />
                <span>{km ? "មើលគន្លឹះដែលបានរក្សាទុក (Saved)" : "View Saved Tips"}</span>
              </button>
            )}

            <Link
              href="/mindguide"
              className="flex h-11 w-full items-center justify-center text-sm font-medium text-ink-muted transition-colors hover:text-arom"
            >
              {km ? "ត្រឡប់ទៅ MindGuide" : "Back to MindGuide"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
