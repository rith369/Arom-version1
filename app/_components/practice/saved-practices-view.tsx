"use client";

import Image from "next/image";
import { ArrowLeft, Bookmark, ChevronRight, Wind } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../language-provider";
import { removeSaved } from "../saved/saved-store";
import { useSavedIds } from "../saved/use-saved";
import { ALL_PRACTICES, PRACTICE_CATEGORIES, type PracticeItem } from "./practice-data";

type SavedPracticesViewProps = {
  onBack: () => void;
  onSelectPractice: (practice: PracticeItem) => void;
};

export function SavedPracticesView({
  onBack,
  onSelectPractice,
}: SavedPracticesViewProps) {
  const { language } = useLanguage();
  const km = language === "km";

  const savedIds = useSavedIds("practice");

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSaved("practice", id);
  };

  // Newest saved first.
  const savedPractices = [...savedIds]
    .reverse()
    .map((id) => ALL_PRACTICES.find((item) => item.id === id && item.isAvailable))
    .filter((item): item is PracticeItem => Boolean(item));

  return (
    <div className="min-h-screen bg-canvas text-ink pb-24 lg:pb-12">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-arom-border bg-white px-4 py-3.5 backdrop-blur-xl sm:px-8">
        <button
          type="button"
          onClick={onBack}
          aria-label={km ? "ត្រឡប់ក្រោយ" : "Back to Practice"}
          className="flex size-10 items-center justify-center rounded-full border border-arom-border bg-white text-arom shadow-sm transition-colors hover:bg-arom-wash"
        >
          <ArrowLeft size={19} />
        </button>

        <h1 className="text-base font-bold text-arom sm:text-lg">
          {km ? "លំហាត់ដែលបានរក្សាទុក (Saved)" : "Saved Practices"}
        </h1>

        <div className="size-10" />
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6 sm:px-8 sm:pt-8">
        {savedPractices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-arom-border bg-white py-14 px-4 text-center shadow-sm">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-arom-soft text-arom">
              <Bookmark size={24} />
            </span>
            <p className="mt-4 text-sm font-bold text-arom">
              {km ? "គ្មានការអនុវត្តដែលបានរក្សាទុកនៅឡើយទេ" : "No saved practices yet"}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {km
                ? "ចុចរូបសញ្ញាចំណាំដើម្បីរក្សាទុកសម្រាប់អនុវត្តពេលក្រោយ"
                : "Bookmark any practice to return and exercise anytime."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedPractices.map((practice) => (
              <motion.div
                key={practice.id}
                whileHover={{ y: -2 }}
                onClick={() => onSelectPractice(practice)}
                className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-arom-border bg-white p-3.5 shadow-[0_8px_24px_rgba(25,87,72,0.05)] transition-all hover:border-arom/40 hover:shadow-card sm:p-4"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-arom-soft sm:size-20 flex items-center justify-center">
                  <Image
                    src={practice.image}
                    alt={practice.title}
                    width={38}
                    height={38}
                    className="size-8 object-contain sm:size-9"
                    unoptimized
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-md bg-arom-soft px-2 py-0.5 text-[0.68rem] font-semibold text-arom">
                    {km
                      ? PRACTICE_CATEGORIES.find((item) => item.id === practice.category)?.kmLabel ?? practice.category
                      : practice.category}
                  </span>
                  <h3 className="mt-1 truncate text-sm font-bold text-ink sm:text-base">
                    {km && practice.kmTitle
                      ? practice.kmTitle
                      : practice.title}
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {km ? practice.kmDuration ?? practice.duration : practice.duration} •{" "}
                    {km ? practice.kmDifficulty ?? practice.difficulty : practice.difficulty}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleRemove(practice.id, e)}
                  aria-label="Remove bookmark"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-arom-border bg-white text-arom transition-colors hover:bg-arom-danger-soft hover:text-arom-danger hover:border-arom-danger/40 shadow-sm"
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
