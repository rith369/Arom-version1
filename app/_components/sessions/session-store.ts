'use client';

import { useSyncExternalStore } from 'react';

import { initialBookings } from '../../admin/_data/bookings';
import { sampleBookingsFor, type ProBooking } from '../../pro/_data/bookings';
import type { SessionType } from '../../pro/_data/profile';

// Sessions shared by the professional area and the user side, so a link,
// a cancellation or a booked suggestion shows on both. Mock store: kept in
// memory only (never in browser storage), so it resets on refresh.

// "Every week, 4 sessions" is { everyWeeks: 1, count: 4 }.
export type SessionRepeat = { everyWeeks: 1 | 2; count: number };

export const REPEAT_OPTIONS: { value: SessionRepeat; en: string; km: string }[] = [
  { value: { everyWeeks: 1, count: 1 }, en: 'Just one session', km: 'តែមួយវគ្គ' },
  { value: { everyWeeks: 1, count: 4 }, en: 'Every week, 4 sessions', km: 'រៀងរាល់សប្តាហ៍ ៤ វគ្គ' },
  { value: { everyWeeks: 1, count: 8 }, en: 'Every week, 8 sessions', km: 'រៀងរាល់សប្តាហ៍ ៨ វគ្គ' },
  { value: { everyWeeks: 2, count: 4 }, en: 'Every 2 weeks, 4 sessions', km: 'រៀងរាល់ ២ សប្តាហ៍ ៤ វគ្គ' },
];

export function repeatLabel(repeat: SessionRepeat, km: boolean) {
  const option = REPEAT_OPTIONS.find((item) => item.value.everyWeeks === repeat.everyWeeks && item.value.count === repeat.count);
  if (option) return km ? option.km : option.en;
  return km ? `${repeat.count} វគ្គ` : `${repeat.count} sessions`;
}

// Cambodia has no daylight saving, so +07:00 is always right. Bookings keep
// this format so they sort correctly as text.
export function cambodiaIso(ms: number) {
  return `${new Date(ms + 7 * 3_600_000).toISOString().slice(0, 19)}+07:00`;
}

// Start times of every session in a series that begins at `startsAt`.
export function seriesTimes(startsAt: string, repeat: SessionRepeat) {
  const start = Date.parse(startsAt);
  return Array.from({ length: repeat.count }, (_, index) => cambodiaIso(start + index * repeat.everyWeeks * 7 * 86_400_000));
}

export type SuggestionStatus = 'open' | 'booked' | 'withdrawn';

// Times a professional offers for the next session. The client picks one.
export type SessionSuggestion = {
  id: string;
  professionalId: string;
  clientId: string;
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

export const MAX_SUGGESTED_TIMES = 3;
export const MAX_SUGGESTION_NOTE = 300;

type State = {
  bookings: ProBooking[];
  suggestions: SessionSuggestion[];
};

const professionalIds = [...new Set(initialBookings.map((booking) => booking.professionalId))];

const initial: State = {
  bookings: professionalIds.flatMap((slug) => sampleBookingsFor(slug)),
  suggestions: [],
};

let state: State = initial;
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSessionStore() {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

export function updateBooking(id: string, change: Partial<ProBooking>) {
  setState({ ...state, bookings: state.bookings.map((item) => (item.id === id ? { ...item, ...change } : item)) });
}

// After the professional changes their default room, upcoming online sessions
// that used the old room (or had none) move to the new one.
export function moveUpcomingToRoom(professionalId: string, from: string, to: string, now: number) {
  setState({
    ...state,
    bookings: state.bookings.map((item) =>
      item.professionalId === professionalId &&
      item.sessionType === 'online' &&
      item.status === 'booked' &&
      Date.parse(item.startsAt) > now &&
      (item.meetingUrl === null || item.meetingUrl === from)
        ? { ...item, meetingUrl: to || null }
        : item,
    ),
  });
}

export function createSuggestion(suggestion: Omit<SessionSuggestion, 'id' | 'createdAt' | 'status' | 'chosenTime' | 'bookingIds'>) {
  const created: SessionSuggestion = {
    ...suggestion,
    id: `sg-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'open',
    chosenTime: null,
    bookingIds: [],
  };
  setState({ ...state, suggestions: [...state.suggestions, created] });
  return created;
}

export function withdrawSuggestion(id: string) {
  setState({
    ...state,
    suggestions: state.suggestions.map((item) => (item.id === id && item.status === 'open' ? { ...item, status: 'withdrawn' } : item)),
  });
}

// The professional's other sessions that would overlap a new one.
function clashes(professionalId: string, startsAt: string, durationMinutes: number) {
  const start = Date.parse(startsAt);
  const end = start + durationMinutes * 60_000;
  return state.bookings.some((item) => {
    if (item.professionalId !== professionalId || item.status !== 'booked') return false;
    const otherStart = Date.parse(item.startsAt);
    return otherStart < end && start < otherStart + item.durationMinutes * 60_000;
  });
}

// The client books one of the suggested times (and the rest of the series).
export function acceptSuggestion(id: string, time: string): 'booked' | 'taken' | 'closed' {
  const suggestion = state.suggestions.find((item) => item.id === id);
  if (!suggestion || suggestion.status !== 'open' || !suggestion.times.includes(time)) return 'closed';

  const times = seriesTimes(time, suggestion.repeat);
  if (times.some((startsAt) => clashes(suggestion.professionalId, startsAt, suggestion.durationMinutes))) return 'taken';

  const seriesId = suggestion.repeat.count > 1 ? suggestion.id : null;
  const created: ProBooking[] = times.map((startsAt, index) => ({
    id: `${suggestion.id}-${index + 1}`,
    professionalId: suggestion.professionalId,
    clientId: suggestion.clientId,
    clientName: suggestion.clientName,
    startsAt,
    durationMinutes: suggestion.durationMinutes,
    sessionType: suggestion.sessionType,
    status: 'booked',
    intakeNote: '',
    intakeAnswers: [],
    cancelledBy: null,
    cancelReason: '',
    rescheduledFrom: null,
    rescheduleReason: '',
    // Sharing is the client's choice per booking, so a follow up starts off.
    shareSurvey: false,
    shareSymptomChecks: false,
    meetingUrl: suggestion.sessionType === 'online' ? suggestion.meetingUrl : null,
    seriesId,
  }));

  setState({
    bookings: [...state.bookings, ...created],
    suggestions: state.suggestions.map((item) =>
      item.id === id ? { ...item, status: 'booked', chosenTime: time, bookingIds: created.map((booking) => booking.id) } : item,
    ),
  });
  return 'booked';
}

// "Session 2 of 4" for a booking that is part of a series.
export function seriesPosition(bookings: ProBooking[], booking: ProBooking) {
  if (!booking.seriesId) return null;
  const series = bookings.filter((item) => item.seriesId === booking.seriesId).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return { index: series.findIndex((item) => item.id === booking.id) + 1, total: series.length };
}
