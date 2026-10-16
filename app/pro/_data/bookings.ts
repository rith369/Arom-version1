import type { SessionType } from './profile';

// The professional's own sessions. Mirrors appointments (status booked,
// completed, cancelled, no_show) plus intake answers. Booking is instant,
// so there is no "pending" here.

export type ProBookingStatus = 'booked' | 'completed' | 'cancelled' | 'no_show';

export type IntakeAnswer = { question: { en: string; km: string }; answer: string };

export type ProBooking = {
  id: string;
  // The professional's public slug.
  professionalId: string;
  // The client's account id (appointments.user_id).
  clientId: string;
  clientName: string;
  // The client's app language (profiles.language).
  clientLanguage: 'en' | 'km';
  startsAt: string;
  durationMinutes: number;
  sessionType: SessionType;
  status: ProBookingStatus;
  // What the client wrote when booking (appointments.intake_note).
  intakeNote: string;
  intakeAnswers: IntakeAnswer[];
  cancelledBy: 'client' | 'professional' | 'admin' | null;
  cancelReason: string;
  // Set when the session was moved; the other side is told.
  rescheduledFrom: string | null;
  rescheduleReason: string;
  // Who last moved it (appointments.rescheduled_by). Null if never moved.
  rescheduledBy: 'client' | 'professional' | null;
  // The client's choice for this booking (appointments.share_survey and
  // share_symptom_checks). Off by default; only the client can change it.
  shareSurvey: boolean;
  shareSymptomChecks: boolean;
  shareMoodTrend: boolean;
  // Online sessions only (appointments.meeting_url). Null for in person.
  meetingUrl: string | null;
  // Set when the client booked a repeating series from a suggestion.
  seriesId: string | null;
};

// Private to the professional who wrote it. Never shown to admins or clients.
export type SessionNote = { text: string; updatedAt: string };

export const MAX_REASON = 300;
export const MAX_NOTE = 5000;
