"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Activity,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useLanguage } from "../_components/language-provider";
import {
  getCustomPlanItems,
  toggleCustomPlanItem,
  type DailyPlanCustomItem,
  type DailyPlanSource,
} from "../_components/daily-plan-store";

export type CuratedPlanItem = {
  id: string;
  source: DailyPlanSource;
  title: string;
  titleKm: string;
  subtitle: string;
  subtitleKm: string;
  description: string;
  descriptionKm: string;
  category: "all" | "practice" | "learn" | "guide" | "tips";
  categoryLabel: string;
  categoryLabelKm: string;
  duration: string;
  durationKm: string;
  estimatedMinutes: number;
  badge: string;
  badgeKm: string;
  icon: string;
  image: string;
  href: string;
};

export const CURATED_ACTIVITIES: CuratedPlanItem[] = [
  {
    id: "interactive-breathing",
    source: "practice",
    title: "Interactive Breathing Exercise",
    titleKm: "ការហាត់ដកដង្ហើម (Breathing Exercise)",
    subtitle: "4 mins • Guided 4-4 pacing for nervous system calm",
    subtitleKm: "៤ នាទី • ការដកដង្ហើមតាមចង្វាក់ ៤-៤ ជួយសម្រួលចិត្ត",
    description: "Follow the rhythmic expanding orb to slow heart rate and ground your mind.",
    descriptionKm: "ដកដង្ហើមតាមចលនារង្វង់ដើម្បីសម្រួលប្រព័ន្ធប្រសាទ និងកាត់បន្ថយភាពតានតឹង។",
    category: "practice",
    categoryLabel: "Practice",
    categoryLabelKm: "ការអនុវត្ត (Practice)",
    duration: "4 mins",
    durationKm: "៤ នាទី",
    estimatedMinutes: 4,
    badge: "Practice",
    badgeKm: "ការអនុវត្ត (Practice)",
    icon: "hugeicons_yoga-03",
    image: "/mindguide/icon-11.svg",
    href: "/practice",
  },
  {
    id: "learn-about-stress",
    source: "learn",
    title: "Learn About Stress",
    titleKm: "ស្វែងយល់ពីភាពតានតឹង (Learn About Stress)",
    subtitle: "6 mins • Clinical coping tools and biological triggers",
    subtitleKm: "៦ នាទី • ស្វែងយល់ពីប្រភព និងវិធីដោះស្រាយភាពតានតឹង",
    description: "Understand acute versus chronic stress, somatic signals, and self-compassion.",
    descriptionKm: "ស្វែងយល់ពីភាពខុសគ្នានៃភាពតានតឹង និងរបៀបថែរក្សាផ្លូវចិត្តដោយមេត្តាធម៌។",
    category: "learn",
    categoryLabel: "Learn",
    categoryLabelKm: "ស្វែងយល់ (Learn)",
    duration: "6 mins",
    durationKm: "៦ នាទី",
    estimatedMinutes: 6,
    badge: "Learn",
    badgeKm: "ស្វែងយល់ (Learn)",
    icon: "ant-design_play-circle-filled",
    image: "/mindguide/icon-10.svg",
    href: "/learn",
  },
  {
    id: "managing-daily-stress",
    source: "guide",
    title: "Managing Daily Stress",
    titleKm: "ការគ្រប់គ្រងភាពតានតឹងប្រចាំថ្ងៃ (Managing Daily Stress)",
    subtitle: "5 mins • Micro-recovery routines for burnout prevention",
    subtitleKm: "៥ នាទី • ជំហានសម្រាកខ្លីៗការពារការអស់កម្លាំងចិត្ត",
    description: "Actionable micro-habits, boundary setting, and cognitive rest methods.",
    descriptionKm: "វិធីសាស្ត្រអនុវត្តជាក់ស្តែងជួយការពារការហត់នឿយផ្លូវចិត្តក្នុងជីវិតប្រចាំថ្ងៃ។",
    category: "guide",
    categoryLabel: "Stress Guide",
    categoryLabelKm: "ការណែនាំ (Guide)",
    duration: "5 mins",
    durationKm: "៥ នាទី",
    estimatedMinutes: 5,
    badge: "Guide",
    badgeKm: "ការណែនាំ (Guide)",
    icon: "boxicons_note-filled",
    image: "/mindguide/icon-7.svg",
    href: "/mindguide/managing-daily-stress",
  },
  {
    id: "mindful-body-scan",
    source: "practice",
    title: "Mindful Body Scan",
    titleKm: "ការពិនិត្យរាងកាយដោយសតិ (Body Scan)",
    subtitle: "8 mins • Release tension held in shoulders, neck, and back",
    subtitleKm: "៨ នាទី • បន្ធូរបន្ថយភាពតានតឹងសាច់ដុំពីក្បាលដល់ចុងជើង",
    description: "Gentle head to toe somatic scanning to release physical holding patterns.",
    descriptionKm: "កត់សម្គាល់អារម្មណ៍រាងកាយពីក្បាលដល់ចុងជើងដោយចិត្តស្ងប់ និងបើកចំហ។",
    category: "practice",
    categoryLabel: "Practice",
    categoryLabelKm: "ការអនុវត្ត (Practice)",
    duration: "8 mins",
    durationKm: "៨ នាទី",
    estimatedMinutes: 8,
    badge: "Practice",
    badgeKm: "ការអនុវត្ត (Practice)",
    icon: "hugeicons_yoga-03",
    image: "/mindguide/strategies.png",
    href: "/practice",
  },
  {
    id: "sensory-grounding",
    source: "practice",
    title: "5-4-3-2-1 Sensory Grounding",
    titleKm: "ការទប់លំនឹងចិត្ត ៥ ជំហាន (Sensory Grounding)",
    subtitle: "5 mins • Anchor your nervous system firmly in the present",
    subtitleKm: "៥ នាទី • ទប់លំនឹងចិត្តតាមរយៈអារម្មណ៍ទាំងប្រាំ",
    description: "Break anxious thought loops using sight, touch, sound, smell, and taste.",
    descriptionKm: "បង្វែរអារម្មណ៍ពីការព្រួយបារម្ភដោយភ្ជាប់ទំនាក់ទំនងជាមួយបរិយាកាសជុំវិញ។",
    category: "practice",
    categoryLabel: "Practice",
    categoryLabelKm: "ការអនុវត្ត (Practice)",
    duration: "5 mins",
    durationKm: "៥ នាទី",
    estimatedMinutes: 5,
    badge: "Practice",
    badgeKm: "ការអនុវត្ត (Practice)",
    icon: "hugeicons_yoga-03",
    image: "/mindguide/icon-10.svg",
    href: "/practice",
  },
  {
    id: "tip-try-now-1",
    source: "tip",
    title: "Cut What You Control",
    titleKm: "បន្ធូរបន្ថយអ្វីដែលអ្នកគ្រប់គ្រងបាន (Cut What You Control)",
    subtitle: "2 mins • Drop or delay one non-essential task this week",
    subtitleKm: "២ នាទី • ពន្យារពេល ឬកាត់បន្ថយការងារមិនចាំបាច់មួយ",
    description: "Identify non-critical obligations to create immediate emotional breathing room.",
    descriptionKm: "ជ្រើសរើសកិច្ចការមិនចាំបាច់មួយដើម្បីពន្យារពេល និងបន្ថយសម្ពាធផ្លូវចិត្ត។",
    category: "tips",
    categoryLabel: "Micro-Tips",
    categoryLabelKm: "គន្លឹះ (Tips)",
    duration: "2 mins",
    durationKm: "២ នាទី",
    estimatedMinutes: 2,
    badge: "Tips",
    badgeKm: "គន្លឹះ (Tips)",
    icon: "boxicons_note-filled",
    image: "/mindguide/icon-7.svg",
    href: "/tips",
  },
  {
    id: "evening-relaxation",
    source: "practice",
    title: "Evening Deep Relaxation",
    titleKm: "ការសម្រាកឱ្យលក់ស្រួលពេលយប់ (Deep Relaxation)",
    subtitle: "10 mins • Slow down racing thoughts and prepare for restorative rest",
    subtitleKm: "១០ នាទី • បន្ធូរអារម្មណ៍សម្រាប់ការគេងលក់ស្រួល",
    description: "Calming bedtime guidance to transition smoothly from busy thoughts into deep sleep.",
    descriptionKm: "រៀបចំចិត្ត និងរាងកាយឱ្យស្ងប់ស្ងាត់ដើម្បីគេងលក់ស្រួលពេញមួយយប់។",
    category: "practice",
    categoryLabel: "Practice",
    categoryLabelKm: "ការអនុវត្ត (Practice)",
    duration: "10 mins",
    durationKm: "១០ នាទី",
    estimatedMinutes: 10,
    badge: "Practice",
    badgeKm: "ការអនុវត្ត (Practice)",
    icon: "hugeicons_yoga-03",
    image: "/mindguide/sleep.png",
    href: "/practice",
  },
];

type DailyPlanCuratorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DailyPlanCuratorModal({ isOpen, onClose }: DailyPlanCuratorModalProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const syncPlan = () => {
    const items = getCustomPlanItems();
    setPlanIds(items.map((i) => i.id));
  };

  useEffect(() => {
    if (isOpen) {
      syncPlan();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => syncPlan();
    window.addEventListener("arom_plan_updated", handleUpdate);
    return () => window.removeEventListener("arom_plan_updated", handleUpdate);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredActivities = useMemo(() => {
    if (selectedCategory === "all") return CURATED_ACTIVITIES;
    return CURATED_ACTIVITIES.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  const activeCount = useMemo(() => {
    return CURATED_ACTIVITIES.filter((a) => planIds.includes(a.id)).length;
  }, [planIds]);

  const totalMinutes = useMemo(() => {
    return CURATED_ACTIVITIES.filter((a) => planIds.includes(a.id)).reduce(
      (sum, a) => sum + a.estimatedMinutes,
      0
    );
  }, [planIds]);

  const handleToggle = (activity: CuratedPlanItem) => {
    toggleCustomPlanItem({
      id: activity.id,
      source: activity.source,
      title: activity.title,
      titleKm: activity.titleKm,
      subtitle: activity.subtitle,
      subtitleKm: activity.subtitleKm,
      badge: activity.badge,
      badgeKm: activity.badgeKm,
      icon: activity.icon,
      href: activity.href,
    });
  };

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "All", kmLabel: "ទាំងអស់ (All)" },
    { id: "practice", label: "Practice", kmLabel: "ការអនុវត្ត (Practice)" },
    { id: "learn", label: "Learn", kmLabel: "ស្វែងយល់ (Learn)" },
    { id: "guide", label: "Stress Guides", kmLabel: "ការណែនាំ (Guides)" },
    { id: "tips", label: "Micro-Tips", kmLabel: "គន្លឹះ (Tips)" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="curator-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 transition-opacity duration-200 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-[32px] bg-white shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom sm:rounded-[28px] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#d2d6db] sm:hidden" />

        {/* Modal Header */}
        <div className="border-b border-arom-border/60 px-5 pt-4 pb-4 sm:px-6 sm:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-arom-soft text-arom shadow-xs">
                <Compass aria-hidden="true" size={22} />
              </div>
              <div>
                <h2
                  id="curator-modal-title"
                  className="text-lg font-bold text-arom sm:text-xl"
                >
                  {km
                    ? "រៀបចំផែនការសុខុមាលភាពប្រចាំថ្ងៃ (Daily Plan Curator)"
                    : "Curate Your Daily Plan"}
                </h2>
                <p className="mt-0.5 text-xs text-ink-muted sm:text-sm">
                  {km
                    ? "ជ្រើសរើសលំហាត់ និងមេរៀនដើម្បីបង្កើតទម្លាប់ថែរក្សាផ្លូវចិត្តសម្រាប់ថ្ងៃនេះ"
                    : "Select mindfulness practices and lessons to shape today's emotional journey"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={km ? "បិទផ្ទាំង" : "Close modal"}
              className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-arom-wash hover:text-arom cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Metrics & Stats Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#f2f8f5] px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-arom">
              <Activity size={15} />
              <span>
                {activeCount} {km ? "សកម្មភាពត្រូវបានជ្រើសរើស" : "activities chosen"}
              </span>
              <span className="text-arom/40">•</span>
              <span className="flex items-center gap-1 font-medium text-ink-muted">
                <Clock size={13} />
                {totalMinutes > 0 ? `~${totalMinutes} mins` : "0 mins"} {km ? "ថ្ងៃនេះ" : "today"}
              </span>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-[0.72rem] font-semibold text-arom shadow-2xs border border-arom/15">
              {km ? "បច្ចុប្បន្នភាពស្វ័យប្រវត្ត" : "Live Home Screen Sync"}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-arom text-white shadow-xs"
                      : "border border-arom-border/80 bg-white text-ink-muted hover:bg-arom-wash hover:text-arom"
                  }`}
                >
                  {km ? cat.kmLabel : cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Activities List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 sm:px-6">
          {filteredActivities.map((activity) => {
            const inPlan = planIds.includes(activity.id);

            return (
              <div
                key={activity.id}
                className={`group flex items-center justify-between gap-3.5 rounded-2xl border p-3 sm:p-3.5 transition-all duration-150 ${
                  inPlan
                    ? "border-arom/50 bg-[#eef7f4] shadow-xs"
                    : "border-arom-border/70 bg-white hover:border-arom/30 hover:bg-[#fafdfc]"
                }`}
              >
                {/* Artwork & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-2xs ring-1 ring-arom/15 sm:size-12">
                    <Image
                      src={activity.image}
                      alt=""
                      width={40}
                      height={40}
                      className="size-7 object-contain sm:size-8"
                      unoptimized
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-arom">
                        {km ? activity.categoryLabelKm : activity.categoryLabel}
                      </span>
                      <span className="text-arom/40">•</span>
                      <span className="flex items-center gap-1 text-[0.72rem] font-medium text-ink-muted">
                        <Clock size={11} />
                        {km ? activity.durationKm : activity.duration}
                      </span>
                    </div>

                    <h3 className="truncate text-sm font-bold text-ink sm:text-base">
                      {km ? activity.titleKm : activity.title}
                    </h3>

                    <p className="line-clamp-1 text-xs text-ink-muted sm:text-[13px]">
                      {km ? activity.descriptionKm : activity.description}
                    </p>
                  </div>
                </div>

                {/* Instant 1-Tap Toggle Pill Button */}
                <button
                  type="button"
                  onClick={() => handleToggle(activity)}
                  aria-label={
                    inPlan
                      ? km
                        ? `លុប ${activity.titleKm} ចេញពីផែនការ`
                        : `Remove ${activity.title} from plan`
                      : km
                      ? `បន្ថែម ${activity.titleKm} ទៅផែនការ`
                      : `Add ${activity.title} to plan`
                  }
                  className={`flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 ${
                    inPlan
                      ? "bg-arom text-white shadow-xs hover:bg-arom-deep"
                      : "border border-arom/35 bg-white text-arom hover:bg-arom-soft hover:border-arom shadow-2xs"
                  }`}
                >
                  {inPlan ? (
                    <>
                      <Check size={14} strokeWidth={2.6} />
                      <span>{km ? "ក្នុងផែនការ" : "In Plan"}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} strokeWidth={2.4} />
                      <span>{km ? "+ បន្ថែម" : "+ Add to Today"}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Done confirmation */}
        <div className="border-t border-arom-border/60 bg-[#fbfdfc] px-5 py-3.5 sm:px-6 sm:py-4 rounded-b-[28px] flex items-center justify-between gap-3">
          <p className="text-xs text-ink-muted hidden sm:block">
            {km
              ? "សកម្មភាពដែលបានជ្រើសរើសនឹងបង្ហាញភ្លាមៗក្នុងទំព័រដើមរបស់អ្នក"
              : "Selected activities update immediately on your Home Screen daily schedule"}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-arom px-6 text-sm font-semibold text-white shadow-xs transition-all hover:bg-arom-deep cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>{km ? "រួចរាល់ (Done)" : "Done"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
