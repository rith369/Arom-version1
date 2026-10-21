"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronRight,
  Clock3,
  Lock,
  Search,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { LanguageQuickToggle, useLanguage } from "../language-provider";
import {
  ALL_TIPS,
  TIP_CATEGORIES,
  TIP_CONTROL_STRESS,
  type TipCategory,
  type TipItem,
} from "./tips-data";

type TipsHomeViewProps = {
  onSelectTip: (tip: TipItem) => void;
  onOpenSaved: () => void;
  onBackToMindGuide: () => void;
};

export function TipsHomeView({
  onSelectTip,
  onOpenSaved,
  onBackToMindGuide,
}: TipsHomeViewProps) {
  const { language } = useLanguage();
  const km = language === "km";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TipCategory>("All");
  const [comingSoonModal, setComingSoonModal] = useState<TipItem | null>(null);

  const filteredTips = useMemo(() => {
    return ALL_TIPS.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.introduction.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.kmTitle && item.kmTitle.includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-canvas text-ink pb-28 lg:pb-16">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-8 sm:pt-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToMindGuide}
            className="flex items-center gap-2 text-xs font-semibold text-arom transition-colors hover:text-arom-deep"
          >
            <span className="flex size-10 items-center justify-center rounded-full border border-arom-border bg-white shadow-sm transition-transform hover:-translate-x-0.5">
              <ArrowLeft size={18} />
            </span>
            <span className="hidden sm:inline">
              {km ? "ត្រឡប់ទៅ MindGuide" : "Back to MindGuide"}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <LanguageQuickToggle />

            <button
              type="button"
              onClick={onOpenSaved}
              className="flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-2 text-xs font-semibold text-arom shadow-sm transition-all hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
            >
              <Bookmark size={15} className="text-arom" />
              <span>{km ? "គន្លឹះដែលបានរក្សាទុក (Saved)" : "Saved Tips"}</span>
            </button>
          </div>
        </div>

        {/* Title Header */}
        <header className="mt-6">
          <span className="inline-flex items-center rounded-full bg-arom-soft px-3 py-1 text-xs font-semibold text-arom">
            ARom MindGuide
          </span>
          <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-arom sm:text-3xl lg:text-4xl">
            {km ? "គន្លឹះ (Tips)" : "Tips"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted sm:text-base">
            {km
              ? "សកម្មភាពតូចៗសម្រាប់សេចក្តីស្ងប់ប្រចាំថ្ងៃ និងការគ្រប់គ្រងភាពតានតឹង។"
              : "Small actions for daily peace and stress control."}
          </p>
        </header>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                km
                  ? "ស្វែងរកគន្លឹះ... (ភាពតានតឹង, ការថប់បារម្ភ, ដំណេក...)"
                  : "Search tips... (Stress, Anxiety, Sleep...)"
              }
              className="w-full rounded-2xl border border-arom-border bg-white py-3 pl-10 pr-10 text-sm text-ink placeholder:text-ink-muted/70 shadow-sm outline-none transition-all focus:border-arom focus:ring-2 focus:ring-arom/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          {TIP_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-arom text-white shadow-sm"
                    : "border border-arom-border bg-white text-ink-muted hover:border-arom/40 hover:text-arom"
                }`}
              >
                {km ? cat.kmLabel : cat.label}
              </button>
            );
          })}
        </div>

        {/* Recommended For You Section */}
        {selectedCategory === "All" && !searchQuery && (
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-arom sm:text-lg">
                {km ? "ណែនាំសម្រាប់អ្នក (Recommended)" : "Recommended For You"}
              </h2>
              <span className="text-xs font-semibold text-arom-accent">
                {km ? "ផ្អែកលើ APA 2024" : "Based on APA 2024"}
              </span>
            </div>

            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => onSelectTip(TIP_CONTROL_STRESS)}
              className="group mt-3 cursor-pointer overflow-hidden rounded-3xl border border-arom-border bg-white p-5 shadow-[0_12px_32px_rgba(25,87,72,0.06)] transition-all hover:border-arom/50 hover:shadow-card sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-arom-soft text-arom shadow-sm">
                    <Image
                      src={TIP_CONTROL_STRESS.image}
                      alt=""
                      width={38}
                      height={38}
                      className="size-8 object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                      <span className="rounded-md bg-arom-soft px-2 py-0.5 font-semibold text-arom">
                        {km ? TIP_CONTROL_STRESS.kmCategory : TIP_CONTROL_STRESS.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock3 size={13} />
                        {km ? TIP_CONTROL_STRESS.kmDuration : TIP_CONTROL_STRESS.duration}
                      </span>
                      <span>•</span>
                      <span>{km ? TIP_CONTROL_STRESS.kmDifficulty : TIP_CONTROL_STRESS.difficulty}</span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-arom sm:text-xl">
                      {km ? TIP_CONTROL_STRESS.kmTitle : TIP_CONTROL_STRESS.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-muted sm:text-sm">
                      {km ? TIP_CONTROL_STRESS.kmSubtitle : TIP_CONTROL_STRESS.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end sm:justify-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-arom text-white shadow-sm transition-transform group-hover:translate-x-1">
                    <ArrowRight size={20} />
                  </span>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* All Tips Vertical List */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-arom sm:text-lg">
              {km ? "គន្លឹះទាំងអស់ (All Tips)" : "All Tips"}
            </h2>
            <span className="text-xs font-medium text-ink-muted">
              {filteredTips.length} {km ? "ប្រធានបទ" : "topics"}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {filteredTips.map((tip) => {
              const isAvailable = tip.isAvailable;

              return (
                <motion.div
                  key={tip.id}
                  whileHover={isAvailable ? { y: -2 } : {}}
                  onClick={() => {
                    if (isAvailable) {
                      onSelectTip(tip);
                    } else {
                      setComingSoonModal(tip);
                    }
                  }}
                  className={`group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all ${
                    isAvailable
                      ? "border-arom-border hover:border-arom/50 hover:shadow-card"
                      : "border-arom-border/60 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-arom-soft text-arom">
                      <Image
                        src={tip.image}
                        alt=""
                        width={32}
                        height={32}
                        className="size-7 object-contain"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[0.7rem] text-ink-muted">
                        <span className="font-semibold text-arom">
                          {km ? tip.kmCategory : tip.category}
                        </span>
                        <span>•</span>
                        <span>{km ? tip.kmDuration : tip.duration}</span>
                      </div>
                      <h3 className="truncate text-sm font-bold text-ink sm:text-base">
                        {km && tip.kmTitle ? tip.kmTitle : tip.title}
                      </h3>
                      <p className="truncate text-xs text-ink-muted">
                        {km && tip.kmSubtitle ? tip.kmSubtitle : tip.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isAvailable ? (
                      <span className="flex size-9 items-center justify-center rounded-full bg-arom-soft text-arom transition-transform group-hover:translate-x-0.5">
                        <ChevronRight size={18} strokeWidth={2.5} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-semibold text-ink-muted">
                        <Lock size={11} />
                        <span>{km ? "នឹងមកដល់ឆាប់ៗ (Coming Soon)" : "Coming Soon"}</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Coming Soon Modal */}
      {comingSoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setComingSoonModal(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-arom-border bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-arom-soft text-arom">
              <Lock size={26} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-arom">
              {km && comingSoonModal.kmTitle
                ? comingSoonModal.kmTitle
                : comingSoonModal.title}
            </h3>
            <p className="mt-1 text-xs font-semibold text-arom-accent">
              {km ? "នឹងមកដល់ឆាប់ៗ (Coming Soon)" : "Coming Soon"}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              {km
                ? "ក្រុមការងាររបស់យើងកំពុងរៀបចំខ្លឹមសារនេះ។ សូមសាកល្បងអានគន្លឹះស្តីពី 'របៀបគ្រប់គ្រងភាពតានតឹង' ជាមុនសិន។"
                : "Our clinical team is preparing this topic guide. In the meantime, try 'How to control your Stress'."}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setComingSoonModal(null);
                  onSelectTip(TIP_CONTROL_STRESS);
                }}
                className="w-full rounded-xl bg-arom py-2.5 text-xs font-semibold text-white transition-all hover:bg-arom-deep active:scale-95"
              >
                {km ? "អានគន្លឹះគ្រប់គ្រងភាពតានតឹង (Read Tips)" : "Read Stress Control Tips"}
              </button>
              <button
                type="button"
                onClick={() => setComingSoonModal(null)}
                className="w-full rounded-xl border border-arom-border py-2 text-xs font-medium text-ink-muted hover:bg-arom-wash"
              >
                {km ? "បិទ" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
