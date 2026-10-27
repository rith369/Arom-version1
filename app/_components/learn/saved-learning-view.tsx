"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  ChevronRight,
  Headphones,
  Lightbulb,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useLanguage } from "../language-provider";
import { MINDGUIDE_PODCASTS, formatDuration } from "../podcasts/podcast-data";
import { removeSaved } from "../saved/saved-store";
import { useSavedIds } from "../saved/use-saved";
import { ALL_TIPS, TIP_CATEGORIES } from "../tips/tips-data";
import { ALL_LESSONS, TOPIC_CATEGORIES } from "./learn-data";

type SavedLearningViewProps = {
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
};

type Tab = "lesson" | "tip" | "podcast";

type Row = {
  id: string;
  title: string;
  category: string;
  duration: string;
  // Empty for podcasts, which show an icon instead of a picture.
  image: string;
};

// Newest saved first. Ids that no longer match an available item are skipped.
function newestFirst<T extends { id: string }>(ids: string[], items: T[]): T[] {
  return [...ids]
    .reverse()
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is T => Boolean(item));
}

export function SavedLearningView({
  onBack,
  onSelectLesson,
}: SavedLearningViewProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("lesson");
  const lessonIds = useSavedIds("lesson");
  const tipIds = useSavedIds("tip");
  const podcastIds = useSavedIds("podcast");

  const rows: Record<Tab, Row[]> = {
    lesson: newestFirst(lessonIds, ALL_LESSONS.filter((lesson) => lesson.isAvailable)).map((lesson) => {
      const category = TOPIC_CATEGORIES.find((item) => item.id === lesson.category);
      return {
        id: lesson.id,
        title: km && lesson.kmTitle ? lesson.kmTitle : lesson.title,
        category: (km ? category?.kmLabel : category?.label) ?? lesson.category,
        duration: km ? lesson.kmDuration ?? lesson.duration : lesson.duration,
        image: lesson.image,
      };
    }),
    tip: newestFirst(tipIds, ALL_TIPS.filter((tip) => tip.isAvailable)).map((tip) => {
      const category = TIP_CATEGORIES.find((item) => item.id === tip.category);
      return {
        id: tip.id,
        title: km ? tip.kmTitle : tip.title,
        category: (km ? category?.kmLabel : category?.label) ?? tip.category,
        duration: km ? tip.kmDuration : tip.duration,
        image: tip.image,
      };
    }),
    podcast: newestFirst(podcastIds, MINDGUIDE_PODCASTS).map((podcast) => ({
      id: podcast.id,
      title: km ? podcast.kmTitle : podcast.title,
      category: km ? podcast.kmTopic : podcast.topic,
      duration: formatDuration(podcast.durationSeconds, km),
      image: "",
    })),
  };

  const openRow = (id: string) => {
    if (activeTab === "lesson") onSelectLesson(id);
    else if (activeTab === "tip") router.push(`/mindguide/tips?open=${id}`);
    else router.push(`/podcasts/${id}`);
  };

  const handleRemoveBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSaved(activeTab, id);
  };

  const filteredItems = rows[activeTab];

  return (
    <div className="min-h-screen bg-canvas text-ink pb-24 lg:pb-12">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-arom-border bg-white px-4 py-3.5 backdrop-blur-xl sm:px-8">
        <button
          type="button"
          onClick={onBack}
          aria-label={km ? "ត្រឡប់ក្រោយ" : "Back to Learn"}
          className="flex size-10 items-center justify-center rounded-full border border-arom-border bg-white text-arom shadow-sm transition-colors hover:bg-arom-wash"
        >
          <ArrowLeft size={19} />
        </button>

        <h1 className="text-base font-bold text-arom sm:text-lg">
          {km ? "មេរៀនដែលបានរក្សាទុក (Saved)" : "Saved Learning"}
        </h1>

        <div className="size-10" />
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6 sm:px-8 sm:pt-8">
        {/* Segmented Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl border border-arom-border bg-arom-wash p-1">
          {(
            [
              { id: "lesson", label: "Lessons", kmLabel: "មេរៀន (Lessons)", icon: BookOpen },
              { id: "tip", label: "Tips", kmLabel: "គន្លឹះ (Tips)", icon: Lightbulb },
              { id: "podcast", label: "Podcasts", kmLabel: "ផតខាស (Podcasts)", icon: Headphones },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                  isActive
                    ? "bg-arom text-white shadow-sm"
                    : "text-ink-muted hover:text-arom hover:bg-white/60"
                }`}
              >
                <Icon size={15} />
                <span>{km ? tab.kmLabel : tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Item List */}
        <div className="mt-6 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-arom-border bg-white py-14 px-4 text-center shadow-sm">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-arom-soft text-arom">
                <Bookmark size={24} />
              </span>
              <p className="mt-4 text-sm font-bold text-arom">
                {km ? "មិនទាន់មានអ្វីដែលបានរក្សាទុកក្នុងផ្នែកនេះទេ" : "No saved items in this category"}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {km
                  ? "ចុចលើរូបសញ្ញាចំណាំដើម្បីរក្សាទុកសម្រាប់អានពេលក្រោយ"
                  : "Tap the bookmark icon on any lesson to save it for later review."}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                onClick={() => openRow(item.id)}
                className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-arom-border bg-white p-3.5 shadow-[0_8px_24px_rgba(25,87,72,0.05)] transition-all hover:border-arom/40 hover:shadow-card sm:p-4"
              >
                {/* Thumbnail */}
                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-arom-soft text-arom sm:size-20">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Headphones size={26} aria-hidden="true" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-md bg-arom-soft px-2 py-0.5 text-[0.68rem] font-semibold text-arom">
                    {item.category}
                  </span>
                  <h3 className="mt-1 truncate text-sm font-bold text-ink sm:text-base">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-muted">{item.duration}</p>
                </div>

                {/* Bookmark Toggle / Remove */}
                <button
                  type="button"
                  onClick={(e) => handleRemoveBookmark(item.id, e)}
                  aria-label={km ? "លុបចេញពីចំណាំ" : "Remove bookmark"}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-arom-border bg-white text-arom transition-colors hover:bg-arom-danger-soft hover:text-arom-danger hover:border-arom-danger/40 shadow-sm"
                >
                  <Bookmark size={17} className="fill-arom" />
                </button>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-arom transition-transform duration-150 group-hover:translate-x-0.5"
                />
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
