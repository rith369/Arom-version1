'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { FigmaIcon } from '../../components/figma-icon';
import { MOOD_COLORS, MOOD_ICONS } from '../../_components/mood/mood-visuals';
import {
  MOOD_LABELS,
  MOOD_LEVELS,
  moodCounts,
  moodStep,
  type MoodDay,
  type MoodLevel,
  type ProgressRange,
} from '@/lib/mood';
import { dayLabel } from './progress-parts';

// Charts for the Progress pages (BACKEND-HANDOFF.md section 22). Heights
// follow the mood the person chose (very low to great); a missed day stays
// a gap, never zero. Nothing here judges the mood or compares weeks.

const moodName = (mood: MoodLevel, km: boolean) => (km ? MOOD_LABELS[mood].km : MOOD_LABELS[mood].en);

/**
 * Which days get a label under the chart: every day for 7 days, fewer for
 * longer ranges. Bars can sit in narrow cards, so they are labeled weekly.
 */
function labelEvery(range: ProgressRange, bars: boolean) {
  if (range === '7d') return 1;
  if (bars) return range === '30d' ? 7 : 21;
  return range === '30d' ? 5 : 15;
}

function showLabel(index: number, count: number, range: ProgressRange, bars = false) {
  return range === '7d' || (count - 1 - index) % labelEvery(range, bars) === 0;
}

/** The faces down the left side: great at the top, very low at the bottom. */
function FaceAxis({ levels }: { levels: MoodLevel[] }) {
  return (
    <div aria-hidden="true" className="flex shrink-0 flex-col justify-between pb-7 pt-1">
      {levels.map((level) => (
        <span
          key={level}
          className="flex size-6 items-center justify-center rounded-full"
          style={{ backgroundColor: `${MOOD_COLORS[level]}33` }}
        >
          <FigmaIcon name={MOOD_ICONS[level]} size={16} />
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mood trend (line)
// ---------------------------------------------------------------------------

// Height is fixed; the width follows the card so text keeps its size on any screen.
const TREND = { height: 150, top: 12, bottom: 122, left: 14, right: 14 };

/** The element's width in pixels, updated when it resizes. */
function useWidth(fallback: number) {
  const [width, setWidth] = useState(fallback);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(200, Math.round(entry.contentRect.width))));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

const trendX = (index: number, count: number, width: number) =>
  TREND.left + (index * (width - TREND.left - TREND.right)) / Math.max(count - 1, 1);
const trendY = (step: number) => TREND.bottom - ((step - 1) * (TREND.bottom - TREND.top)) / 4;
const clampY = (y: number) => Math.min(TREND.bottom, Math.max(TREND.top, y));

/** A smooth line through the points (Catmull Rom), kept inside the chart. */
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 1) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: clampY(p1.y + (p2.y - p0.y) / 6) };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: clampY(p2.y - (p3.y - p1.y) / 6) };
    path += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

/** Runs of days in a row that have a check in; a missed day breaks the line. */
function runs(days: MoodDay[], width: number) {
  const result: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  days.forEach((entry, index) => {
    if (entry.mood) {
      current.push({ x: trendX(index, days.length, width), y: trendY(moodStep(entry.mood)) });
    } else if (current.length) {
      result.push(current);
      current = [];
    }
  });
  if (current.length) result.push(current);
  return result;
}

export function MoodTrendChart({ days, km, range }: { days: MoodDay[]; km: boolean; range: ProgressRange }) {
  const gradientId = useId();
  const short = range === '7d';
  const { ref, width } = useWidth(320);
  const x = (index: number) => trendX(index, days.length, width);
  const [picked, setPicked] = useState<number | null>(null);
  const lastWithMood = days.findLastIndex((entry) => entry.mood);
  const active = short ? (picked ?? (lastWithMood >= 0 ? lastWithMood : null)) : null;
  const activeDay = active === null ? null : days[active];

  return (
    <div>
      <div className="flex gap-2">
        <FaceAxis levels={['great', 'okay', 'very_low']} />
        <div ref={ref} className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${width} ${TREND.height}`}
            width={width}
            height={TREND.height}
            className="block w-full"
            role="img"
            aria-label={days
              .map((entry) => `${dayLabel(entry.day, km, short)}: ${entry.mood ? moodName(entry.mood, km) : km ? 'មិនបានកត់ត្រា' : 'no check in'}`)
              .join(', ')}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1f6f5b" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#1f6f5b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <rect x={0} y={TREND.top - 6} width={width} height={TREND.bottom - TREND.top + 12} rx={8} fill="#f4faf8" />
            {[1, 2, 3, 4, 5].map((step) => (
              <line key={step} x1={0} x2={width} y1={trendY(step)} y2={trendY(step)} stroke="#e3efeb" strokeWidth={1} />
            ))}
            {days.map((entry, index) =>
              showLabel(index, days.length, range) ? (
                <line
                  key={entry.day}
                  x1={x(index)}
                  x2={x(index)}
                  y1={TREND.top - 6}
                  y2={TREND.bottom + 6}
                  stroke="#e3efeb"
                  strokeWidth={1}
                />
              ) : null,
            )}
            {runs(days, width).map((points) => {
              const line = smoothPath(points);
              if (!line) return null;
              const area = `${line} L ${points[points.length - 1].x} ${TREND.bottom} L ${points[0].x} ${TREND.bottom} Z`;
              return (
                <g key={`${points[0].x}`}>
                  <path d={area} fill={`url(#${gradientId})`} />
                  <path d={line} fill="none" stroke="#1f6f5b" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              );
            })}
            {days.map((entry, index) => {
              const cx = x(index);
              if (!entry.mood) {
                return short ? <circle key={entry.day} cx={cx} cy={TREND.bottom} r={2.5} fill="#c9d8d2" /> : null;
              }
              const isActive = index === active;
              // Long ranges show dots only where a check in stands alone.
              const alone = !days[index - 1]?.mood && !days[index + 1]?.mood;
              if (!short && !alone) return null;
              return (
                <circle
                  key={entry.day}
                  cx={cx}
                  cy={trendY(moodStep(entry.mood))}
                  r={isActive ? 6 : short ? 4.5 : 3}
                  fill={isActive || !short ? '#1f6f5b' : '#ffffff'}
                  stroke="#1f6f5b"
                  strokeWidth={2}
                />
              );
            })}
            {days.map((entry, index) =>
              showLabel(index, days.length, range) ? (
                <text
                  key={entry.day}
                  x={x(index)}
                  y={TREND.height - 8}
                  textAnchor={index === 0 && !short ? 'start' : index === days.length - 1 && !short ? 'end' : 'middle'}
                  fontSize={11}
                  fontWeight={index === active ? 700 : 500}
                  fill={index === active ? '#1f6f5b' : '#667a75'}
                >
                  {dayLabel(entry.day, km, short)}
                </text>
              ) : null,
            )}
          </svg>

          {short && (
            <div
              role="group"
              aria-label={km ? 'ជ្រើសថ្ងៃ' : 'Choose a day'}
              className="absolute inset-x-0 top-0 grid"
              style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`, height: '100%' }}
            >
              {days.map((entry, index) => (
                <button
                  key={entry.day}
                  type="button"
                  aria-pressed={index === active}
                  onClick={() => setPicked(index)}
                  className="rounded-lg focus-visible:outline-2 focus-visible:outline-arom"
                >
                  <span className="sr-only">{dayLabel(entry.day, km, true)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeDay && (
        <p aria-live="polite" className="mt-2 rounded-2xl bg-arom-wash px-4 py-2.5 text-sm text-ink">
          <span className="font-semibold">{dayLabel(activeDay.day, km, true)}:</span>{' '}
          {activeDay.mood ? moodName(activeDay.mood, km) : km ? 'មិនបានកត់ត្រាទេ' : 'No check in'}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mood statistics (bars)
// ---------------------------------------------------------------------------

export function MoodBarChart({ days, km, range }: { days: MoodDay[]; km: boolean; range: ProgressRange }) {
  const short = range === '7d';
  const lastWithMood = days.findLastIndex((entry) => entry.mood);
  const [picked, setPicked] = useState<number | null>(null);
  const active = picked ?? (lastWithMood >= 0 ? lastWithMood : null);
  const gap = range === '7d' ? 'gap-2 sm:gap-3' : range === '30d' ? 'gap-1' : 'gap-px';

  return (
    <div className="flex gap-2">
      <FaceAxis levels={['great', 'good', 'okay', 'very_low']} />
      <div className="min-w-0 flex-1">
        <div className={`flex h-44 items-end border-b border-arom-grid pt-9 ${gap}`}>
          {days.map((entry, index) => {
            const isActive = index === active && Boolean(entry.mood);
            const height = entry.mood ? `${(moodStep(entry.mood) / 5) * 100}%` : '4px';
            return (
              <button
                key={entry.day}
                type="button"
                aria-pressed={isActive}
                onClick={() => setPicked(index)}
                // 30 or 90 bars are too many keyboard stops; the donut below sums them up.
                tabIndex={short ? undefined : -1}
                aria-label={`${dayLabel(entry.day, km, short)}: ${entry.mood ? moodName(entry.mood, km) : km ? 'មិនបានកត់ត្រា' : 'no check in'}`}
                className="relative flex h-full min-w-0 flex-1 items-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
              >
                {isActive && entry.mood && (
                  <span
                    aria-hidden="true"
                    // Near the edges the bubble lines up with the bar so it stays inside the card.
                    className={`absolute z-10 whitespace-nowrap rounded-lg bg-arom px-2 py-1 text-xs font-semibold text-white shadow-sm ${
                      index >= days.length - 2 && !short
                        ? 'right-0'
                        : index <= 1 && !short
                          ? 'left-0'
                          : 'left-1/2 -translate-x-1/2'
                    }`}
                    style={{ bottom: `calc(${height} + 8px)` }}
                  >
                    {moodName(entry.mood, km)}
                    {(short || (index > 1 && index < days.length - 2)) && (
                      <span className="absolute left-1/2 top-full size-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-arom" />
                    )}
                  </span>
                )}
                <span
                  className={`w-full rounded-t-md transition-opacity ${short ? 'rounded-t-lg' : ''} ${
                    active !== null && !isActive && entry.mood ? 'opacity-75' : ''
                  }`}
                  style={{ height, backgroundColor: entry.mood ? MOOD_COLORS[entry.mood] : '#dbe5e1' }}
                />
              </button>
            );
          })}
        </div>
        <div className={`mt-1.5 flex ${gap}`}>
          {days.map((entry, index) => (
            <span key={entry.day} className="relative min-w-0 flex-1 text-center text-[11px] text-ink-muted">
              {showLabel(index, days.length, range, true) && (
                <span
                  className={
                    short
                      ? ''
                      : index === days.length - 1
                        ? 'absolute right-0 whitespace-nowrap'
                        : 'absolute left-1/2 -translate-x-1/2 whitespace-nowrap'
                  }
                >
                  {dayLabel(entry.day, km, short)}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mood distribution (donut)
// ---------------------------------------------------------------------------

const DONUT = { size: 140, radius: 52, stroke: 24 };

// Below this many check ins the legend shows counts instead of percentages.
const FEW_CHECK_INS = 10;

export function MoodDonut({ days, km }: { days: MoodDay[]; km: boolean }) {
  const counts = moodCounts(days);
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const circumference = 2 * Math.PI * DONUT.radius;
  // Great first, so the ring reads from the top like the legend.
  const order = [...MOOD_LEVELS].reverse();
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
      <div className="relative shrink-0" style={{ width: DONUT.size, height: DONUT.size }}>
        <svg viewBox={`0 0 ${DONUT.size} ${DONUT.size}`} className="size-full -rotate-90" aria-hidden="true">
          <circle
            cx={DONUT.size / 2}
            cy={DONUT.size / 2}
            r={DONUT.radius}
            fill="none"
            stroke="#e8f0ee"
            strokeWidth={DONUT.stroke}
          />
          {total > 0 &&
            order.map((level) => {
              const length = (counts[level] / total) * circumference;
              const segment = (
                <circle
                  key={level}
                  cx={DONUT.size / 2}
                  cy={DONUT.size / 2}
                  r={DONUT.radius}
                  fill="none"
                  stroke={MOOD_COLORS[level]}
                  strokeWidth={DONUT.stroke}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return counts[level] ? segment : null;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-ink">{total}</span>
          <span className="text-xs font-medium text-ink-muted">{km ? 'ការកត់ត្រា' : total === 1 ? 'Check in' : 'Check ins'}</span>
        </div>
      </div>

      <ul className="w-full max-w-xs space-y-2.5">
        {order.map((level) => (
          <li key={level} className="flex items-center gap-3 text-sm text-ink">
            <span aria-hidden="true" className="size-3.5 shrink-0 rounded-full" style={{ backgroundColor: MOOD_COLORS[level] }} />
            <span className="min-w-0 flex-1">{moodName(level, km)}</span>
            <span className="font-semibold tabular-nums">
              {/* With few check ins a percentage overstates it: "1 of 2" reads more honestly than "50%". */}
              {total < FEW_CHECK_INS
                ? km
                  ? `${counts[level]} ក្នុង ${total}`
                  : `${counts[level]} of ${total}`
                : `${Math.round((counts[level] / total) * 100)}%`}
            </span>
            <span className="sr-only">
              {km ? `${counts[level]} ដង` : `${counts[level]} ${counts[level] === 1 ? 'check in' : 'check ins'}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
