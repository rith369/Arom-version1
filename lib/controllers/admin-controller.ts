import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  bucketByDay,
  overviewQuerySchema,
  type AdminOverview,
  type AdminStats,
  type AuditEntry,
  type OpenFlag,
  type OverviewRange,
  type PendingApplication,
} from "@/lib/admin-overview";
import { databaseError, fail, invalidInput, json } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM admin controller. Read only views for the admin dashboard.
 * Everything here is counts or queue metadata. Private content (journals,
 * answers, notes, flag details) is never selected.
 */

type RawStats = {
  users_total?: number;
  users_by_role?: Record<string, number>;
  new_users_7d?: number;
  suspended_accounts?: number;
  pending_applications?: number;
  verified_professionals?: number;
  appointments_by_status?: Record<string, number>;
  upcoming_appointments?: number;
  active_groups?: number;
  open_safety_flags?: number;
  journal_entries_7d?: number;
  symptom_checks_7d?: number;
};

function toStats(raw: RawStats | null): AdminStats {
  const roles = raw?.users_by_role ?? {};
  return {
    usersTotal: raw?.users_total ?? 0,
    usersByRole: {
      user: roles.user ?? 0,
      professional: roles.professional ?? 0,
      admin: roles.admin ?? 0,
    },
    newUsers7d: raw?.new_users_7d ?? 0,
    suspendedAccounts: raw?.suspended_accounts ?? 0,
    pendingApplications: raw?.pending_applications ?? 0,
    verifiedProfessionals: raw?.verified_professionals ?? 0,
    upcomingAppointments: raw?.upcoming_appointments ?? 0,
    appointmentsByStatus: raw?.appointments_by_status ?? {},
    activeGroups: raw?.active_groups ?? 0,
    openSafetyFlags: raw?.open_safety_flags ?? 0,
    journalEntries7d: raw?.journal_entries_7d ?? 0,
    symptomChecks7d: raw?.symptom_checks_7d ?? 0,
  };
}

function readDetail(details: unknown, key: "from" | "to") {
  if (details && typeof details === "object" && key in details) {
    const value = (details as Record<string, unknown>)[key];
    return typeof value === "string" ? value : null;
  }
  return null;
}

/** GET /api/admin/overview?days=7|30|90 */
export async function getOverview(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const query = overviewQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!query.success) return invalidInput();

  const range = query.data.days as OverviewRange;
  const { supabase } = guard;
  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();

  const [stats, signups, applications, flags, hotlinesActive, hotlinesMissing, audit] =
    await Promise.all([
      supabase.rpc("admin_stats"),
      supabase.from("profiles").select("created_at").gte("created_at", since).limit(20000),
      supabase
        .from("professional_applications")
        .select("id, full_name, title, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(5),
      supabase
        .from("safety_flags")
        .select("id, reason, status, created_at")
        .in("status", ["open", "reviewing"])
        .order("created_at", { ascending: true })
        .limit(5),
      supabase.from("crisis_resources").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase
        .from("crisis_resources")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .is("phone", null),
      supabase
        .from("admin_audit_log")
        .select("id, action, target_table, details, created_at, admin:profiles!admin_audit_log_admin_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  if (stats.error) {
    return fail("server_error", "We could not load platform stats.", 500);
  }

  const overview: AdminOverview = {
    generatedAt: new Date().toISOString(),
    range,
    stats: toStats(stats.data as RawStats | null),
    signups: bucketByDay(
      (signups.data ?? []).map((row: { created_at: string }) => row.created_at),
      range,
    ),
    applications: (applications.data ?? []).map(
      (row): PendingApplication => ({
        id: row.id,
        fullName: row.full_name,
        title: row.title,
        createdAt: row.created_at,
      }),
    ),
    flags: (flags.data ?? []).map(
      (row): OpenFlag => ({
        id: row.id,
        reason: row.reason,
        status: row.status,
        createdAt: row.created_at,
      }),
    ),
    hotlines: { active: hotlinesActive.count ?? 0, missingPhone: hotlinesMissing.count ?? 0 },
    audit: (audit.data ?? []).map((row): AuditEntry => {
      const admin = Array.isArray(row.admin) ? row.admin[0] : row.admin;
      return {
        id: row.id,
        action: row.action,
        targetTable: row.target_table,
        adminName: (admin as { full_name: string | null } | null)?.full_name ?? null,
        from: readDetail(row.details, "from"),
        to: readDetail(row.details, "to"),
        createdAt: row.created_at,
      };
    }),
  };

  return json<AdminOverview>(overview);
}

export type AdminGroupMessage = {
  id: string;
  content: string;
  createdAt: string;
  displayName: string;
  isMentor: boolean;
  isHidden: boolean;
};

/**
 * GET /api/admin/community/groups/:id/messages?reason=: an admin opens a
 * support group chat for safety. admin_read_community_messages() writes an
 * audit log entry every time (AGENTS.md section 9). Never log message text.
 */
export async function readGroupChatAsAdmin(request: NextRequest, groupId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = z.string().uuid().safeParse(groupId);
  const reason = z.string().trim().max(300).safeParse(request.nextUrl.searchParams.get("reason") ?? "");
  if (!id.success || !reason.success) return invalidInput();

  const { data, error } = await guard.supabase.rpc("admin_read_community_messages", {
    p_group_id: id.data,
    p_reason: reason.data || null,
  });
  if (error) return databaseError(error, "This chat could not be opened. Please try again.");

  const rows = (data ?? []) as {
    id: string;
    content: string;
    created_at: string;
    display_name: string;
    is_mentor: boolean;
    is_hidden: boolean;
  }[];
  return json<{ messages: AdminGroupMessage[] }>({
    messages: rows.map((row) => ({
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      displayName: row.display_name,
      isMentor: row.is_mentor,
      isHidden: row.is_hidden,
    })),
  });
}
