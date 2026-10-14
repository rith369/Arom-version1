import type { SessionType } from './profile';

// A professional's weekly hours, settings and time off. The backend turns
// these into concrete rows in availability_slots for the booking window.
// All times are Cambodia time (Asia/Phnom_Penh).

// 1 = Monday ... 7 = Sunday (ISO order, the week starts on Monday).
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type TimeRange = {
  id: string;
  start: string; // "09:00"
  end: string; // "12:00"
  sessionTypes: SessionType[];
};

export type DayHours = {
  day: Weekday;
  enabled: boolean;
  ranges: TimeRange[];
};

export type TimeOff = {
  id: string;
  from: string; // "2026-10-20"
  to: string; // inclusive
  note: string;
};

export type Schedule = {
  week: DayHours[];
  sessionMinutes: 45 | 60 | 90;
  breakMinutes: 0 | 10 | 15;
  bookingWindowWeeks: 2 | 4 | 8;
  minNoticeHours: 2 | 12 | 24;
  timeOff: TimeOff[];
  // Default room for online sessions (Google Meet, Zoom...). Copied onto each
  // online booking; the professional can change it per session.
  meetingUrl: string;
};


// A meeting link must be a full https address.
export function isMeetingUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && url.hostname.includes('.');
  } catch {
    return false;
  }
}

// The Join button opens this many minutes before the start, until the end.
export const JOIN_OPENS_MINUTES = 10;

export function joinState(booking: { startsAt: string; durationMinutes: number; status: string }, now: number) {
  const start = Date.parse(booking.startsAt);
  const end = start + booking.durationMinutes * 60_000;
  if (booking.status !== 'booked' || now >= end) return 'ended' as const;
  return now >= start - JOIN_OPENS_MINUTES * 60_000 ? ('open' as const) : ('early' as const);
}

export type OpenSlot = {
  date: string;
  start: string;
  end: string;
  sessionTypes: SessionType[];
};

export const WEEKDAYS: { day: Weekday; en: string; km: string; short: { en: string; km: string } }[] = [
  { day: 1, en: 'Monday', km: 'ថ្ងៃច័ន្ទ', short: { en: 'Mon', km: 'ច័ន្ទ' } },
  { day: 2, en: 'Tuesday', km: 'ថ្ងៃអង្គារ', short: { en: 'Tue', km: 'អង្គារ' } },
  { day: 3, en: 'Wednesday', km: 'ថ្ងៃពុធ', short: { en: 'Wed', km: 'ពុធ' } },
  { day: 4, en: 'Thursday', km: 'ថ្ងៃព្រហស្បតិ៍', short: { en: 'Thu', km: 'ព្រហស្បតិ៍' } },
  { day: 5, en: 'Friday', km: 'ថ្ងៃសុក្រ', short: { en: 'Fri', km: 'សុក្រ' } },
  { day: 6, en: 'Saturday', km: 'ថ្ងៃសៅរ៍', short: { en: 'Sat', km: 'សៅរ៍' } },
  { day: 7, en: 'Sunday', km: 'ថ្ងៃអាទិត្យ', short: { en: 'Sun', km: 'អាទិត្យ' } },
];

// Earliest and latest times a range may use.
export const DAY_START = '06:00';
export const DAY_END = '22:00';

export const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export type RangeProblem = { rangeId: string; message: { en: string; km: string } };

// Checks one day: valid times, long enough for one session, no overlaps.
export function checkDay(day: DayHours, sessionMinutes: number, offered: SessionType[]): RangeProblem[] {
  if (!day.enabled) return [];
  const problems: RangeProblem[] = [];
  const sorted = [...day.ranges].sort((a, b) => a.start.localeCompare(b.start));

  for (const range of day.ranges) {
    const start = toMinutes(range.start);
    const end = toMinutes(range.end);

    if (!range.start || !range.end || Number.isNaN(start) || Number.isNaN(end)) {
      problems.push({ rangeId: range.id, message: { en: 'Choose a start and end time.', km: 'សូមជ្រើសរើសម៉ោងចាប់ផ្តើម និងម៉ោងបញ្ចប់។' } });
    } else if (start < toMinutes(DAY_START) || end > toMinutes(DAY_END)) {
      problems.push({ rangeId: range.id, message: { en: `Use times between ${DAY_START} and ${DAY_END}.`, km: `សូមប្រើម៉ោងចន្លោះ ${DAY_START} និង ${DAY_END}។` } });
    } else if (end - start < sessionMinutes) {
      problems.push({ rangeId: range.id, message: { en: `Make it at least ${sessionMinutes} minutes, one session.`, km: `យ៉ាងហោចណាស់ ${sessionMinutes} នាទី សម្រាប់មួយវគ្គ។` } });
    }

    if (range.sessionTypes.length === 0) {
      problems.push({ rangeId: range.id, message: { en: 'Choose online, in person or both.', km: 'សូមជ្រើសរើសអនឡាញ ជួបផ្ទាល់ ឬទាំងពីរ។' } });
    } else if (range.sessionTypes.some((type) => !offered.includes(type))) {
      problems.push({ rangeId: range.id, message: { en: 'Your profile does not offer this session type. Change it in My profile.', km: 'ប្រវត្តិរូបរបស់អ្នកមិនផ្តល់ប្រភេទនេះទេ។ សូមកែក្នុងប្រវត្តិរូបរបស់ខ្ញុំ។' } });
    }
  }

  for (let index = 1; index < sorted.length; index += 1) {
    if (toMinutes(sorted[index].start) < toMinutes(sorted[index - 1].end)) {
      problems.push({ rangeId: sorted[index].id, message: { en: 'This overlaps another time on the same day.', km: 'ម៉ោងនេះជាន់គ្នាជាមួយម៉ោងផ្សេងទៀតក្នុងថ្ងៃដដែល។' } });
    }
  }

  return problems;
}

export function hasOpenTimes(schedule: Schedule) {
  return schedule.week.some((day) => day.enabled && day.ranges.length > 0);
}

const TIME_ZONE = 'Asia/Phnom_Penh';

export function cambodiaDate(value: Date | number) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(value);
}

export function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function weekdayOf(date: string): Weekday {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return (day === 0 ? 7 : day) as Weekday;
}

// The times a user could book, from the weekly hours, minus time off,
// sessions already booked, and anything inside the minimum notice.
export function openSlots(
  schedule: Schedule,
  options: { fromDate: string; days: number; now: number; booked: { startsAt: string }[] },
): OpenSlot[] {
  const bookedStarts = new Set(options.booked.map((item) => Date.parse(item.startsAt)));
  const earliest = options.now + schedule.minNoticeHours * 60 * 60 * 1000;
  const slots: OpenSlot[] = [];

  for (let offset = 0; offset < options.days; offset += 1) {
    const date = addDays(options.fromDate, offset);
    if (schedule.timeOff.some((off) => off.from <= date && date <= (off.to || off.from))) continue;

    const day = schedule.week.find((item) => item.day === weekdayOf(date));
    if (!day?.enabled) continue;

    for (const range of [...day.ranges].sort((a, b) => a.start.localeCompare(b.start))) {
      const end = toMinutes(range.end);
      for (let start = toMinutes(range.start); start + schedule.sessionMinutes <= end; start += schedule.sessionMinutes + schedule.breakMinutes) {
        const startsAt = Date.parse(`${date}T${toTime(start)}:00+07:00`);
        if (startsAt < earliest || bookedStarts.has(startsAt)) continue;
        slots.push({ date, start: toTime(start), end: toTime(start + schedule.sessionMinutes), sessionTypes: range.sessionTypes });
      }
    }
  }

  return slots;
}

// No weekly hours yet.
export const emptySchedule: Schedule = {
  week: WEEKDAYS.map(({ day }) => ({ day, enabled: false, ranges: [] })),
  sessionMinutes: 60,
  breakMinutes: 10,
  bookingWindowWeeks: 4,
  minNoticeHours: 24,
  timeOff: [],
  meetingUrl: '',
};
