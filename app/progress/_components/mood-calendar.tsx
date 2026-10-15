'use client';

import { useState } from 'react';

import { MOOD_COLORS } from '../../_components/mood/mood-visuals';
import { MOOD_LABELS, MOOD_LEVELS, type MoodDay, type MoodLevel } from '@/lib/mood';
import { dayLabel } from './progress-parts';

// Month calendars for 30 days and 3 months (BACKEND-HANDOFF.md section 22).
// Each day is colored by the mood chosen; a missed day stays grey, never a
// mood. Weeks start on Monday, like the professional schedule.

// Dark tones need white numbers to stay readable.
const LIGHT_TEXT: Partial<Record<MoodLevel, boolean>> = { great: true };

const moodName = (mood: MoodLevel, km: boolean) => (km ? MOOD_LABELS[mood].km : MOOD_LABELS[mood].en);

type Month = { key: string; title: string; offset: number; days: MoodDay[] };

function months(days: MoodDay[], km: boolean): Month[] {
  const result: Month[] = [];
  for (const entry of days) {
    const key = entry.day.slice(0, 7);
    let month = result[result.length - 1];
    if (!month || month.key !== key) {
      const first = new Date(`${entry.day}T00:00:00Z`);
      month = {
        key,
        title: new Intl.DateTimeFormat(km ? 'km-KH' : 'en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first),
        // Blank cells before the first day shown, Monday first.
        offset: (first.getUTCDay() + 6) % 7,
        days: [],
      };
      result.push(month);
    }
    month.days.push(entry);
  }
  return result;
}

function weekdayHeads(km: boolean) {
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(km ? 'km-KH' : 'en-US', { weekday: 'narrow', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2024, 0, 1 + index)),
    ),
  );
}

export function MoodCalendar({ days, km }: { days: MoodDay[]; km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const lastWithMood = [...days].reverse().find((entry) => entry.mood);
  const [picked, setPicked] = useState<string | null>(lastWithMood?.day ?? null);
  const active = days.find((entry) => entry.day === picked);
  const heads = weekdayHeads(km);

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        {months(days, km).map((month) => (
          <div key={month.key}>
            <p className="text-sm font-semibold text-ink">{month.title}</p>
            <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] text-ink-muted" aria-hidden="true">
              {heads.map((head, index) => (
                <span key={index}>{head}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: month.offset }, (_, index) => (
                <span key={`blank-${index}`} aria-hidden="true" />
              ))}
              {month.days.map((entry) => {
                const isActive = entry.day === picked;
                return (
                  <button
                    key={entry.day}
                    type="button"
                    // Up to 90 days: pointer friendly; the donut and Insights sum them up for keyboards.
                    tabIndex={-1}
                    onClick={() => setPicked(entry.day)}
                    aria-label={`${dayLabel(entry.day, km, false)}: ${entry.mood ? moodName(entry.mood, km) : t('មិនបានកត់ត្រា', 'no check in')}`}
                    className={`flex aspect-square items-center justify-center rounded-md text-[11px] font-medium transition-shadow ${
                      isActive ? 'ring-2 ring-arom ring-offset-1' : ''
                    } ${entry.mood && LIGHT_TEXT[entry.mood] ? 'text-white' : 'text-ink'}`}
                    style={{ backgroundColor: entry.mood ? MOOD_COLORS[entry.mood] : '#eef3f1' }}
                  >
                    {Number(entry.day.slice(8))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <p aria-live="polite" className="mt-4 rounded-2xl bg-arom-wash px-4 py-2.5 text-sm text-ink">
          <span className="font-semibold">{dayLabel(active.day, km, false)}:</span>{' '}
          {active.mood ? moodName(active.mood, km) : t('មិនបានកត់ត្រាទេ', 'No check in')}
        </p>
      )}

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted" aria-label={t('ពណ៌', 'Colors')}>
        {[...MOOD_LEVELS].reverse().map((level) => (
          <li key={level} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: MOOD_COLORS[level] }} />
            {moodName(level, km)}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-sm bg-[#eef3f1] ring-1 ring-arom-border" />
          {t('មិនបានកត់ត្រា', 'No check in')}
        </li>
      </ul>
    </div>
  );
}
