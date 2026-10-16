"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpen, Check, ChevronRight, LogIn, RotateCcw } from "lucide-react";
import { useLanguage } from "../_components/language-provider";
import { useAuth } from "../_components/auth-provider";
import { MOOD_LABELS, MOOD_LEVELS, saveTodayMood, useMoodStore, type MoodLevel } from "../_components/mood/mood-store";

// The AROM sprout for each mood (Figma Homescreen): small WebP files, 168px wide.
const MOOD_SPROUTS: Record<MoodLevel, { src: string; height: number }> = {
  very_low: { src: "/home/mood-very-low.webp", height: 189 },
  low: { src: "/home/mood-low.webp", height: 154 },
  okay: { src: "/home/mood-okay.webp", height: 153 },
  good: { src: "/home/mood-good.webp", height: 153 },
  great: { src: "/home/mood-great.webp", height: 150 },
};

const moods = MOOD_LEVELS.map((id) => ({ id, sprout: MOOD_SPROUTS[id] }));

type SaveState = "idle" | "saving" | "saved" | "error" | "sign_in";

/**
 * Daily mood check in on Home (BACKEND-HANDOFF.md section 22). A tap selects
 * and saves today's mood; it never leaves the page. Nothing is selected until
 * the person picks, and "Saved" shows only after the server confirms it.
 */
export function MoodSelector() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const reduce = useReducedMotion();
  const { user, status: authStatus } = useAuth();
  const mood = useMoodStore();

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [pending, setPending] = useState<MoodLevel | null>(null);
  const [lastChoice, setLastChoice] = useState<MoodLevel | null>(null);

  const signedOut = authStatus !== "loading" && !user;
  const selected = pending ?? mood.today;

  async function save(choice: MoodLevel) {
    if (signedOut || mood.status === "signed_out") {
      setSaveState("sign_in");
      return;
    }
    if (saveState === "saving") return;
    setLastChoice(choice);
    setPending(choice);
    setSaveState("saving");
    const result = await saveTodayMood(choice);
    setPending(null);
    if (result.ok) setSaveState("saved");
    else setSaveState(result.signedOut ? "sign_in" : "error");
  }

  return (
    <section id="mood-check-in" aria-labelledby="mood-heading" className="pt-1">
      <div className="flex items-start justify-between gap-3">
        <h2 id="mood-heading" className="text-sm font-medium text-[#1f6f5b] sm:text-base">
          {t("តើថ្ងៃនេះអារម្មណ៍របស់អ្នកយ៉ាងណាដែរ?", "How are you feeling today?")}
        </h2>
        <Link href="/detection/journal" className="shrink-0 pt-0.5 text-xs font-semibold text-[#1f6f5b] hover:underline">
          {t("កំណត់ត្រាអារម្មណ៍ (Journal)", "Journal")} &rarr;
        </Link>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="mood-heading"
        aria-busy={saveState === "saving"}
        className="mt-3.5 grid grid-cols-5 gap-1.5 sm:gap-3"
      >
        {moods.map(({ id, sprout }) => {
          const isSelected = selected === id;
          const label = MOOD_LABELS[id];
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => void save(id)}
              className="group flex flex-col items-center gap-1.5 rounded-xl py-1 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b] active:scale-95"
            >
              <span
                className={`flex h-14 w-full max-w-16 items-center justify-center rounded-2xl p-0.5 transition-all duration-200 sm:h-16 sm:max-w-[4.5rem] ${
                  isSelected
                    ? "bg-[#e0f3ed] shadow-[0_4px_12px_rgba(31,111,91,0.2)] ring-2 ring-[#23aa89]"
                    : "group-hover:bg-[#e0f3ed]/60"
                }`}
              >
                <Image
                  src={sprout.src}
                  alt=""
                  width={168}
                  height={sprout.height}
                  sizes="72px"
                  className={`h-full w-auto object-contain transition-transform duration-200 ${
                    isSelected ? "scale-105" : "group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  }`}
                />
              </span>
              <span
                className={`text-[11px] leading-tight transition-colors sm:text-xs ${
                  isSelected ? "font-bold text-[#1f6f5b]" : "font-medium text-[#1f6f5b]/80"
                }`}
              >
                {km ? label.km : label.en}
              </span>
            </button>
          );
        })}
      </div>

      <p role="status" aria-live="polite" className="mt-2 flex min-h-5 justify-center text-center text-xs">
        <AnimatePresence mode="wait" initial={false}>
          {saveState === "saved" && (
            <motion.span
              key="saved"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="inline-flex items-center gap-1 font-semibold text-[#1f6f5b]"
            >
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
              {t("បានរក្សាទុក", "Saved")}
            </motion.span>
          )}
          {saveState === "saving" && (
            <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ink-muted">
              {t("កំពុងរក្សាទុក", "Saving")}
            </motion.span>
          )}
          {saveState === "error" && (
            <motion.span key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2 text-arom-danger">
              {t("មិនអាចរក្សាទុកបានទេ", "Could not save")}
              <button
                type="button"
                onClick={() => lastChoice && void save(lastChoice)}
                className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
              >
                <RotateCcw size={12} aria-hidden="true" />
                {t("ព្យាយាមម្ដងទៀត", "Try again")}
              </button>
            </motion.span>
          )}
          {saveState === "sign_in" && (
            <motion.span key="sign_in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Link
                href="/login?next=%2F"
                className="inline-flex items-center gap-1 font-semibold text-[#1f6f5b] hover:underline"
              >
                <LogIn size={13} aria-hidden="true" />
                {t("ចូលគណនីដើម្បីរក្សាទុក", "Log in to save your mood")}
              </Link>
            </motion.span>
          )}
        </AnimatePresence>
      </p>

      <div className="mt-2 flex items-center border-t border-gray-100 pt-2.5">
        <Link
          href="/detection/journal"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f6f5b] hover:underline"
        >
          <BookOpen size={13} aria-hidden="true" />
          <span>{t("កត់ត្រាការឆ្លុះបញ្ចាំងក្នុងកំណត់ហេតុ", "Write reflection in Journal")}</span>
          <ChevronRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
