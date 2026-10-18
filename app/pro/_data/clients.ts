import type { MoodWeekResponse } from '@/lib/mood';
import type { ProBooking } from './bookings';

// The server names a client who hides their identity "Anonymous" (section 29).
const ANONYMOUS = 'Anonymous';

/**
 * "Anonymous #4821": a 4 digit number made from the client's alias id, so a
 * professional can tell anonymous clients apart. The alias is different for
 * each professional, so the number cannot be compared between professionals
 * and says nothing about the account. Same client, same number, every visit.
 */
export function anonymousLabel(clientId: string, language: 'en' | 'km') {
  // FNV-1a hash of the alias id.
  let hash = 2166136261;
  for (let i = 0; i < clientId.length; i += 1) {
    hash ^= clientId.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const number = 1000 + ((hash >>> 0) % 9000);
  return language === 'km' ? `អនាមិក #${number}` : `${ANONYMOUS} #${number}`;
}

/** Bookings with anonymous clients renamed to their numbered label. */
export function withClientLabels(bookings: ProBooking[], language: 'en' | 'km'): ProBooking[] {
  return bookings.map((booking) =>
    booking.clientName === ANONYMOUS ? { ...booking, clientName: anonymousLabel(booking.clientId, language) } : booking,
  );
}

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
      preferredLanguage: sorted[0].clientLanguage,
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
    moods: active.some((item) => item.shareMoodTrend),
  };
}

// What a client shares with this professional, from GET /api/pro/clients/<id>.
// Empty unless sharingFor() allows it (the database checks this too).
export type SharedByClient = {
  survey: SharedSurvey | null;
  symptomChecks: SharedSymptomCheck[];
  // Last 30 days of mood check ins, only while the client shares them. Null otherwise.
  moods: MoodWeekResponse | null;
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
