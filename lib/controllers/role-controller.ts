import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { UserRole } from "@/lib/auth";
import {
  applicationListQuerySchema,
  assignableRoleSchema,
  reviewApplicationSchema,
  userListQuerySchema,
  uuidSchema,
  type AdminUserList,
  type AdminUserSummary,
  type ApplicationSummary,
} from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * AROM role controller. Every handler starts with `requireRole`, which reads
 * the role from the database (not the JWT), so a promotion or demotion takes
 * effect immediately. RLS and the database functions check again underneath.
 */

const PAGE_SIZE = 25;

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

/** GET /api/admin/users?role=&page= */
export async function listUsers(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const query = userListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!query.success) return invalidInput();

  const { role, page } = query.data;
  const from = (page - 1) * PAGE_SIZE;

  let builder = guard.supabase
    .from("profiles")
    .select("id, full_name, role, account_status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (role) builder = builder.eq("role", role);

  const { data, count, error } = await builder;
  if (error) return fail("server_error", "We could not load accounts.", 500);

  const users: AdminUserSummary[] = (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    accountStatus: row.account_status === "suspended" ? "suspended" : "active",
    createdAt: row.created_at,
  }));

  return json<AdminUserList>({ users, page, pageSize: PAGE_SIZE, total: count ?? 0 });
}

/** PATCH /api/admin/users/:id/role  body `{ role: "user" | "professional" }` */
export async function setUserRole(request: NextRequest, userId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(userId);
  const body = assignableRoleSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { error } = await guard.supabase.rpc("set_user_role", {
    p_user_id: id.data,
    p_role: body.data.role,
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
      "id, user_id, full_name, title, license_number, issuing_body, specialties, languages, years_experience, motivation, status, review_note, created_at",
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
    specialties: row.specialties ?? [],
    languages: row.languages ?? [],
    yearsExperience: row.years_experience,
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
