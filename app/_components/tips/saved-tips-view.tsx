"use client";

import Image from "next/image";
import { ArrowLeft, Bookmark, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useLanguage } from "../language-provider";
import {
  ALL_TIPS,
  STORAGE_TIPS_KEYS,
  type TipItem,
} from "./tips-data";

type SavedTipsViewProps = {
  onBack: () => void;
  onSelectTip: (tip: TipItem) => void;
};

export function SavedTipsView({
  onBack,
  onSelectTip,
}: SavedTipsViewProps) {
  const { language } = useLanguage();
  const km = language === "km";

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["how-to-control-stress"];
    try {
      const raw = window.localStorage.getItem(STORAGE_TIPS_KEYS.BOOKMARKS);
      return raw ? JSON.parse(raw) : ["how-to-control-stress"];
    } catch {
      return ["how-to-control-stress"];
    }
  });

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = prev.filter((item) => item !== id);
      try {
        window.localStorage.setItem(
          STORAGE_TIPS_KEYS.BOOKMARKS,
          JSON.stringify(next),
        );
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const savedTips = ALL_TIPS.filter(
    (item) => item.isAvailable && savedIds.includes(item.id),
  );

  return (
    <div className="min-h-screen bg-canvas text-ink pb-24 lg:pb-12">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-arom-border bg-white px-4 py-3.5 backdrop-blur-xl sm:px-8">
        <button
          type="button"
          onClick={onBack}
          aria-label={km ? "ត្រឡប់ក្រោយ" : "Back to Tips"}
          className="flex size-10 items-center justify-center rounded-full border border-arom-border bg-white text-arom shadow-sm transition-colors hover:bg-arom-wash"
        >
          <ArrowLeft size={19} />
        </button>

        <h1 className="text-base font-bold text-arom sm:text-lg">
          {km ? "គន្លឹះដែលបានរក្សាទុក (Saved)" : "Saved Tips"}
        </h1>

        <div className="size-10" />
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6 sm:px-8 sm:pt-8">
        {savedTips.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-arom-border bg-white py-14 px-4 text-center shadow-sm">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-arom-soft text-arom">
              <Bookmark size={24} />
            </span>
            <p className="mt-4 text-sm font-bold text-arom">
              {km ? "គ្មានគន្លឹះដែលបានរក្សាទុកនៅឡើយទេ" : "No saved tips yet"}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {km
                ? "ចុចរូបសញ្ញាចំណាំដើម្បីរក្សាទុកសម្រាប់អានពេលក្រោយ"
                : "Bookmark any tip guide to return and read anytime."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedTips.map((tip) => (
              <motion.div
                key={tip.id}
                whileHover={{ y: -2 }}
                onClick={() => onSelectTip(tip)}
                className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-arom-border bg-white p-3.5 shadow-[0_8px_24px_rgba(25,87,72,0.05)] transition-all hover:border-arom/40 hover:shadow-card sm:p-4"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-arom-soft sm:size-20 flex items-center justify-center">
                  <Image
                    src={tip.image}
                    alt=""
                    width={38}
                    height={38}
                    className="size-8 object-contain sm:size-9"
                    unoptimized
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-md bg-arom-soft px-2 py-0.5 text-[0.68rem] font-semibold text-arom">
                    {km ? tip.kmCategory : tip.category}
                  </span>
                  <h3 className="mt-1 truncate text-sm font-bold text-ink sm:text-base">
                    {km && tip.kmTitle ? tip.kmTitle : tip.title}
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {km ? tip.kmDuration : tip.duration} • {km ? tip.kmDifficulty : tip.difficulty}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleRemove(tip.id, e)}
                  aria-label={km ? "លុបចេញពីចំណាំ" : "Remove bookmark"}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-arom-border bg-white text-arom transition-colors hover:bg-arom-wash shadow-sm"
                >
                  <Bookmark size={17} className="fill-arom" />
                </button>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-arom transition-transform duration-150 group-hover:translate-x-0.5"
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
