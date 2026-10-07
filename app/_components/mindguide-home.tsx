"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Play,
  Plus,
  Wind,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AromBrand, DesktopNavigation, MobileNavigation } from "./app-navigation";
import { BreathingExperience } from "./breathing-session";
import {
  getCustomPlanItems,
  toggleCustomPlanItem,
  type DailyPlanCustomItem,
} from "./daily-plan-store";
import { useLanguage } from "./language-provider";
import { LessonCompleteView } from "./learn/lesson-complete-view";
import { LESSON_ABOUT_STRESS } from "./learn/learn-data";
import { LessonScreen } from "./learn/lesson-screen";
import { useSidebar } from "./sidebar-provider";

const easeOut = [0.23, 1, 0.32, 1] as const;

const categories = [
  { label: "Learn", khmer: "ស្វែងយល់ (Learn)", icon: "/mindguide/icon-10.svg" },
  { label: "Practice", khmer: "អនុវត្ត (Practice)", icon: "/mindguide/icon-11.svg" },
  { label: "Tips", khmer: "គន្លឹះ (Tips)", icon: "/mindguide/icon-7.svg" },
  { label: "Podcast", khmer: "ផតខាស (Podcast)", icon: "/mindguide/icon-9.svg" },
];

export type TodayActivity = {
  id: string;
  title: string;
  khmerTitle: string;
  category: "Practice" | "Learn" | "Guide";
  khmerCategory: string;
  duration: string;
  khmerDuration: string;
  image: string;
  badge: string;
  khmerBadge: string;
  description: string;
  khmerDescription: string;
  outcomes: { en: string; km: string }[];
  actionType: "breathing" | "learn-stress" | "daily-stress";
  hubHref: string;
  hubLabelEn: string;
  hubLabelKm: string;
};

export const todayActivities: TodayActivity[] = [
  {
    id: "interactive-breathing",
    title: "Interactive Breathing Exercise",
    khmerTitle: "ការហាត់ដកដង្ហើម (Breathing Exercise)",
    category: "Practice",
    khmerCategory: "ការអនុវត្ត (Practice)",
    duration: "4 mins",
    khmerDuration: "៤ នាទី",
    image: "/mindguide/icon-11.svg",
    badge: "Practice",
    khmerBadge: "អនុវត្ត (Practice)",
    description:
      "Follow the rhythmic expanding orb to balance your nervous system, slow down your heart rate, and bring gentle calm back to your day.",
    khmerDescription:
      "ដកដង្ហើមតាមចលនារង្វង់ដើម្បីសម្រួលប្រព័ន្ធប្រសាទ បន្ថយចង្វាក់បេះដូង និងនាំមកនូវភាពស្ងប់ស្ងាត់ដល់ចិត្តរបស់អ្នក។",
    outcomes: [
      {
        en: "Continuous 4-4 cycles with live visual cues",
        km: "វដ្តដកដង្ហើម ៤-៤ ជាមួយសញ្ញាបញ្ជាក់ច្បាស់លាស់",
      },
      {
        en: "Manual start, pause, resume, and stop controls",
        km: "ប៊ូតុងបញ្ជា ចាប់ផ្តើម ផ្អាក បន្ត និងបញ្ចប់ដោយខ្លួនឯង",
      },
      {
        en: "Gentle relaxing audio guidance",
        km: "សំឡេងណែនាំស្រទន់ជួយសម្រួលអារម្មណ៍",
      },
    ],
    actionType: "breathing",
    hubHref: "/practice",
    hubLabelEn: "Explore Practice Hub",
    hubLabelKm: "ស្វែងរកក្នុងផ្ទាំងអនុវត្ត (Practice Hub)",
  },
  {
    id: "learn-about-stress",
    title: "Learn About Stress",
    khmerTitle: "ស្វែងយល់ពីភាពតានតឹង (Stress)",
    category: "Learn",
    khmerCategory: "ការសិក្សា (Learn)",
    duration: "6 mins",
    khmerDuration: "៦ នាទី",
    image: "/mindguide/stress.png",
    badge: "Learn",
    khmerBadge: "សិក្សា (Learn)",
    description:
      "Understand how stress affects your brain and body, learn natural physical reactions, explore practical coping tools, and review scientific citations.",
    khmerDescription:
      "ស្វែងយល់ពីរបៀបដែលភាពតានតឹង (Stress) ប៉ះពាល់ដល់ខួរក្បាល និងរាងកាយ ស្គាល់រោគសញ្ញា និងវិធីដោះស្រាយងាយៗ។",
    outcomes: [
      {
        en: "5 interactive sections with medical citations [1] to [6]",
        km: "៥ ផ្នែកអន្តរកម្មជាមួយឯកសារយោងវេជ្ជសាស្ត្រ [1] ដល់ [6]",
      },
      {
        en: "Interactive knowledge check and reflection prompt",
        km: "កម្រងសំណួរខ្លីៗ និងការឆ្លុះបញ្ចាំងពីខ្លួនឯង",
      },
      {
        en: "Actionable relief tips and professional support pathways",
        km: "គន្លឹះអនុវត្តជាក់ស្តែង និងការស្វែងរកអ្នកជំនាញ (Professional)",
      },
    ],
    actionType: "learn-stress",
    hubHref: "/learn",
    hubLabelEn: "Explore Learn Hub",
    hubLabelKm: "ស្វែងរកក្នុងផ្ទាំងសិក្សា (Learn Hub)",
  },
  {
    id: "managing-daily-stress",
    title: "Managing Daily Stress",
    khmerTitle: "ការគ្រប់គ្រងភាពតានតឹងប្រចាំថ្ងៃ (Daily Stress)",
    category: "Guide",
    khmerCategory: "ការណែនាំ (Guide)",
    duration: "5 mins",
    khmerDuration: "៥ នាទី",
    image: "/mindguide/strategies.png",
    badge: "Daily Guide",
    khmerBadge: "ការណែនាំប្រចាំថ្ងៃ (Daily Guide)",
    description:
      "Explore common signs of ongoing tension, daily mental habits, and guided techniques to stay grounded throughout your routine.",
    khmerDescription:
      "ស្វែងយល់ពីរោគសញ្ញានៃភាពតានតឹង (Stress) ទម្លាប់ចិត្តគំនិតប្រចាំថ្ងៃ និងវិធីសាស្ត្ររក្សាលំនឹងអារម្មណ៍។",
    outcomes: [
      {
        en: "Identify physical indicators before stress builds up",
        km: "សម្គាល់រោគសញ្ញារាងកាយមុនពេលភាពតានតឹងកើនឡើង",
      },
      {
        en: "Practical routine resets and mindful pauses",
        km: "ការសម្រាកខ្លីៗដើម្បីកំណត់ចិត្តឡើងវិញ (Mindful Pauses)",
      },
      {
        en: "Integrated breathing exercises for instant relief",
        km: "ការរួមបញ្ចូលការដកដង្ហើម (Breathing) ដើម្បីបន្ធូរអារម្មណ៍ភ្លាមៗ",
      },
    ],
    actionType: "daily-stress",
    hubHref: "/mindguide/managing-daily-stress",
    hubLabelEn: "View Full Daily Guide",
    hubLabelKm: "មើលការណែនាំពេញលេញ (Daily Guide)",
  },
];

function ActivityModal({
  activity,
  onClose,
  onStart,
  onTogglePlan,
  isInPlan,
}: {
  activity: TodayActivity;
  onClose: () => void;
  onStart: (activity: TodayActivity) => void;
  onTogglePlan: (activity: TodayActivity) => void;
  isInPlan: boolean;
}) {
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const km = language === "km";

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.button
        type="button"
        aria-label={km ? "បិទ" : "Close"}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: easeOut }}
        className="fixed inset-0 cursor-default bg-ink/35 backdrop-blur-[2px]"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-modal-title"
        initial={{
          opacity: 0,
          transform: shouldReduceMotion ? "scale(1)" : "scale(0.95) translateY(12px)",
        }}
        animate={{ opacity: 1, transform: "scale(1) translateY(0)" }}
        exit={{
          opacity: 0,
          transform: shouldReduceMotion ? "scale(1)" : "scale(0.95) translateY(12px)",
        }}
        transition={{ duration: 0.24, ease: easeOut }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-arom-border/70 bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-arom-soft px-3 py-1 text-xs font-semibold text-arom">
            {km ? activity.khmerCategory : activity.category}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={km ? "បិទផ្ទាំង" : "Close modal"}
            className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-arom-wash hover:text-arom cursor-pointer"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-arom-border bg-arom-soft/60 p-2">
            <Image
              src={activity.image}
              alt=""
              width={48}
              height={48}
              className="size-10 object-contain"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="activity-modal-title" className="text-xl font-bold tracking-[-0.02em] text-arom">
              {km ? activity.khmerTitle : activity.title}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-ink-muted">
              <span className="flex items-center gap-1">
                <Clock aria-hidden="true" size={13} />
                {km ? activity.khmerDuration : activity.duration}
              </span>
              <span>•</span>
              <span className="text-arom">{km ? activity.khmerBadge : activity.badge}</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink">
          {km ? activity.khmerDescription : activity.description}
        </p>

        <div className="mt-4 rounded-2xl bg-[#f4f9f7] p-3.5 sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-arom">
            {km ? "អ្វីដែលអ្នកនឹងទទួលបាន (What is Included)" : "What is included"}
          </p>
          <ul className="mt-2 space-y-2 text-xs leading-5 text-ink">
            {activity.outcomes.map((outcome) => (
              <li key={outcome.en} className="flex items-start gap-2">
                <CheckCircle2 aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-arom" />
                <span>{km ? outcome.km : outcome.en}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => onStart(activity)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-arom px-5 text-base font-semibold text-white shadow-sm transition-all duration-150 active:scale-[0.98] hover:bg-arom-deep cursor-pointer"
          >
            <Play aria-hidden="true" size={18} className="fill-current" />
            <span>
              {activity.actionType === "breathing"
                ? km
                  ? "ចាប់ផ្តើមការហាត់ដកដង្ហើម (Breathing)"
                  : "Start Breathing Session"
                : activity.actionType === "learn-stress"
                ? km
                  ? "ចាប់ផ្តើមមេរៀនអន្តរកម្ម (Interactive Lesson)"
                  : "Start Interactive Lesson"
                : km
                ? "បើកការណែនាំប្រចាំថ្ងៃ (Daily Guide)"
                : "Open Daily Guide"}
            </span>
          </button>

          {/* Add to Daily Plan at Home button */}
          <button
            type="button"
            onClick={() => onTogglePlan(activity)}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              isInPlan
                ? "border-arom bg-arom-soft text-arom shadow-xs"
                : "border-arom-border bg-white text-arom hover:bg-arom-wash hover:border-arom/40"
            }`}
          >
            {isInPlan ? (
              <CheckCircle2 aria-hidden="true" size={18} className="text-arom" />
            ) : (
              <CalendarPlus aria-hidden="true" size={18} className="text-arom" />
            )}
            <span>
              {isInPlan
                ? km
                  ? "មានក្នុងផែនការទំព័រដើមរួចរាល់ (In Daily Plan)"
                  : "In Home Daily Plan (Tap to Remove)"
                : km
                ? "បន្ថែមទៅផែនការទំព័រដើម (Add to Plan)"
                : "Add to Daily Plan at Home"}
            </span>
          </button>

          <Link
            href={activity.hubHref}
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-arom-border bg-white text-sm font-semibold text-ink-muted transition-colors hover:text-arom hover:bg-arom-wash"
          >
            <span>{km ? activity.hubLabelKm : activity.hubLabelEn}</span>
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export function MindGuideHome() {
  const router = useRouter();
  const { language } = useLanguage();
  const sidebar = useSidebar();
  const shouldReduceMotion = useReducedMotion();
  const [selectedActivity, setSelectedActivity] = useState<TodayActivity | null>(null);
  const [activeExperience, setActiveExperience] = useState<
    "breathing" | "lesson" | "lesson-complete" | null
  >(null);
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const km = language === "km";

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

  const handleTogglePlan = (activity: TodayActivity) => {
    const isAdded = toggleCustomPlanItem({
      id: activity.id,
      source:
        activity.category === "Practice"
          ? "practice"
          : activity.category === "Learn"
          ? "learn"
          : "guide",
      title: activity.title,
      titleKm: activity.khmerTitle,
      subtitle: activity.duration + " • " + (activity.outcomes[0]?.en || ""),
      subtitleKm: activity.khmerDuration + " • " + (activity.outcomes[0]?.km || ""),
      badge: activity.badge,
      badgeKm: activity.khmerBadge,
      icon:
        activity.actionType === "breathing"
          ? "hugeicons_yoga-03"
          : activity.actionType === "learn-stress"
          ? "ant-design_play-circle-filled"
          : "boxicons_note-filled",
      href:
        activity.actionType === "daily-stress"
          ? "/mindguide/managing-daily-stress"
          : activity.actionType === "breathing"
          ? "/practice"
          : "/learn",
    });

    if (isAdded) {
      setToastMessage(
        km
          ? `បានបន្ថែម "${activity.khmerTitle}" ទៅផែនការទំព័រដើមរបស់អ្នក`
          : `Added "${activity.title}" to your Home Screen Daily Plan`
      );
    } else {
      setToastMessage(
        km
          ? `បានលុប "${activity.khmerTitle}" ចេញពីផែនការទំព័រដើម`
          : `Removed "${activity.title}" from your Home Screen Daily Plan`
      );
    }
  };

  const item = {
    hidden: {
      opacity: 0,
      transform: shouldReduceMotion ? "translateY(0)" : "translateY(8px)",
    },
    visible: {
      opacity: 1,
      transform: "translateY(0)",
      transition: { duration: shouldReduceMotion ? 0.16 : 0.24, ease: easeOut },
    },
  };

  const handleStartActivity = (activity: TodayActivity) => {
    setSelectedActivity(null);
    if (activity.actionType === "breathing") {
      setActiveExperience("breathing");
    } else if (activity.actionType === "learn-stress") {
      setActiveExperience("lesson");
    } else if (activity.actionType === "daily-stress") {
      router.push("/mindguide/managing-daily-stress");
    }
  };

  if (activeExperience === "breathing") {
    return <BreathingExperience onExit={() => setActiveExperience(null)} />;
  }

  if (activeExperience === "lesson") {
    return (
      <LessonScreen
        lesson={LESSON_ABOUT_STRESS}
        onExit={() => setActiveExperience(null)}
        onComplete={() => setActiveExperience("lesson-complete")}
        onOpenExercise={() => setActiveExperience("breathing")}
        onOpenProfessional={() => router.push("/professional")}
      />
    );
  }

  if (activeExperience === "lesson-complete") {
    return (
      <LessonCompleteView
        lesson={LESSON_ABOUT_STRESS}
        onTryExercise={() => setActiveExperience("breathing")}
        onReadAnother={() => setActiveExperience(null)}
        onViewSaved={() => router.push("/learn")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="MindGuide" />

      <motion.main
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: shouldReduceMotion ? 0 : 0.055 }}
        className="min-w-0 px-5 pb-28 pt-5 sm:px-8 sm:pt-7 lg:px-10 lg:pb-12 lg:pt-8 xl:px-12"
      >
        <div className="mx-auto w-full max-w-[70rem]">
          <motion.header variants={item} className="flex items-center justify-between gap-3 lg:hidden">
            <AromBrand />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={sidebar.openSidebar}
                aria-label={km ? "បើកម៉ឺនុយរុករក" : "Open sidebar navigation"}
                className="flex size-9 items-center justify-center rounded-2xl bg-arom-soft border border-arom/30 shadow-[0_2px_10px_rgba(31,111,91,0.12)] text-arom transition-all hover:bg-arom-soft/80 active:scale-95 cursor-pointer"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1f6f5b"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </button>
              <Link
                href="/profile"
                aria-label="Open profile and settings"
                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-arom"
              >
                <Image
                  src="/brand/muoyly-avatar.svg"
                  alt="Muoyly"
                  width={36}
                  height={36}
                  className="size-9 rounded-full object-cover ring-2 ring-white shadow-[0_5px_18px_rgba(20,75,63,0.15)]"
                  unoptimized
                />
              </Link>
            </div>
          </motion.header>

          <motion.section
            variants={item}
            aria-labelledby="mindguide-title"
            className="relative mt-8 aspect-[356/132] min-h-[132px] overflow-hidden rounded-[1.85rem] bg-[#dcf5ee] shadow-[0_16px_40px_rgba(31,111,91,0.08)] sm:mt-9 lg:mt-0 lg:min-h-[260px] lg:rounded-[2rem]"
          >
            <Image
              src="/traced/arom-design.svg"
              alt=""
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 70vw"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#e8faf5]/96 via-[#e8faf5]/65 to-transparent lg:via-[#e8faf5]/35" />
            <div className="relative z-10 flex h-full max-w-[66%] flex-col justify-center px-4 py-5 sm:px-7 lg:max-w-[48%] lg:px-12">
              <p className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-arom-accent lg:block">
                {km ? "ស្វែងយល់ និងអនុវត្ត (Learn & Practice)" : "Learn and practice"}
              </p>
              <h1 id="mindguide-title" className="text-[1.35rem] font-semibold leading-tight text-arom sm:text-2xl lg:mt-2 lg:text-[2.75rem]">
                MindGuide
              </h1>
              <p className="mt-1 max-w-[14rem] text-[0.78rem] leading-[1.15rem] text-ink sm:max-w-sm sm:text-sm sm:leading-6 lg:mt-3 lg:text-base">
                {km
                  ? "រៀនសូត្រ អនុវត្ត និងថែរក្សាសុខភាពផ្លូវចិត្តរបស់អ្នក។"
                  : "Learn, practice, and take care of your mind."}
              </p>
            </div>
          </motion.section>

          <motion.nav variants={item} aria-label="MindGuide categories" className="mt-6 grid grid-cols-4 gap-2 sm:mx-auto sm:max-w-2xl sm:gap-6 lg:mt-9">
            {categories.map((category) => {
              const categoryContent = (
                <>
                  <span className="flex size-14 items-center justify-center rounded-full bg-arom-accent/20 transition-transform duration-150 group-hover:-translate-y-0.5 sm:size-16">
                    <Image src={category.icon} alt="" width={37} height={37} className="size-8 object-contain sm:size-9" unoptimized />
                  </span>
                  <span className="mt-2 truncate text-[0.7rem] font-medium text-arom sm:text-sm">
                    {km ? category.khmer : category.label}
                  </span>
                </>
              );

              if (category.label === "Learn") {
                return (
                  <Link
                    key={category.label}
                    href="/learn"
                    className="group flex min-w-0 flex-col items-center rounded-2xl py-1 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                  >
                    {categoryContent}
                  </Link>
                );
              }

              if (category.label === "Practice") {
                return (
                  <Link
                    key={category.label}
                    href="/practice"
                    className="group flex min-w-0 flex-col items-center rounded-2xl py-1 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                  >
                    {categoryContent}
                  </Link>
                );
              }

              if (category.label === "Tips") {
                return (
                  <Link
                    key={category.label}
                    href="/tips"
                    className="group flex min-w-0 flex-col items-center rounded-2xl py-1 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                  >
                    {categoryContent}
                  </Link>
                );
              }

              return (
                <a
                  key={category.label}
                  href="#today"
                  className="group flex min-w-0 flex-col items-center rounded-2xl py-1 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                >
                  {categoryContent}
                </a>
              );
            })}
          </motion.nav>

          <motion.section variants={item} id="today" aria-labelledby="today-title" className="mt-9 lg:mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-arom-accent lg:block">
                  {km ? "ការណែនាំប្រចាំថ្ងៃ (Recommendations)" : "Daily recommendations"}
                </p>
                <h2 id="today-title" className="text-2xl font-semibold text-arom lg:mt-1.5 lg:text-3xl">
                  {km ? "សកម្មភាពសម្រាប់ថ្ងៃនេះ (For Today)" : "For Today"}
                </h2>
              </div>
              <span className="hidden rounded-full bg-arom-soft px-3 py-1 text-xs font-medium text-arom sm:block">
                {km ? "៣ សកម្មភាព (3 Activities)" : "3 activities"}
              </span>
            </div>

            <div className="mt-4 grid gap-2.5 lg:grid-cols-3 lg:gap-5">
              {todayActivities.map((activity) => {
                const inPlan = planIds.includes(activity.id);
                return (
                  <div
                    key={activity.id}
                    className="group relative flex min-h-[64px] w-full items-center rounded-2xl border-2 border-arom/80 bg-arom/[0.07] p-2.5 transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-arom-soft hover:shadow-card lg:min-h-[86px] lg:p-3"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedActivity(activity)}
                      className="flex flex-1 items-center min-w-0 pr-8 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom cursor-pointer"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-arom/20 lg:size-12">
                        <Image
                          src={activity.image}
                          alt=""
                          width={42}
                          height={42}
                          className="size-7 object-contain lg:size-8"
                          unoptimized
                        />
                      </div>
                      <span className="ml-3 min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-arom lg:text-base">
                          {km ? activity.khmerTitle : activity.title}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[0.72rem] text-ink lg:text-xs">
                          <span className="font-medium text-ink-muted">
                            {km ? activity.khmerDuration : activity.duration}
                          </span>
                          <span className="text-arom/50">•</span>
                          <span className="rounded bg-arom/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-arom">
                            {km ? activity.khmerBadge : activity.badge}
                          </span>
                        </span>
                      </span>
                    </button>

                    {/* Subtle Floating Corner Pin */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlan(activity);
                      }}
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
                            ? "មានក្នុងផែនការទំព័រដើម (ចុចដើម្បីលុប)"
                            : "In Home Daily Plan (Tap to remove)"
                          : km
                          ? "បន្ថែមទៅផែនការទំព័រដើម"
                          : "Add to Home Daily Plan"
                      }
                      className={`absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                        inPlan
                          ? "bg-arom text-white shadow-xs scale-100 ring-2 ring-arom/25 hover:bg-arom-deep"
                          : "border border-arom/25 bg-white/75 text-arom/60 hover:bg-white hover:text-arom hover:scale-110 shadow-2xs"
                      }`}
                    >
                      {inPlan ? (
                        <Check size={13} strokeWidth={2.8} />
                      ) : (
                        <Plus size={14} strokeWidth={2.5} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </motion.main>

      <MobileNavigation active="MindGuide" />

      {/* Activity Popup Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <ActivityModal
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
            onStart={handleStartActivity}
            onTogglePlan={handleTogglePlan}
            isInPlan={planIds.includes(selectedActivity.id)}
          />
        )}
      </AnimatePresence>

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
