"use client";

import Link from "next/link";
import { Check, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FigmaIcon } from "./figma-icon";
import { useLanguage } from "../_components/language-provider";
import {
  getPlanTryNowItems,
  togglePlanTryNowComplete,
  type PlanTryNowItem,
} from "../_components/tips/tips-data";
import {
  getCustomPlanItems,
  removeCustomPlanItem,
  toggleCustomPlanItemComplete,
  type DailyPlanCustomItem,
} from "../_components/daily-plan-store";

type PlanActivity = {
  id: string;
  title: string;
  titleKm: string;
  subtitle: string;
  subtitleKm: string;
  icon: string;
  href: string;
  completed?: boolean;
  isTryNow?: boolean;
  stepNumber?: number;
  isCustom?: boolean;
  badge?: string;
  badgeKm?: string;
};

const baseMoodActivity: PlanActivity = {
  id: "mood",
  title: "Mood check in",
  titleKm: "ពិនិត្យអារម្មណ៍ (Mood Check-in)",
  subtitle: "Great Start",
  subtitleKm: "ការចាប់ផ្តើមដ៏ស្រស់ស្រាយ",
  icon: "mdi_check-circle",
  href: "/detection/journal",
  completed: true,
};

const defaultMindGuideActivity: PlanActivity = {
  id: "default-mindguide",
  title: "MindGuide Lesson",
  titleKm: "មេរៀនចិត្ត (MindGuide Lesson)",
  subtitle: "Understanding Anxiety (5min)",
  subtitleKm: "ស្វែងយល់ពីការថប់បារម្ភ (Anxiety) • ៥ នាទី",
  icon: "ant-design_play-circle-filled",
  href: "/mindguide",
  completed: true,
};

const defaultMeditationActivity: PlanActivity = {
  id: "default-meditation",
  title: "Guided Meditation",
  titleKm: "ការហាត់សមាធិ (Guided Meditation)",
  subtitle: "Relax and breathe (3min)",
  subtitleKm: "សម្រាកកាយ និងដកដង្ហើម • ៣ នាទី",
  icon: "hugeicons_yoga-03",
  href: "/practice",
  completed: false,
};

const baseCommunityActivity: PlanActivity = {
  id: "community",
  title: "Explore Community",
  titleKm: "ចូលរួមសហគមន៍ (Community)",
  subtitle: "Share Each Other",
  subtitleKm: "ចែករំលែក និងលើកទឹកចិត្តគ្នា",
  icon: "fluent_people-community-32-filled",
  href: "/community",
  completed: false,
};

export function DailyPlanCard() {
  const { language } = useLanguage();
  const km = language === "km";
  const [tryNowItems, setTryNowItems] = useState<PlanTryNowItem[]>([]);
  const [customItems, setCustomItems] = useState<DailyPlanCustomItem[]>([]);

  useEffect(() => {
    setTryNowItems(getPlanTryNowItems());
    setCustomItems(getCustomPlanItems());

    const handleUpdate = () => {
      setTryNowItems(getPlanTryNowItems());
      setCustomItems(getCustomPlanItems());
    };

    window.addEventListener("arom_plan_updated", handleUpdate);
    return () => window.removeEventListener("arom_plan_updated", handleUpdate);
  }, []);

  const handleToggleTryNow = (e: React.MouseEvent, stepNumber: number) => {
    e.preventDefault();
    e.stopPropagation();
    togglePlanTryNowComplete(stepNumber);
  };

  const handleToggleCustom = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCustomPlanItemComplete(id);
  };

  const handleRemoveCustom = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeCustomPlanItem(id);
  };

  // Convert try now items into plan activities
  const tryNowActivities: PlanActivity[] =
    tryNowItems.length > 0
      ? tryNowItems.map((item) => ({
          id: item.id,
          title: item.title,
          titleKm: item.kmTitle,
          subtitle: item.subtitle,
          subtitleKm: item.kmSubtitle,
          icon: item.completed ? "mdi_check-circle" : "boxicons_note-filled",
          href: "/tips",
          completed: item.completed,
          isTryNow: true,
          stepNumber: item.stepNumber,
        }))
      : [
          {
            id: "default-try-now",
            title: "Try now: Cut what you control",
            titleKm: "សាកល្បង (Try now)៖ បន្ធូរបន្ថយអ្វីដែលអ្នកគ្រប់គ្រងបាន",
            subtitle: "drop or delay ONE thing this week.",
            subtitleKm: "កាត់បន្ថយ ឬពន្យារពេលការងារមួយក្នុងសប្តាហ៍នេះ",
            icon: "boxicons_note-filled",
            href: "/tips",
            completed: false,
            isTryNow: true,
            stepNumber: 1,
          },
        ];

  // Convert custom items added from MindGuide into plan activities
  const customActivities: PlanActivity[] = customItems.map((item) => ({
    id: item.id,
    title: item.title,
    titleKm: item.titleKm,
    subtitle: item.subtitle,
    subtitleKm: item.subtitleKm,
    icon:
      item.icon ||
      (item.source === "practice"
        ? "hugeicons_yoga-03"
        : item.source === "learn"
        ? "ant-design_play-circle-filled"
        : "boxicons_note-filled"),
    href: item.href,
    completed: item.completed,
    isCustom: true,
    badge: item.badge,
    badgeKm: item.badgeKm,
  }));

  // Build the complete activities array
  // If user has added custom items from MindGuide, display them!
  // If none added, show the default MindGuide lesson and guided meditation
  const mindguideOrCustomItems =
    customActivities.length > 0
      ? customActivities
      : [defaultMindGuideActivity, defaultMeditationActivity];

  const allActivities: PlanActivity[] = [
    baseMoodActivity,
    ...mindguideOrCustomItems,
    ...tryNowActivities,
    baseCommunityActivity,
  ];

  const totalTasks = allActivities.length;
  const completedTasks = allActivities.filter((a) => a.completed).length;

  return (
    <section
      aria-labelledby="daily-plan-heading"
      className="rounded-[20px] bg-[#1f6f5b] p-4 text-white shadow-[0_12px_36px_rgba(31,111,91,0.18)] sm:p-5"
    >
      <div className="flex items-center justify-between">
        <h2 id="daily-plan-heading" className="text-sm font-medium tracking-normal sm:text-base">
          {km ? "ផែនការប្រចាំថ្ងៃរបស់អ្នក (Daily Plan)" : "Your Plan For Today"}
        </h2>
        <span className="text-xs font-semibold text-[#83dfca]">
          {completedTasks}/{totalTasks} {km ? "រួចរាល់" : "done"}
        </span>
      </div>

      {/* Dynamic segment progress bar */}
      <div
        role="progressbar"
        aria-valuenow={completedTasks}
        aria-valuemin={0}
        aria-valuemax={totalTasks}
        aria-label={`${completedTasks} of ${totalTasks} tasks completed`}
        className="mt-3 flex items-center gap-1.5"
      >
        {allActivities.map((task, idx) => (
          <span
            key={task.id || idx}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              task.completed ? "bg-[#23aa89]" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Plan Activity items */}
      <div className="mt-3 divide-y divide-white/10">
        {allActivities.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex items-center gap-3 py-2.5 transition-colors duration-150 hover:bg-white/5 rounded-xl px-1.5 focus-visible:outline-2 focus-visible:outline-white"
          >
            {/* Interactive check button for Try Now and Custom MindGuide items */}
            {item.isTryNow && item.stepNumber !== undefined ? (
              <button
                type="button"
                onClick={(e) => handleToggleTryNow(e, item.stepNumber!)}
                aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                className={`flex size-7 items-center justify-center rounded-full shrink-0 border transition-colors ${
                  item.completed
                    ? "border-[#23aa89] bg-[#23aa89] text-white shadow-sm"
                    : "border-white/40 bg-white/10 text-white/60 hover:border-white hover:text-white"
                }`}
              >
                {item.completed ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <FigmaIcon name="boxicons_note-filled" size={16} className="text-white" />
                )}
              </button>
            ) : item.isCustom ? (
              <button
                type="button"
                onClick={(e) => handleToggleCustom(e, item.id)}
                aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                className={`flex size-7 items-center justify-center rounded-full shrink-0 border transition-colors ${
                  item.completed
                    ? "border-[#23aa89] bg-[#23aa89] text-white shadow-sm"
                    : "border-white/40 bg-white/10 text-white/60 hover:border-white hover:text-white"
                }`}
              >
                {item.completed ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <FigmaIcon name={item.icon} size={16} className="text-white" />
                )}
              </button>
            ) : (
              <div className="flex size-7 items-center justify-center shrink-0">
                <FigmaIcon name={item.icon} size={22} className="text-white" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-medium leading-tight text-white sm:text-[13px]">
                  {km ? item.titleKm : item.title}
                </p>
                {item.isTryNow && (
                  <span className="rounded bg-[#23aa89]/30 px-1.5 py-0.5 text-[0.62rem] font-semibold text-[#a3edd9]">
                    {km ? "សាកល្បង (Try Now)" : "Try Now"}
                  </span>
                )}
                {item.badge && (
                  <span className="rounded bg-white/15 px-1.5 py-0.5 text-[0.62rem] font-semibold text-[#83dfca]">
                    {km && item.badgeKm ? item.badgeKm : item.badge}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] font-light leading-tight text-white/80">
                {km ? item.subtitleKm : item.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {item.isCustom && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveCustom(e, item.id)}
                  aria-label={km ? "លុបចេញពីផែនការ" : "Remove from daily plan"}
                  title={km ? "លុបចេញពីផែនការ" : "Remove from daily plan"}
                  className="flex size-6 items-center justify-center rounded-md text-white/40 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
              <ChevronRight
                aria-hidden="true"
                className="size-4 shrink-0 text-white/90 transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
