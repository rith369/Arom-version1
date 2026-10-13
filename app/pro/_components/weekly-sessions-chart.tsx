'use client';

import { useState, type ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import type { ProBooking } from '../_data/bookings';
import { addDays, cambodiaDate, weekdayOf } from '../_data/schedule';

type WeekRow = { week: string; done: number; noShow: number; cancelled: number };

// Same colours as the admin bookings chart, already checked with the dataviz
// palette validator on the white card. Cancelled is a de-emphasis gray, and
// the legend and table view carry the values too.
const SERIES = [
  { key: 'done', en: 'Completed or booked', km: 'បានបញ្ចប់ ឬបានកក់', color: '#1c9a7b' },
  { key: 'noShow', en: 'Did not come', km: 'មិនបានមក', color: '#e0a43a' },
  { key: 'cancelled', en: 'Cancelled', km: 'បានបោះបង់', color: '#c3cdca' },
] as const;

export const WEEKS = 8;

// Monday of the week that contains `date` (Cambodia dates, "2026-10-13").
export const mondayOf = (date: string) => addDays(date, -(weekdayOf(date) - 1));

export function weeklyRows(bookings: ProBooking[], now: number): WeekRow[] {
  const thisMonday = mondayOf(cambodiaDate(now));
  const rows = Array.from({ length: WEEKS }, (_, index) => ({ week: addDays(thisMonday, (index - WEEKS + 1) * 7), done: 0, noShow: 0, cancelled: 0 }));
  for (const booking of bookings) {
    const row = rows.find((item) => item.week === mondayOf(cambodiaDate(Date.parse(booking.startsAt))));
    if (!row) continue;
    if (booking.status === 'cancelled') row.cancelled += 1;
    else if (booking.status === 'no_show') row.noShow += 1;
    else row.done += 1;
  }
  return rows;
}

const total = (row: WeekRow) => row.done + row.noShow + row.cancelled;

function niceTicks(max: number) {
  const step = Math.max(1, Math.ceil(Math.max(max, 4) / 4));
  return [0, 1, 2, 3, 4].map((index) => index * step);
}

type ShapeProps = { x?: number; y?: number; width?: number; height?: number; payload?: WeekRow };

// 4px rounded top on the highest segment, 2px white gap between segments.
function columnShape(key: keyof WeekRow, color: string) {
  function Shape({ x = 0, y = 0, width = 0, height = 0, payload }: ShapeProps): ReactElement {
    if (height <= 0 || !payload) return <g />;
    const topKey = [...SERIES].reverse().find((item) => payload[item.key] > 0)?.key;
    const isTop = topKey === key;
    const top = isTop ? y : y + 2;
    const h = isTop ? height : Math.max(0, height - 2);
    const r = isTop ? Math.min(4, width / 2, h) : 0;
    return (
      <path
        d={`M${x},${top + h} L${x},${top + r} Q${x},${top} ${x + r},${top} L${x + width - r},${top} Q${x + width},${top} ${x + width},${top + r} L${x + width},${top + h} Z`}
        fill={color}
      />
    );
  }
  return Shape;
}

export function WeeklySessionsChart({ bookings, now, km }: { bookings: ProBooking[]; now: number; km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [showTable, setShowTable] = useState(false);
  const rows = weeklyRows(bookings, now);
  const thisMonday = rows.at(-1)!.week;
  const short = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const weekLabel = (week: string) => (week === thisMonday ? t('សប្តាហ៍នេះ', 'This week') : short.format(new Date(`${week}T00:00:00Z`)));
  const weekRange = (week: string) =>
    t(
      `${short.format(new Date(`${week}T00:00:00Z`))} ដល់ ${short.format(new Date(`${addDays(week, 6)}T00:00:00Z`))}`,
      `${short.format(new Date(`${week}T00:00:00Z`))} to ${short.format(new Date(`${addDays(week, 6)}T00:00:00Z`))}`,
    );
  const sum = rows.reduce((acc, row) => acc + row.done, 0);
  const average = Math.round((sum / WEEKS) * 10) / 10;
  const yTicks = niceTicks(Math.max(0, ...rows.map(total)));

  const renderTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
    const row = payload?.[0]?.payload as WeekRow | undefined;
    if (!active || !row) return null;
    return (
      <div className="min-w-44 rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-[0_8px_24px_rgba(20,34,31,0.22)]">
        <p className="font-medium">{weekRange(row.week)}</p>
        <ul className="mt-1.5 space-y-1">
          {SERIES.map((series) => (
            <li key={series.key} className="flex items-center gap-2">
              <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ backgroundColor: series.color }} />
              <span className="font-semibold tabular-nums">{row[series.key]}</span>
              <span className="text-white/70">{km ? series.km : series.en}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-base font-bold text-ink">{t('វគ្គក្នុងមួយសប្តាហ៍ ៨ សប្តាហ៍ចុងក្រោយ', 'Sessions per week, last 8 weeks')}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        {t(`ជាមធ្យម ${average} វគ្គដែលបានបញ្ចប់ ឬបានកក់ ក្នុងមួយសប្តាហ៍`, `On average ${average} completed or booked sessions a week`)}
      </p>

      <ul aria-label={t('សេចក្តីពន្យល់', 'Legend')} className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted">
        {SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: series.color }} />
            {km ? series.km : series.en}
          </li>
        ))}
      </ul>

      <div role="img" aria-label={t(`វគ្គក្នុងមួយសប្តាហ៍ ៨ សប្តាហ៍ចុងក្រោយ ជាមធ្យម ${average}`, `Sessions per week for the last 8 weeks, ${average} a week on average.`)} className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap="24%">
            <CartesianGrid vertical={false} stroke="var(--arom-grid)" />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={{ stroke: 'var(--arom-border)' }}
              tickMargin={10}
              minTickGap={4}
              tick={{ fill: 'var(--ink-muted)', fontSize: 11 }}
              tickFormatter={weekLabel}
            />
            <YAxis allowDecimals={false} domain={[0, yTicks.at(-1)!]} ticks={yTicks} tickLine={false} axisLine={false} width={44} tick={{ fill: 'var(--ink-muted)', fontSize: 11 }} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--arom-wash)' }} isAnimationActive={false} />
            {SERIES.map((series) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                name={km ? series.km : series.en}
                stackId="sessions"
                fill={series.color}
                maxBarSize={32}
                shape={columnShape(series.key, series.color)}
                // No grow in animation: with the custom column shape it can stall at height 0.
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button type="button" onClick={() => setShowTable(!showTable)} aria-expanded={showTable} className="mt-4 text-sm font-medium text-arom hover:underline">
        {showTable ? t('លាក់តារាង', 'Hide table') : t('មើលជាតារាង', 'View as table')}
      </button>
      {showTable && (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-arom-border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{t('វគ្គក្នុងមួយសប្តាហ៍', 'Sessions per week')}</caption>
            <thead className="bg-arom-wash/70 text-xs text-ink-muted">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">{t('សប្តាហ៍', 'Week')}</th>
                {SERIES.map((series) => (
                  <th key={series.key} scope="col" className="px-3 py-2 text-right font-medium">{km ? series.km : series.en}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-arom-border">
              {rows.map((row) => (
                <tr key={row.week}>
                  <th scope="row" className="px-3 py-2 font-medium text-ink">{weekRange(row.week)}</th>
                  {SERIES.map((series) => (
                    <td key={series.key} className="px-3 py-2 text-right tabular-nums text-ink">{row[series.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
