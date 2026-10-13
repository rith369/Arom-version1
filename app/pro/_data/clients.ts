import { initialUsers } from '../../admin/_data/users';
import type { ProBooking } from './bookings';

// A professional only ever sees people who booked with them, and only what
// happened in those sessions. Journals, mood logs and detection answers are
// never shown, unless the client switched sharing on for a booking.

export type SymptomCheckType = 'general' | 'depression' | 'anxiety' | 'stress' | 'sleep' | 'burnout';
export type SymptomLevel = 'none' | 'low' | 'medium' | 'high';

// Mirrors symptom_checks (shared when share_symptom_checks is on).
export type SharedSymptomCheck = {
  type: SymptomCheckType;
  score: number;
  maxScore: number;
  level: SymptomLevel;
  createdAt: string;
};

// Mirrors onboarding_surveys (shared when share_survey is on).
export type SharedSurvey = {
  feelings: string[];
  frequency: 'almost_every_day' | 'several_days_week' | 'sometimes' | 'rarely';
  impact: number; // 1 to 5
  challenges: string[];
  priorSupport: 'first_time' | 'friend_family' | 'counselor_therapist' | 'doctor' | 'prefer_not_say';
  goals: string[];
  createdAt: string;
};

export type ClientSummary = {
  id: string;
  name: string;
  preferredLanguage: 'en' | 'km';
  firstSessionAt: string;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
  completedSessions: number;
  totalBookings: number;
};

const endOf = (booking: ProBooking) => Date.parse(booking.startsAt) + booking.durationMinutes * 60_000;

// One row per person who booked with this professional.
export function clientsFrom(bookings: ProBooking[], now: number): ClientSummary[] {
  const byClient = new Map<string, ProBooking[]>();
  for (const booking of bookings) {
    byClient.set(booking.clientId, [...(byClient.get(booking.clientId) ?? []), booking]);
  }

  return [...byClient.entries()].map(([id, list]) => {
    const sorted = [...list].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const past = sorted.filter((item) => item.status !== 'cancelled' && endOf(item) <= now);
    const next = sorted.find((item) => item.status === 'booked' && endOf(item) > now);

    return {
      id,
      name: sorted[0].clientName,
      preferredLanguage: initialUsers.find((user) => user.id === id)?.preferredLanguage ?? 'km',
      firstSessionAt: sorted[0].startsAt,
      lastSessionAt: past.at(-1)?.startsAt ?? null,
      nextSessionAt: next?.startsAt ?? null,
      completedSessions: sorted.filter((item) => item.status === 'completed').length,
      totalBookings: sorted.length,
    };
  });
}

// Sharing counts only on a booked or completed session, as in client_shares_with_me().
export function sharingFor(bookings: ProBooking[], clientId: string) {
  const active = bookings.filter(
    (item) => item.clientId === clientId && (item.status === 'booked' || item.status === 'completed'),
  );
  return {
    survey: active.some((item) => item.shareSurvey),
    symptomChecks: active.some((item) => item.shareSymptomChecks),
  };
}

// Demo shared results. Only shown when sharingFor() allows it.
export const SAMPLE_SHARED: Record<string, { survey?: SharedSurvey; symptomChecks?: SharedSymptomCheck[] }> = {
  'demo-user-001': {
    survey: {
      feelings: ['Stressed', 'Tired', 'Worried'],
      frequency: 'several_days_week',
      impact: 4,
      challenges: ['Work', 'Sleep'],
      priorSupport: 'first_time',
      goals: ['Sleep better', 'Feel calmer at work'],
      createdAt: '2026-09-18T03:10:00Z',
    },
    symptomChecks: [
      { type: 'stress', score: 24, maxScore: 40, level: 'medium', createdAt: '2026-09-20T02:00:00Z' },
      { type: 'sleep', score: 14, maxScore: 20, level: 'high', createdAt: '2026-10-01T13:00:00Z' },
      { type: 'stress', score: 17, maxScore: 40, level: 'low', createdAt: '2026-10-11T03:30:00Z' },
    ],
  },
  'demo-user-005': {
    symptomChecks: [
      { type: 'anxiety', score: 12, maxScore: 21, level: 'medium', createdAt: '2026-10-06T08:00:00Z' },
      { type: 'anxiety', score: 9, maxScore: 21, level: 'medium', createdAt: '2026-10-12T09:00:00Z' },
    ],
  },
};

export const SYMPTOM_TYPE_LABELS: Record<SymptomCheckType, { en: string; km: string }> = {
  general: { en: 'General wellbeing', km: 'សុខុមាលភាពទូទៅ' },
  depression: { en: 'Low mood', km: 'អារម្មណ៍ធ្លាក់ចុះ' },
  anxiety: { en: 'Anxiety', km: 'ការថប់បារម្ភ' },
  stress: { en: 'Stress', km: 'ភាពតានតឹង' },
  sleep: { en: 'Sleep', km: 'ការគេង' },
  burnout: { en: 'Burnout', km: 'ភាពអស់កម្លាំង' },
};

export const LEVEL_LABELS: Record<SymptomLevel, { en: string; km: string }> = {
  none: { en: 'None', km: 'គ្មាន' },
  low: { en: 'Low', km: 'ទាប' },
  medium: { en: 'Medium', km: 'មធ្យម' },
  high: { en: 'High', km: 'ខ្ពស់' },
};

export const FREQUENCY_LABELS: Record<SharedSurvey['frequency'], { en: string; km: string }> = {
  almost_every_day: { en: 'Almost every day', km: 'ស្ទើររាល់ថ្ងៃ' },
  several_days_week: { en: 'Several days a week', km: 'ច្រើនថ្ងៃក្នុងមួយសប្តាហ៍' },
  sometimes: { en: 'Sometimes', km: 'ពេលខ្លះ' },
  rarely: { en: 'Rarely', km: 'កម្រ' },
};

export const PRIOR_SUPPORT_LABELS: Record<SharedSurvey['priorSupport'], { en: string; km: string }> = {
  first_time: { en: 'First time getting support', km: 'ជាលើកដំបូងស្វែងរកជំនួយ' },
  friend_family: { en: 'Talked to friends or family', km: 'បាននិយាយជាមួយមិត្តភក្តិ ឬគ្រួសារ' },
  counselor_therapist: { en: 'Saw a counselor or therapist', km: 'ធ្លាប់ជួបអ្នកប្រឹក្សា' },
  doctor: { en: 'Saw a doctor', km: 'ធ្លាប់ជួបវេជ្ជបណ្ឌិត' },
  prefer_not_say: { en: 'Prefers not to say', km: 'មិនចង់និយាយ' },
};
