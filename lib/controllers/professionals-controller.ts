import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type {
  AccountStatus,
  Professional,
  ReviewedField,
  VerificationStatus,
} from "@/app/admin/_data/professionals";
import { uuidSchema } from "@/lib/roles";
import { NO_STORE, fail, invalidInput, json, readJson } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM admin professionals controller (BACKEND-HANDOFF.md section 6).
 * One list that merges live professionals (professional_profiles) with
 * applicants who are not professionals yet (professional_applications).
 * Phone and Telegram are private and only ever returned here, to admins.
 */

const LICENSE_LINK_SECONDS = 60;

interface ProfileRow {
  id: string;
  display_name: string;
  display_name_km: string | null;
  title: string;
  title_km: string | null;
  bio: string | null;
  bio_km: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  languages: string[] | null;
  years_experience: number | null;
  session_types: string[] | null;
  verification_status: VerificationStatus;
  created_at: string;
  profiles: { account_status: AccountStatus; suspended_reason: string | null } | null;
  professional_credentials:
    | { license_number: string; issuing_body: string | null; submitted_at: string }[]
    | null;
  professional_contacts: { phone: string | null; telegram: string | null } | null;
  professional_profile_changes:
    | { field: string; old_value: string; new_value: string; status: string }[]
    | null;
}

// Professional area field names to the admin page's field names.
const CHANGE_FIELDS: Record<string, ReviewedField> = {
  displayName: "name",
  kmDisplayName: "kmName",
  title: "role",
  kmTitle: "kmRole",
  licenseNumber: "licenseNumber",
  issuingBody: "issuingBody",
};

interface ApplicationRow {
  id: string;
  user_id: string;
  full_name: string;
  title: string;
  license_number: string;
  issuing_body: string | null;
  document_name: string | null;
  document_path: string | null;
  specialties: string[] | null;
  languages: string[] | null;
  years_experience: number | null;
  phone: string | null;
  telegram: string | null;
  status: "pending" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
}

function experienceText(years: number | null) {
  if (years === null) return "";
  return years === 1 ? "1 year of experience" : `${years} years of experience`;
}

function sessionLabel(types: string[] | null): Professional["session"] {
  const online = types?.includes("online") ?? false;
  const inPerson = types?.includes("in_person") ?? false;
  if (online && inPerson) return "Both";
  return inPerson ? "In-person" : "Online";
}

function fromProfile(row: ProfileRow, application: ApplicationRow | undefined): Professional {
  const credential = [...(row.professional_credentials ?? [])].sort((a, b) =>
    b.submitted_at.localeCompare(a.submitted_at),
  )[0];
  const accountStatus = row.profiles?.account_status === "suspended" ? "suspended" : "active";

  return {
    id: row.id,
    name: row.display_name,
    kmName: row.display_name_km ?? "",
    role: row.title,
    kmRole: row.title_km ?? "",
    specialties: row.specialties ?? [],
    languages: row.languages ?? [],
    experience: experienceText(row.years_experience),
    about: row.bio ?? "",
    kmAbout: row.bio_km ?? "",
    image: row.photo_url ?? "",
    session: sessionLabel(row.session_types),
    verificationStatus: row.verification_status,
    accountStatus,
    credential: {
      licenseNumber: credential?.license_number ?? "",
      issuingBody: credential?.issuing_body ?? "",
      documentName: application?.document_path ? (application.document_name ?? "license") : "",
      submittedAt: credential?.submitted_at ?? row.created_at,
    },
    phone: row.professional_contacts?.phone ?? application?.phone ?? "",
    telegram: row.professional_contacts?.telegram ?? application?.telegram ?? "",
    pendingChanges: (row.professional_profile_changes ?? [])
      .filter((change) => change.status === "pending" && CHANGE_FIELDS[change.field])
      .map((change) => ({ field: CHANGE_FIELDS[change.field], from: change.old_value, to: change.new_value })),
    reviewNote: accountStatus === "suspended" ? (row.profiles?.suspended_reason ?? "") : "",
    source: application ? "application" : "admin",
    joinedAt: row.created_at,
    applicationId: application?.document_path ? application.id : undefined,
  };
}

function fromApplication(row: ApplicationRow): Professional {
  return {
    id: row.user_id,
    name: row.full_name,
    kmName: "",
    role: row.title,
    kmRole: "",
    specialties: row.specialties ?? [],
    languages: row.languages ?? [],
    experience: experienceText(row.years_experience),
    about: "",
    kmAbout: "",
    image: "",
    session: "Online",
    verificationStatus: row.status === "rejected" ? "rejected" : "pending",
    accountStatus: "active",
    credential: {
      licenseNumber: row.license_number,
      issuingBody: row.issuing_body ?? "",
      documentName: row.document_path ? (row.document_name ?? "license") : "",
      submittedAt: row.created_at,
    },
    phone: row.phone ?? "",
    telegram: row.telegram ?? "",
    pendingChanges: [],
    reviewNote: row.review_note ?? "",
    source: "application",
    joinedAt: row.created_at,
    applicationId: row.id,
  };
}

/** GET /api/admin/professionals */
export async function listProfessionals() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;
  const { supabase } = guard;

  const [profiles, applications] = await Promise.all([
    supabase
      .from("professional_profiles")
      .select(
        "id, display_name, display_name_km, title, title_km, bio, bio_km, photo_url, specialties, languages, years_experience, session_types, verification_status, created_at, profiles(account_status, suspended_reason), professional_credentials(license_number, issuing_body, submitted_at), professional_contacts(phone, telegram), professional_profile_changes(field, old_value, new_value, status)",
      )
      .order("created_at", { ascending: false })
      .limit(1000)
      .returns<ProfileRow[]>(),
    supabase
      .from("professional_applications")
      .select(
        "id, user_id, full_name, title, license_number, issuing_body, document_name, document_path, specialties, languages, years_experience, phone, telegram, status, review_note, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(2000)
      .returns<ApplicationRow[]>(),
  ]);

  if (profiles.error || applications.error) {
    return fail("server_error", "We could not load professionals.", 500);
  }

  // Newest first, so the first row seen per user is their latest.
  const latestByUser = new Map<string, ApplicationRow>();
  const approvedByUser = new Map<string, ApplicationRow>();
  for (const row of applications.data ?? []) {
    if (!latestByUser.has(row.user_id)) latestByUser.set(row.user_id, row);
    if (row.status === "approved" && !approvedByUser.has(row.user_id)) {
      approvedByUser.set(row.user_id, row);
    }
  }

  const profileIds = new Set((profiles.data ?? []).map((row) => row.id));
  const professionals: Professional[] = [
    ...(profiles.data ?? []).map((row) => fromProfile(row, approvedByUser.get(row.id))),
    ...[...latestByUser.values()]
      .filter((row) => !profileIds.has(row.user_id) && row.status !== "approved")
      .map(fromApplication),
  ];

  return json({ professionals });
}

/**
 * GET /api/admin/applications/:id/license
 * Sends the admin to a signed link for the license file, valid for one minute.
 */
export async function openLicense(applicationId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(applicationId);
  if (!id.success) return invalidInput();

  const { data: application } = await guard.supabase
    .from("professional_applications")
    .select("document_path")
    .eq("id", id.data)
    .maybeSingle<{ document_path: string | null }>();
  if (!application?.document_path) {
    return fail("invalid_input", "This application has no license file.", 404);
  }

  const { data, error } = await guard.supabase.storage
    .from("licenses")
    .createSignedUrl(application.document_path, LICENSE_LINK_SECONDS);
  if (error || !data) return fail("server_error", "We could not open the license file.", 500);

  return NextResponse.redirect(data.signedUrl, { status: 303, headers: NO_STORE });
}

const accountStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
  reason: z.string().trim().max(500).optional(),
});

/** PATCH /api/admin/users/:id/status  body `{ status, reason? }` */
export async function setAccountStatus(request: NextRequest, userId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(userId);
  const body = accountStatusSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  // The database function refuses your own account and a suspension without a reason.
  const { error } = await guard.supabase.rpc("set_account_status", {
    p_user_id: id.data,
    p_status: body.data.status,
    p_reason: body.data.reason ?? null,
  });
  if (error) return fail("invalid_input", error.message, 400);

  return json({ ok: true, userId: id.data, status: body.data.status });
}

const reviewChangesSchema = z.object({
  approve: z.boolean(),
  note: z.string().trim().max(1000).optional(),
});

/** POST /api/admin/professionals/:id/changes/review  body `{ approve, note? }` */
export async function reviewProfileChanges(request: NextRequest, professionalId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(professionalId);
  const body = reviewChangesSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  // The database function refuses a decline without a reason and writes the audit log.
  const { error } = await guard.supabase.rpc("review_profile_changes", {
    p_professional_id: id.data,
    p_approve: body.data.approve,
    p_note: body.data.note ?? null,
  });
  if (error) return fail("invalid_input", error.message, 400);

  return json({ ok: true, professionalId: id.data, approved: body.data.approve });
}
