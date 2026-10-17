"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, LogIn, RotateCcw } from "lucide-react";
import { useLanguage } from "../_components/language-provider";
import { MOOD_LABELS, loadMoodWeek, useMoodStore } from "../_components/mood/mood-store";
import { MOOD_COLORS } from "../_components/mood/mood-visuals";

// Your Progress on Home (BACKEND-HANDOFF.md section 22): a small glance at the
// last 7 days that opens the Progress Dashboard, where the charts live. Only
// the person's own check ins; a missed day stays an empty dot, and the text
// counts check ins instead of judging the mood.

function weekdayInitial(day: string, km: boolean) {
  return new Intl.DateTimeFormat(km ? "km-KH" : "en-US", { weekday: "narrow", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}

const card =
  "rounded-[24px] border border-[#e5efe9] bg-white p-5 shadow-[0_4px_24px_rgba(20,75,63,0.04)] sm:p-6";

export function ProgressDashboard() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const mood = useMoodStore();

  return (
    <section
      id="progress-dashboard"
      aria-labelledby="progress-title"
      className="mt-2 flex scroll-mt-6 flex-col gap-4 sm:gap-5"
    >
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h2 id="progress-title" className="text-lg font-semibold tracking-tight text-[#1f6f5b] sm:text-xl">
            {t("ដំណើរការវិវឌ្ឍរបស់អ្នក (Your Progress)", "Your Progress")}
          </h2>
          <p className="mt-0.5 text-xs text-[#4b5563] sm:text-sm">
            {t("អារម្មណ៍របស់អ្នកក្នុង ៧ ថ្ងៃចុងក្រោយ", "Your moods over the last 7 days")}
          </p>
        </div>
        <Link
          href="/progress"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#1f6f5b] hover:underline"
        >
          {t("មើលទាំងអស់", "See all")}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {mood.status === "loading" && (
        <div aria-busy="true" aria-label={t("កំពុងផ្ទុក", "Loading")} className={card}>
          <div className="h-4 w-48 animate-pulse rounded-full bg-[#e0f3ed]" />
          <div className="mt-3 h-8 animate-pulse rounded-xl bg-[#f0f6f3]" />
        </div>
      )}

      {mood.status === "signed_out" && (
        <div className={card}>
          <p className="text-sm text-[#4b5563]">
            {t(
              "ចូលគណនី ដើម្បីកត់ត្រាអារម្មណ៍ប្រចាំថ្ងៃ និងមើលសប្តាហ៍របស់អ្នក។ មានតែអ្នកទេដែលអាចមើលឃើញ។",
              "Log in to check in each day and see your week. Only you can see it.",
            )}
          </p>
          <Link
            href="/login?next=%2F"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#1f6f5b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#144b3e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b]"
          >
            <LogIn size={16} aria-hidden="true" />
            {t("ចូលគណនី", "Log in")}
          </Link>
        </div>
      )}

      {mood.status === "error" && (
        <div className={card}>
          <p role="alert" className="text-sm text-[#4b5563]">
            {t("មិនអាចផ្ទុកសប្តាហ៍របស់អ្នកបានទេ។", "Your week could not be loaded.")}
          </p>
          <button
            type="button"
            onClick={() => void loadMoodWeek()}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1f6f5b] hover:underline"
          >
            <RotateCcw size={14} aria-hidden="true" />
            {t("ព្យាយាមម្ដងទៀត", "Try again")}
          </button>
        </div>
      )}

      {mood.status === "ready" && mood.checkIns === 0 && (
        <a
          href="#mood-check-in"
          className={`${card} group flex items-center gap-3 transition-colors hover:bg-[#f4f9f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b]`}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-[#14221f]">
              {t("ចាប់ផ្តើមសប្តាហ៍របស់អ្នកថ្ងៃនេះ", "Start your week today")}
            </span>
            <span className="block text-sm text-[#4b5563]">
              {t("កត់ត្រាអារម្មណ៍ថ្ងៃនេះខាងលើ ហើយថ្ងៃនីមួយៗនឹងបង្ហាញនៅទីនេះ។", "Check in with today's mood above, and each day will show here.")}
            </span>
          </span>
          <ChevronRight size={20} aria-hidden="true" className="shrink-0 text-[#1f6f5b]" />
        </a>
      )}

      {mood.status === "ready" && mood.checkIns > 0 && (
        <Link
          href="/progress"
          className={`${card} group block transition-colors hover:bg-[#f4f9f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b]`}
        >
          <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            {/* The last 7 days: each day's mood color, an empty dot for a missed day. */}
            <span aria-hidden="true" className="flex gap-2">
              {mood.days.map((entry) => (
                <span key={entry.day} className="flex flex-col items-center gap-1">
                  <span
                    className={`size-5 rounded-full ${entry.mood ? "" : "border-2 border-dashed border-[#c9d8d2]"}`}
                    style={entry.mood ? { backgroundColor: MOOD_COLORS[entry.mood] } : undefined}
                    title={entry.mood ? (km ? MOOD_LABELS[entry.mood].km : MOOD_LABELS[entry.mood].en) : undefined}
                  />
                  <span className="text-[10px] font-medium text-[#6b7280]">{weekdayInitial(entry.day, km)}</span>
                </span>
              ))}
            </span>
            <span className="text-sm font-semibold text-[#14221f]">
              {km
                ? `អ្នកបានកត់ត្រា ${mood.checkIns} ក្នុងចំណោម ${mood.days.length} ថ្ងៃ`
                : `You checked in ${mood.checkIns} of ${mood.days.length} days`}
            </span>
          </span>
          <span className="mt-4 flex items-center justify-between border-t border-[#eef3f1] pt-3 text-sm font-semibold text-[#1f6f5b]">
            {t("បើកផ្ទាំងតាមដានការវិវត្ត", "Open Progress Dashboard")}
            <ChevronRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}
    </section>
  );
}
