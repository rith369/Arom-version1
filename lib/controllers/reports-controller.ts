import type { NextRequest } from "next/server";
import { z } from "zod";
import { ALL_LESSONS } from "@/app/_components/learn/learn-data";
import { ALL_PRACTICES } from "@/app/_components/practice/practice-data";
import { ALL_TIPS } from "@/app/_components/tips/tips-data";
import { REPORT_NOTE_MAX, type ReportResult } from "@/app/_components/content-reports";
import type { AdminContentReport } from "@/app/admin/_data/reports";
import { createClient } from "@/lib/supabase/server";
import { databaseError, fail, invalidInput, json, readJson, unauthorized } from "./shared";
import { requireRole } from "./role-controller";

/*
 * "Report a problem" on MindGuide content (BACKEND-HANDOFF.md section 10).
 * Reports point at an item, never copy its text. The reporter is kept only
 * for the 5 a day limit and never reaches the admin screens.
 */

function itemExists(type: "lesson" | "tip" | "practice", sourceId: string) {
  if (type === "lesson") return ALL_LESSONS.some((item) => item.id === sourceId);
  if (type === "tip") return ALL_TIPS.some((item) => item.id === sourceId);
  return ALL_PRACTICES.some((item) => item.id === sourceId);
}

const targetSchema = z.object({
  type: z.enum(["lesson", "tip", "practice"]),
  sourceId: z.string().min(1).max(100),
  partId: z.string().min(1).max(60).optional(),
});

const submitSchema = z
  .object({
    target: targetSchema,
    reason: z.enum(["wrong_info", "harmful", "broken", "other"]),
    note: z.string().trim().max(REPORT_NOTE_MAX),
  })
  .refine((value) => itemExists(value.target.type, value.target.sourceId));

/** POST /api/content-reports `{ target, reason, note }` returns `{ result: 'sent' | 'daily_limit' }`. */
export async function submitContentReport(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const body = submitSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { data, error } = await supabase.rpc("submit_content_report", {
    p_target_type: body.data.target.type,
    p_source_id: body.data.target.sourceId,
    p_part_id: body.data.target.partId ?? null,
    p_reason: body.data.reason,
    p_note: body.data.note,
  });
  if (error) {
    if (error.code === "PT403") return unauthorized();
    return fail("server_error", "The report could not be sent. Please try again.", 500);
  }
  return json<{ result: ReportResult }>({ result: data === "daily_limit" ? "daily_limit" : "sent" });
}

interface ReportRow {
  id: string;
  target_type: "lesson" | "tip" | "practice";
  source_id: string;
  part_id: string | null;
  reason: AdminContentReport["reason"];
  note: string;
  created_at: string;
  status: AdminContentReport["status"];
  resolved_at: string | null;
  resolved_by_name: string | null;
}

/** GET /api/admin/content-reports: open reports and the last 180 days, never the reporter. */
export async function listContentReports() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase.rpc("admin_list_content_reports");
  if (error) return fail("server_error", "Reports could not be loaded.", 500);

  const reports: AdminContentReport[] = ((data ?? []) as ReportRow[]).map((row) => ({
    id: row.id,
    target: { type: row.target_type, sourceId: row.source_id, ...(row.part_id ? { partId: row.part_id } : {}) },
    reason: row.reason,
    note: row.note,
    createdAt: row.created_at,
    status: row.status,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by_name,
  }));
  return json({ reports });
}

const resolveSchema = z.object({
  itemId: z.string().regex(/^(lesson|tip|practice):[^:#]{1,100}$/),
  status: z.enum(["fixed", "not_a_problem"]),
});

/** POST /api/admin/content-reports/resolve `{ itemId: "lesson:<id>", status }`. */
export async function resolveContentReports(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const body = resolveSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const [type, sourceId] = body.data.itemId.split(":");
  const { error } = await guard.supabase.rpc("resolve_content_reports", {
    p_target_type: type,
    p_source_id: sourceId,
    p_status: body.data.status,
  });
  if (error) return databaseError(error, "The reports could not be closed. Please try again.");
  return listContentReports();
}
