"use client";

import { useReducedMotion } from "motion/react";
import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { DailyCount } from "@/lib/admin-overview";

const toDate = (key: string) => new Date(`${key}T00:00:00Z`);

/** Clean axis: 5 ticks on a round step, e.g. 0 / 5 / 10 / 15 / 20. */
function niceTicks(max: number) {
  const rough = Math.max(max * 1.1, 4) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(1, Math.ceil(([1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((v) => v >= rough) ?? rough)));
  return [0, 1, 2, 3, 4].map((i) => i * step);
}

/** Daily new accounts as a 2px line over a light wash, with a crosshair tooltip. */
export function SignupsChart({
  data,
  locale,
  unitLabel,
  summaryLabel,
}: {
  data: DailyCount[];
  locale: string;
  /** e.g. (n) => `${n} new accounts` */
  unitLabel: (count: number) => string;
  /** Screen reader summary of the whole chart. */
  summaryLabel: string;
}) {
  const reduceMotion = useReducedMotion();
  const gradientId = `signups-${useId().replace(/:/g, "")}`;
  const shortDate = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const longDate = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const yTicks = niceTicks(Math.max(0, ...data.map((d) => d.count)));
  const tickEvery = data.length <= 7 ? 0 : data.length <= 30 ? 6 : 14;

  const renderTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
    const point = payload?.[0]?.payload as DailyCount | undefined;
    if (!active || !point) return null;
    return (
      <div className="rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-[0_8px_24px_rgba(20,34,31,0.22)]">
        <p className="font-medium">{longDate.format(toDate(point.date))}</p>
        <p className="mt-0.5 tabular-nums text-white/80">{unitLabel(point.count)}</p>
      </div>
    );
  };

  return (
    <div role="img" aria-label={summaryLabel} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--arom)" stopOpacity={0.16} />
              <stop offset="100%" stopColor="var(--arom)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--arom-grid)" />
          <XAxis
            dataKey="date"
            interval={tickEvery}
            tickLine={false}
            axisLine={{ stroke: "var(--arom-border)" }}
            tickMargin={10}
            minTickGap={12}
            tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
            tickFormatter={(value: string) =>
              tickEvery === 0 ? weekday.format(toDate(value)) : shortDate.format(toDate(value))
            }
          />
          <YAxis
            allowDecimals={false}
            domain={[0, yTicks[yTicks.length - 1]]}
            ticks={yTicks}
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
            tickFormatter={(value: number) => value.toLocaleString(locale)}
          />
          <Tooltip
            content={renderTooltip}
            cursor={{ stroke: "var(--arom-border)", strokeWidth: 1 }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--arom)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 5, fill: "var(--arom)", stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={!reduceMotion}
            animationDuration={700}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
