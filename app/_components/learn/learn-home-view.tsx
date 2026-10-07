"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Lock,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  getCustomPlanItems,
  toggleCustomPlanItem,
} from "../daily-plan-store";
import { useLanguage } from "../language-provider";
import {
  ALL_LESSONS,
  LESSON_ABOUT_STRESS,
  TOPIC_CATEGORIES,
  getLessonProgress,
  type Lesson,
  type TopicCategory,
} from "./learn-data";

type LearnHomeViewProps = {
  onSelectLesson: (lesson: Lesson) => void;
  onOpenSaved: () => void;
  onBackToMindGuide: () => void;
};

export function LearnHomeView({
  onSelectLesson,
  onOpenSaved,
  onBackToMindGuide,
}: LearnHomeViewProps) {
  const { language } = useLanguage();
  const km = language === "km";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory>("All");
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const progress = getLessonProgress(LESSON_ABOUT_STRESS.id);
  const hasProgress = progress.completedSections > 0;

  useEffect(() => {
    const syncPlan = () => {
      const items = getCustomPlanItems();
      setPlanIds(items.map((i) => i.id));
    };
    syncPlan();
    window.addEventListener("arom_plan_updated", syncPlan);
    return () => window.removeEventListener("arom_plan_updated", syncPlan);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = window.setTimeout(() => setToastMessage(null), 3200);
      return () => window.clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleTogglePlan = (lesson: Lesson) => {
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

  // Filter lessons based on category & search query
  const filteredLessons = useMemo(() => {
    return ALL_LESSONS.filter((lesson) => {
      const matchesCategory =
        selectedCategory === "All" || lesson.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        lesson.title.toLowerCase().includes(q) ||
        lesson.subtitle.toLowerCase().includes(q) ||
        lesson.description.toLowerCase().includes(q) ||
        lesson.category.toLowerCase().includes(q) ||
        (lesson.kmTitle && lesson.kmTitle.includes(q));

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
            className="flex items-center gap-2 text-xs font-semibold text-arom transition-colors hover:text-arom-deep cursor-pointer"
          >
            <span className="flex size-10 items-center justify-center rounded-full border border-arom-border bg-white shadow-sm transition-transform hover:-translate-x-0.5">
              <ArrowLeft size={18} />
            </span>
            <span className="hidden sm:inline">
              {km ? "ត្រឡប់ទៅ MindGuide" : "Back to MindGuide"}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenSaved}
            className="flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-2 text-xs font-semibold text-arom shadow-sm transition-all hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom cursor-pointer"
          >
            <Bookmark size={15} className="text-arom" />
            <span>{km ? "មេរៀនដែលបានរក្សាទុក (Saved)" : "Saved"}</span>
          </button>
        </div>

        {/* Title Header */}
        <header className="mt-6">
          <span className="inline-flex items-center rounded-full bg-arom-soft px-3 py-1 text-xs font-semibold text-arom">
            ARom MindGuide
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-arom sm:text-3xl lg:text-4xl">
            {km ? "ស្វែងយល់ពីចិត្ត (Learn Hub)" : "Learn Hub"}
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-ink-muted sm:text-sm">
            {km
              ? "ស្វែងយល់ពីសុខភាពផ្លូវចិត្តតាមរយៈមេរៀនខ្លីៗ ផ្អែកលើការស្រាវជ្រាវវេជ្ជសាស្ត្រ និងវិធីអនុវត្តជាក់ស្តែង។"
              : "Bite-sized, clinically backed lessons that explain how your brain and body experience emotional challenges, grounded in accessible science."}
          </p>
        </header>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted/70"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                km
                  ? "ស្វែងរកមេរៀន... (ភាពតានតឹង, ការថប់បារម្ភ, អារម្មណ៍...)"
                  : "Search lessons... (Stress, Anxiety, Burnout, Sleep...)"
              }
              className="h-12 w-full rounded-2xl border border-arom-border bg-white pl-11 pr-10 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-muted/70 shadow-sm focus:border-arom focus:ring-4 focus:ring-arom/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Topic Category Chips */}
        <nav
          aria-label="Lesson Topics"
          className="mt-4 flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar"
        >
          {TOPIC_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom cursor-pointer ${
                  isSelected
                    ? "bg-arom text-white shadow-sm"
                    : "border border-arom-border bg-white text-ink-muted hover:bg-arom-wash hover:text-arom"
                }`}
              >
                {km ? cat.kmLabel : cat.label}
              </button>
            );
          })}
        </nav>

        {/* Recommended Lesson Section */}
        {selectedCategory === "All" && !searchQuery && (
          <section
            aria-labelledby="recommended-heading"
            className="mt-7 overflow-hidden rounded-[1.85rem] border border-arom/20 bg-gradient-to-br from-[#e8faf5] via-[#f0fbf7] to-white p-5 sm:p-7 shadow-[0_12px_32px_rgba(31,111,91,0.06)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-arom-accent">
                {km ? "ណែនាំសម្រាប់អ្នក (Recommended)" : "Recommended For You"}
              </span>
              <span className="rounded-full bg-arom-soft px-3 py-1 text-xs font-semibold text-arom">
                {km ? "មេរៀនស្នូល (Core Lesson)" : "Core Lesson"}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-arom">
                  {LESSON_ABOUT_STRESS.category} • {LESSON_ABOUT_STRESS.duration} • {km ? LESSON_ABOUT_STRESS.kmDifficulty : LESSON_ABOUT_STRESS.difficulty}
                </span>
                <h2
                  id="recommended-heading"
                  className="text-xl font-bold text-arom sm:text-2xl"
                >
                  {km ? LESSON_ABOUT_STRESS.kmTitle : LESSON_ABOUT_STRESS.title}
                </h2>
                <p className="max-w-xl text-xs leading-relaxed text-ink-muted sm:text-sm">
                  {km
                    ? LESSON_ABOUT_STRESS.kmDescription
                    : "Stress is your body reacting to pressure. Learn what stress is, why it happens, and small things that truly help."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePlan(LESSON_ABOUT_STRESS)}
                  title={
                    planIds.includes(LESSON_ABOUT_STRESS.id)
                      ? km
                        ? "លុបចេញពីផែនការទំព័រដើម"
                        : "Remove from Home Daily Plan"
                      : km
                      ? "បន្ថែមទៅផែនការទំព័រដើម"
                      : "Add to Home Daily Plan"
                  }
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-150 cursor-pointer sm:size-14 ${
                    planIds.includes(LESSON_ABOUT_STRESS.id)
                      ? "border-arom bg-arom text-white shadow-md"
                      : "border-arom-border bg-white text-arom hover:border-arom hover:bg-arom-wash shadow-sm"
                  }`}
                >
                  {planIds.includes(LESSON_ABOUT_STRESS.id) ? (
                    <CalendarCheck size={22} />
                  ) : (
                    <CalendarPlus size={22} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectLesson(LESSON_ABOUT_STRESS)}
                  className="group flex size-12 shrink-0 items-center justify-center rounded-2xl bg-arom text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-arom-deep hover:shadow-[0_10px_24px_rgba(31,111,91,0.25)] sm:size-14 cursor-pointer"
                >
                  <ArrowRight
                    size={22}
                    className="transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Continue Learning Section (if progress exists) */}
        {hasProgress && !searchQuery && (
          <section
            aria-labelledby="continue-learning-heading"
            className="mt-6 rounded-2xl border border-arom-border bg-white p-5 shadow-[0_8px_24px_rgba(25,87,72,0.05)] sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-arom" />
                <h2
                  id="continue-learning-heading"
                  className="text-sm font-bold text-arom sm:text-base"
                >
                  {km ? "បន្តការរៀនសូត្រ (Continue Learning)" : "Continue Learning"}
                </h2>
              </div>
              <span className="text-xs font-semibold text-arom">
                {progress.completedSections} {km ? "នៃ" : "of"}{" "}
                {progress.totalSections} {km ? "ផ្នែកបានបញ្ចប់" : "lessons completed"}
              </span>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">
                  {km ? LESSON_ABOUT_STRESS.kmTitle : LESSON_ABOUT_STRESS.title}
                </h3>
                <p className="text-xs text-ink-muted">
                  {km ? "ផ្នែកបន្ទាប់របស់អ្នកបានត្រៀមរួចជាស្រេច" : "Ready to jump back into your next section."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectLesson(LESSON_ABOUT_STRESS)}
                className="flex items-center gap-2 self-start rounded-xl bg-arom px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-arom-deep cursor-pointer"
              >
                <span>{km ? "បន្តឥឡូវនេះ" : "Resume"}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </section>
        )}

        {/* Lessons List (Vertical Cards) */}
        <section
          aria-labelledby="all-lessons-heading"
          className="mt-8 sm:mt-10"
        >
          <div className="flex items-center justify-between">
            <h2
              id="all-lessons-heading"
              className="text-xl font-bold text-arom"
            >
              {km ? "បញ្ជីមេរៀនទាំងអស់ (All Lessons)" : "All Lessons"}
            </h2>
            <span className="text-xs font-medium text-ink-muted">
              {filteredLessons.length} {km ? "មេរៀន" : "lessons"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {filteredLessons.map((lesson) => {
              const isAvailable = lesson.isAvailable;
              const inPlan = planIds.includes(lesson.id);

              return (
                <motion.div
                  key={lesson.id}
                  whileHover={isAvailable ? { y: -2 } : {}}
                  onClick={() => {
                    if (isAvailable) {
                      onSelectLesson(lesson);
                    }
                  }}
                  className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-150 ${
                    isAvailable
                      ? "cursor-pointer border-arom-border bg-white shadow-[0_8px_24px_rgba(25,87,72,0.05)] hover:border-arom/40 hover:shadow-card"
                      : "cursor-default border-arom-border/60 bg-white/70 opacity-75"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-arom-soft sm:size-16 flex items-center justify-center">
                    <Image
                      src={lesson.image}
                      alt={lesson.title}
                      width={38}
                      height={38}
                      className="size-8 object-contain sm:size-9"
                      unoptimized
                    />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-arom">
                        {lesson.category}
                      </span>
                      {lesson.badge && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-arom-border bg-arom-wash px-2.5 py-0.5 text-[0.68rem] font-semibold text-ink-muted">
                          <Lock size={10} />
                          {lesson.badge === "Coming Soon" && km ? "នឹងមកដល់ឆាប់ៗ (Coming Soon)" : lesson.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1 truncate text-sm font-bold text-arom sm:text-base">
                      {km && lesson.kmTitle ? lesson.kmTitle : lesson.title}
                    </h3>

                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted sm:text-sm">
                      {km && lesson.kmDescription
                        ? lesson.kmDescription
                        : lesson.description}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={13} />
                        {km && lesson.kmDuration ? lesson.kmDuration : lesson.duration}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap size={13} />
                        {km && lesson.kmDifficulty ? lesson.kmDifficulty : lesson.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Add to plan + Arrow or Lock */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isAvailable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePlan(lesson);
                        }}
                        title={
                          inPlan
                            ? km
                              ? "លុបចេញពីផែនការទំព័រដើម"
                              : "Remove from Home Daily Plan"
                            : km
                            ? "បន្ថែមទៅផែនការទំព័រដើម"
                            : "Add to Home Daily Plan"
                        }
                        className={`flex size-9 items-center justify-center rounded-xl border transition-all duration-150 cursor-pointer ${
                          inPlan
                            ? "border-arom bg-arom text-white shadow-2xs"
                            : "border-arom-border bg-white text-arom hover:border-arom hover:bg-arom-wash"
                        }`}
                      >
                        {inPlan ? <CalendarCheck size={16} /> : <CalendarPlus size={16} />}
                      </button>
                    )}

                    {isAvailable ? (
                      <span className="flex size-10 items-center justify-center rounded-full bg-arom-soft text-arom transition-colors group-hover:bg-arom group-hover:text-white">
                        <ChevronRight size={18} />
                      </span>
                    ) : (
                      <span className="flex size-9 items-center justify-center rounded-full bg-arom-wash text-ink-muted/50">
                        <Lock size={14} />
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

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
