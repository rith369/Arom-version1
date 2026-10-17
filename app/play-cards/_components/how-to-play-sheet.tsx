"use client";

import { useEffect, useState } from "react";
import { Feather, Hand, Heart, LifeBuoy, MessageCircle, Users, Wind, X, type LucideIcon } from "lucide-react";
import { SheetDialog } from "../../_components/sheet-dialog";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import { LEVELS, type CardLevel } from "../_data/cards";
import { LEVEL_THEME } from "./theme";

const STEPS = [
  { en: "Give the phone to the person whose name is at the top.", km: "ហុចទូរស័ព្ទទៅអ្នកដែលមានឈ្មោះនៅខាងលើ។" },
  { en: "Tap the card to flip it. Read it out loud and answer your way.", km: "ចុចលើកាតដើម្បីបើក។ អានឮៗ ហើយឆ្លើយតាមចិត្តរបស់អ្នក។" },
  { en: "Swipe the card right (or press Done) to give the phone to the next person.", km: "អូសកាតទៅស្តាំ (ឬចុច រួចរាល់) ដើម្បីហុចទូរស័ព្ទទៅអ្នកបន្ទាប់។" },
];

const BUTTONS: { icon: LucideIcon; en: string; km: string; enNote: string; kmNote: string }[] = [
  { icon: Hand, en: "Pass", km: "រំលង", enNote: "Swipe the card left, or press Pass, to get a different card. No reason needed.", kmNote: "អូសកាតទៅឆ្វេង ឬចុច រំលង ដើម្បីយកកាតផ្សេង។ មិនបាច់ប្រាប់ហេតុផលទេ។" },
  { icon: Feather, en: "Lighter card", km: "កាតស្រាលជាងនេះ", enNote: "Too heavy? Get an easier question from the level before.", kmNote: "ធ្ងន់ពេក? យកសំណួរងាយជាងនេះពីកម្រិតមុន។" },
  { icon: LifeBuoy, en: "Need support?", km: "ត្រូវការជំនួយ?", enNote: "Opens helplines and people who can help.", kmNote: "បើកលេខទូរស័ព្ទជំនួយ និងអ្នកដែលអាចជួយបាន។" },
  { icon: X, en: "Close", km: "បិទ", enNote: "Ends the game. You can start again any time.", kmNote: "បញ្ចប់ការលេង។ អ្នកអាចចាប់ផ្តើមម្តងទៀតបានគ្រប់ពេល។" },
];

const CARD_TYPES: { icon: LucideIcon; en: string; km: string; enNote: string; kmNote: string }[] = [
  { icon: MessageCircle, en: "Question", km: "សំណួរ", enNote: "Answer it in your own words.", kmNote: "ឆ្លើយតាមពាក្យរបស់អ្នកផ្ទាល់។" },
  { icon: Wind, en: "Breathe together", km: "ដកដង្ហើមជាមួយគ្នា", enNote: "Press Start and breathe with the circle.", kmNote: "ចុចចាប់ផ្តើម ហើយដកដង្ហើមតាមរង្វង់។" },
  { icon: Heart, en: "Kind words", km: "ពាក្យល្អ", enNote: "Say something kind to someone here.", kmNote: "និយាយពាក្យល្អទៅកាន់នរណាម្នាក់នៅទីនេះ។" },
  { icon: Users, en: "Everyone together", km: "គ្រប់គ្នារួមគ្នា", enNote: "The whole group does it at once.", kmNote: "ក្រុមទាំងមូលធ្វើវាព្រមគ្នា។" },
];

const LEVEL_ORDER: CardLevel[] = ["warm", "real", "care"];

export function HowToPlaySheet({ km, onClose }: { km: boolean; onClose: () => void }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const heading = "text-xs font-bold uppercase tracking-[0.12em] text-arom";

  return (
    <SheetDialog
      closing={closing}
      onClosed={onClose}
      labelledBy="how-to-play-title"
      panelClassName="flex max-h-[92vh] w-full max-w-md flex-col rounded-t-[32px] bg-white shadow-2xl sm:rounded-[32px]"
    >
      <div className="flex items-center gap-3 border-b border-arom-border/60 px-6 pb-4 pt-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-arom-soft">
          <MoodSprout mood="good" className="h-9 w-auto" />
        </span>
        <h2 id="how-to-play-title" className="flex-1 text-lg font-bold tracking-tight text-ink">
          {t("របៀបលេង", "How to play")}
        </h2>
        <button
          type="button"
          onClick={() => setClosing(true)}
          aria-label={t("បិទ", "Close")}
          className="flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-arom-wash hover:text-arom"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto px-6 py-5">
        <section>
          <h3 className={heading}>{t("ជំហាន", "Steps")}</h3>
          <ol className="mt-3 space-y-3">
            {STEPS.map((step, index) => (
              <li key={step.en} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-arom text-xs font-bold text-white">{index + 1}</span>
                <span className="pt-0.5 text-sm leading-relaxed text-ink">{km ? step.km : step.en}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h3 className={heading}>{t("ប៊ូតុង", "Buttons")}</h3>
          <ul className="mt-3 space-y-2">
            {BUTTONS.map((item) => (
              <li key={item.en} className="flex items-start gap-3 rounded-2xl bg-[#f6faf8] p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-arom shadow-sm">
                  <item.icon size={16} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{km ? item.km : item.en}</span>
                  <span className="block text-xs leading-relaxed text-ink-muted">{km ? item.kmNote : item.enNote}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className={heading}>{t("ប្រភេទកាត", "Card types")}</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {CARD_TYPES.map((item) => (
              <li key={item.en} className="rounded-2xl border border-arom-border/70 p-3">
                <item.icon size={16} aria-hidden="true" className="text-arom" />
                <span className="mt-1.5 block text-sm font-semibold text-ink">{km ? item.km : item.en}</span>
                <span className="block text-xs leading-relaxed text-ink-muted">{km ? item.kmNote : item.enNote}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className={heading}>{t("កម្រិត", "Levels")}</h3>
          <ul className="mt-3 space-y-2">
            {LEVEL_ORDER.map((level) => {
              const Icon = LEVEL_THEME[level].icon;
              return (
                <li key={level} className="flex items-center gap-3">
                  <span className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg shadow-inner" style={LEVEL_THEME[level].card}>
                    <Icon size={14} aria-hidden="true" className={LEVEL_THEME[level].sub} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{km ? LEVELS[level].km : LEVELS[level].en}</span>
                    <span className="block text-xs text-ink-muted">{km ? LEVELS[level].kmBlurb : LEVELS[level].blurb}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="border-t border-arom-border/60 px-6 py-4">
        <button
          type="button"
          onClick={() => setClosing(true)}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-arom text-sm font-semibold text-white hover:bg-arom-deep"
        >
          {t("យល់ហើយ", "Got it")}
        </button>
      </div>
    </SheetDialog>
  );
}
