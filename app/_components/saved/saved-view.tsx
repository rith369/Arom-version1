"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Lightbulb,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { useLanguage } from "../language-provider";
import { ALL_LESSONS, TOPIC_CATEGORIES } from "../learn/learn-data";
import { MINDGUIDE_PODCASTS, formatDuration } from "../podcasts/podcast-data";
import { ALL_PRACTICES, PRACTICE_CATEGORIES } from "../practice/practice-data";
import { ALL_TIPS, TIP_CATEGORIES } from "../tips/tips-data";
import { removeSaved, useSavedIds, type SavedKind } from "./saved-store";

type SavedRow = {
  id: string;
  title: string;
  meta: string;
  href: string;
  // Empty for podcasts, which show an icon instead of a picture.
  image: string;
};

const TABS: {
  kind: SavedKind;
  label: string;
  kmLabel: string;
  icon: LucideIcon;
  browseHref: string;
  emptyEn: string;
  emptyKm: string;
}[] = [
  {
    kind: "lesson",
    label: "Lessons",
    kmLabel: "មេរៀន (Lessons)",
    icon: BookOpen,
    browseHref: "/mindguide/learn",
    emptyEn: "Tap the bookmark on a lesson to keep it here.",
    emptyKm: "ចុចរូបសញ្ញាចំណាំលើមេរៀន ដើម្បីរក្សាទុកនៅទីនេះ។",
  },
  {
    kind: "tip",
    label: "Tips",
    kmLabel: "គន្លឹះ (Tips)",
    icon: Lightbulb,
    browseHref: "/mindguide/tips",
    emptyEn: "Tap the bookmark on a tip to keep it here.",
    emptyKm: "ចុចរូបសញ្ញាចំណាំលើគន្លឹះ ដើម្បីរក្សាទុកនៅទីនេះ។",
  },
  {
    kind: "practice",
    label: "Practice",
    kmLabel: "ការអនុវត្ត (Practice)",
    icon: Wind,
    browseHref: "/mindguide/practice",
    emptyEn: "Tap the bookmark on an exercise to keep it here.",
    emptyKm: "ចុចរូបសញ្ញាចំណាំលើលំហាត់ ដើម្បីរក្សាទុកនៅទីនេះ។",
  },
  {
    kind: "podcast",
    label: "Podcasts",
    kmLabel: "ផតខាស (Podcasts)",
    icon: Headphones,
    browseHref: "/podcasts",
    emptyEn: "Tap the heart in the player to keep an episode here.",
    emptyKm: "ចុចរូបបេះដូងក្នុងកម្មវិធីចាក់ ដើម្បីរក្សាទុកភាគនៅទីនេះ។",
  },
];

const BROWSE_EN: Record<SavedKind, string> = {
  lesson: "Browse lessons",
  tip: "Browse tips",
  practice: "Browse practice",
  podcast: "Browse podcasts",
};
const BROWSE_KM: Record<SavedKind, string> = {
  lesson: "មើលមេរៀន",
  tip: "មើលគន្លឹះ",
  practice: "មើលការអនុវត្ត",
  podcast: "មើលផតខាស",
};

// Newest saved first. Ids that no longer match an available item are skipped.
function newestFirst<T extends { id: string }>(ids: string[], items: T[]): T[] {
  return [...ids]
    .reverse()
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is T => Boolean(item));
}

function useSavedRows(km: boolean): Record<SavedKind, SavedRow[]> {
  const lessonIds = useSavedIds("lesson");
  const tipIds = useSavedIds("tip");
  const practiceIds = useSavedIds("practice");
  const podcastIds = useSavedIds("podcast");

  const join = (parts: (string | undefined)[]) => parts.filter(Boolean).join(" · ");

  return {
    lesson: newestFirst(
      lessonIds,
      ALL_LESSONS.filter((lesson) => lesson.isAvailable),
    ).map((lesson) => {
      const category = TOPIC_CATEGORIES.find((item) => item.id === lesson.category);
      return {
        id: lesson.id,
        title: km && lesson.kmTitle ? lesson.kmTitle : lesson.title,
        meta: join([km ? lesson.kmDuration ?? lesson.duration : lesson.duration, km ? category?.kmLabel : category?.label]),
        href: `/mindguide/learn?open=${lesson.id}`,
        image: lesson.image,
      };
    }),
    tip: newestFirst(
      tipIds,
      ALL_TIPS.filter((tip) => tip.isAvailable),
    ).map((tip) => {
      const category = TIP_CATEGORIES.find((item) => item.id === tip.category);
      return {
        id: tip.id,
        title: km ? tip.kmTitle : tip.title,
        meta: join([km ? tip.kmDuration : tip.duration, km ? category?.kmLabel : category?.label]),
        href: `/mindguide/tips?open=${tip.id}`,
        image: tip.image,
      };
    }),
    practice: newestFirst(
      practiceIds,
      ALL_PRACTICES.filter((practice) => practice.isAvailable),
    ).map((practice) => {
      const category = PRACTICE_CATEGORIES.find((item) => item.id === practice.category);
      return {
        id: practice.id,
        title: km && practice.kmTitle ? practice.kmTitle : practice.title,
        meta: join([
          km ? practice.kmDuration ?? practice.duration : practice.duration,
          km ? category?.kmLabel : category?.label,
        ]),
        href: `/mindguide/practice?open=${practice.id}`,
        image: practice.image,
      };
    }),
    podcast: newestFirst(podcastIds, MINDGUIDE_PODCASTS).map((podcast) => ({
      id: podcast.id,
      title: km ? podcast.kmTitle : podcast.title,
      meta: join([formatDuration(podcast.durationSeconds, km), km ? podcast.kmTopic : podcast.topic]),
      href: `/podcasts/${podcast.id}`,
      image: "",
    })),
  };
}

export function SavedView() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const shouldReduceMotion = useReducedMotion();
  const rows = useSavedRows(km);
  const [picked, setPicked] = useState<SavedKind | null>(null);

  // Until a tab is tapped, open the first one that has something saved.
  const active: SavedKind =
    picked ?? TABS.find((tab) => rows[tab.kind].length > 0)?.kind ?? "lesson";
  const tab = TABS.find((item) => item.kind === active) ?? TABS[0];
  const items = rows[active];
  const total = TABS.reduce((sum, item) => sum + rows[item.kind].length, 0);

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Profile" />

      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8 xl:px-14">
        <div className="mx-auto w-full max-w-[52rem]">
          <Link
            href="/profile"
            aria-label={t("ត្រឡប់ទៅការកំណត់", "Back to settings")}
            className="-ml-2 flex size-11 items-center justify-center rounded-full text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
          >
            <ChevronLeft size={26} aria-hidden="true" />
          </Link>

          <header className="mt-1">
            <h1 className="text-[28px] font-semibold leading-tight text-arom sm:text-4xl">
              {t("បានរក្សាទុក (Saved)", "Saved")}
            </h1>
            <p className="mt-2 text-[15px] font-light leading-snug text-ink">
              {t(
                "មេរៀន គន្លឹះ ការអនុវត្ត និងផតខាសដែលអ្នកបានរក្សាទុក នៅកន្លែងតែមួយ។",
                "Your lessons, tips, practice and podcasts, all in one place.",
              )}
            </p>
          </header>

          <div
            role="tablist"
            aria-label={t("ប្រភេទដែលបានរក្សាទុក", "Saved types")}
            className="mt-6 grid grid-cols-4 gap-1 rounded-2xl border border-arom-border bg-arom-wash p-1"
          >
            {TABS.map((item) => {
              const isActive = item.kind === active;
              const Icon = item.icon;
              const count = rows[item.kind].length;
              return (
                <button
                  key={item.kind}
                  type="button"
                  role="tab"
                  id={`saved-tab-${item.kind}`}
                  aria-selected={isActive}
                  aria-controls="saved-panel"
                  onClick={() => setPicked(item.kind)}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center text-[11px] font-semibold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom sm:text-sm ${
                    isActive ? "bg-arom text-white shadow-sm" : "text-ink-muted hover:bg-white/70 hover:text-arom"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{km ? item.kmLabel : item.label}</span>
                  <span
                    className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                      isActive ? "bg-white/20" : "bg-arom-soft text-arom"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="saved-panel"
            role="tabpanel"
            aria-labelledby={`saved-tab-${active}`}
            className="mt-6"
          >
            {items.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-arom-border bg-white px-4 py-12 text-center shadow-sm">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-arom-soft text-arom">
                  <Bookmark size={24} aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-bold text-arom">
                  {total === 0
                    ? t("មិនទាន់មានអ្វីដែលបានរក្សាទុកទេ", "Nothing saved yet")
                    : t("មិនទាន់មានអ្វីដែលបានរក្សាទុកក្នុងផ្នែកនេះទេ", "Nothing saved in this part yet")}
                </p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-ink-muted">
                  {km ? tab.emptyKm : tab.emptyEn}
                </p>
                <Link
                  href={tab.browseHref}
                  className="mt-5 inline-flex h-10 items-center rounded-xl bg-arom px-5 text-sm font-semibold text-white transition-colors hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                >
                  {km ? BROWSE_KM[active] : BROWSE_EN[active]}
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {items.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, transform: "translateY(8px)" }}
                    animate={{ opacity: 1, transform: "translateY(0)" }}
                    transition={{ duration: 0.24, delay: shouldReduceMotion ? 0 : index * 0.04 }}
                    className="flex items-center gap-2 rounded-2xl border border-arom-border bg-white p-3 shadow-sm transition-shadow hover:shadow-card"
                  >
                    <Link
                      href={item.href}
                      className="group flex min-w-0 flex-1 items-center gap-3.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                    >
                      <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-arom-soft text-arom sm:size-16">
                        {item.image ? (
                          <Image src={item.image} alt="" fill sizes="64px" unoptimized className="object-cover" />
                        ) : (
                          <Headphones size={26} aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-arom">{item.title}</span>
                        <span className="mt-0.5 block truncate text-[13px] font-light text-ink">{item.meta}</span>
                      </span>
                      <ChevronRight
                        size={20}
                        aria-hidden="true"
                        className="shrink-0 text-arom transition-transform duration-150 group-hover:translate-x-0.5"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeSaved(active, item.id)}
                      aria-label={t(`ដក ${item.title} ចេញពីអ្វីដែលបានរក្សាទុក`, `Remove ${item.title} from saved`)}
                      className="flex size-10 shrink-0 items-center justify-center rounded-full text-arom transition-colors hover:bg-arom-danger-soft hover:text-arom-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                    >
                      <Bookmark size={19} aria-hidden="true" className="fill-current" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <MobileNavigation active="Profile" />
    </div>
  );
}
