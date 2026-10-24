/*
 * Clinic bookings (BACKEND-HANDOFF.md section 34). Students book a clinic,
 * not a therapist: they pick online or in person, a therapist preference,
 * one day and one or more of the clinic's times. The clinic desk picks the
 * time and the therapist. Confirming creates a normal appointment.
 */

export type ClinicSessionType = "online" | "in_person";
export type TherapistPreference = "female" | "male" | "any";
export type ClinicRequestStatus = "waiting" | "confirmed" | "declined" | "cancelled";

export const MAX_CLINIC_NOTE = 1000;
export const MAX_DESK_ANSWER = 500;
export const MAX_DESK_CANCEL_REASON = 500;
export const MAX_DESK_MOVE_REASON = 300;

/** A clinic therapist, public profile fields only (clinic_therapists()). */
export interface ClinicTherapist {
  slug: string;
  name: string;
  kmName: string;
  title: string;
  kmTitle: string;
  about: string;
  kmAbout: string;
  photoUrl: string;
  specialties: string[];
  languages: string[];
  yearsExperience: number | null;
  gender: "female" | "male" | "other" | "prefer_not_say" | null;
}

export interface ClinicTime {
  startsAt: string;
  endsAt: string;
  isFull: boolean;
}

/** GET /api/clinics/:slug/booking */
export interface ClinicBookingInfo {
  // False for clinics that do not take bookings in AROM (the page hides Book).
  takesBookings: boolean;
  sessionTypes: ClinicSessionType[];
  therapists: ClinicTherapist[];
  times: ClinicTime[];
}

/** A request as the student sees it (My appointments). */
export interface MyClinicRequest {
  id: string;
  clinicSlug: string;
  clinicName: string;
  clinicKmName: string;
  sessionType: ClinicSessionType;
  therapistGender: TherapistPreference;
  times: string[];
  note: string;
  status: ClinicRequestStatus;
  answerNote: string;
  createdAt: string;
  appointmentId: string | null;
}

export interface MyClinicRequestsResponse {
  requests: MyClinicRequest[];
}

/** A clinic the signed in account answers bookings for. */
export interface ClinicDesk {
  slug: string;
  name: string;
  kmName: string;
}

export interface DeskRequest {
  id: string;
  // Short code so the desk can tell requests apart without a name.
  reference: string;
  clientName: string;
  sessionType: ClinicSessionType;
  therapistGender: TherapistPreference;
  times: string[];
  note: string;
  status: ClinicRequestStatus;
  answerNote: string;
  createdAt: string;
  answeredAt: string | null;
  appointmentId: string | null;
  bookedAt: string | null;
  therapistName: string | null;
  appointmentStatus: "booked" | "completed" | "cancelled" | "no_show" | null;
}

export interface DeskTherapist {
  id: string;
  name: string;
  title: string;
  gender: ClinicTherapist["gender"];
}

export interface DeskTime {
  startsAt: string;
  endsAt: string;
  state: "open" | "closed" | "booked";
  appointmentId: string | null;
  sessionType: ClinicSessionType | null;
  therapistName: string | null;
  clientName: string | null;
}

/** GET /api/clinic-desk/:slug */
export interface DeskData {
  desk: ClinicDesk;
  requests: DeskRequest[];
  therapists: DeskTherapist[];
  schedule: DeskTime[];
}

/** GET /api/admin/clinics */
export interface AdminClinic {
  id: string;
  slug: string;
  name: string;
}

export interface AdminClinicsResponse {
  clinics: AdminClinic[];
  // Accounts that work at a clinic desk.
  staff: { clinicId: string; userId: string }[];
}

/** Cambodia day key, for grouping times by day. */
export function cambodiaDay(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Phnom_Penh" }).format(new Date(iso));
}

export function formatClinicTime(iso: string, km: boolean) {
  return new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", {
    timeZone: "Asia/Phnom_Penh",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function formatClinicDay(iso: string, km: boolean) {
  return new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", {
    timeZone: "Asia/Phnom_Penh",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

/** "8:30 to 9:30 AM" style range, Cambodia time. */
export function formatClinicRange(startsAt: string, endsAt: string, km: boolean) {
  return `${formatClinicTime(startsAt, km)} ${km ? "ដល់" : "to"} ${formatClinicTime(endsAt, km)}`;
}
