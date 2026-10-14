/*
 * A user's own appointments, as the My appointments page shows them.
 * Returned by GET /api/appointments. Only the user and their professional
 * can read an appointment (RLS on appointments).
 */

export type AppointmentStatus = "booked" | "completed" | "cancelled" | "no_show";

export interface AppointmentProfessional {
  slug: string;
  name: string;
  kmName: string;
  title: string;
  kmTitle: string;
  photoUrl: string;
}

export interface UserAppointment {
  id: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  sessionType: "online" | "in_person";
  status: AppointmentStatus;
  // Online sessions only. Only this user and their professional can read it.
  meetingUrl: string | null;
  intakeNote: string;
  cancelledBy: "you" | "professional" | "admin" | null;
  cancelReason: string;
  rescheduledFrom: string | null;
  rescheduleReason: string;
  // The user's choice per booking. Off by default.
  shareSurvey: boolean;
  shareSymptomChecks: boolean;
  // Shared by every session of a repeating series (section 19).
  seriesId: string | null;
  // Null when the professional is no longer listed publicly.
  professional: AppointmentProfessional | null;
}

export interface AppointmentsResponse {
  appointments: UserAppointment[];
}

export const MAX_CANCEL_REASON = 300;
