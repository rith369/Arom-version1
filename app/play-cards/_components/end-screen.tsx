"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { BookOpen, CalendarPlus, Check, Ear, Home, RotateCcw, Users } from "lucide-react";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import { addPlanTask } from "../../_components/daily-plan-store";

// A few leaves drift down once when the game ends. Fixed positions keep the
// server and browser in step; nothing falls when motion is reduced.
const LEAVES = [
  { left: 8, delay: 0, size: 14, turn: 220, color: "#6CC3A0" },
  { left: 22, delay: 0.6, size: 10, turn: -160, color: "#A8DCC4" },
  { left: 37, delay: 0.25, size: 16, turn: 260, color: "#23AA89" },
  { left: 53, delay: 0.9, size: 12, turn: -200, color: "#F2B98B" },
  { left: 66, delay: 0.4, size: 15, turn: 180, color: "#6CC3A0" },
  { left: 79, delay: 1.1, size: 11, turn: -240, color: "#D9C6F2" },
  { left: 91, delay: 0.7, size: 13, turn: 200, color: "#23AA89" },
];

function FallingLeaves() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {LEAVES.map((leaf, index) => (
        <motion.span
          key={index}
          className="absolute -top-6 block rounded-[0_100%_0_100%]"
          style={{ left: `${leaf.left}%`, width: leaf.size, height: leaf.size * 1.4, backgroundColor: leaf.color }}
          initial={{ y: -30, rotate: 0, opacity: 0 }}
          animate={{ y: 720, rotate: leaf.turn, opacity: [0, 1, 1, 0], x: [0, 18, -14, 10] }}
          transition={{ duration: 6.5, delay: leaf.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function EndScreen({
  km,
  shared,
  players,
  onPlayAgain,
  onNewGame,
}: {
  km: boolean;
  shared: number;
  players: number;
  onPlayAgain: () => void;
  onNewGame: () => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const reduce = useReducedMotion();
  const [plan, setPlan] = useState<"idle" | "saving" | "added" | "error">("idle");

  async function planHangout() {
    if (plan !== "idle" && plan !== "error") return;
    setPlan("saving");
    const result = await addPlanTask({
      source: "custom",
      title: "Plan the next hangout with friends",
      titleKm: "រៀបចំការជួបជុំលើកក្រោយជាមួយមិត្តភក្តិ",
      icon: "friend",
      repeat: "once",
    });
    setPlan(result.ok ? "added" : "error");
  }

  const action =
    "flex min-h-14 w-full items-center gap-3 rounded-2xl border border-arom-border/70 bg-white px-4 text-left text-sm font-semibold text-ink shadow-[0_4px_18px_rgba(20,54,47,0.05)] transition-colors hover:border-arom/50";

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,#EAF6F0_0%,#F7FAF9_45%,#FBF6FD_100%)]">
      <FallingLeaves />
      <div className="relative mx-auto flex w-full max-w-md flex-col items-center px-5 pb-10 pt-12 text-center">
        <motion.span
          className="relative flex size-36 items-center justify-center rounded-full bg-white shadow-[0_24px_60px_-24px_rgba(31,111,91,0.6)]"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-[#9BE0C6]/40 blur-2xl" />
          <motion.span
            className="flex origin-bottom"
            animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <MoodSprout mood="great" className="h-24 w-auto" />
          </motion.span>
        </motion.span>

        <h1 className="mt-6 text-[1.75rem] font-bold tracking-tight text-ink">{t("អ្នកបានធ្វើវាជាមួយគ្នា", "You did it together")}</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          {t(`កាត ${shared} ត្រូវបានចែករំលែកដោយមិត្ត ${players} នាក់។`, `${shared} cards shared by ${players} friends.`)}
        </p>

        <section className="mt-6 w-full rounded-3xl bg-[linear-gradient(135deg,#1A5E4D,#1F6F5B_50%,#2E9175)] p-5 text-left text-white shadow-[0_20px_44px_-22px_rgba(31,111,91,0.85)]">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80">
            <Ear size={14} aria-hidden="true" />
            {t("មុនពេលចាកចេញ", "Before you go")}
          </p>
          <p className="mt-2 text-lg font-semibold leading-snug">
            {t("ម្នាក់ម្តង៖ តើអ្នកបានស្គាល់អ្វីថ្មីអំពីគ្នាទៅវិញទៅមក?", "Go around once: what did you learn about each other?")}
          </p>
          <p className="mt-1.5 text-xs text-white/75">{t("និយាយឮៗ។ គ្មានអ្វីត្រូវបានរក្សាទុកទេ។", "Say it out loud. Nothing is saved.")}</p>
        </section>

        <div className="mt-5 w-full space-y-2.5">
          <Link href="/detection/journal" className={action}>
            <span className="flex size-9 items-center justify-center rounded-full bg-arom-soft text-arom">
              <BookOpen size={17} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              {t("សរសេរកំណត់ត្រាឯកជន", "Write a private note")}
              <span className="block text-xs font-normal text-ink-muted">{t("សម្រាប់តែអ្នកប៉ុណ្ណោះ", "Only for you")}</span>
            </span>
          </Link>
          <button type="button" onClick={() => void planHangout()} disabled={plan === "added" || plan === "saving"} className={action}>
            <span className="flex size-9 items-center justify-center rounded-full bg-arom-soft text-arom">
              {plan === "added" ? <Check size={17} aria-hidden="true" /> : <CalendarPlus size={17} aria-hidden="true" />}
            </span>
            <span className="min-w-0 flex-1">
              {plan === "added" ? t("បានបន្ថែមទៅផែនការថ្ងៃនេះ", "Added to today's plan") : t("រៀបចំការជួបជុំលើកក្រោយ", "Plan the next hangout")}
              <span className={`block text-xs font-normal ${plan === "error" ? "text-arom-danger" : "text-ink-muted"}`}>
                {plan === "error"
                  ? t("មិនអាចបន្ថែមបានទេ។ ព្យាយាមម្តងទៀត។", "Could not add it. Try again.")
                  : t("បន្ថែមការរំលឹកទៅផែនការរបស់អ្នក", "Adds a reminder to your plan")}
              </span>
            </span>
          </button>
        </div>

        <div className="mt-6 grid w-full grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-arom px-4 text-sm font-semibold text-white shadow-[0_14px_30px_-16px_rgba(31,111,91,0.9)] hover:bg-arom-deep"
          >
            <RotateCcw size={16} aria-hidden="true" />
            {t("លេងម្តងទៀត", "Play again")}
          </button>
          <button
            type="button"
            onClick={onNewGame}
            className="flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-arom-border bg-white px-4 text-sm font-semibold text-arom hover:bg-arom-wash"
          >
            <Users size={16} aria-hidden="true" />
            {t("ហ្គេមថ្មី", "New game")}
          </button>
        </div>
        <Link href="/" className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-arom">
          <Home size={15} aria-hidden="true" />
          {t("ត្រឡប់ទៅទំព័រដើម", "Back to Home")}
        </Link>
      </div>
    </div>
  );
}
