import type { NextRequest } from "next/server";
import { z } from "zod";
import { DEFAULT_GROUP_RULES, type CommunityReportReason } from "@/app/community/community-data";
import { reportReasonLabels, type AdminGroup, type CommunityReport } from "@/app/admin/_data/community";
import { createClient } from "@/lib/supabase/server";
import { databaseError, fail, invalidInput, json, readJson, unauthorized } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM community moderation (BACKEND-HANDOFF.md section 23). Admins list,
 * create, edit, shut down and reopen groups, and resolve member reports.
 * Reporters and reported people are never named to admins. Every admin
 * action is audit logged by its database function.
 */

const uuid = z.string().uuid();

interface GroupRow {
  id: string;
  name: string;
  name_km: string | null;
  description: string | null;
  description_km: string | null;
  max_members: number;
  members_count: number;
  is_active: boolean;
  closed_reason: string | null;
  mentor_id: string;
  mentor_name: string;
  created_by_admin: boolean;
}

/** GET /api/admin/community/groups */
export async function listAdminGroups() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase.rpc("admin_list_groups");
  if (error) return fail("server_error", "Groups could not be loaded.", 500);

  const groups: AdminGroup[] = ((data ?? []) as GroupRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    kmName: row.name_km ?? "",
    about: row.description ?? "",
    kmAbout: row.description_km ?? "",
    maxMembers: row.max_members,
    membersCount: row.members_count,
    // Members show as Anonymous by their own Hide my identity setting.
    isAnonymous: true,
    mentorId: row.mentor_id,
    // Rules are the same for every group today and are not stored per group.
    rules: [...DEFAULT_GROUP_RULES],
    status: row.is_active ? "active" : "closed",
    closedReason: row.closed_reason ?? undefined,
    createdBy: row.created_by_admin ? "admin" : "professional",
    creatorName: row.created_by_admin ? "AROM team" : row.mentor_name,
  }));
  return json({ groups });
}

const groupSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  kmName: z.string().trim().max(160),
  about: z.string().trim().min(1).max(3000),
  kmAbout: z.string().trim().max(3000),
  maxMembers: z.number().int().min(2).max(10),
  mentorId: uuid,
});

/** POST /api/admin/community/groups `{ group }`: creates (no saved id) or edits a group. */
export async function saveAdminGroup(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const body = z.object({ group: groupSchema, isNew: z.boolean() }).safeParse(await readJson(request));
  if (!body.success) return invalidInput();
  const group = body.data.group;
  if (!body.data.isNew && !uuid.safeParse(group.id).success) return invalidInput();

  const { error } = await guard.supabase.rpc("admin_save_group", {
    p_id: body.data.isNew ? null : group.id,
    p_name: group.name,
    p_name_km: group.kmName,
    p_description: group.about,
    p_description_km: group.kmAbout,
    p_max_members: group.maxMembers,
    p_mentor_id: group.mentorId,
  });
  if (error) return databaseError(error, "The group could not be saved. Please try again.");
  return listAdminGroups();
}

/** POST /api/admin/community/groups/:id/close `{ reason }` or /reopen. */
export async function setGroupClosed(request: NextRequest, groupId: string, closed: boolean) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = uuid.safeParse(groupId);
  const body = z.object({ reason: z.string().trim().max(500).default("") }).safeParse((await readJson(request)) ?? {});
  if (!id.success || !body.success) return invalidInput();
  if (closed && !body.data.reason) return invalidInput();

  const { error } = await guard.supabase.rpc("admin_set_group_closed", {
    p_group_id: id.data,
    p_closed: closed,
    p_reason: body.data.reason,
  });
  if (error) return databaseError(error, "The group could not be changed. Please try again.");
  return listAdminGroups();
}

interface ReportRow {
  id: string;
  group_id: string;
  target_kind: CommunityReport["targetKind"];
  message_id: string | null;
  member_label: string;
  message_preview: string;
  reason: CommunityReportReason;
  note: string;
  created_at: string;
  status: CommunityReport["status"];
}

const KIND_LABELS: Record<CommunityReport["targetKind"], string> = {
  member: "Person",
  message: "Message",
  image: "Image",
  group: "Group",
};

/** GET /api/admin/community/reports: never the reporter, never who was reported. */
export async function listCommunityReports() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase.rpc("admin_list_community_reports");
  if (error) return fail("server_error", "Reports could not be loaded.", 500);

  const reports: CommunityReport[] = ((data ?? []) as ReportRow[]).map((row) => ({
    id: row.id,
    groupId: row.group_id,
    targetKind: row.target_kind,
    targetLabel: row.target_kind === "member" ? row.member_label || "A member" : KIND_LABELS[row.target_kind],
    messageId: row.message_id ?? undefined,
    messagePreview: row.message_preview,
    reason: reportReasonLabels[row.reason] ?? row.reason,
    note: row.note,
    createdAt: row.created_at,
    status: row.status,
  }));
  return json({ reports });
}

/** POST /api/admin/community/reports/:id/resolve `{ status: 'dismissed' | 'removed' }`. */
export async function resolveCommunityReport(request: NextRequest, reportId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = uuid.safeParse(reportId);
  const body = z.object({ status: z.enum(["dismissed", "removed"]) }).safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { error } = await guard.supabase.rpc("admin_resolve_community_report", {
    p_report_id: id.data,
    p_status: body.data.status,
  });
  if (error) return databaseError(error, "The report could not be closed. Please try again.");
  return listCommunityReports();
}

const reportSchema = z.object({
  target: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("member"), groupId: uuid, memberLabel: z.string().max(80), messageId: uuid.optional() }),
    z.object({ kind: z.literal("message"), groupId: uuid, messageId: uuid }),
    z.object({ kind: z.literal("image"), groupId: uuid, messageId: uuid }),
    z.object({ kind: z.literal("group"), groupId: uuid }),
  ]),
  reason: z.enum(["harassment", "spam", "harmful", "inappropriate_image", "safety_concern", "other"]),
  note: z.string().trim().max(300),
});

/** POST /api/community/reports `{ target, reason, note }` returns `{ result: 'sent' | 'daily_limit' }`. */
export async function submitCommunityReport(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const body = reportSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();
  const target = body.data.target;

  const { data, error } = await supabase.rpc("submit_community_report", {
    p_group_id: target.groupId,
    p_target_kind: target.kind,
    p_message_id: "messageId" in target ? (target.messageId ?? null) : null,
    p_member_label: target.kind === "member" ? target.memberLabel : "",
    p_reason: body.data.reason,
    p_note: body.data.note,
  });
  if (error) {
    if (error.code === "PT403") return unauthorized();
    return databaseError(error, "The report could not be sent. Please try again.");
  }
  return json({ result: data === "daily_limit" ? "daily_limit" : "sent" });
}
