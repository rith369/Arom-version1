"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, Plus, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FigmaIcon } from "./figma-icon";
import { DailyPlanCuratorModal } from "./daily-plan-curator-modal";
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
import {
  cambodiaToday,
  isDoneToday,
  isDueToday,
  mindguideOption,
  taskHref,
  taskTitle,
  toggleCheckIn,
  useCareStore,
  type CareTask,
} from "../_components/care/care-store";

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
  // Given by the client's professional (Care plan).
  careTask?: CareTask;
};

// Icon for a task from the professional, matching the plan's other rows.
function careIcon(task: CareTask) {
  const type = mindguideOption(task)?.type;
  if (type === "practice") return "hugeicons_yoga-03";
  if (type === "lesson") return "ant-design_play-circle-filled";
  return "boxicons_note-filled";
}

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
  subtitle: "Understanding Anxiety (5 min)",
  subtitleKm: "ស្វែងយល់ពីការថប់បារម្ភ (Anxiety) • ៥ នាទី",
  icon: "ant-design_play-circle-filled",
  href: "/mindguide",
  completed: true,
};

const defaultMeditationActivity: PlanActivity = {
  id: "default-meditation",
  title: "Guided Meditation",
  titleKm: "ការហាត់សមាធិ (Guided Meditation)",
  subtitle: "Relax and breathe (3 min)",
  subtitleKm: "សម្រាកកាយ និងដកដង្ហើម • ៣ នាទី",
  icon: "hugeicons_yoga-03",
  href: "/practice",
  completed: false,
};

const baseCommunityActivity: PlanActivity = {
  id: "community",
  title: "Explore Community",
  titleKm: "ចូលរួមសហគមន៍ (Community)",
  subtitle: "Share with each other",
  subtitleKm: "ចែករំលែក និងលើកទឹកចិត្តគ្នា",
  icon: "fluent_people-community-32-filled",
  href: "/community",
  completed: false,
};

// The tick in a plan row. The check settles in when an item is ticked, but
// not when the page loads. Reduced motion: fade only.
function TickIcon({ done, children }: { done: boolean; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false} mode="popLayout">
      {done ? (
        <motion.span
          key="done"
          className="flex"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        >
          <Check size={16} strokeWidth={2.5} />
        </motion.span>
      ) : (
        <motion.span key="todo" className="flex" initial={false} exit={{ opacity: 0, transition: { duration: 0 } }}>
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function DailyPlanCard() {
  const { language } = useLanguage();
  const km = language === "km";
  const [tryNowItems, setTryNowItems] = useState<PlanTryNowItem[]>([]);
  const [customItems, setCustomItems] = useState<DailyPlanCustomItem[]>([]);
  const [isCuratorOpen, setIsCuratorOpen] = useState(false);
  const care = useCareStore("client");
  const [today] = useState(() => cambodiaToday(Date.now()));

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

  const handleToggleCare = (e: React.MouseEvent, task: CareTask) => {
    e.preventDefault();
    e.stopPropagation();
    void toggleCheckIn(task, today);
  };

  // Tasks from the user's professionals that are due today.
  const careActivities: PlanActivity[] = care.tasks
    .filter((task) => isDueToday(task, care.checkIns, today))
    .map((task) => {
      const professional = care.professionals.find((item) => item.slug === task.professionalId);
      const from = professional?.name || "your professional";
      const fromKm = professional?.kmName || professional?.name || "អ្នកជំនាញរបស់អ្នក";
      return {
        id: task.id,
        title: taskTitle(task, false),
        titleKm: taskTitle(task, true),
        subtitle: task.note || (task.kind === "goal" ? "Goal, tick it when you reach it" : "From your care plan"),
        subtitleKm: task.note || (task.kind === "goal" ? "គោលដៅ ចុចពេលអ្នកសម្រេចបាន" : "ពីផែនការថែទាំរបស់អ្នក"),
        icon: careIcon(task),
        href: taskHref(task),
        completed: isDoneToday(task, care.checkIns, today),
        badge: `From ${from}`,
        badgeKm: `ពី ${fromKm}`,
        careTask: task,
      };
    });

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
    ...careActivities,
    ...mindguideOrCustomItems,
    ...tryNowActivities,
    baseCommunityActivity,
  ];

  const totalTasks = allActivities.length;
  const completedTasks = allActivities.filter((a) => a.completed).length;

  return (
    <div>
      {/* The AROM sprout peeking over the plan (Figma Homescreen). The picture is
          wider than the card so its plants line up with the card's edges. */}
      <Image
        src="/home/plan-banner.webp"
        alt=""
        width={1024}
        height={325}
        preload
        sizes="(min-width: 1024px) 34rem, (min-width: 640px) 36rem, 100vw"
        className="pointer-events-none relative -mx-[5.65%] block h-auto w-[111.3%] max-w-none select-none"
      />
      <section
        aria-labelledby="daily-plan-heading"
        className="rounded-[20px] bg-[#1f6f5b] p-4 text-white shadow-[0_12px_36px_rgba(31,111,91,0.18)] sm:p-5"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="daily-plan-heading" className="text-base font-semibold tracking-normal sm:text-lg">
            {km ? "ផែនការប្រចាំថ្ងៃរបស់អ្នក (Daily Plan)" : "Your Plan For Today"}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap text-xs font-semibold text-[#83dfca]">
              {completedTasks}/{totalTasks} {km ? "រួចរាល់" : "done"}
            </span>
            <button
              type="button"
              onClick={() => setIsCuratorOpen(true)}
              aria-label={km ? "រៀបចំផែនការសុខុមាលភាព" : "Curate daily plan"}
              className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white transition-all hover:bg-white/25 active:scale-95 cursor-pointer"
            >
              <SlidersHorizontal size={12} />
              <span>{km ? "រៀបចំ" : "Curate"}</span>
            </button>
          </div>
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
              className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                task.completed ? "bg-[#23aa89] shadow-[0_0_6px_rgba(35,170,137,0.6)]" : "bg-white/75"
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
              {item.careTask ? (
                <button
                  type="button"
                  onClick={(e) => handleToggleCare(e, item.careTask!)}
                  aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                  className={`flex size-7 items-center justify-center rounded-full shrink-0 border transition-[transform,background-color,border-color,color] duration-[160ms] ease-[var(--ease-out)] active:scale-95 motion-reduce:active:scale-100 ${
                    item.completed
                      ? "border-[#23aa89] bg-[#23aa89] text-white shadow-sm"
                      : "border-white/40 bg-white/10 text-white/60 hover:border-white hover:text-white"
                  }`}
                >
                  <TickIcon done={item.completed === true}>
                    <FigmaIcon name={item.icon} size={16} className="text-white" />
                  </TickIcon>
                </button>
              ) : item.isTryNow && item.stepNumber !== undefined ? (
                <button
                  type="button"
                  onClick={(e) => handleToggleTryNow(e, item.stepNumber!)}
                  aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                  className={`flex size-7 items-center justify-center rounded-full shrink-0 border transition-[transform,background-color,border-color,color] duration-[160ms] ease-[var(--ease-out)] active:scale-95 motion-reduce:active:scale-100 ${
                    item.completed
                      ? "border-[#23aa89] bg-[#23aa89] text-white shadow-sm"
                      : "border-white/40 bg-white/10 text-white/60 hover:border-white hover:text-white"
                  }`}
                >
                  <TickIcon done={item.completed === true}>
                    <FigmaIcon name="boxicons_note-filled" size={16} className="text-white" />
                  </TickIcon>
                </button>
              ) : item.isCustom ? (
                <button
                  type="button"
                  onClick={(e) => handleToggleCustom(e, item.id)}
                  aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                  className={`flex size-7 items-center justify-center rounded-full shrink-0 border transition-[transform,background-color,border-color,color] duration-[160ms] ease-[var(--ease-out)] active:scale-95 motion-reduce:active:scale-100 ${
                    item.completed
                      ? "border-[#23aa89] bg-[#23aa89] text-white shadow-sm"
                      : "border-white/40 bg-white/10 text-white/60 hover:border-white hover:text-white"
                  }`}
                >
                  <TickIcon done={item.completed === true}>
                    <FigmaIcon name={item.icon} size={16} className="text-white" />
                  </TickIcon>
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

        {careActivities.length > 0 && (
          <Link
            href="/care-plan"
            className="mt-2 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#a3edd9] hover:text-white"
          >
            {km ? "មើលផែនការថែទាំរបស់អ្នក" : "See your care plan"}
            <ChevronRight aria-hidden="true" className="size-3.5" />
          </Link>
        )}

        {/* Bottom launcher for Daily Flow Curator */}
        <button
          type="button"
          onClick={() => setIsCuratorOpen(true)}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/35 bg-white/[0.08] px-3 py-2.5 text-xs font-semibold text-white/95 transition-all hover:border-white/70 hover:bg-white/15 active:scale-[0.99] cursor-pointer"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>
            {km
              ? "+ បន្ថែមសកម្មភាពទៅផែនការប្រចាំថ្ងៃ"
              : "+ Add Activities to Your Daily Flow"}
          </span>
        </button>

        {/* Daily Plan Curator Modal */}
        <DailyPlanCuratorModal
          isOpen={isCuratorOpen}
          onClose={() => setIsCuratorOpen(false)}
        />
      </section>
    </div>
  );
}
