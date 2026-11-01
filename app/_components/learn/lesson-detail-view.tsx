"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  GraduationCap,
  Info,
  Layers,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  getCustomPlanItems,
  toggleCustomPlanItem,
} from "../daily-plan-store";
import { LanguageQuickToggle, useLanguage } from "../language-provider";
import { chooseLabel, useMindGuidePick } from "../mindguide-pick";
import { EducationalNote } from "../educational-note";
import { ReportProblemButton } from "../report-problem";
import {
  toggleLessonBookmark,
  TOPIC_CATEGORIES,
  type Lesson,
} from "./learn-data";
import { useLessonBookmarked, useLessonProgress } from "./use-lesson-storage";

type LessonDetailViewProps = {
  lesson: Lesson;
  onBack: () => void;
  onStartLesson: (startSection?: number) => void;
  /** Admin preview: nothing is saved to this browser. */
  preview?: boolean;
};

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
function toKhmerNum(n: number): string {
  return String(n)
    .split("")
    .map((d) => (/\d/.test(d) ? KHMER_DIGITS[parseInt(d, 10)] : d))
    .join("");
}

function cleanOutcomeText(text: string): string {
  return text.replace(/\s*\[\d+(?:,\s*\d+)*\]/g, "").trim();
}

export function LessonDetailView({
  lesson,
  onBack,
  onStartLesson,
  preview = false,
}: LessonDetailViewProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const pick = useMindGuidePick();
  const bookmarked = useLessonBookmarked(lesson.id);
  const [inPlan, setInPlan] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showReferences, setShowReferences] = useState(false);
  const progress = useLessonProgress(lesson.id);

  useEffect(() => {
    const syncPlan = () => {
      const items = getCustomPlanItems();
      setInPlan(items.some((i) => i.id === lesson.id));
    };
    syncPlan();
    window.addEventListener("arom_plan_updated", syncPlan);
    return () => window.removeEventListener("arom_plan_updated", syncPlan);
  }, [lesson.id]);

  useEffect(() => {
    if (toastMessage) {
      const timer = window.setTimeout(() => setToastMessage(null), 3200);
      return () => window.clearTimeout(timer);
    }
  }, [toastMessage]);

  const categoryLabel = km
    ? TOPIC_CATEGORIES.find((c) => c.id === lesson.category)?.kmLabel || lesson.category
    : lesson.category;

  const handleBookmarkToggle = () => {
    if (preview) return;
    toggleLessonBookmark(lesson.id);
  };

  const handleTogglePlan = () => {
    if (preview) return;
    const isAdded = toggleCustomPlanItem({
      id: lesson.id,
      source: "learn",
      title: lesson.title,
      titleKm: lesson.kmTitle || lesson.title,
      subtitle: `${lesson.duration} • ${lesson.subtitle}`,
      subtitleKm: `${lesson.kmDuration || lesson.duration} • ${lesson.kmSubtitle || lesson.subtitle}`,
      badge: "Lesson",
      badgeKm: "មេរៀន (Lesson)",
      icon: "ant-design_play-circle-filled",
      href: "/learn",
    });

    if (isAdded) {
      setToastMessage(
        km
          ? `បានបន្ថែម "${lesson.kmTitle || lesson.title}" ទៅផែនការទំព័រដើមរបស់អ្នក`
          : `Added "${lesson.title}" to your Home Screen Daily Plan`
      );
    } else {
      setToastMessage(
        km
          ? `បានលុប "${lesson.kmTitle || lesson.title}" ចេញពីផែនការទំព័រដើម`
          : `Removed "${lesson.title}" from your Home Screen Daily Plan`
      );
    }
  };

  const hasProgress = progress.completedSections > 0 && !progress.isComplete;
  const startSectionNumber = hasProgress
    ? Math.min(progress.completedSections + 1, lesson.totalSections)
    : 1;

  return (
    <div className="min-h-screen bg-canvas text-ink pb-36 lg:pb-16">
      {/* Top sticky bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-arom-border bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-8">
        <button
          type="button"
          onClick={onBack}
          aria-label={km ? "ត្រឡប់ក្រោយ" : "Back to Learn"}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-arom-border bg-white text-arom shadow-sm transition-colors hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom cursor-pointer"
        >
          <ArrowLeft size={19} />
        </button>

        <div className="min-w-0 px-2 text-center">
          <span className="inline-flex items-center rounded-full bg-arom-soft px-3 py-1 text-xs font-semibold text-arom">
            {km ? "ទិដ្ឋភាពទូទៅនៃមេរៀន" : "Lesson Overview"}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageQuickToggle />

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
                  ? "ចំណាំមេរៀននេះ"
                  : "Bookmark this lesson"
            }
            className={`flex size-10 items-center justify-center rounded-full border shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-arom cursor-pointer ${
              bookmarked
                ? "border-arom bg-arom text-white"
                : "border-arom-border bg-white text-ink-muted hover:bg-arom-wash hover:text-arom"
            }`}
          >
            <Bookmark
              size={18}
              className={bookmarked ? "fill-current" : "fill-none"}
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
            src={lesson.heroImage || lesson.image}
            alt={lesson.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-arom/80 via-arom/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between sm:bottom-6 sm:left-6 sm:right-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-arom shadow-sm backdrop-blur-sm">
              <Clock3 size={13} strokeWidth={2.5} />
              {km && lesson.kmDuration ? lesson.kmDuration : lesson.duration}
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
          <div className="flex items-center gap-2 text-xs font-semibold text-arom-accent">
            <span className="rounded-full bg-arom-soft px-2.5 py-0.5">{categoryLabel}</span>
            <span>•</span>
            <span>{km && lesson.kmDifficulty ? lesson.kmDifficulty : lesson.difficulty}</span>
          </div>

          <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-arom sm:text-3xl">
            {km && lesson.kmTitle ? lesson.kmTitle : lesson.title}
          </h1>
          <p className="mt-1.5 text-sm sm:text-base font-medium text-ink-muted leading-relaxed">
            {km ? lesson.kmSubtitle : lesson.subtitle}
          </p>

          <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-ink">
            {km ? lesson.kmDescription : lesson.description}
          </p>
        </motion.div>

        {/* Sections Road Map (Interactive Syllabus Preview) */}
        {lesson.sections && lesson.sections.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.09 }}
            aria-labelledby="sections-title"
            className="mt-8 rounded-3xl border border-arom-border bg-white p-5 sm:p-7 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-arom-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-arom-soft text-arom shadow-xs">
                  <Layers size={18} />
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-arom-accent">
                    {km ? "មាតិកាក្នុងមេរៀន" : "Lesson Outline"}
                  </span>
                  <h2 id="sections-title" className="text-base font-bold text-arom sm:text-lg">
                    {km
                      ? `ដំណើរការរៀនទាំង ${toKhmerNum(lesson.sections.length)} ផ្នែក`
                      : `All ${lesson.sections.length} Sections`}
                  </h2>
                </div>
              </div>
              <span className="rounded-full bg-arom-soft px-2.5 py-1 text-xs font-semibold text-arom">
                {toKhmerNum(progress.completedSections)} / {toKhmerNum(lesson.sections.length)} {km ? "បានបញ្ចប់" : "done"}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {lesson.sections.map((sec, idx) => {
                const isSecDone = idx < progress.completedSections;
                const isCurrent = idx === progress.completedSections && !progress.isComplete;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => onStartLesson(sec.sectionNumber)}
                    className={`group flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      isCurrent
                        ? "border-arom bg-arom-soft/60 shadow-xs"
                        : isSecDone
                        ? "border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50/70"
                        : "border-arom-border/80 bg-canvas/40 hover:bg-arom-wash/50 hover:border-arom/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isSecDone
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-arom text-white"
                            : "bg-arom-soft text-arom"
                        }`}
                      >
                        {isSecDone ? (
                          <CheckCircle2 size={14} strokeWidth={2.5} />
                        ) : (
                          km ? toKhmerNum(sec.sectionNumber) : sec.sectionNumber
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-semibold text-ink group-hover:text-arom">
                          {km && sec.kmTitle ? sec.kmTitle : sec.title}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-ink-muted group-hover:text-arom group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Key Takeaways Section */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.12 }}
          aria-labelledby="outcomes-title"
          className="mt-8 rounded-3xl border border-arom-border bg-white p-5 sm:p-7 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-arom-border/60 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-arom-soft text-arom shadow-xs">
                <GraduationCap size={18} />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-arom-accent">
                  {km ? "គោលដៅមេរៀន" : "Lesson Goals"}
                </span>
                <h2 id="outcomes-title" className="text-base font-bold text-arom sm:text-lg">
                  {km ? "ចំណុចសំខាន់ៗដែលអ្នកនឹងរៀន (Key Takeaways)" : "What You Will Learn"}
                </h2>
              </div>
            </div>
            <span className="hidden sm:inline-flex rounded-full bg-arom-soft px-2.5 py-1 text-xs font-semibold text-arom">
              {toKhmerNum(lesson.outcomes.length)} {km ? "ចំណុច" : "key points"}
            </span>
          </div>

          <ul className="mt-4 space-y-2.5">
            {lesson.outcomes.map((outcome, idx) => {
              const rawText = km && outcome.km ? outcome.km : outcome.en;
              const cleanText = cleanOutcomeText(rawText);
              return (
                <li
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl bg-canvas/70 p-3.5 text-xs sm:text-sm text-ink transition-colors hover:bg-arom-wash/40"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-arom/15 text-arom">
                    <CheckCircle2 size={14} strokeWidth={2.5} />
                  </span>
                  <span className="leading-relaxed font-medium">{cleanText}</span>
                </li>
              );
            })}
          </ul>
        </motion.section>

        {/* References Collapsible Section */}
        {lesson.references && lesson.references.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.18 }}
            className="mt-6 rounded-2xl border border-arom-border bg-white p-4 text-xs text-ink-muted shadow-sm"
          >
            <button
              type="button"
              onClick={() => setShowReferences(!showReferences)}
              className="flex w-full items-center justify-between gap-3 text-left font-semibold text-arom hover:text-arom-deep cursor-pointer"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Info size={15} className="shrink-0 text-arom" />
                <span className="truncate">
                  {km
                    ? `ឯកសារយោងវេជ្ជសាស្ត្រ (${toKhmerNum(lesson.references.length)} ប្រភព)`
                    : `Clinical & Scientific References (${lesson.references.length} Sources)`}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-arom-soft px-2.5 py-1 text-[11px] font-semibold text-arom">
                {showReferences ? (km ? "បិទ" : "Hide") : (km ? "មើលប្រភព" : "View Sources")}
              </span>
            </button>

            {showReferences && (
              <ul className="mt-3 space-y-1.5 border-t border-arom-border pt-3 text-[0.78rem] leading-relaxed text-ink">
                {lesson.references.map((ref) => (
                  <li key={ref.id} className="flex items-baseline gap-2">
                    <span className="font-bold text-arom">{ref.citation}</span>
                    <span>{ref.title}</span>
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-arom underline hover:text-arom-deep"
                      >
                        <ExternalLink size={10} className="ml-0.5" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Action Buttons: Primary Start / Continue + Secondary Daily Plan */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.22 }}
          className="mt-8 sm:mt-10 space-y-3"
        >
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => onStartLesson(startSectionNumber)}
            className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-arom px-6 text-base font-bold text-white shadow-[0_12px_28px_rgba(31,111,91,0.22)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-arom-deep hover:shadow-[0_16px_36px_rgba(31,111,91,0.28)] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom cursor-pointer"
          >
            <span>
              {hasProgress
                ? km
                  ? `បន្តការរៀន (ផ្នែកទី ${toKhmerNum(startSectionNumber)})`
                  : `Continue Learning (Section ${startSectionNumber})`
                : km
                  ? "ចាប់ផ្តើមរៀនឥឡូវនេះ (Start Learning)"
                  : "Start Learning"}
            </span>
            <span className="transition-transform duration-150 group-hover:translate-x-1">
              →
            </span>
          </button>

          {/* Secondary Plan Action Button */}
          {pick ? (
            <button
              type="button"
              onClick={() => pick.choose("lesson", lesson.id)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-arom px-6 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-arom-deep active:scale-[0.98]"
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{chooseLabel(pick.clientName, km)}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTogglePlan}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                inPlan
                  ? "border-emerald-300 bg-emerald-50/80 text-emerald-800 shadow-xs"
                  : "border-arom-border bg-white text-arom hover:bg-arom-wash hover:border-arom/40 shadow-sm"
              }`}
            >
              {inPlan ? (
                <CalendarCheck size={16} className="text-emerald-700 shrink-0" />
              ) : (
                <CalendarPlus size={16} className="text-arom shrink-0" />
              )}
              <span>
                {inPlan
                  ? km
                    ? "មានក្នុងផែនការទំព័រដើមរួចរាល់ (In Daily Plan)"
                    : "Saved in Home Daily Plan (Tap to Remove)"
                  : km
                    ? "បន្ថែមទៅផែនការទំព័រដើម (Add to Plan)"
                    : "Add to Daily Plan at Home Screen"}
              </span>
            </button>
          )}
        </motion.div>

        <EducationalNote className="mt-8" />

        {!preview && (
          <div className="mt-6 flex justify-center">
            <ReportProblemButton
              target={{ type: "lesson", sourceId: lesson.id }}
              itemTitle={km && lesson.kmTitle ? lesson.kmTitle : lesson.title}
            />
          </div>
        )}
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
