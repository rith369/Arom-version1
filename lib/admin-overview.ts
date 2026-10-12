import { z } from "zod";

/*
 * Shape of GET /api/admin/overview. Counts and queue items only: no journal
 * text, answers, flag details or emails ever leave the database here.
 */

export const overviewQuerySchema = z.object({
  days: z.coerce.number().int().refine((value) => [7, 30, 90].includes(value)).default(30),
});

export type OverviewRange = 7 | 30 | 90;

export interface DailyCount {
  /** Calendar day in Cambodia time, `YYYY-MM-DD`. */
  date: string;
  count: number;
}

export interface PendingApplication {
  id: string;
  fullName: string;
  title: string;
  createdAt: string;
}

export interface OpenFlag {
  id: string;
  reason: "self_harm_risk" | "harmful_content" | "harassment" | "other";
  status: "open" | "reviewing";
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  targetTable: string;
  adminName: string | null;
  from: string | null;
  to: string | null;
  createdAt: string;
}

export interface AdminStats {
  usersTotal: number;
  usersByRole: { user: number; professional: number; admin: number };
  newUsers7d: number;
  suspendedAccounts: number;
  pendingApplications: number;
  verifiedProfessionals: number;
  upcomingAppointments: number;
  appointmentsByStatus: Record<string, number>;
  activeGroups: number;
  openSafetyFlags: number;
  journalEntries7d: number;
  symptomChecks7d: number;
}

export interface AdminOverview {
  generatedAt: string;
  range: OverviewRange;
  stats: AdminStats;
  signups: DailyCount[];
  applications: PendingApplication[];
  flags: OpenFlag[];
  hotlines: { active: number; missingPhone: number };
  audit: AuditEntry[];
}

/** Cambodia has no daylight saving, so a fixed +7h offset is exact. */
const PHNOM_PENH_OFFSET_MS = 7 * 60 * 60 * 1000;

export function phnomPenhDay(value: string | number | Date) {
  return new Date(new Date(value).getTime() + PHNOM_PENH_OFFSET_MS).toISOString().slice(0, 10);
}

/** One entry per day for the last `days` days (oldest first), zeros included. */
export function bucketByDay(timestamps: string[], days: number, now = new Date()): DailyCount[] {
  const counts = new Map<string, number>();
  for (const stamp of timestamps) {
    const day = phnomPenhDay(stamp);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const today = new Date(`${phnomPenhDay(now)}T00:00:00Z`);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (days - 1 - index));
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: counts.get(key) ?? 0 };
  });
}
