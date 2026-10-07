"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, CheckCircle2, Clock3 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { DesktopNavigation, MobileNavigation } from "./app-navigation";
import { BreathingExperience } from "./breathing-session";
import {
  getCustomPlanItems,
  toggleCustomPlanItem,
} from "./daily-plan-store";
import { useLanguage } from "./language-provider";

const easeOut = [0.23, 1, 0.32, 1] as const;

const outcomes = [
  { en: "What stress is", km: "ស្វែងយល់ពីភាពតានតឹង (What Stress Is)" },
  {
    en: "Common signs and symptoms, and simple ways to manage stress",
    km: "សញ្ញា និងរោគសញ្ញាទូទៅ ព្រមទាំងវិធីងាយៗក្នុងការគ្រប់គ្រងភាពតានតឹង",
  },
  { en: "Build healthy habits", km: "បង្កើតទម្លាប់ល្អសម្រាប់សុខភាព (Healthy Habits)" },
];

export function ManagingDailyStress() {
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [sessionOpen, setSessionOpen] = useState(false);
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

  const isInPlan = planIds.includes("managing-daily-stress");

  const handleTogglePlan = () => {
    const isAdded = toggleCustomPlanItem({
      id: "managing-daily-stress",
      source: "guide",
      title: "Managing Daily Stress",
      titleKm: "ការគ្រប់គ្រងភាពតានតឹងប្រចាំថ្ងៃ (Daily Stress)",
      subtitle: "5 mins • Build healthy habits and mindful pauses",
      subtitleKm: "៥ នាទី • បង្កើតទម្លាប់ល្អសម្រាប់សុខភាព និងការសម្រាកខ្លីៗ",
      badge: "Daily Guide",
      badgeKm: "ការណែនាំប្រចាំថ្ងៃ (Daily Guide)",
      icon: "boxicons_note-filled",
      href: "/mindguide/managing-daily-stress",
    });

    if (isAdded) {
      setToastMessage(
        km
          ? "បានបន្ថែម 'ការគ្រប់គ្រងភាពតានតឹងប្រចាំថ្ងៃ' ទៅផែនការទំព័រដើមរបស់អ្នក"
          : "Added 'Managing Daily Stress' to your Home Screen Daily Plan"
      );
    } else {
      setToastMessage(
        km
          ? "បានលុបចេញពីផែនការទំព័រដើមរបស់អ្នក"
          : "Removed from your Home Screen Daily Plan"
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

  if (sessionOpen) {
    return <BreathingExperience onExit={() => setSessionOpen(false)} />;
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="MindGuide" />

      <motion.main
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: shouldReduceMotion ? 0 : 0.055 }}
        className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8 xl:px-14"
      >
        <div className="mx-auto w-full max-w-[68rem]">
          <motion.div variants={item}>
            <Link
              href="/mindguide"
              className="group inline-flex min-h-11 items-center gap-2 rounded-full pr-4 text-sm font-semibold text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-150 group-hover:-translate-x-0.5">
                <ArrowLeft aria-hidden="true" size={20} />
              </span>
              <span className="hidden sm:inline">{km ? "ត្រឡប់ទៅ MindGuide" : "Back to MindGuide"}</span>
            </Link>
          </motion.div>

          <div className="mt-4 grid items-start gap-7 lg:mt-7 lg:grid-cols-[minmax(22rem,1.04fr)_minmax(22rem,0.96fr)] lg:gap-10">
            <motion.div variants={item}>
              <div className="relative aspect-[451/174] overflow-hidden rounded-[0.65rem] bg-arom-soft shadow-card lg:rounded-[1.5rem]">
                <Image
                  src="/mindguide/managing-stress-hero.svg"
                  alt={km ? "មនុស្សម្នាក់កំពុងធ្វើសមាធិនៅលើភ្នំ" : "A person meditating while overlooking a mountain valley"}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 48vw"
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute left-3 top-3 flex h-9 items-center gap-1.5 rounded-xl bg-[#e5f8f3]/95 px-3 text-sm font-semibold text-arom shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 lg:h-10 lg:px-3.5 lg:text-base">
                  <Clock3 aria-hidden="true" size={17} strokeWidth={2.2} />
                  {km ? "៥ នាទី" : "5 mins"}
                </span>
                <span className="font-khmer absolute bottom-2.5 right-2.5 rounded-xl bg-arom/95 px-3 py-1.5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm sm:bottom-3 sm:right-3 lg:px-4 lg:py-2 lg:text-base">
                  {km ? "មេរៀន (Lesson)" : "Lesson"}
                </span>
              </div>

              <div className="mt-6 lg:mt-8">
                <p className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-arom-accent lg:block">
                  {km ? "មេរៀនប្រចាំថ្ងៃ" : "Daily lesson"}
                </p>
                <h1 className="text-[1.55rem] font-bold leading-tight tracking-[-0.03em] text-arom sm:text-3xl lg:mt-2 lg:text-[2.55rem]">
                  {km ? "ការគ្រប់គ្រងភាពតានតឹងប្រចាំថ្ងៃ (Daily Stress)" : "Managing Daily Stress"}
                </h1>
                <p className="mt-7 max-w-2xl text-[0.95rem] leading-[1.25rem] text-ink sm:text-base sm:leading-6 lg:mt-5">
                  {km
                    ? "ភាពតានតឹងគឺជាប្រតិកម្មរបស់រាងកាយអ្នកចំពោះសម្ពាធ។ ក្នុងកម្រិតតិចតួច វាអាចជួយឱ្យអ្នកផ្តោតអារម្មណ៍ ប៉ុន្តែភាពតានតឹងបន្តបន្ទាប់អាចធ្វើឱ្យអ្នកនឿយហត់។"
                    : "Stress is your body's reaction to pressure. In small doses it can help you focus, but ongoing stress can wear you down."}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => setSessionOpen(true)}
                    className="flex h-12 w-full items-center justify-center rounded-[1.1rem] bg-arom px-6 text-xl font-bold text-white shadow-[0_12px_28px_rgba(31,111,91,0.18)] transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-arom-deep hover:shadow-[0_15px_32px_rgba(31,111,91,0.24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom sm:w-auto sm:min-w-[140px] cursor-pointer"
                  >
                    {km ? "ចាប់ផ្តើម (Start)" : "Start"}
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlan}
                    className={`flex h-12 w-full items-center justify-center gap-2 rounded-[1.1rem] border px-5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer sm:w-auto ${
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
                        : "Add to Daily Plan at Home Screen"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={item} id="lesson-content" className="space-y-6 lg:pt-1">
              <section className="rounded-[0.9rem] bg-arom-accent/16 px-4 py-4 sm:px-6 sm:py-5 lg:rounded-[1.5rem] lg:p-7" aria-labelledby="learn-title">
                <h2 id="learn-title" className="text-center text-xl font-semibold text-arom lg:text-2xl">
                  {km ? "អ្វីដែលអ្នកនឹងរៀន (What You'll Learn)" : "What you'd learn"}
                </h2>
                <ul className="mt-4 space-y-3 lg:mt-5 lg:space-y-4">
                  {outcomes.map((outcome) => (
                    <li key={outcome.en} className="flex items-start gap-3 text-base leading-6 text-ink">
                      <Image src="/mindguide/stress-assets/check-circle.svg" alt="" width={31} height={31} className="mt-0.5 size-7 shrink-0" unoptimized />
                      <span>{km ? outcome.km : outcome.en}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[0.9rem] border border-arom/25 bg-arom-accent/5 px-4 py-3.5 lg:rounded-[1.5rem] lg:p-6" aria-labelledby="completed-title">
                <h2 id="completed-title" className="text-base font-semibold text-ink">
                  {km ? "បានបញ្ចប់ (Completed)" : "Completed"}
                </h2>
                <div className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                  <Image src="/mindguide/stress-assets/reward-bell.svg" alt="" width={34} height={39} className="h-10 w-9 shrink-0" unoptimized />
                  <div>
                    <p className="text-sm font-semibold text-ink">+XP</p>
                    <p className="mt-0.5 text-[0.7rem] font-medium text-arom">
                      {km ? "បញ្ចប់មេរៀនដើម្បីទទួលបានពិន្ទុ" : "End lesson now!"}
                    </p>
                  </div>
                  <Link
                    href="/mindguide"
                    className="col-span-2 flex min-h-10 items-center justify-center rounded-xl bg-arom px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom sm:col-span-1"
                  >
                    {km ? "ត្រឡប់ទៅ MindGuide" : "View MindGuide"}
                  </Link>
                </div>
              </section>
            </motion.div>
          </div>
        </div>
      </motion.main>

      <MobileNavigation active="MindGuide" />

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
