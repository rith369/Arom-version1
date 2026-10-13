import { initialBookings } from '../../admin/_data/bookings';
import { initialUsers } from '../../admin/_data/users';
import type { SessionType } from './profile';

// The professional's own sessions. Mirrors appointments (status booked,
// completed, cancelled, no_show) plus intake answers. Booking is instant,
// so there is no "pending" here.

export type ProBookingStatus = 'booked' | 'completed' | 'cancelled' | 'no_show';

export type IntakeAnswer = { question: { en: string; km: string }; answer: string };

export type ProBooking = {
  id: string;
  // The client's account id (appointments.user_id).
  clientId: string;
  clientName: string;
  startsAt: string;
  durationMinutes: number;
  sessionType: SessionType;
  status: ProBookingStatus;
  // What the client wrote when booking (appointments.intake_note).
  intakeNote: string;
  intakeAnswers: IntakeAnswer[];
  cancelledBy: 'client' | 'professional' | 'admin' | null;
  cancelReason: string;
  // Set when the professional moved the session; the client is told.
  rescheduledFrom: string | null;
  rescheduleReason: string;
  // The client's choice for this booking (appointments.share_survey and
  // share_symptom_checks). Off by default; only the client can change it.
  shareSurvey: boolean;
  shareSymptomChecks: boolean;
};

// Private to the professional who wrote it. Never shown to admins or clients.
export type SessionNote = { text: string; updatedAt: string };

const QUESTIONS = {
  focus: { en: 'What would you like help with?', km: 'តើអ្នកចង់បានជំនួយអំពីអ្វី?' },
  before: { en: 'Have you talked to a counselor before?', km: 'តើអ្នកធ្លាប់និយាយជាមួយអ្នកប្រឹក្សាពីមុនទេ?' },
  goal: { en: 'What would make this session helpful for you?', km: 'តើអ្វីនឹងធ្វើឱ្យវគ្គនេះមានប្រយោជន៍សម្រាប់អ្នក?' },
};

const SAMPLE_INTAKES: { note: string; answers: [string, string, string] }[] = [
  {
    note: 'I prefer to talk in Khmer if possible.',
    answers: ['Stress from work and trouble sleeping.', 'No, this is my first time.', 'Some simple ways to calm down at night.'],
  },
  {
    note: '',
    answers: ['Worry about exams and my family expectations.', 'Once, at my university.', 'To understand why I feel anxious so often.'],
  },
  {
    note: 'Online please, my camera may be off at first.',
    answers: ['Feeling low for a few weeks.', 'No.', 'Someone to listen without judging.'],
  },
];

const sessionType = (meetingType: 'Online' | 'In-person'): SessionType =>
  meetingType === 'Online' ? 'online' : 'in_person';

// Demo: built from the admin sample bookings for this professional.
export function sampleBookingsFor(slug: string): ProBooking[] {
  return initialBookings
    .filter((booking) => booking.professionalId === slug)
    .map((booking, index) => {
      const intake = SAMPLE_INTAKES[index % SAMPLE_INTAKES.length];
      return {
        id: booking.id,
        clientId: booking.userId,
        clientName: initialUsers.find((user) => user.id === booking.userId)?.fullName ?? 'Client',
        startsAt: booking.startsAt,
        durationMinutes: booking.durationMinutes,
        sessionType: sessionType(booking.meetingType),
        // Instant booking: pending and confirmed are both "booked" here.
        status:
          booking.status === 'completed' ? 'completed' : booking.status === 'cancelled' ? 'cancelled' : 'booked',
        intakeNote: intake.note,
        intakeAnswers: [
          { question: QUESTIONS.focus, answer: intake.answers[0] },
          { question: QUESTIONS.before, answer: intake.answers[1] },
          { question: QUESTIONS.goal, answer: intake.answers[2] },
        ],
        cancelledBy: booking.status === 'cancelled' ? 'client' : null,
        cancelReason: booking.status === 'cancelled' ? 'Something came up at work.' : '',
        rescheduledFrom: null,
        rescheduleReason: '',
        // Demo: Sok Dara shares both, Heng Rachana shares symptom checks only.
        shareSurvey: booking.userId === 'demo-user-001',
        shareSymptomChecks: booking.userId === 'demo-user-001' || booking.userId === 'demo-user-005',
      };
    });
}

export const MAX_REASON = 300;
export const MAX_NOTE = 5000;
