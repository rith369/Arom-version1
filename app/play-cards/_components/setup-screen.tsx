"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, CircleHelp, Clock, Leaf } from "lucide-react";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import { LEVELS, PLAY_CARDS, ROUND_OPTIONS, type CardLevel, type DeckChoice, type RoundCount } from "../_data/cards";
import { LanguageToggle } from "./language-toggle";
import { BackToGames } from "./bold-parts";
import { CARD_BACK, JOURNEY_ICON, LEVEL_THEME } from "./theme";


const ROUND_LABELS: Record<RoundCount, { en: string; km: string; minutes: number }> = {
  9: { en: "Short", km: "ខ្លី", minutes: 10 },
  15: { en: "Medium", km: "មធ្យម", minutes: 15 },
  21: { en: "Long", km: "វែង", minutes: 25 },
};

const LEVEL_ORDER: CardLevel[] = ["warm", "real", "care"];

/** A small fanned card in a level's colors, used in the hero and deck tiles. */
function MiniCard({ level, className = "", style }: { level: CardLevel; className?: string; style?: CSSProperties }) {
  const Icon = LEVEL_THEME[level].icon;
  return (
    <span
      aria-hidden="true"
      className={`absolute flex items-center justify-center rounded-xl shadow-[0_8px_20px_-8px_rgba(20,40,34,0.45)] ring-1 ring-white/50 ${className}`}
      style={{ ...LEVEL_THEME[level].card, ...style }}
    >
      <Icon size={18} className={LEVEL_THEME[level].sub} />
    </span>
  );
}

/** A level's card face for the hero: its colors, icon and a few lines of "text". */
function HeroFaceCard({ level, className }: { level: CardLevel; className: string }) {
  const theme = LEVEL_THEME[level];
  const Icon = theme.icon;
  const line = level === "real" ? "bg-white/45" : "bg-current opacity-25";
  return (
    <span
      className={`absolute flex h-[5.25rem] w-[4rem] flex-col rounded-xl p-2 shadow-[0_16px_30px_-14px_rgba(0,0,0,0.55)] ring-1 ring-white/80 sm:h-[7.25rem] sm:w-[5.5rem] sm:rounded-2xl sm:p-3 ${theme.text} ${className}`}
      style={theme.card}
    >
      <Icon size={14} className={theme.sub} />
      <span className="mt-auto space-y-1.5">
        <span className={`block h-1.5 w-full rounded-full ${line}`} />
        <span className={`block h-1.5 w-4/5 rounded-full ${line}`} />
        <span className={`block h-1.5 w-3/5 rounded-full ${line}`} />
      </span>
    </span>
  );
}

/**
 * The hero picture: a fan of real looking cards (two faces and the AROM
 * card back from the game) with the sprout presenting them. It floats
 * gently, and stays still when motion is reduced.
 */
function HeroFan() {
  const reduce = useReducedMotion();
  return (
    // Phones: beside the title, clear of the buttons. Wider screens: centered.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-1 top-4 h-40 w-[8.5rem] sm:right-8 sm:top-1/2 sm:h-56 sm:w-48 sm:-translate-y-1/2"
    >
      <span className="absolute inset-6 rounded-full bg-[#9BE0C6]/30 blur-2xl" />
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeroFaceCard level="warm" className="left-0 top-6 -rotate-[15deg] sm:top-8" />
        <HeroFaceCard level="care" className="right-0 top-6 rotate-[15deg] sm:top-8" />
        {/* The card back, as in the game */}
        <span
          className="absolute left-1/2 top-1 flex h-[6.5rem] w-[4.75rem] -translate-x-1/2 flex-col items-center justify-center rounded-xl text-white shadow-[0_22px_40px_-16px_rgba(0,0,0,0.6)] ring-2 ring-white/85 sm:h-[8.75rem] sm:w-[6.5rem] sm:rounded-2xl"
          style={CARD_BACK}
        >
          <span className="absolute inset-1.5 rounded-xl border border-white/25" />
          <span className="flex size-8 items-center justify-center rounded-full bg-white text-arom shadow-md sm:size-11">
            <Leaf size={18} />
          </span>
          <span className="mt-1.5 text-[9px] font-bold tracking-[0.22em] sm:text-[10px]">AROM</span>
        </span>
      </motion.div>
      {/* The sprout presents the cards from the front. */}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <span className="absolute inset-x-1 bottom-1 top-3 rounded-full bg-white/35 blur-xl" />
        <MoodSprout mood="great" className="relative h-[3.75rem] w-auto drop-shadow-[0_10px_14px_rgba(0,0,0,0.3)] sm:h-[5rem]" />
      </span>
    </div>
  );
}

export function SetupScreen({
  km,
  deck,
  onDeckChange,
  rounds,
  onRoundsChange,
  onStart,
  onHelp,
}: {
  km: boolean;
  deck: DeckChoice;
  onDeckChange: (deck: DeckChoice) => void;
  rounds: RoundCount;
  onRoundsChange: (rounds: RoundCount) => void;
  onStart: () => void;
  onHelp: () => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const levelCount = (level: CardLevel) => PLAY_CARDS.filter((card) => card.level === level).length;

  return (
    <div className="space-y-5">
      <BackToGames km={km} />
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1A5E4D_0%,#1F6F5B_45%,#2E9175_100%)] px-5 pb-6 pt-5 text-white shadow-[0_24px_50px_-24px_rgba(31,111,91,0.75)] sm:px-7 sm:py-8">
        <span aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
        <span aria-hidden="true" className="absolute -bottom-20 left-10 size-48 rounded-full bg-[#7FD6B8]/20 blur-3xl" />

        <HeroFan />

        <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm">
          {t("ទូរស័ព្ទមួយ • មិត្ត ២ ដល់ ៨ នាក់", "One phone • 2 to 8 friends")}
        </p>
        <h1 className="relative mt-3 max-w-[56%] text-[1.7rem] font-bold leading-[1.15] tracking-tight sm:max-w-[60%] sm:text-[2rem]">
          {t("កាតនិយាយពីចិត្ត", "Mental health cards")}
        </h1>
        <p className="relative mt-2 max-w-[56%] text-sm leading-relaxed text-white/85 sm:max-w-[58%]">
          {t(
            "អង្គុយជាមួយគ្នា ហុចទូរស័ព្ទជុំគ្នា បើកកាត ហើយនិយាយពីចិត្ត។ គ្មានពិន្ទុ គ្មានអ្នកឈ្នះ។",
            "Sit together, pass the phone, flip a card and talk for real. No points, no winners.",
          )}
        </p>
        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onHelp}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-arom shadow-sm hover:bg-white/90"
          >
            <CircleHelp size={16} aria-hidden="true" />
            {t("របៀបលេង", "How to play")}
          </button>
          <LanguageToggle onDark />
        </div>
      </section>

      {/* Deck */}
      <section aria-labelledby="deck-title" className="rounded-3xl border border-arom-border/70 bg-white p-5 shadow-[0_4px_24px_rgba(20,54,47,0.04)]">
        <h2 id="deck-title" className="text-base font-semibold text-ink">
          {t("ជ្រើសរើសកាត", "Choose your deck")}
        </h2>

        <div role="radiogroup" aria-labelledby="deck-title" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Journey: light to deep */}
          <button
            type="button"
            role="radio"
            aria-checked={deck === "journey"}
            onClick={() => onDeckChange("journey")}
            className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all sm:col-span-3 ${
              deck === "journey"
                ? "border-arom bg-[linear-gradient(120deg,#F2FAF6,#FFFFFF)] shadow-[0_10px_28px_-16px_rgba(31,111,91,0.6)] ring-2 ring-arom"
                : "border-arom-border hover:border-arom/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="relative h-16 w-20 shrink-0">
                <MiniCard level="warm" className="left-0 top-2 h-14 w-10 -rotate-12" />
                <MiniCard level="real" className="left-5 top-0 h-14 w-10" />
                <MiniCard level="care" className="left-10 top-2 h-14 w-10 rotate-12" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink">
                    <JOURNEY_ICON size={16} className="text-arom" aria-hidden="true" />
                    {t("ដំណើរ (Journey)", "Journey")}
                  </span>
                  <span className="rounded-full bg-arom px-2 py-0.5 text-[10px] font-semibold text-white">
                    {t("ណែនាំ", "Recommended")}
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                  {t(
                    "ចាប់ផ្តើមស្រាលៗ បន្ទាប់មកនិយាយពីចិត្ត ហើយបញ្ចប់ដោយការយកចិត្តទុកដាក់គ្នា។",
                    "Start light, get real, and end with care for each other.",
                  )}
                </span>
              </span>
              {deck === "journey" && (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-arom text-white">
                  <Check size={14} strokeWidth={3} aria-hidden="true" />
                </span>
              )}
            </div>
          </button>

          {LEVEL_ORDER.map((level) => {
            const chosen = deck === level;
            const theme = LEVEL_THEME[level];
            const Icon = theme.icon;
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={chosen}
                onClick={() => onDeckChange(level)}
                className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left transition-all sm:flex-col sm:items-stretch ${
                  chosen ? "border-arom shadow-[0_10px_28px_-16px_rgba(31,111,91,0.6)] ring-2 ring-arom" : "border-arom-border hover:border-arom/50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-16 w-14 shrink-0 items-center justify-center rounded-xl shadow-inner sm:h-20 sm:w-full"
                  style={theme.card}
                >
                  <Icon size={22} className={theme.sub} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{km ? LEVELS[level].km : LEVELS[level].en}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-muted">{km ? LEVELS[level].kmBlurb : LEVELS[level].blurb}</span>
                  <span className="mt-1 block text-[11px] font-medium text-arom">
                    {levelCount(level)} {t("កាត", "cards")}
                  </span>
                </span>
                {chosen && (
                  <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-arom text-white">
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Length */}
      <section aria-labelledby="length-title" className="rounded-3xl border border-arom-border/70 bg-white p-5 shadow-[0_4px_24px_rgba(20,54,47,0.04)]">
        <h2 id="length-title" className="text-base font-semibold text-ink">
          {t("លេងយូរប៉ុណ្ណា?", "How long?")}
        </h2>
        <div role="radiogroup" aria-labelledby="length-title" className="mt-3 grid grid-cols-3 gap-2">
          {ROUND_OPTIONS.map((option) => {
            const chosen = rounds === option;
            const label = ROUND_LABELS[option];
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={chosen}
                onClick={() => onRoundsChange(option)}
                className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border px-2 py-2 transition-colors ${
                  chosen ? "border-arom bg-arom text-white shadow-[0_8px_20px_-10px_rgba(31,111,91,0.7)]" : "border-arom-border bg-white text-ink hover:border-arom/50"
                }`}
              >
                <span className="text-sm font-semibold">{km ? label.km : label.en}</span>
                <span className={`mt-0.5 text-[11px] font-medium ${chosen ? "text-white/90" : "text-ink"}`}>
                  {option} {t("កាត", "cards")}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] ${chosen ? "text-white/75" : "text-ink-muted"}`}>
                  <Clock size={10} aria-hidden="true" />
                  {t(`ប្រហែល ${label.minutes} នាទី`, `about ${label.minutes} min`)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div>
        <button
          type="button"
          onClick={onStart}
          className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1A5E4D,#1F6F5B_50%,#2E9175)] px-6 text-base font-semibold text-white shadow-[0_18px_36px_-18px_rgba(31,111,91,0.9)] transition-transform active:scale-[0.99] disabled:opacity-45 disabled:shadow-none"
        >
          {t("ចាប់ផ្តើមលេង", "Start playing")}
          <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
