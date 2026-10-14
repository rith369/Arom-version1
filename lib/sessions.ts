import type { ProBooking } from "@/app/pro/_data/bookings";
import type { SessionType } from "@/app/pro/_data/profile";

/*
 * Suggested sessions and repeating series (BACKEND-HANDOFF.md section 19).
 * Shared by the browser and the API. A suggestion is sent as a chat message;
 * the client accepts one time and every session of the series is booked.
 */

// "Every week, 4 sessions" is { everyWeeks: 1, count: 4 }.
export type SessionRepeat = { everyWeeks: 1 | 2; count: number };

export const REPEAT_OPTIONS: { value: SessionRepeat; en: string; km: string }[] = [
  { value: { everyWeeks: 1, count: 1 }, en: "Just one session", km: "តែមួយវគ្គ" },
  { value: { everyWeeks: 1, count: 4 }, en: "Every week, 4 sessions", km: "រៀងរាល់សប្តាហ៍ ៤ វគ្គ" },
  { value: { everyWeeks: 1, count: 8 }, en: "Every week, 8 sessions", km: "រៀងរាល់សប្តាហ៍ ៨ វគ្គ" },
  { value: { everyWeeks: 2, count: 4 }, en: "Every 2 weeks, 4 sessions", km: "រៀងរាល់ ២ សប្តាហ៍ ៤ វគ្គ" },
];

export const MAX_SERIES_SESSIONS = 8;
export const MAX_SUGGESTED_TIMES = 3;
export const MAX_SUGGESTION_NOTE = 300;
// Suggested first sessions fall within the next three weeks.
export const SUGGEST_DAYS = 21;

export function repeatLabel(repeat: SessionRepeat, km: boolean) {
  const option = REPEAT_OPTIONS.find((item) => item.value.everyWeeks === repeat.everyWeeks && item.value.count === repeat.count);
  if (option) return km ? option.km : option.en;
  return km ? `${repeat.count} វគ្គ` : `${repeat.count} sessions`;
}

// Cambodia has no daylight saving, so +07:00 is always right. Times keep
// this format so they sort and compare correctly as text.
export function cambodiaIso(ms: number) {
  return `${new Date(ms + 7 * 3_600_000).toISOString().slice(0, 19)}+07:00`;
}

// Start times of every session in a series that begins at `startsAt`.
export function seriesTimes(startsAt: string, repeat: SessionRepeat) {
  const start = Date.parse(startsAt);
  return Array.from({ length: repeat.count }, (_, index) => cambodiaIso(start + index * repeat.everyWeeks * 7 * 86_400_000));
}

export type SuggestionStatus = "open" | "booked" | "withdrawn";

// Times a professional offers for the next session. The client picks one.
export type SessionSuggestion = {
  id: string;
  professionalId: string; // slug
  clientId: string;
  // Professional side only. Empty for the client.
  clientName: string;
  sessionType: SessionType;
  durationMinutes: number;
  // One to three start times (ISO, Cambodia offsets).
  times: string[];
  repeat: SessionRepeat;
  note: string;
  meetingUrl: string | null;
  createdAt: string;
  status: SuggestionStatus;
  chosenTime: string | null;
  bookingIds: string[];
};

export type NewSuggestion = Pick<SessionSuggestion, "clientId" | "sessionType" | "times" | "repeat" | "note">;

export interface SuggestionResponse {
  suggestion: SessionSuggestion;
}

// A professional's saved reply. {name}, {link} and {next} are filled in when inserted.
export type QuickReply = { id: string; text: string };
export const MAX_QUICK_REPLIES = 20;
export const MAX_QUICK_REPLY = 500;

export interface QuickRepliesResponse {
  quickReplies: QuickReply[];
}

// "Session 2 of 4" for a booking that is part of a series.
export function seriesPosition(bookings: ProBooking[], booking: ProBooking) {
  if (!booking.seriesId) return null;
  const series = bookings.filter((item) => item.seriesId === booking.seriesId).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return { index: series.findIndex((item) => item.id === booking.id) + 1, total: series.length };
}
