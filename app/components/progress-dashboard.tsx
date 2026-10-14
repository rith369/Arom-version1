"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Activity, ArrowRight, LogIn, RotateCcw, Wind } from "lucide-react";
import { useLanguage } from "../_components/language-provider";
import {
  MOOD_LABELS,
  loadMoodWeek,
  moodStep,
  useMoodStore,
  type MoodDay,
} from "../_components/mood/mood-store";

// Your Progress on Home (BACKEND-HANDOFF.md section 22). Shows only the
// person's own check ins from the last 7 days. Missed days stay blank, never
// zero, and the summary counts check ins instead of judging the mood.

const CHART = { width: 320, height: 132, left: 22, right: 22, top: 18, bottom: 26 };
const STEP_Y = (CHART.height - CHART.top - CHART.bottom) / 4;

function xOf(index: number, count: number) {
  return CHART.left + (index * (CHART.width - CHART.left - CHART.right)) / Math.max(count - 1, 1);
}

function yOf(step: number) {
  return CHART.height - CHART.bottom - (step - 1) * STEP_Y;
}

function weekday(day: string, km: boolean) {
  return new Intl.DateTimeFormat(km ? "km-KH" : "en-US", { weekday: "short", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}

// Lines join two days only when both have a check in, so a gap stays a gap.
function segments(days: MoodDay[]) {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  days.forEach((entry, index) => {
    const next = days[index + 1];
    if (!entry.mood || !next?.mood) return;
    lines.push({
      x1: xOf(index, days.length),
      y1: yOf(moodStep(entry.mood)),
      x2: xOf(index + 1, days.length),
      y2: yOf(moodStep(next.mood)),
    });
  });
  return lines;
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#e5efe9] bg-white p-5 shadow-[0_4px_24px_rgba(20,75,63,0.04)] sm:p-6">
      {children}
    </div>
  );
}

export function ProgressDashboard() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const reduce = useReducedMotion();
  const mood = useMoodStore();
  const [picked, setPicked] = useState<number | null>(null);

  const lastIndex = mood.days.length - 1;
  const activeIndex = picked ?? lastIndex;
  const activeDay = mood.days[activeIndex];

  return (
    <section
      id="progress-dashboard"
      aria-labelledby="progress-title"
      className="mt-6 flex scroll-mt-6 flex-col gap-4 sm:gap-5"
    >
      <div className="px-1">
        <h2 id="progress-title" className="text-xl font-bold tracking-tight text-[#14221f] sm:text-2xl">
          {t("ដំណើរការវិវឌ្ឍរបស់អ្នក (Your Progress)", "Your Progress")}
        </h2>
        <p className="mt-0.5 text-xs text-[#4b5563] sm:text-sm">
          {t("«រាល់ជំហានតូចៗ សុទ្ធតែជាការរីកចម្រើនដ៏មានតម្លៃ។»", "“Small steps are still progress.”")}
        </p>
      </div>

      {mood.status === "loading" && (
        <Card>
          <div aria-busy="true" aria-label={t("កំពុងផ្ទុក", "Loading")} className="flex flex-col gap-3">
            <div className="h-4 w-40 animate-pulse rounded-full bg-[#e0f3ed]" />
            <div className="h-28 animate-pulse rounded-2xl bg-[#f0f6f3]" />
          </div>
        </Card>
      )}

      {mood.status === "signed_out" && (
        <Card>
          <h3 className="text-base font-bold text-[#14221f] sm:text-lg">
            {t("តាមដានសប្តាហ៍របស់អ្នក", "Keep track of your week")}
          </h3>
          <p className="mt-1 text-sm text-[#4b5563]">
            {t(
              "ចូលគណនី ដើម្បីកត់ត្រាអារម្មណ៍ប្រចាំថ្ងៃ និងមើលសប្តាហ៍របស់អ្នកនៅទីនេះ។ មានតែអ្នកទេដែលអាចមើលឃើញ។",
              "Log in to check in each day and see your week here. Only you can see it.",
            )}
          </p>
          <Link
            href="/login?next=%2F"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1f6f5b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#144b3e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b]"
          >
            <LogIn size={16} aria-hidden="true" />
            {t("ចូលគណនី", "Log in")}
          </Link>
        </Card>
      )}

      {mood.status === "error" && (
        <Card>
          <p role="alert" className="text-sm text-[#4b5563]">
            {t("មិនអាចផ្ទុកសប្តាហ៍របស់អ្នកបានទេ។", "Your week could not be loaded.")}
          </p>
          <button
            type="button"
            onClick={() => void loadMoodWeek()}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1f6f5b] hover:underline"
          >
            <RotateCcw size={14} aria-hidden="true" />
            {t("ព្យាយាមម្ដងទៀត", "Try again")}
          </button>
        </Card>
      )}

      {mood.status === "ready" && mood.checkIns === 0 && (
        <Card>
          <h3 className="text-base font-bold text-[#14221f] sm:text-lg">
            {t("សប្តាហ៍របស់អ្នកនឹងបង្ហាញនៅទីនេះ", "Your week will show here")}
          </h3>
          <p className="mt-1 text-sm text-[#4b5563]">
            {t(
              "កត់ត្រាអារម្មណ៍ថ្ងៃនេះ ហើយថ្ងៃនីមួយៗនឹងបង្ហាញនៅលើតារាងនេះ។",
              "Check in with today's mood, and each day will appear on this chart.",
            )}
          </p>
          <a
            href="#mood-check-in"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1f6f5b] hover:underline"
          >
            {t("កត់ត្រាអារម្មណ៍ថ្ងៃនេះ", "Check in today")}
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </Card>
      )}

      {mood.status === "ready" && mood.checkIns > 0 && (
        <Card>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e0f3ed] text-[#1f6f5b]">
              <Activity size={14} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#14221f] sm:text-lg">
                {t("៧ ថ្ងៃចុងក្រោយ", "Your last 7 days")}
              </h3>
              <p className="text-xs text-[#4b5563] sm:text-sm">
                {km
                  ? `អ្នកបានកត់ត្រាអារម្មណ៍ ${mood.checkIns} ដងក្នុងសប្តាហ៍នេះ។`
                  : `You checked in ${mood.checkIns} ${mood.checkIns === 1 ? "time" : "times"} this week.`}
              </p>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${CHART.width} ${CHART.height}`}
            className="mt-4 w-full"
            role="img"
            aria-label={mood.days
              .map((entry) => `${weekday(entry.day, km)}: ${entry.mood ? (km ? MOOD_LABELS[entry.mood].km : MOOD_LABELS[entry.mood].en) : t("មិនបានកត់ត្រា", "no check in")}`)
              .join(", ")}
          >
            {[1, 2, 3, 4, 5].map((step) => (
              <line
                key={step}
                x1={CHART.left - 10}
                x2={CHART.width - CHART.right + 10}
                y1={yOf(step)}
                y2={yOf(step)}
                stroke="#eef3f1"
                strokeWidth={1}
              />
            ))}
            {segments(mood.days).map((line, index) => (
              <motion.line
                key={`${line.x1}-${index}`}
                {...line}
                stroke="#1f6f5b"
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
            {mood.days.map((entry, index) => {
              const x = xOf(index, mood.days.length);
              const isActive = index === activeIndex;
              return (
                <g key={entry.day}>
                  {entry.mood ? (
                    <circle
                      cx={x}
                      cy={yOf(moodStep(entry.mood))}
                      r={isActive ? 6 : 4.5}
                      fill={isActive ? "#1f6f5b" : "#ffffff"}
                      stroke="#1f6f5b"
                      strokeWidth={2}
                    />
                  ) : (
                    <circle cx={x} cy={yOf(1)} r={2} fill="#c9d8d2" />
                  )}
                  <text
                    x={x}
                    y={CHART.height - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={index === lastIndex ? 700 : 500}
                    fill={index === lastIndex ? "#1f6f5b" : "#6b7280"}
                  >
                    {index === lastIndex ? t("ថ្ងៃនេះ", "Today") : weekday(entry.day, km)}
                  </text>
                </g>
              );
            })}
          </svg>

          <div role="group" aria-label={t("ជ្រើសថ្ងៃ", "Choose a day")} className="mt-2 grid grid-cols-7 gap-1">
            {mood.days.map((entry, index) => (
              <button
                key={entry.day}
                type="button"
                aria-pressed={index === activeIndex}
                onClick={() => setPicked(index)}
                className={`h-2 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b] ${
                  index === activeIndex ? "bg-[#1f6f5b]" : "bg-[#e0f3ed] hover:bg-[#c7e6dc]"
                }`}
              >
                <span className="sr-only">{weekday(entry.day, km)}</span>
              </button>
            ))}
          </div>

          {activeDay && (
            <p aria-live="polite" className="mt-3 rounded-2xl bg-[#f4f9f7] px-4 py-3 text-sm text-[#14221f]">
              <span className="font-semibold">
                {activeIndex === lastIndex ? t("ថ្ងៃនេះ", "Today") : weekday(activeDay.day, km)}:
              </span>{" "}
              {activeDay.mood
                ? km
                  ? MOOD_LABELS[activeDay.mood].km
                  : MOOD_LABELS[activeDay.mood].en
                : t("មិនបានកត់ត្រាទេ", "No check in")}
            </p>
          )}
        </Card>
      )}

      <Link
        href="/practice"
        className="group flex items-center gap-3 rounded-[20px] border border-[#e5efe9] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-colors hover:bg-[#f4f9f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e0f3ed] text-[#1f6f5b]">
          <Wind size={18} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[#14221f]">
            {t("សាកល្បងលំហាត់ដកដង្ហើមខ្លីមួយ", "Try a short breathing practice")}
          </span>
          <span className="block text-xs text-[#4b5563]">
            {t("ពីរបីនាទីសម្រាប់សម្រាកចិត្ត", "A few minutes to settle your mind")}
          </span>
        </span>
        <ArrowRight size={16} aria-hidden="true" className="text-[#1f6f5b] transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
