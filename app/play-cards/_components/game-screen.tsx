"use client";

import Link from "next/link";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { ArrowRight, CircleHelp, Feather, Hand, Heart, Leaf, LifeBuoy, MessageCircle, Users, Wind, X, type LucideIcon } from "lucide-react";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import { KINDS, LEVELS, lighterLevel, type CardKind, type PlayCard } from "../_data/cards";
import { BreatheCircle } from "./breathe-circle";
import { LanguageToggle } from "./language-toggle";
import { CARD_BACK, LEVEL_THEME, PLAYER_COLORS, initialOf } from "./theme";

const KIND_ICON: Record<CardKind, LucideIcon> = {
  question: MessageCircle,
  breathe: Wind,
  kind: Heart,
  together: Users,
};

// How a card leaves: "next" slides away to the left, "pass" sinks down.
export type CardExit = "next" | "pass";

const EASE = [0.23, 1, 0.32, 1] as const;

const secondaryButton =
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border border-white bg-white/75 px-3 py-2 text-sm font-semibold text-ink shadow-sm backdrop-blur transition-colors hover:bg-white";

function PlayingCard({
  card,
  flipped,
  onFlip,
  exit,
  km,
}: {
  card: PlayCard;
  flipped: boolean;
  onFlip: () => void;
  exit: CardExit;
  km: boolean;
}) {
  const reduce = useReducedMotion();
  // A card that is leaving never catches the tap meant for the next one.
  const present = useIsPresent();
  const theme = LEVEL_THEME[card.level];
  const KindIcon = KIND_ICON[card.kind];
  const isDark = card.level === "real";

  return (
    <motion.div
      className={`absolute inset-0 [perspective:1400px] ${present ? "" : "pointer-events-none"}`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }}
      // The direction comes from AnimatePresence `custom`, so a leaving card
      // uses the latest choice, not the one from when it was drawn.
      variants={{
        leave: (direction: CardExit) =>
          reduce
            ? { opacity: 0, transition: { duration: 0.15 } }
            : direction === "next"
              ? { opacity: 0, x: -340, rotate: -14, transition: { duration: 0.35, ease: EASE } }
              : { opacity: 0, y: 90, scale: 0.92, transition: { duration: 0.3, ease: EASE } },
      }}
      custom={exit}
      exit="leave"
      transition={{ duration: 0.45, ease: EASE }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE }}
      >
        {/* Back */}
        <button
          type="button"
          onClick={onFlip}
          disabled={flipped}
          aria-label={km ? "បើកកាត" : "Flip the card"}
          className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[30px] text-white shadow-[0_30px_60px_-28px_rgba(20,60,48,0.8)] ring-1 ring-white/20 [backface-visibility:hidden] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-arom"
          style={CARD_BACK}
        >
          <span aria-hidden="true" className="absolute inset-3 rounded-[24px] border border-white/20" />
          <span aria-hidden="true" className="absolute -left-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <span className="flex size-28 items-center justify-center rounded-full bg-white/95 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.45)]">
            <MoodSprout mood="great" className="h-20 w-auto" />
          </span>
          <span className="mt-5 inline-flex items-center gap-1.5 text-lg font-bold tracking-[0.2em]">
            <Leaf size={16} aria-hidden="true" />
            AROM
          </span>
          <motion.span
            className="mt-2 text-xs font-medium text-white/80"
            animate={reduce || flipped ? { opacity: 0.8 } : { opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {km ? "ចុចដើម្បីបើកកាត" : "Tap to flip"}
          </motion.span>
        </button>

        {/* Front */}
        <div
          className={`absolute inset-0 flex flex-col overflow-hidden rounded-[30px] p-6 shadow-[0_30px_60px_-28px_rgba(20,60,48,0.7)] ring-1 ring-white/50 [backface-visibility:hidden] [transform:rotateY(180deg)] ${theme.text}`}
          style={theme.card}
          aria-hidden={!flipped}
        >
          <span aria-hidden="true" className="absolute -right-12 -top-12 size-44 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${theme.chip}`}>
              <KindIcon size={13} aria-hidden="true" />
              {km ? KINDS[card.kind].km : KINDS[card.kind].en}
            </span>
            <span className={`text-[11px] font-semibold ${theme.sub}`}>{km ? LEVELS[card.level].km : LEVELS[card.level].en}</span>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center text-center">
            <p className={`font-semibold tracking-tight ${km ? "text-[1.2rem] leading-[1.75]" : "text-[1.45rem] leading-snug"}`}>
              {km ? card.km : card.en}
            </p>
            {card.kind === "breathe" && flipped && <BreatheCircle km={km} light={isDark} />}
          </div>

          <div className={`relative flex items-end justify-between ${theme.sub}`}>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-[0.18em]">
              <Leaf size={12} aria-hidden="true" />
              AROM
            </span>
            <MoodSprout mood={theme.sprout} className="h-12 w-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function GameScreen({
  km,
  players,
  hostIsYou,
  playerIndex,
  card,
  flipped,
  onFlip,
  exit,
  step,
  total,
  onNext,
  onPass,
  onLighter,
  onExit,
  onHelp,
}: {
  km: boolean;
  players: string[];
  // The host has no name on the account, so player 0 is shown as "You".
  hostIsYou: boolean;
  playerIndex: number;
  card: PlayCard;
  flipped: boolean;
  onFlip: () => void;
  exit: CardExit;
  step: number;
  total: number;
  onNext: () => void;
  onPass: () => void;
  onLighter: () => void;
  onExit: () => void;
  onHelp: () => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const reduce = useReducedMotion();
  const theme = LEVEL_THEME[card.level];
  const player = players[playerIndex];
  const isYou = hostIsYou && playerIndex === 0;
  const nextIndex = (playerIndex + 1) % players.length;
  const nextName = hostIsYou && nextIndex === 0 ? t("អ្នក", "you") : players[nextIndex];
  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
  const lighter = lighterLevel(card.level);
  const deep = card.level !== "warm";

  return (
    <motion.div
      className="relative flex min-h-[100dvh] flex-col overflow-hidden"
      animate={{ backgroundColor: theme.page }}
      transition={{ duration: 0.6 }}
    >
      {/* Soft light behind the cards, in the level's color */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[38%] size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        animate={{ backgroundColor: theme.glow }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-6 pt-4">
        {/* Top bar */}
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            aria-label={t("បញ្ចប់ការលេង", "End the game")}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-ink shadow-sm backdrop-blur hover:bg-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-center text-xs font-semibold text-ink-muted">
              {t(`កាតទី ${step} នៃ ${total}`, `Card ${step} of ${total}`)}
            </p>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/80"
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={total}
              aria-label={t("វឌ្ឍនភាព", "Progress")}
            >
              <motion.div
                className="h-full rounded-full bg-arom"
                initial={false}
                animate={{ width: `${(step / total) * 100}%` }}
                transition={{ duration: 0.4, ease: EASE }}
              />
            </div>
          </div>
          <LanguageToggle />
          <button
            type="button"
            onClick={onHelp}
            aria-label={t("របៀបលេង", "How to play")}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-arom shadow-sm backdrop-blur hover:bg-white"
          >
            <CircleHelp size={20} aria-hidden="true" />
          </button>
        </header>

        {/* Whose turn */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={playerIndex}
            className="mt-6 flex items-center justify-center gap-3"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <span
              aria-hidden="true"
              className="flex size-11 items-center justify-center rounded-full text-base font-bold text-white shadow-[0_8px_18px_-8px_rgba(0,0,0,0.45)] ring-4 ring-white"
              style={{ backgroundColor: color }}
            >
              {initialOf(player)}
            </span>
            <div>
              <p className="text-lg font-bold leading-tight text-ink">
                {isYou ? t("វេនរបស់អ្នក", "Your turn") : t(`វេនរបស់ ${player}`, `${player}'s turn`)}
              </p>
              <p className="text-xs text-ink-muted">
                {flipped
                  ? t("អានឮៗ ហើយឆ្លើយតាមចិត្ត", "Read it out loud and answer your way")
                  : step === 1
                    ? t("ចុចលើកាតដើម្បីចាប់ផ្តើម", "Tap the card to start")
                    : isYou
                      ? t("ទូរស័ព្ទត្រឡប់មកអ្នកវិញហើយ", "The phone is back with you")
                      : t(`ហុចទូរស័ព្ទទៅ ${player}`, `Pass the phone to ${player}`)}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* The card, with the deck peeking out behind it */}
        <div className="relative mx-auto mt-6 aspect-[3/4] w-full max-w-[320px]">
          <span aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-2 rotate-[5deg] rounded-[30px] opacity-60 shadow-lg" style={CARD_BACK} />
          <span aria-hidden="true" className="absolute inset-0 -translate-x-2 translate-y-1 -rotate-[4deg] rounded-[30px] opacity-80 shadow-lg" style={CARD_BACK} />
          <AnimatePresence initial={false} custom={exit}>
            <PlayingCard key={card.id} card={card} flipped={flipped} onFlip={onFlip} exit={exit} km={km} />
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="mt-7 min-h-[7.5rem]">
          {flipped ? (
            <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onPass}
                  title={t("រំលងកាតនេះ ហើយយកកាតផ្សេងទៀត។ មិនបាច់ប្រាប់ហេតុផលទេ។", "Skip this card and get another one. No reason needed.")}
                  className={secondaryButton}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Hand size={16} aria-hidden="true" />
                    {t("រំលង", "Pass")}
                  </span>
                  {/* Always visible: phones have no hover tooltips. */}
                  <span className="text-[11px] font-normal text-ink-muted">{t("យកកាតផ្សេង", "Get a different card")}</span>
                </button>
                {lighter && (
                  <button
                    type="button"
                    onClick={onLighter}
                    title={t(
                      "ប្តូរទៅកាតដែលស្រាលជាងនេះ ពីកម្រិតមុន ពេលសំណួរនេះធ្ងន់ពេក។",
                      "Swap to an easier card from the level before, when this one feels too heavy.",
                    )}
                    className={secondaryButton}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Feather size={16} aria-hidden="true" />
                      {t("កាតស្រាលជាងនេះ", "Lighter card")}
                    </span>
                    <span className="text-[11px] font-normal text-ink-muted">{t("សំណួរងាយជាងនេះ", "An easier question")}</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onNext}
                className="group mt-2.5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1A5E4D,#1F6F5B_50%,#2E9175)] px-6 text-base font-semibold text-white shadow-[0_18px_36px_-18px_rgba(31,111,91,0.9)] transition-transform active:scale-[0.99]"
              >
                {step === total
                  ? t("បញ្ចប់", "Finish")
                  : t(`រួចរាល់ ទៅ ${nextName}`, `Done, next: ${nextName}`)}
                <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
              </button>
              {deep && (
                <Link
                  href="/profile#get-help-title"
                  className="mx-auto mt-3 flex w-fit items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-arom"
                >
                  <LifeBuoy size={13} aria-hidden="true" />
                  {t("ត្រូវការជំនួយ?", "Need support?")}
                </Link>
              )}
            </motion.div>
          ) : (
            <p className="pt-3 text-center text-sm text-ink-muted">{t("ចុចលើកាតដើម្បីបើក", "Tap the card to flip it")}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
