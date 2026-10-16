import type { UserAppointment } from "@/lib/appointments";
import { officeLine } from "@/lib/office";

const TIME_ZONE = "Asia/Phnom_Penh";

const cambodiaDay = (value: number) =>
  Date.parse(`${new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(value)}T00:00:00Z`);

/** Calendar days from today to the session in Cambodia time: 0 today, 1 tomorrow. */
export function daysUntil(startsAt: string, now: number) {
  return Math.round((cambodiaDay(Date.parse(startsAt)) - cambodiaDay(now)) / 86_400_000);
}

/** "Today", "Tomorrow" or "In 3 days" in Cambodia time, or null when two weeks or more away. */
export function howSoon(startsAt: string, now: number, km: boolean): string | null {
  const days = daysUntil(startsAt, now);
  if (days < 0 || days > 13) return null;
  if (days === 0) return km ? "ថ្ងៃនេះ" : "Today";
  if (days === 1) return km ? "ថ្ងៃស្អែក" : "Tomorrow";
  return km ? `${days} ថ្ងៃទៀត` : `In ${days} days`;
}

// Text values in a calendar file escape \ ; , and new lines.
const escapeText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const utcStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// Calendar files keep lines under 75 bytes; longer lines continue after a space.
function fold(line: string) {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 73) {
      parts.push(current);
      current = " ";
      bytes = 1;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n");
}

/**
 * Downloads one session as a calendar file the phone or computer can add.
 * The title stays neutral ("Appointment with ...") because calendar
 * reminders can show on a locked screen.
 */
export function downloadCalendarFile(appointment: UserAppointment, professionalName: string, km: boolean) {
  const link = `${window.location.origin}/appointments`;
  const office = appointment.professional?.office;
  const location =
    appointment.sessionType === "online"
      ? appointment.meetingUrl || (km ? "អនឡាញ" : "Online")
      : office
        ? officeLine(office)
        : km
          ? "ជួបផ្ទាល់"
          : "In person";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AROM//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@arom`,
    `DTSTAMP:${utcStamp(new Date().toISOString())}`,
    `DTSTART:${utcStamp(appointment.startsAt)}`,
    `DTEND:${utcStamp(appointment.endsAt)}`,
    `SUMMARY:${escapeText(km ? `ការណាត់ជួបជាមួយ ${professionalName}` : `Appointment with ${professionalName}`)}`,
    `DESCRIPTION:${escapeText(km ? `មើលព័ត៌មានលម្អិតក្នុង AROM: ${link}` : `See the details in AROM: ${link}`)}`,
    `LOCATION:${escapeText(location)}`,
    `URL:${link}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(km ? `ការណាត់ជួបជាមួយ ${professionalName}` : `Appointment with ${professionalName}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.map(fold).join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "arom-appointment.ics";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
