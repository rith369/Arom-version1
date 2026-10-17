"use client";

import { useEffect, useState } from "react";
import { Ear, Hand, Lock, type LucideIcon } from "lucide-react";
import { SheetDialog } from "../../_components/sheet-dialog";
import { MoodSprout } from "../../_components/mood/mood-sprout";

export type HouseRule = { icon: LucideIcon; en: string; km: string; enNote: string; kmNote: string };

const RULES: HouseRule[] = [
  {
    icon: Lock,
    en: "What is shared here stays here",
    km: "អ្វីដែលនិយាយនៅទីនេះ នៅតែនៅទីនេះ",
    enNote: "Nothing is recorded or saved. Keep each other's stories private.",
    kmNote: "គ្មានអ្វីត្រូវបានថត ឬរក្សាទុកទេ។ សូមរក្សារឿងរបស់គ្នាជាការសម្ងាត់។",
  },
  {
    icon: Ear,
    en: "Listen, don't fix",
    km: "ស្តាប់ មិនចាំបាច់ដោះស្រាយ",
    enNote: "Let each person finish. A nod is often enough.",
    kmNote: "ទុកឱ្យម្នាក់ៗនិយាយចប់។ ការងក់ក្បាលច្រើនតែគ្រប់គ្រាន់ហើយ។",
  },
  {
    icon: Hand,
    en: "Pass any time, no reason needed",
    km: "អាចរំលងបានគ្រប់ពេល ដោយមិនបាច់ប្រាប់ហេតុផល",
    enNote: "Every card has a Pass button. Use it freely.",
    kmNote: "កាតនីមួយៗមានប៊ូតុងរំលង។ ប្រើវាដោយសេរី។",
  },
];

/** House rules before a game. Each game can pass its own rules. */
export function RulesSheet({
  km,
  onAgree,
  onClose,
  rules = RULES,
}: {
  km: boolean;
  onAgree: () => void;
  onClose: () => void;
  rules?: HouseRule[];
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  // What to do once the closing animation finishes.
  const [closing, setClosing] = useState<null | "agree" | "back">(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing("back");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SheetDialog
      closing={closing !== null}
      onClosed={() => (closing === "agree" ? onAgree() : onClose())}
      labelledBy="rules-title"
      panelClassName="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[32px] bg-[linear-gradient(180deg,#F3FAF7_0%,#FFFFFF_45%)] p-6 shadow-2xl sm:rounded-[32px]"
    >
      <div className="flex flex-col items-center text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_-12px_rgba(31,111,91,0.5)]">
          <MoodSprout mood="good" className="h-14 w-auto" />
        </span>
        <h2 id="rules-title" className="mt-4 text-xl font-bold tracking-tight text-ink">
          {t("ច្បាប់តូចៗរបស់យើង", "Our house rules")}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{t("អានជាមួយគ្នា មុនពេលចាប់ផ្តើម។", "Read them together before you start.")}</p>
      </div>

      <ol className="mt-5 space-y-2.5">
        {rules.map((rule, index) => (
          <li key={rule.en} className="flex items-start gap-3 rounded-2xl border border-arom-border/70 bg-white p-3.5">
            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-arom-soft text-arom">
              <rule.icon size={18} aria-hidden="true" />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-arom text-[10px] font-bold text-white">
                {index + 1}
              </span>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">{km ? rule.km : rule.en}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{km ? rule.kmNote : rule.enNote}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={() => setClosing("agree")}
          className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-arom px-6 py-3.5 text-base font-semibold text-white shadow-[0_16px_32px_-16px_rgba(31,111,91,0.9)] transition-transform hover:bg-arom-deep active:scale-[0.99]"
        >
          {t("យើងយល់ព្រម តោះលេង", "We agree, let's play")}
        </button>
        <button
          type="button"
          onClick={() => setClosing("back")}
          className="flex min-h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold text-ink-muted hover:text-arom"
        >
          {t("មិនទាន់ទេ", "Not yet")}
        </button>
      </div>
    </SheetDialog>
  );
}
