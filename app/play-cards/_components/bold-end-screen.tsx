"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CalendarPlus, Check, Gamepad2, RotateCcw, Settings2 } from "lucide-react";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import { addPlanTask } from "../../_components/daily-plan-store";
import { BOLD, DOTS } from "./bold";

/** The end of a party game: a friendly total, no winners. */
export function BoldEndScreen({
  km,
  title,
  stat,
  note,
  color,
  onPlayAgain,
  onSettings,
}: {
  km: boolean;
  title: { en: string; km: string };
  stat: { en: string; km: string };
  note: { en: string; km: string };
  color: string;
  onPlayAgain: () => void;
  onSettings: () => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const reduce = useReducedMotion();
  const [plan, setPlan] = useState<"idle" | "saving" | "added" | "error">("idle");

  async function planHangout() {
    if (plan === "saving" || plan === "added") return;
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

  return (
    <div className={`min-h-[100dvh] ${BOLD.page} px-5 py-10`}>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <motion.span
          className="flex size-36 items-center justify-center rounded-full border-[2.5px] border-[#14221f] shadow-[5px_5px_0_0_#14221f]"
          style={{ backgroundColor: color, ...DOTS }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
        >
          <MoodSprout mood="great" className="h-24 w-auto" />
        </motion.span>

        <h1 className="mt-6 text-[2rem] font-black leading-tight tracking-tight text-[#14221f]">{km ? title.km : title.en}</h1>
        <p className={`mt-3 inline-flex bg-[#FFD23F] px-4 py-1.5 text-sm font-black text-[#14221f] ${BOLD.pill}`}>{km ? stat.km : stat.en}</p>
        <p className="mt-3 text-sm font-medium text-[#14221f]/70">{km ? note.km : note.en}</p>

        <button
          type="button"
          onClick={() => void planHangout()}
          disabled={plan === "added" || plan === "saving"}
          className={`mt-6 flex min-h-14 w-full items-center gap-3 bg-white px-4 text-left text-sm text-[#14221f] ${BOLD.button} disabled:opacity-100`}
        >
          <span className="flex size-9 items-center justify-center rounded-full border-2 border-[#14221f] bg-[#B7EAD7]">
            {plan === "added" ? <Check size={17} aria-hidden="true" /> : <CalendarPlus size={17} aria-hidden="true" />}
          </span>
          <span className="min-w-0 flex-1">
            {plan === "added" ? t("បានបន្ថែមទៅផែនការថ្ងៃនេះ", "Added to today's plan") : t("រៀបចំការជួបជុំលើកក្រោយ", "Plan the next hangout")}
            <span className={`block text-xs font-medium ${plan === "error" ? "text-[#C2410C]" : "text-[#14221f]/60"}`}>
              {plan === "error" ? t("មិនអាចបន្ថែមបានទេ។ ព្យាយាមម្តងទៀត។", "Could not add it. Try again.") : t("បន្ថែមការរំលឹកទៅផែនការរបស់អ្នក", "Adds a reminder to your plan")}
            </span>
          </span>
        </button>

        <div className="mt-4 grid w-full grid-cols-2 gap-3">
          <button type="button" onClick={onPlayAgain} className={`flex min-h-13 items-center justify-center gap-2 bg-[#2FA584] px-3 text-sm text-white ${BOLD.button}`}>
            <RotateCcw size={16} aria-hidden="true" />
            {t("លេងម្តងទៀត", "Play again")}
          </button>
          <button type="button" onClick={onSettings} className={`flex min-h-13 items-center justify-center gap-2 bg-white px-3 text-sm text-[#14221f] ${BOLD.button}`}>
            <Settings2 size={16} aria-hidden="true" />
            {t("ប្តូរការកំណត់", "Change setup")}
          </button>
        </div>
        <Link href="/play-cards" className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-[#14221f] hover:underline">
          <Gamepad2 size={16} aria-hidden="true" />
          {t("ហ្គេមទាំងអស់", "All games")}
        </Link>
      </div>
    </div>
  );
}
