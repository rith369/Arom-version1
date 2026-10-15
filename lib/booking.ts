export type MeetingType = "Online" | "In-person";

export type BookingDay = {
  /** Calendar date in YYYY-MM-DD, in the clinic time zone. */
  value: string;
  /** e.g. "Sep 17" */
  label: string;
  /** e.g. "Tue" */
  weekday: string;
  /** e.g. "Sep 17, 2026" */
  longLabel: string;
  /** Khmer date label, e.g. "17 កញ្ញា" */
  kmLabel: string;
  /** Khmer weekday, e.g. "អង្គារ" */
  kmWeekday: string;
  /** Khmer full date label, e.g. "17 កញ្ញា 2026" */
  kmLongLabel: string;
};

export type PeriodLabel = "Morning" | "Afternoon" | "Evening";

/** One bookable time, as the booking page shows it. */
export type BookableTime = {
  /** availability_slots.id */
  id: string;
  startsAt: string;
  endsAt: string;
  /** e.g. "9:00 AM" in Cambodia time */
  label: string;
  /** e.g. "10:30 AM" in Cambodia time */
  endLabel: string;
  period: PeriodLabel;
};

export const clinicTimeZone = "Asia/Phnom_Penh";

export const meetingTypes: {
  type: MeetingType;
  title: string;
  kmTitle: string;
  description: string;
  kmDescription: string;
  image: string;
}[] = [
  {
    type: "Online",
    title: "Online",
    kmTitle: "អនឡាញ (Online)",
    description: "Meet your therapist through a secure, private online session.",
    kmDescription: "ជួបពិគ្រោះជាមួយអ្នកជំនាញតាមរយៈវីដេអូប្រកបដោយសុវត្ថិភាព និងការសម្ងាត់ខ្ពស់។",
    image: "/booking/online-laptop.svg",
  },
  {
    type: "In-person",
    title: "In Person",
    kmTitle: "ជួបផ្ទាល់ (In Person)",
    description: "Visit the therapist at their clinic or hospital.",
    kmDescription: "ជួបពិគ្រោះផ្ទាល់ជាមួយអ្នកជំនាញនៅគ្លីនិក ឬមន្ទីរពេទ្យ។",
    image: "/booking/in-person.svg",
  },
];

export function getPeriodLabel(label: PeriodLabel, km: boolean): string {
  if (km) {
    switch (label) {
      case "Morning":
        return "ពេលព្រឹក (Morning)";
      case "Afternoon":
        return "ពេលរសៀល (Afternoon)";
      case "Evening":
        return "ពេលល្ងាច (Evening)";
    }
  }
  return label;
}

export function getMeetingTypeLabel(type: MeetingType | null, km: boolean): string {
  if (!type) return "";
  if (km) {
    return type === "Online" ? "អនឡាញ (Online)" : "ជួបផ្ទាល់ (In Person)";
  }
  return type === "In-person" ? "In Person" : type;
}

/** Labels for one calendar date (YYYY-MM-DD, Cambodia time). */
export function bookingDay(value: string): BookingDay {
  const date = new Date(`${value}T00:00:00Z`);
  const formatEn = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(date);
  const formatKm = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("km-KH", { timeZone: "UTC", ...options }).format(date);

  return {
    value,
    label: formatEn({ month: "short", day: "numeric" }),
    weekday: formatEn({ weekday: "short" }),
    longLabel: formatEn({ month: "short", day: "numeric", year: "numeric" }),
    kmLabel: formatKm({ month: "short", day: "numeric" }),
    kmWeekday: formatKm({ weekday: "short" }),
    kmLongLabel: formatKm({ month: "short", day: "numeric", year: "numeric" }),
  };
}

const dateOf = (startsAt: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: clinicTimeZone }).format(new Date(startsAt));

const hourOf = (startsAt: string) =>
  Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: clinicTimeZone, hour: "2-digit", hourCycle: "h23" }).format(
      new Date(startsAt),
    ),
  );

/** e.g. "9:00 AM" in Cambodia time. */
export const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: clinicTimeZone, hour: "numeric", minute: "2-digit" }).format(
    new Date(iso),
  );

/** e.g. "9:00 AM to 10:30 AM", the same on the booking and appointments pages. */
export const timeRangeLabel = (startsAt: string, endsAt: string, km: boolean) =>
  `${timeLabel(startsAt)} ${km ? "ដល់" : "to"} ${timeLabel(endsAt)}`;

/**
 * Groups open times into days (soonest first, at most `maxDays`) and, per
 * day, into morning, afternoon and evening.
 */
export function groupOpenTimes(
  times: { id: string; startsAt: string; endsAt: string }[],
  maxDays = 14,
): { days: BookingDay[]; byDay: Record<string, BookableTime[]> } {
  const byDay: Record<string, BookableTime[]> = {};
  for (const time of [...times].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const day = dateOf(time.startsAt);
    const hour = hourOf(time.startsAt);
    (byDay[day] ??= []).push({
      id: time.id,
      startsAt: time.startsAt,
      endsAt: time.endsAt,
      label: timeLabel(time.startsAt),
      endLabel: timeLabel(time.endsAt),
      period: hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening",
    });
  }
  const days = Object.keys(byDay).sort().slice(0, maxDays).map(bookingDay);
  return { days, byDay };
}
