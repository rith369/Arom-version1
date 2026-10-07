"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Angry,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  Flower2,
  Frown,
  Heart,
  Laugh,
  Meh,
  NotebookPen,
  Quote,
  Smile,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AromBrand, DesktopNavigation, MobileNavigation } from "./app-navigation";
import { useLanguage } from "./language-provider";

type PlanItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  complete?: boolean;
};

type Mood = {
  label: string;
  icon: LucideIcon;
};

const planItems: PlanItem[] = [
  {
    title: "Mood check-in",
    description: "Great start",
    icon: CheckCircle2,
    complete: true,
  },
  {
    title: "MindGuide lesson",
    description: "Understanding anxiety · 5 min",
    icon: CirclePlay,
  },
  {
    title: "Guided meditation",
    description: "Relax and breathe · 3 min",
    icon: Flower2,
  },
  {
    title: "Daily mission",
    description: "Write one thing you’re grateful for",
    icon: NotebookPen,
  },
  {
    title: "Explore community",
    description: "Share with each other",
    icon: UsersRound,
  },
];

const moods: Mood[] = [
  { label: "Very low", icon: Angry },
  { label: "Low", icon: Frown },
  { label: "Okay", icon: Meh },
  { label: "Good", icon: Smile },
  { label: "Great", icon: Laugh },
];

const easeOut = [0.23, 1, 0.32, 1] as const;

function DailyPlanCard() {
  const { language } = useLanguage();
  const km = language === "km";
  return (
    <section
      aria-labelledby="daily-plan-title"
      className="rounded-[1.4rem] bg-arom px-4 pb-4 pt-3.5 text-white shadow-[0_18px_50px_rgba(25,87,72,0.14)] sm:px-5 sm:pb-5"
    >
      <h2 id="daily-plan-title" className="px-3 text-sm font-medium sm:text-base">
        {km ? "ផែនការរបស់អ្នកសម្រាប់ថ្ងៃនេះ" : "Your Plan For Today"}
      </h2>

      <div aria-label="Two of five activities complete" className="mt-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full ${index < 2 ? "bg-arom-accent" : "bg-white"}`}
          />
        ))}
      </div>

      <div className="mt-2">
        {planItems.map(({ title, description, icon: Icon, complete }) => (
          <a
            href="#"
            key={title}
            className="group flex min-h-[49px] items-center gap-3 rounded-xl px-2 py-1.5 transition-colors duration-150 hover:bg-white/8 focus-visible:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                complete ? "bg-white text-arom" : "text-white"
              }`}
            >
              <Icon aria-hidden="true" size={complete ? 21 : 23} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.78rem] font-medium leading-4 sm:text-sm">
                {km ? ({
                  "Mood check-in": "ពិនិត្យអារម្មណ៍",
                  "MindGuide lesson": "មេរៀនមគ្គុទ្ទេសក៍ចិត្ត",
                  "Guided meditation": "សមាធិដោយមានការណែនាំ",
                  "Daily mission": "បេសកកម្មប្រចាំថ្ងៃ",
                  "Explore community": "ស្វែងយល់ពីសហគមន៍",
                } as Record<string, string>)[title] : title}
              </span>
              <span className="mt-0.5 block truncate text-[0.68rem] leading-4 text-white/68 sm:text-xs">
                {description}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              size={20}
              className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </a>
        ))}
      </div>
    </section>
  );
}

function EncouragementCard() {
  const { language } = useLanguage();
  return (
    <aside className="flex min-h-[60px] items-center gap-3 rounded-2xl bg-arom-soft px-3.5 py-3 text-arom sm:px-5">
      <Quote aria-hidden="true" size={25} strokeWidth={1.8} className="shrink-0" />
      <p className="flex-1 text-sm font-medium leading-[1.25rem]">
        {language === "km" ? "ការរីកចម្រើននៅតែជាការរីកចម្រើន" : "Progress is still progress,"}
        <br />
        {language === "km" ? "ទោះបីតិចតួចក៏ដោយ។" : "no matter how small."}
      </p>
      <Heart aria-hidden="true" size={25} className="shrink-0" />
    </aside>
  );
}

function MoodCheckIn() {
  const { language } = useLanguage();
  const [selectedMood, setSelectedMood] = useState("Good");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="mood-title" className="rounded-[1.4rem] bg-white sm:p-5 sm:shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-arom-accent">
            {language === "km" ? "ការពិនិត្យប្រចាំថ្ងៃ" : "Daily check-in"}
          </p>
          <h2 id="mood-title" className="mt-1.5 text-sm font-semibold text-arom sm:text-base">
            {language === "km" ? "ថ្ងៃនេះអ្នកមានអារម្មណ៍យ៉ាងដូចម្តេច?" : "How are you feeling today?"}
          </h2>
        </div>
        <span className="hidden rounded-full bg-arom-wash px-3 py-1 text-xs font-medium text-arom sm:block xl:hidden 2xl:block">
          {selectedMood}
        </span>
      </div>

      <div role="radiogroup" aria-label="Select your mood" className="mt-4 grid grid-cols-5 gap-1 sm:gap-2">
        {moods.map(({ label, icon: Icon }) => {
          const isSelected = selectedMood === label;
          return (
            <motion.button
              key={label}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={label}
              onClick={() => setSelectedMood(label)}
              whileTap={shouldReduceMotion ? undefined : { transform: "scale(0.97)" }}
              transition={{ duration: 0.14, ease: easeOut }}
              className="group flex min-h-[74px] flex-col items-center rounded-2xl px-0.5 py-1 text-arom focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
            >
              <motion.span
                animate={{
                  transform: isSelected && !shouldReduceMotion ? "scale(1)" : "scale(0.96)",
                  backgroundColor: isSelected ? "#1f6f5b" : "#dff3ee",
                  color: isSelected ? "#ffffff" : "#1f6f5b",
                }}
                transition={{ duration: 0.18, ease: easeOut }}
                className="flex size-10 items-center justify-center rounded-full sm:size-11"
              >
                <Icon aria-hidden="true" size={24} strokeWidth={1.9} />
              </motion.span>
              <span className={`mt-2 text-[0.68rem] leading-4 sm:text-xs ${isSelected ? "font-semibold" : "font-medium"}`}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

export function AromHome() {
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.055,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      transform: shouldReduceMotion ? "translateY(0)" : "translateY(8px)",
    },
    visible: {
      opacity: 1,
      transform: "translateY(0)",
      transition: {
        duration: shouldReduceMotion ? 0.16 : 0.24,
        ease: easeOut,
      },
    },
  };

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Home" />

      <div className="min-w-0">
        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto min-h-screen w-full max-w-[74rem] px-5 pb-28 pt-5 sm:px-8 sm:pt-7 lg:px-10 lg:pb-10 lg:pt-8 xl:px-12"
        >
          <motion.header variants={itemVariants} className="flex items-start justify-between gap-4">
            <div className="lg:hidden">
              <AromBrand />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-arom-accent">
                {language === "km" ? "កន្លែងសុខុមាលភាពរបស់អ្នក" : "Your wellness space"}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {language === "km" ? "ចិត្តស្ងប់ស្ងាត់ ជីវិតកាន់តែភ្លឺស្វាង" : "A calmer mind, a brighter you"}
              </p>
            </div>

            <Link
              href="/profile"
              aria-label="Open profile and settings"
              className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-arom"
            >
              <Image
                src="/brand/muoyly-avatar.svg"
                alt="Muoyly"
                width={45}
                height={42}
                className="size-11 rounded-full object-cover ring-2 ring-white shadow-[0_5px_18px_rgba(20,75,63,0.15)]"
                unoptimized
              />
            </Link>
          </motion.header>

          <motion.section
            variants={itemVariants}
            className="mt-8 sm:mt-10 lg:mt-12 xl:mx-auto xl:w-full xl:max-w-[28rem]"
          >
            <p className="text-2xl font-bold tracking-[-0.035em] text-arom sm:text-[1.75rem]">
              {language === "km" ? "អរុណសួស្តី Muoyly!" : "Good morning Muoyly!"}
            </p>
            <p className="mt-1.5 text-sm text-ink sm:text-base">
              {language === "km" ? "ថ្ងៃនេះអ្នកមានអារម្មណ៍យ៉ាងដូចម្តេច?" : "How are you feeling today?"}
            </p>
          </motion.section>

          <div className="mt-4 grid items-start gap-4 sm:mt-6 sm:gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)] lg:grid-cols-[minmax(0,1.28fr)_minmax(19rem,0.82fr)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(25rem,28rem)_minmax(0,1fr)]">
            <motion.div
              variants={itemVariants}
              className="mx-auto w-full max-w-[35rem] md:row-span-2 md:max-w-none xl:col-start-2"
            >
              <DailyPlanCard />
            </motion.div>

            <motion.div variants={itemVariants} className="xl:col-start-3">
              <EncouragementCard />
            </motion.div>

            <motion.div variants={itemVariants} className="xl:col-start-3">
              <MoodCheckIn />
            </motion.div>
          </div>
        </motion.main>
      </div>

      <MobileNavigation active="Home" />
    </div>
  );
}
