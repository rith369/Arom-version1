"use client";

import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { JOURNAL_MOOD_LEVEL, type JournalMood } from "@/lib/journal";
import { MOOD_LABELS, MOOD_LEVELS, cambodiaDay, lastDays, type MoodLevel } from "@/lib/mood";
import { MoodSprout } from "../mood/mood-sprout";
import dynamic from "next/dynamic";
import type { JournalSummary } from "@/lib/journal-summary";
import { JournalWrittenSummary } from "./journal-written-summary";

// Lessons, tips and practices are large, so the suggestions load after the page.
const JournalSuggestions = dynamic(() => import("./journal-suggestions").then((m) => m.JournalSuggestions), {
  ssr: false,
});

export type WeekEntry = { date: string; mood: string; tags: string[] };

/**
 * The journal's last 7 days, counted from the person's own entries: how many
 * entries, which moods, which feelings came up most. Counts only, it never
 * says better or worse. Below it, the written summary the person can turn
 * on, then suggestions for the week's topic (BACKEND-HANDOFF.md section 22).
 */
export function JournalWeekSummary({
  entries,
  km,
  feelingLabel,
}: {
  entries: WeekEntry[];
  km: boolean;
  feelingLabel: (tag: string) => string;
}) {
  const [today] = useState(() => cambodiaDay(Date.now()));
  const [summary, setSummary] = useState<JournalSummary | null>(null);
  const week = new Set(lastDays(today));
  const recent = entries.filter((entry) => week.has(entry.date));
  const daysWritten = new Set(recent.map((entry) => entry.date)).size;

  const moods = new Map<MoodLevel, number>();
  const feelings = new Map<string, number>();
  for (const entry of recent) {
    const level = JOURNAL_MOOD_LEVEL[entry.mood as JournalMood];
    if (level) moods.set(level, (moods.get(level) ?? 0) + 1);
    for (const tag of entry.tags) feelings.set(tag, (feelings.get(tag) ?? 0) + 1);
  }
  const moodRows = [...MOOD_LEVELS].reverse().filter((level) => moods.has(level));
  const topFeelings = [...feelings.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <>
      <section className="mt-5 rounded-[24px] border border-[#bce5d8] bg-gradient-to-br from-[#ebf7f3] via-[#f8fdfb] to-[#e4f5ee] p-4 shadow-[0_4px_22px_rgba(31,111,91,0.06)] sm:p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[#dff3ee] text-[#1f6f5b]">
            <HeartPulse size={19} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-[#111827] sm:text-base">{km ? "សប្តាហ៍របស់អ្នក" : "Your week"}</h2>
            <p className="text-[11px] text-[#4b5563]">{km ? "ពីកំណត់ត្រា ៧ ថ្ងៃចុងក្រោយ" : "From your entries in the last 7 days"}</p>
          </div>
        </div>

        {recent.length === 0 ? (
          <p className="mt-3.5 rounded-2xl border border-[#1f6f5b]/10 bg-white/80 p-3.5 text-xs leading-relaxed text-[#1f2d29] sm:text-sm">
            {km
              ? "មិនទាន់មានកំណត់ត្រាក្នុង ៧ ថ្ងៃចុងក្រោយទេ។ សប្តាហ៍របស់អ្នកនឹងបង្ហាញនៅទីនេះ ពេលអ្នកសរសេរ។"
              : "No entries in the last 7 days yet. Your week shows here once you write."}
          </p>
        ) : (
          <>
            <p className="mt-3.5 rounded-2xl border border-[#1f6f5b]/10 bg-white/80 p-3.5 text-xs font-medium leading-relaxed text-[#1f2d29] sm:text-sm">
              {km
                ? `អ្នកបានសរសេរ ${recent.length} កំណត់ត្រា ក្នុងរយៈពេល ${daysWritten} ថ្ងៃ។`
                : `You wrote ${recent.length} ${recent.length === 1 ? "entry" : "entries"} on ${daysWritten} ${
                    daysWritten === 1 ? "day" : "days"
                  }.`}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#1f6f5b]/10 bg-white/80 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  {km ? "អារម្មណ៍ (Moods)" : "Moods"}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {moodRows.map((level) => (
                    <li key={level} className="flex items-center gap-2 text-xs text-[#1f2d29]">
                      <MoodSprout mood={level} className="h-5 w-auto" />
                      <span className="flex-1">{km ? MOOD_LABELS[level].km : MOOD_LABELS[level].en}</span>
                      <span className="font-bold text-[#1f6f5b]">{moods.get(level)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[#1f6f5b]/10 bg-white/80 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  {km ? "អារម្មណ៍ដែលកើតញឹកញាប់ (Common feelings)" : "Common feelings"}
                </p>
                {topFeelings.length === 0 ? (
                  <p className="mt-2 text-xs text-[#6b7280]">{km ? "មិនទាន់មានទេ" : "None picked yet"}</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {topFeelings.map(([tag, count]) => (
                      <li key={tag} className="rounded-full bg-[#dff3ee] px-2.5 py-1 text-xs font-semibold text-[#1f6f5b]">
                        {feelingLabel(tag)} ({count})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        <JournalWrittenSummary km={km} weekCount={recent.length} onSummary={setSummary} />
      </section>
      <JournalSuggestions km={km} entries={recent} summary={summary} />
    </>
  );
}
