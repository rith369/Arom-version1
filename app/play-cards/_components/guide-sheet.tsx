"use client";

import { useEffect, useState } from "react";
import { X, type LucideIcon } from "lucide-react";
import { SheetDialog } from "../../_components/sheet-dialog";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import { BOLD } from "./bold";

export type GuideItem = { icon?: LucideIcon; en: string; km: string; enNote?: string; kmNote?: string };
export type GuideSection = { en: string; km: string; numbered?: boolean; items: GuideItem[] };

/** "How to play" for a party game: a few short sections. */
export function GuideSheet({
  km,
  title,
  sections,
  onClose,
}: {
  km: boolean;
  title: { en: string; km: string };
  sections: GuideSection[];
  onClose: () => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SheetDialog
      closing={closing}
      onClosed={onClose}
      labelledBy="guide-title"
      panelClassName="flex max-h-[92vh] w-full max-w-md flex-col rounded-t-[30px] border-[2.5px] border-[#14221f] bg-[#FFF6E5] sm:rounded-[30px] sm:shadow-[6px_6px_0_0_#14221f]"
    >
      <div className="flex items-center gap-3 border-b-2 border-[#14221f] px-6 pb-4 pt-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-[#14221f] bg-[#FFD23F]">
          <MoodSprout mood="good" className="h-9 w-auto" />
        </span>
        <h2 id="guide-title" className="flex-1 text-lg font-extrabold tracking-tight text-[#14221f]">
          {km ? title.km : title.en}
        </h2>
        <button
          type="button"
          onClick={() => setClosing(true)}
          aria-label={t("បិទ", "Close")}
          className={`flex size-10 items-center justify-center bg-white text-[#14221f] ${BOLD.button}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto px-6 py-5">
        {sections.map((section) => (
          <section key={section.en}>
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-[#1F6F5B]">{km ? section.km : section.en}</h3>
            <ul className="mt-3 space-y-2.5">
              {section.items.map((item, index) => (
                <li key={item.en} className={`flex items-start gap-3 bg-white p-3 ${BOLD.box}`}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-[#14221f] bg-[#FFD23F] text-xs font-black text-[#14221f]">
                    {section.numbered || !item.icon ? index + 1 : <item.icon size={15} aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span className="block text-sm font-bold leading-snug text-[#14221f]">{km ? item.km : item.en}</span>
                    {(item.enNote || item.kmNote) && (
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#14221f]/70">{km ? item.kmNote : item.enNote}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="border-t-2 border-[#14221f] px-6 py-4">
        <button type="button" onClick={() => setClosing(true)} className={`flex min-h-12 w-full items-center justify-center bg-[#2FA584] text-sm text-white ${BOLD.button}`}>
          {t("យល់ហើយ", "Got it")}
        </button>
      </div>
    </SheetDialog>
  );
}
