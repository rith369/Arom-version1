import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { UserRole } from "@/lib/auth";
import {
  applicationListQuerySchema,
  assignableRoleSchema,
  reviewApplicationSchema,
  uuidSchema,
  type ApplicationSummary,
} from "@/lib/roles";
import type { AdminUser } from "@/app/admin/_data/users";
import { createClient } from "@/lib/supabase/server";
import { fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * AROM role controller. Every handler starts with `requireRole`, which reads
 * the role from the database (not the JWT), so a promotion or demotion takes
 * effect immediately. RLS and the database functions check again underneath.
 */

type Guard =
  | { ok: true; supabase: SupabaseClient; userId: string; role: UserRole }
  | { ok: false; response: Response };

/** Loads the caller and checks their role. Use at the top of every protected handler. */
export async function requireRole(...allowed: UserRole[]): Promise<Guard> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, response: unauthorized() };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .maybeSingle<{ role: UserRole; account_status: string }>();

  if (!profile || profile.account_status === "suspended" || !allowed.includes(profile.role)) {
    return {
      ok: false,
      response: fail("forbidden", "You do not have access to this.", 403),
    };
  }

  return { ok: true, supabase, userId: user.id, role: profile.role };
}

/** Database function errors are written for admins, so they are safe to show. */
function databaseError(message: string | undefined) {
  return fail("invalid_input", message ?? "That change could not be made.", 400);
}

interface AdminUserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  account_status: "active" | "suspended";
  language: "en" | "km";
  created_at: string;
  last_seen_at: string | null;
  days_active_30: number;
  check_in_count: number;
  booking_count: number;
}

/**
 * GET /api/admin/users: every account with email and activity counts.
 * Counts only, never journal, mood, detection or session content.
 */
export async function listUsers() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase.rpc("admin_list_users");
  if (error) return fail("server_error", "We could not load accounts.", 500);

  const users: AdminUser[] = ((data ?? []) as AdminUserRow[]).map((row) => ({
    id: row.id,
    fullName: row.full_name ?? "",
    email: row.email ?? "",
    avatarUrl: null,
    role: row.role,
    status: row.account_status === "suspended" ? "suspended" : "active",
    preferredLanguage: row.language === "km" ? "km" : "en",
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    daysActive30: row.days_active_30,
    checkInCount: row.check_in_count,
    bookingCount: row.booking_count,
  }));

  return json({ users, currentUserId: guard.userId });
}

/** PATCH /api/admin/users/:id/role  body `{ role, promotion? }` */
export async function setUserRole(request: NextRequest, userId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(userId);
  const body = assignableRoleSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const promotion = body.data.role === "professional" ? body.data.promotion : undefined;
  // The database function checks: admin only, not yourself, never the last admin.
  const { error } = await guard.supabase.rpc("set_user_role", {
    p_user_id: id.data,
    p_role: body.data.role,
    p_title: promotion?.title ?? null,
    p_license_number: promotion?.licenseNumber ?? null,
    p_issuing_body: promotion?.issuingBody ?? null,
    p_note: promotion?.note || null,
  });
  if (error) return databaseError(error.message);

  return json({ ok: true, userId: id.data, role: body.data.role });
}

/** GET /api/admin/applications?status=pending */
export async function listApplications(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const query = applicationListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!query.success) return invalidInput();

  const { data, error } = await guard.supabase
    .from("professional_applications")
    .select(
      "id, user_id, full_name, title, license_number, issuing_body, document_name, specialties, languages, years_experience, phone, telegram, motivation, status, review_note, created_at",
    )
    .eq("status", query.data.status)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) return fail("server_error", "We could not load applications.", 500);

  const applications: ApplicationSummary[] = (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    title: row.title,
    licenseNumber: row.license_number,
    issuingBody: row.issuing_body,
    documentName: row.document_name,
    specialties: row.specialties ?? [],
    languages: row.languages ?? [],
    yearsExperience: row.years_experience,
    phone: row.phone,
    telegram: row.telegram,
    motivation: row.motivation,
    status: row.status,
    reviewNote: row.review_note,
    createdAt: row.created_at,
  }));

  return json({ applications });
}

/** POST /api/admin/applications/:id/review  body `{ approve: boolean, note?: string }` */
export async function reviewApplication(request: NextRequest, applicationId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(applicationId);
  const body = reviewApplicationSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  // Approving promotes the account to professional and creates its verified profile.
  const { error } = await guard.supabase.rpc("review_professional_application", {
    p_application_id: id.data,
    p_approve: body.data.approve,
    p_note: body.data.note ?? null,
  });
  if (error) return databaseError(error.message);

  return json({ ok: true, applicationId: id.data, approved: body.data.approve });
}
