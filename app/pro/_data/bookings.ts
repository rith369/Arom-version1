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
  // True when the client hides their identity: clientName is then their
  // nickname or "Anonymous", and the app adds the code ("Mony #1625").
  clientHidden?: boolean;
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
  // Set when the session came through a clinic (section 34). The clinic desk
  // moves or cancels it, so the professional does not reschedule it here.
  clinic?: { name: string; address: string } | null;
};

// Private to the professional who wrote it. Never shown to admins or clients.
export type SessionNote = { text: string; updatedAt: string };

// A note after a session: free text, or SOAP (what the client said, what the
// professional observed, their assessment, and the plan). Section 16.
export type NoteFormat = 'free' | 'soap';
export type SoapSection = 'subjective' | 'objective' | 'assessment' | 'plan';
export type SoapNote = Record<SoapSection, string>;
export type SessionRecord = SessionNote & { format: NoteFormat; soap: SoapNote };

export const SOAP_SECTIONS: SoapSection[] = ['subjective', 'objective', 'assessment', 'plan'];
export const EMPTY_SOAP: SoapNote = { subjective: '', objective: '', assessment: '', plan: '' };

export const SOAP_LABELS: Record<SoapSection, { en: string; km: string; hint: string; kmHint: string }> = {
  subjective: { en: 'Subjective', km: 'អ្វីដែលអតិថិជនបាននិយាយ (Subjective)', hint: 'What the client said', kmHint: 'អារម្មណ៍ បញ្ហា និងពាក្យរបស់អតិថិជនផ្ទាល់' },
  objective: { en: 'Objective', km: 'អ្វីដែលអ្នកបានសង្កេត (Objective)', hint: 'What you observed', kmHint: 'ឥរិយាបថ ទឹកមុខ និងអ្វីដែលអ្នកបានឃើញក្នុងវគ្គ' },
  assessment: { en: 'Assessment', km: 'ការវាយតម្លៃ (Assessment)', hint: 'Your assessment', kmHint: 'ការយល់ឃើញរបស់អ្នកអំពីស្ថានភាព និងវឌ្ឍនភាព' },
  plan: { en: 'Plan', km: 'ផែនការ (Plan)', hint: 'The plan', kmHint: 'អ្វីដែលត្រូវធ្វើបន្ទាប់ និងសម្រាប់វគ្គក្រោយ' },
};

/** Characters in the whole note, for the 20,000 limit. */
export function sessionNoteLength(format: NoteFormat, text: string, soap: SoapNote) {
  return format === 'soap' ? SOAP_SECTIONS.reduce((sum, key) => sum + soap[key].length, 0) : text.length;
}

/** The note as plain text, for previews and search. SOAP sections get their headings. */
export function sessionNotePlain(note: SessionRecord | undefined, km: boolean) {
  if (!note) return '';
  if (note.format === 'free') return note.text;
  return SOAP_SECTIONS.filter((key) => note.soap[key].trim())
    .map((key) => `${km ? SOAP_LABELS[key].km : SOAP_LABELS[key].en}\n${note.soap[key]}`)
    .join('\n\n');
}

export const MAX_SESSION_NOTE = 20000;

export const MAX_REASON = 300;
// Prep notes and summary notes. Session notes use MAX_SESSION_NOTE.
export const MAX_NOTE = 5000;
