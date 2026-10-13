'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Monitor, Repeat, UserRound } from 'lucide-react';

import type { ProBooking } from '../_data/bookings';
import { WEEKDAYS, addDays, cambodiaDate, toMinutes, weekdayOf, type Schedule } from '../_data/schedule';

const HOUR_PX = 56;
const endOf = (booking: ProBooking) => Date.parse(booking.startsAt) + booking.durationMinutes * 60_000;

// Minutes since midnight in Cambodia (no daylight saving, always UTC+7).
const minuteOfDay = (ms: number) => {
  const shifted = new Date(ms + 7 * 3_600_000);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
};

function blockStyle(booking: ProBooking, now: number) {
  if (booking.status === 'booked' && endOf(booking) <= now) return 'border-arom-warning/40 bg-arom-warning-soft text-arom-warning';
  if (booking.status === 'booked') return 'border-arom/40 bg-arom-soft text-arom-deep';
  if (booking.status === 'completed') return 'border-arom-border bg-white text-ink-muted';
  return 'border-gray-200 bg-gray-100 text-gray-600';
}

// Monday to Sunday, with open hours shaded and sessions placed by time.
export function WeekCalendar({
  bookings,
  schedule,
  now,
  km,
  onOpen,
}: {
  bookings: ProBooking[];
  schedule: Schedule;
  now: number;
  km: boolean;
  onOpen: (id: string) => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const locale = km ? 'km-KH' : 'en-GB';
  const today = cambodiaDate(now);
  const thisMonday = addDays(today, -(weekdayOf(today) - 1));

  const [offset, setOffset] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(weekdayOf(today) - 1);

  const monday = addDays(thisMonday, offset * 7);
  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  const inWeek = bookings.filter((item) => item.status !== 'cancelled' && days.includes(cambodiaDate(Date.parse(item.startsAt))));

  // Hours shown: the working hours and every session this week, at least 08:00 to 18:00.
  const ranges = schedule.week.filter((day) => day.enabled).flatMap((day) => day.ranges);
  const starts = [8 * 60, ...ranges.map((range) => toMinutes(range.start)), ...inWeek.map((item) => minuteOfDay(Date.parse(item.startsAt)))];
  const ends = [18 * 60, ...ranges.map((range) => toMinutes(range.end)), ...inWeek.map((item) => minuteOfDay(Date.parse(item.startsAt)) + item.durationMinutes)];
  const firstHour = Math.max(0, Math.floor(Math.min(...starts) / 60));
  const lastHour = Math.min(24, Math.ceil(Math.max(...ends) / 60));
  const hours = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index);
  const height = hours.length * HOUR_PX;
  const top = (minutes: number) => ((minutes - firstHour * 60) / 60) * HOUR_PX;

  const dayLabel = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' });
  const rangeLabel = (from: string, to: string) => {
    const format = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
    return t(`${format.format(new Date(`${from}T00:00:00Z`))} ដល់ ${format.format(new Date(`${to}T00:00:00Z`))}`, `${format.format(new Date(`${from}T00:00:00Z`))} to ${format.format(new Date(`${to}T00:00:00Z`))}`);
  };
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Phnom_Penh' });
  const nowMinute = minuteOfDay(now);

  return (
    <div className="rounded-3xl border border-arom-border bg-white p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-bold text-ink">{rangeLabel(days[0], days[6])}</p>
          <p className="text-xs text-ink-muted">
            {inWeek.length === 1 ? t('១ វគ្គ', '1 session') : t(`${inWeek.length} វគ្គ`, `${inWeek.length} sessions`)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setOffset(offset - 1)} aria-label={t('សប្តាហ៍មុន', 'Previous week')} className="rounded-full border border-arom-border p-2 text-arom hover:bg-arom-wash">
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            disabled={offset === 0}
            onClick={() => {
              setOffset(0);
              setSelectedIndex(weekdayOf(today) - 1);
            }}
            className="rounded-full border border-arom-border px-3.5 py-1.5 text-sm font-medium text-arom hover:bg-arom-wash disabled:opacity-40">
            {t('សប្តាហ៍នេះ', 'This week')}
          </button>
          <button type="button" onClick={() => setOffset(offset + 1)} aria-label={t('សប្តាហ៍ក្រោយ', 'Next week')} className="rounded-full border border-arom-border p-2 text-arom hover:bg-arom-wash">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Phones show one day at a time. */}
      <div className="mt-4 grid grid-cols-7 gap-1 md:hidden" role="tablist" aria-label={t('ថ្ងៃ', 'Days')}>
        {days.map((date, index) => {
          const count = inWeek.filter((item) => cambodiaDate(Date.parse(item.startsAt)) === date).length;
          return (
            <button
              key={date}
              type="button"
              role="tab"
              aria-selected={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              className={`rounded-xl px-1 py-1.5 text-center text-xs ${selectedIndex === index ? 'bg-arom text-white' : date === today ? 'bg-arom-wash text-arom-deep' : 'text-ink-muted'}`}>
              <span className="block">{km ? WEEKDAYS[index].short.km : WEEKDAYS[index].short.en}</span>
              <span className="block text-sm font-semibold">{dayLabel.format(new Date(`${date}T00:00:00Z`))}</span>
              <span className={`mx-auto mt-0.5 block size-1.5 rounded-full ${count > 0 ? (selectedIndex === index ? 'bg-white' : 'bg-arom') : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex">
        <div className="w-12 shrink-0 pt-10 md:pt-12" aria-hidden="true">
          <div className="relative" style={{ height }}>
            {hours.map((hour) => (
              <span key={hour} className="absolute -translate-y-1/2 text-[0.68rem] tabular-nums text-ink-muted" style={{ top: (hour - firstHour) * HOUR_PX }}>
                {String(hour).padStart(2, '0')}:00
              </span>
            ))}
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 md:grid-cols-7">
          {days.map((date, index) => {
            const weekday = schedule.week.find((day) => day.day === weekdayOf(date));
            const off = schedule.timeOff.find((item) => item.from <= date && date <= (item.to || item.from));
            const sessions = inWeek.filter((item) => cambodiaDate(Date.parse(item.startsAt)) === date);
            const isToday = date === today;
            return (
              <div key={date} className={`min-w-0 border-l border-arom-border ${selectedIndex === index ? '' : 'hidden md:block'}`}>
                <div className={`flex h-10 flex-col items-center justify-center md:h-12 ${isToday ? 'text-arom' : 'text-ink'}`}>
                  <span className="text-[0.7rem] font-medium uppercase tracking-wide text-ink-muted">{km ? WEEKDAYS[index].short.km : WEEKDAYS[index].short.en}</span>
                  <span className={`text-sm font-bold ${isToday ? 'rounded-full bg-arom px-2 text-white' : ''}`}>{dayLabel.format(new Date(`${date}T00:00:00Z`))}</span>
                </div>
                <div className="relative" style={{ height }}>
                  {hours.map((hour) => (
                    <div key={hour} className="absolute inset-x-0 border-t border-arom-border/60" style={{ top: (hour - firstHour) * HOUR_PX }} />
                  ))}

                  {off ? (
                    <div className="absolute inset-0 flex items-start justify-center bg-gray-100/80 pt-3 text-xs font-medium text-gray-500">
                      {t('ឈប់សម្រាក', 'Time off')}
                    </div>
                  ) : (
                    weekday?.enabled &&
                    weekday.ranges.map((range) => (
                      <div
                        key={range.id}
                        className="absolute inset-x-0 bg-arom-wash/70"
                        style={{ top: top(toMinutes(range.start)), height: top(toMinutes(range.end)) - top(toMinutes(range.start)) }}
                      />
                    ))
                  )}

                  {sessions.map((booking) => {
                    const start = minuteOfDay(Date.parse(booking.startsAt));
                    return (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => onOpen(booking.id)}
                        className={`absolute inset-x-1 overflow-hidden rounded-lg border px-1.5 py-1 text-left text-[0.7rem] leading-4 shadow-sm hover:brightness-95 ${blockStyle(booking, now)}`}
                        style={{ top: top(start) + 1, height: Math.max(22, (booking.durationMinutes / 60) * HOUR_PX - 2) }}>
                        <span className="flex items-center gap-1 font-semibold tabular-nums">
                          {time.format(new Date(booking.startsAt))}
                          {booking.sessionType === 'online' ? <Monitor size={11} aria-hidden="true" /> : <UserRound size={11} aria-hidden="true" />}
                          {booking.seriesId && <Repeat size={11} aria-hidden="true" />}
                        </span>
                        <span className="block truncate">{booking.clientName}</span>
                      </button>
                    );
                  })}

                  {isToday && nowMinute >= firstHour * 60 && nowMinute <= lastHour * 60 && (
                    <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: top(nowMinute) }} aria-hidden="true">
                      <span className="size-2 -translate-x-1 rounded-full bg-arom-danger" />
                      <span className="h-0.5 flex-1 bg-arom-danger" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
        <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-arom-wash ring-1 ring-arom-border" />{t('ម៉ោងបើក', 'Open hours')}</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-arom-soft ring-1 ring-arom/40" />{t('បានកក់', 'Booked')}</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-arom-warning-soft ring-1 ring-arom-warning/40" />{t('ត្រូវកត់លទ្ធផល', 'Add outcome')}</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-white ring-1 ring-arom-border" />{t('បានបញ្ចប់', 'Completed')}</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-gray-100 ring-1 ring-gray-200" />{t('មិនបានមក', 'Did not come')}</li>
      </ul>
    </div>
  );
}
