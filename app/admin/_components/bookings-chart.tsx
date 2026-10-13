'use client';

import { useState, type ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import type { AdminBooking } from '../_data/bookings';

type Metric = 'sessions' | 'created';
type Range = 'last7' | 'last30' | 'next14';

type DayRow = {
  date: string;
  going: number;
  pending: number;
  cancelled: number;
  created: number;
};

// Checked with the dataviz palette validator against the white card:
// green and amber pass lightness, chroma and colour blind separation.
// Cancelled is a de-emphasis gray on purpose. Both hues sit under 3:1 on
// white, so the legend and the table view carry the values too.
const SERIES = [
  { key: 'going', label: 'Completed or confirmed', color: '#1c9a7b' },
  { key: 'pending', label: 'Pending', color: '#e0a43a' },
  { key: 'cancelled', label: 'Cancelled', color: '#c3cdca' },
] as const;

const CREATED_COLOR = '#1c9a7b';

const TIME_ZONE = 'Asia/Phnom_Penh';

function dayKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function addDays(key: string, days: number) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const toDate = (key: string) => new Date(`${key}T00:00:00Z`);
const weekdayDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', timeZone: 'UTC' });
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const longDate = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

/** 5 clean ticks on a round step, for example 0, 2, 4, 6, 8. */
function niceTicks(max: number) {
  const step = Math.max(1, Math.ceil(Math.max(max, 4) / 4));
  return [0, 1, 2, 3, 4].map((index) => index * step);
}

function buildRows(bookings: AdminBooking[], from: string, days: number): DayRow[] {
  const rows = new Map<string, DayRow>();
  for (let index = 0; index < days; index += 1) {
    const date = addDays(from, index);
    rows.set(date, { date, going: 0, pending: 0, cancelled: 0, created: 0 });
  }

  for (const booking of bookings) {
    const session = rows.get(dayKey(booking.startsAt));
    if (session) {
      if (booking.status === 'pending') session.pending += 1;
      else if (booking.status === 'cancelled') session.cancelled += 1;
      else session.going += 1;
    }

    const created = rows.get(dayKey(booking.createdAt));
    if (created) created.created += 1;
  }

  return [...rows.values()];
}

const sessionTotal = (row: DayRow) => row.going + row.pending + row.cancelled;

type ShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: DayRow;
};

// Columns grow from one square baseline with a 4px rounded top on the
// highest segment, and a 2px white gap between stacked segments.
function columnShape(key: keyof DayRow, color: string, stackKeys: (keyof DayRow)[]) {
  function Shape({ x = 0, y = 0, width = 0, height = 0, payload }: ShapeProps): ReactElement {
    if (height <= 0 || !payload) return <g />;

    const topKey = [...stackKeys].reverse().find((item) => Number(payload[item]) > 0);
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

export function BookingsChart({
  bookings,
  onSelectDay,
}: {
  bookings: AdminBooking[];
  onSelectDay: (date: string) => void;
}) {
  const [metric, setMetric] = useState<Metric>('sessions');
  const [range, setRange] = useState<Range>('last7');
  const [showTable, setShowTable] = useState(false);

  const today = dayKey(new Date());
  const days = range === 'last30' ? 30 : range === 'next14' ? 14 : 7;
  const from = range === 'next14' ? today : addDays(today, -(days - 1));
  const rows = buildRows(bookings, from, days);
  const previousRows = buildRows(bookings, addDays(from, -days), days);

  const value = (row: DayRow) => (metric === 'sessions' ? sessionTotal(row) : row.created);
  const total = rows.reduce((sum, row) => sum + value(row), 0);
  const previousTotal = previousRows.reduce((sum, row) => sum + value(row), 0);
  const difference = total - previousTotal;
  const busiest = rows.reduce<DayRow | null>(
    (best, row) => (value(row) > (best ? value(best) : 0) ? row : best),
    null,
  );

  const unit = metric === 'sessions' ? 'session' : 'new booking';
  const plural = (count: number) => `${count.toLocaleString('en-GB')} ${unit}${count === 1 ? '' : 's'}`;
  const rangeLabel = range === 'last7' ? 'Last 7 days' : range === 'last30' ? 'Last 30 days' : 'Next 14 days';
  const previousLabel = `the ${days} days before`;
  const comparison =
    difference === 0
      ? `Same as ${previousLabel}`
      : `${Math.abs(difference)} ${difference > 0 ? 'more' : 'fewer'} than ${previousLabel}${
          previousTotal > 0 ? ` (${difference > 0 ? '+' : '-'}${Math.round((Math.abs(difference) / previousTotal) * 100)}%)` : ''
        }`;

  const yTicks = niceTicks(Math.max(0, ...rows.map(value)));
  const tickEvery = days <= 14 ? 0 : 5;
  const stackKeys: (keyof DayRow)[] = SERIES.map((series) => series.key);

  function changeMetric(next: Metric) {
    setMetric(next);
    // "Next 14 days" only makes sense for sessions that are already booked.
    if (next === 'created' && range === 'next14') setRange('last7');
  }

  const renderTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
    const row = payload?.[0]?.payload as DayRow | undefined;
    if (!active || !row) return null;

    return (
      <div className="min-w-44 rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-[0_8px_24px_rgba(20,34,31,0.22)]">
        <p className="font-medium">{longDate.format(toDate(row.date))}</p>
        {metric === 'sessions' ? (
          <ul className="mt-1.5 space-y-1">
            {SERIES.map((series) => (
              <li key={series.key} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ backgroundColor: series.color }} />
                <span className="font-semibold tabular-nums">{row[series.key]}</span>
                <span className="text-white/70">{series.label}</span>
              </li>
            ))}
            <li className="border-t border-white/15 pt-1 text-white/80">
              <span className="font-semibold tabular-nums text-white">{sessionTotal(row)}</span> in total
            </li>
          </ul>
        ) : (
          <p className="mt-0.5 text-white/80">
            <span className="font-semibold tabular-nums text-white">{row.created}</span> new booking{row.created === 1 ? '' : 's'}
          </p>
        )}
        {metric === 'sessions' && (
          <p className="mt-1.5 text-white/60">Click to see this day&apos;s bookings</p>
        )}
      </div>
    );
  };

  const segment = (selected: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium ${
      selected ? 'bg-arom text-white' : 'text-ink-muted hover:bg-arom-wash'
    }`;

  return (
    <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="What to count" className="flex gap-1 rounded-full border border-arom-border p-1">
          <button type="button" aria-pressed={metric === 'sessions'} onClick={() => changeMetric('sessions')} className={segment(metric === 'sessions')}>
            Sessions per day
          </button>
          <button type="button" aria-pressed={metric === 'created'} onClick={() => changeMetric('created')} className={segment(metric === 'created')}>
            New bookings per day
          </button>
        </div>

        <div role="group" aria-label="Date range" className="flex gap-1 rounded-full border border-arom-border p-1">
          {(['last7', 'last30', 'next14'] as const)
            .filter((item) => metric === 'sessions' || item !== 'next14')
            .map((item) => (
              <button key={item} type="button" aria-pressed={range === item} onClick={() => setRange(item)} className={segment(range === item)}>
                {item === 'last7' ? 'Last 7 days' : item === 'last30' ? 'Last 30 days' : 'Next 14 days'}
              </button>
            ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-ink-muted">
            {metric === 'sessions' ? 'Sessions' : 'New bookings'}, {rangeLabel.toLowerCase()}
          </h2>
          <p className="mt-1 text-3xl font-semibold text-ink">{total.toLocaleString('en-GB')}</p>
          <p className="mt-1 text-sm text-ink-muted">{comparison}</p>
        </div>
        {busiest && (
          <p className="text-sm text-ink-muted">
            Busiest day: <span className="font-medium text-ink">{longDate.format(toDate(busiest.date))}</span> ({plural(value(busiest))})
          </p>
        )}
      </div>

      {metric === 'sessions' && (
        <ul aria-label="Legend" className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted">
          {SERIES.map((series) => (
            <li key={series.key} className="flex items-center gap-2">
              <span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: series.color }} />
              {series.label}
            </li>
          ))}
        </ul>
      )}

      <div
        role="img"
        aria-label={`${metric === 'sessions' ? 'Sessions' : 'New bookings'} per day, ${rangeLabel.toLowerCase()}: ${plural(total)} in total, ${comparison.toLowerCase()}.`}
        className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
            barCategoryGap="20%"
            // The bookings table filters by session date, so only session days are clickable.
            onClick={(state) => {
              const label = state?.activeLabel;
              if (metric === 'sessions' && typeof label === 'string') onSelectDay(label);
            }}
            className={metric === 'sessions' ? 'cursor-pointer' : undefined}>
            <CartesianGrid vertical={false} stroke="var(--arom-grid)" />
            <XAxis
              dataKey="date"
              interval={tickEvery}
              tickLine={false}
              axisLine={{ stroke: 'var(--arom-border)' }}
              tickMargin={10}
              minTickGap={8}
              tick={{ fill: 'var(--ink-muted)', fontSize: 11 }}
              tickFormatter={(key: string) =>
                key === today ? 'Today' : days <= 14 ? weekdayDay.format(toDate(key)) : shortDate.format(toDate(key))
              }
            />
            <YAxis
              allowDecimals={false}
              domain={[0, yTicks[yTicks.length - 1]]}
              ticks={yTicks}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fill: 'var(--ink-muted)', fontSize: 11 }}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--arom-wash)' }} isAnimationActive={false} />
            {metric === 'sessions' ? (
              SERIES.map((series) => (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  name={series.label}
                  stackId="sessions"
                  fill={series.color}
                  maxBarSize={24}
                  shape={columnShape(series.key, series.color, stackKeys)}
                  // No grow in animation: with the custom column shape it can stall at height 0.
                  isAnimationActive={false}
                />
              ))
            ) : (
              <Bar
                dataKey="created"
                name="New bookings"
                fill={CREATED_COLOR}
                maxBarSize={24}
                shape={columnShape('created', CREATED_COLOR, ['created'])}
                isAnimationActive={false}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button
        type="button"
        onClick={() => setShowTable((current) => !current)}
        aria-expanded={showTable}
        className="mt-4 text-sm font-medium text-arom hover:underline">
        {showTable ? 'Hide table' : 'View as table'}
      </button>

      {showTable && (
        <div className="mt-3 max-h-80 overflow-auto rounded-2xl border border-arom-border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              {metric === 'sessions' ? 'Sessions' : 'New bookings'} per day, {rangeLabel.toLowerCase()}
            </caption>
            <thead className="sticky top-0 bg-arom-wash text-xs text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Day</th>
                {metric === 'sessions' ? (
                  <>
                    {SERIES.map((series) => (
                      <th key={series.key} scope="col" className="px-4 py-3 text-right font-medium">{series.label}</th>
                    ))}
                    <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                  </>
                ) : (
                  <th scope="col" className="px-4 py-3 text-right font-medium">New bookings</th>
                )}
                {metric === 'sessions' && (
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Action</span></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-arom-border tabular-nums">
              {rows.map((row) => (
                <tr key={row.date}>
                  <th scope="row" className="px-4 py-2.5 font-medium">
                    {longDate.format(toDate(row.date))}
                    {row.date === today && <span className="ml-2 text-xs font-normal text-arom">Today</span>}
                  </th>
                  {metric === 'sessions' ? (
                    <>
                      {SERIES.map((series) => (
                        <td key={series.key} className="px-4 py-2.5 text-right">{row[series.key]}</td>
                      ))}
                      <td className="px-4 py-2.5 text-right font-semibold">{sessionTotal(row)}</td>
                    </>
                  ) : (
                    <td className="px-4 py-2.5 text-right font-semibold">{row.created}</td>
                  )}
                  {metric === 'sessions' && (
                    <td className="px-4 py-2.5 text-right">
                      <button type="button" onClick={() => onSelectDay(row.date)} className="text-xs font-medium text-arom hover:underline">
                        Show bookings
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
