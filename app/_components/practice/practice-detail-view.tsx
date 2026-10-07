"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Wind,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  getCustomPlanItems,
  toggleCustomPlanItem,
} from "../daily-plan-store";
import { useLanguage } from "../language-provider";
import {
  isPracticeBookmarked,
  PRACTICE_CATEGORIES,
  togglePracticeBookmark,
  type PracticeItem,
} from "./practice-data";

type PracticeDetailViewProps = {
  practice: PracticeItem;
  onBack: () => void;
  onStartPractice: () => void;
};

export function PracticeDetailView({
  practice,
  onBack,
  onStartPractice,
}: PracticeDetailViewProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const [bookmarked, setBookmarked] = useState(() =>
    isPracticeBookmarked(practice.id),
  );
  const [inPlan, setInPlan] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const syncPlan = () => {
      const items = getCustomPlanItems();
      setInPlan(items.some((i) => i.id === practice.id));
    };
    syncPlan();
    window.addEventListener("arom_plan_updated", syncPlan);
    return () => window.removeEventListener("arom_plan_updated", syncPlan);
  }, [practice.id]);

  useEffect(() => {
    if (toastMessage) {
      const timer = window.setTimeout(() => setToastMessage(null), 3200);
      return () => window.clearTimeout(timer);
    }
  }, [toastMessage]);

  const categoryLabel = km
    ? PRACTICE_CATEGORIES.find((c) => c.id === practice.category)?.kmLabel || practice.category
    : practice.category;

  const handleBookmarkToggle = () => {
    const newState = togglePracticeBookmark(practice.id);
    setBookmarked(newState);
  };

  const handleTogglePlan = () => {
    const isAdded = toggleCustomPlanItem({
      id: practice.id,
      source: "practice",
      title: practice.title,
      titleKm: practice.kmTitle || practice.title,
      subtitle: `${practice.duration} • ${practice.subtitle}`,
      subtitleKm: `${practice.kmDuration || practice.duration} • ${practice.kmSubtitle || practice.subtitle}`,
      badge: practice.category,
      badgeKm: categoryLabel,
      icon: "hugeicons_yoga-03",
      href: "/practice",
    });

    if (isAdded) {
      setToastMessage(
        km
          ? `បានបន្ថែម "${practice.kmTitle || practice.title}" ទៅផែនការទំព័រដើមរបស់អ្នក`
          : `Added "${practice.title}" to your Home Screen Daily Plan`
      );
    } else {
      setToastMessage(
        km
          ? `បានលុប "${practice.kmTitle || practice.title}" ចេញពីផែនការទំព័រដើម`
          : `Removed "${practice.title}" from your Home Screen Daily Plan`
      );
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink pb-24 lg:pb-12">
      {/* Top sticky bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-arom-border bg-white/95 px-4 py-3.5 backdrop-blur-xl sm:px-8">
        <button
          type="button"
          onClick={onBack}
          aria-label={km ? "ត្រឡប់ក្រោយ" : "Back to Practice"}
          className="flex size-10 items-center justify-center rounded-full border border-arom-border bg-white text-arom shadow-sm transition-colors hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom cursor-pointer"
        >
          <ArrowLeft size={19} />
        </button>

        <span className="text-xs font-semibold tracking-wider uppercase text-arom">
          {km ? "ទិដ្ឋភាពទូទៅនៃការអនុវត្ត (Overview)" : "Practice Overview"}
        </span>

        <div className="flex items-center gap-2">
          {/* Add to Daily Plan Header Button */}
          <button
            type="button"
            onClick={handleTogglePlan}
            aria-label={
              inPlan
                ? km
                  ? "លុបចេញពីផែនការទំព័រដើម"
                  : "Remove from Home Daily Plan"
                : km
                ? "បន្ថែមទៅផែនការទំព័រដើម"
                : "Add to Home Daily Plan"
            }
            title={
              inPlan
                ? km
                  ? "មានក្នុងផែនការទំព័រដើមរួចរាល់"
                  : "In Home Daily Plan"
                : km
                ? "បន្ថែមទៅផែនការទំព័រដើម"
                : "Add to Home Daily Plan"
            }
            className={`flex size-10 items-center justify-center rounded-full border shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-arom cursor-pointer ${
              inPlan
                ? "border-arom bg-arom text-white"
                : "border-arom-border bg-white text-ink-muted hover:bg-arom-wash hover:text-arom"
            }`}
          >
            {inPlan ? <CalendarCheck size={18} /> : <CalendarPlus size={18} />}
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label={
              bookmarked
                ? km
                  ? "លុបចំណាំ"
                  : "Remove bookmark"
                : km
                  ? "ចំណាំការអនុវត្តនេះ"
                  : "Bookmark this practice"
            }
            className={`flex size-10 items-center justify-center rounded-full border shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-arom cursor-pointer ${
              bookmarked
                ? "border-arom bg-arom-soft text-arom"
                : "border-arom-border bg-white text-ink-muted hover:bg-arom-wash hover:text-arom"
            }`}
          >
            <Bookmark
              size={18}
              className={bookmarked ? "fill-arom" : "fill-none"}
            />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6 sm:px-8 sm:pt-8">
        {/* Hero Visual Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative aspect-[16/8] w-full overflow-hidden rounded-[1.85rem] border border-arom-border bg-arom-soft shadow-card sm:aspect-[16/7]"
        >
          <Image
            src={practice.heroImage || "/mindguide/managing-stress-hero.svg"}
            alt={practice.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-arom/75 via-arom/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between sm:bottom-6 sm:left-6 sm:right-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-arom shadow-sm backdrop-blur-sm">
              <Clock3 size={13} strokeWidth={2.5} />
              {km && practice.kmDuration ? practice.kmDuration : practice.duration}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-arom/90 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
              {categoryLabel}
            </span>
          </div>
        </motion.div>

        {/* Title, Category & Description */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
          className="mt-6 sm:mt-8"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-arom-accent">
            <span>{categoryLabel}</span>
            <span>•</span>
            <span>{km && practice.kmDifficulty ? practice.kmDifficulty : practice.difficulty}</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-arom sm:text-3xl">
            {km && practice.kmTitle ? practice.kmTitle : practice.title}
          </h1>
          <p className="mt-1 text-base font-semibold text-arom-accent sm:text-lg">
            {km ? practice.kmSubtitle : practice.subtitle}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-ink sm:text-base">
            {km ? practice.kmDescription : practice.description}
          </p>
        </motion.div>

        {/* What You Will Practice Checklist */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.12 }}
          aria-labelledby="what-youll-practice-title"
          className="mt-8 rounded-[1.5rem] border border-arom/15 bg-arom-accent/8 p-5 sm:p-7 shadow-sm"
        >
          <div className="flex items-center gap-2 text-base font-bold text-arom sm:text-lg">
            <span className="flex size-7 items-center justify-center rounded-lg bg-arom text-white">
              <Zap size={16} />
            </span>
            <h2 id="what-youll-practice-title">
              {km ? "អ្វីដែលអ្នកនឹងអនុវត្ត (What You'll Practice)" : "What You Will Practice"}
            </h2>
          </div>

          <ul className="mt-5 space-y-3.5">
            {practice.outcomes.map((outcome, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-ink sm:text-base">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-arom"
                />
                <span className="leading-snug">{km && outcome.km ? outcome.km : outcome.en}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Action Buttons: Start + Add to Daily Plan */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.18 }}
          className="mt-8 sm:mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <button
            type="button"
            onClick={onStartPractice}
            className="group flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-arom px-6 text-base font-bold text-white shadow-[0_12px_28px_rgba(31,111,91,0.2)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-arom-deep hover:shadow-[0_16px_36px_rgba(31,111,91,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom cursor-pointer"
          >
            <span>
              {km ? "ចាប់ផ្តើមការហាត់ដកដង្ហើម (Start Breathing)" : "Start Breathing Session"}
            </span>
            <span className="transition-transform duration-150 group-hover:translate-x-1">
              →
            </span>
          </button>

          <button
            type="button"
            onClick={handleTogglePlan}
            className={`flex h-14 items-center justify-center gap-2.5 rounded-2xl border px-6 text-sm font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              inPlan
                ? "border-arom bg-arom-soft text-arom shadow-xs"
                : "border-arom-border bg-white text-arom hover:bg-arom-wash hover:border-arom/40 shadow-sm"
            }`}
          >
            {inPlan ? (
              <CheckCircle2 size={18} className="text-arom" />
            ) : (
              <CalendarPlus size={18} className="text-arom" />
            )}
            <span>
              {inPlan
                ? km
                  ? "មានក្នុងផែនការទំព័រដើមរួចរាល់ (In Daily Plan)"
                  : "In Home Daily Plan (Tap to Remove)"
                : km
                ? "បន្ថែមទៅផែនការទំព័រដើម (Add to Plan)"
                : "Add to Daily Plan at Home Screen"}
            </span>
          </button>
        </motion.div>
      </main>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-xs font-semibold text-white shadow-xl sm:text-sm"
          >
            <CheckCircle2 size={16} className="text-[#83dfca] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
