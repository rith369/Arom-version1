import type { NextRequest } from "next/server";
import {
  LICENSE_FILE_TYPES,
  MAX_DOCUMENT_BYTES,
  applicationFieldsSchema,
  type OwnApplication,
  type OwnApplicationResponse,
} from "@/lib/professional-application";
import { fail, invalidInput, json } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM application controller: a signed in seeker applies to become a
 * professional. Runs as the caller, so RLS and the storage policies apply.
 * The license file goes to the private "licenses" bucket at
 * <user_id>/<uuid>.<ext> and is never given a public URL.
 */

const OWN_COLUMNS =
  "id, full_name, title, license_number, issuing_body, document_name, specialties, languages, years_experience, phone, telegram, motivation, status, review_note, created_at";

interface OwnRow {
  id: string;
  full_name: string;
  title: string;
  license_number: string;
  issuing_body: string | null;
  document_name: string | null;
  specialties: string[] | null;
  languages: string[] | null;
  years_experience: number | null;
  phone: string | null;
  telegram: string | null;
  motivation: string | null;
  status: OwnApplication["status"];
  review_note: string | null;
  created_at: string;
}

function toOwnApplication(row: OwnRow): OwnApplication {
  return {
    id: row.id,
    fullName: row.full_name,
    title: row.title,
    licenseNumber: row.license_number,
    issuingBody: row.issuing_body ?? "",
    documentName: row.document_name ?? "",
    specialties: row.specialties ?? [],
    languages: row.languages ?? [],
    yearsExperience: row.years_experience ?? 0,
    phone: row.phone ?? "",
    telegram: row.telegram ?? "",
    motivation: row.motivation ?? "",
    status: row.status,
    reviewNote: row.review_note ?? "",
    createdAt: row.created_at,
  };
}

/** Keeps only a safe, short version of the uploaded file's name for display. */
function cleanFileName(name: string) {
  const cleaned = name.replace(/[\\/\u0000-\u001f]/g, "").trim();
  return cleaned.slice(-200) || "license";
}

async function readLicense(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0 || value.size > MAX_DOCUMENT_BYTES) {
    return null;
  }
  const type = LICENSE_FILE_TYPES[value.type];
  if (!type) return null;

  // Check the file really is what its type says, not only its label.
  const bytes = new Uint8Array(await value.arrayBuffer());
  if (!type.signature.every((byte, index) => bytes[index] === byte)) return null;

  return { bytes, contentType: value.type, extension: type.extension, name: cleanFileName(value.name) };
}

/** GET /api/professional/application: the caller's latest application, or null. */
export async function getOwnApplication() {
  // Professionals and admins may open the page too; they simply have nothing pending.
  const guard = await requireRole("user", "professional", "admin");
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase
    .from("professional_applications")
    .select(OWN_COLUMNS)
    .eq("user_id", guard.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<OwnRow>();
  if (error) return fail("server_error", "We could not load your application.", 500);

  return json<OwnApplicationResponse>({ application: data ? toOwnApplication(data) : null });
}

/** POST /api/professional/application (multipart): submit or resubmit. */
export async function submitApplication(request: NextRequest) {
  const guard = await requireRole("user");
  if (!guard.ok) return guard.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return invalidInput();
  }

  const fields = applicationFieldsSchema.safeParse({
    fullName: form.get("fullName"),
    title: form.get("title"),
    licenseNumber: form.get("licenseNumber"),
    issuingBody: form.get("issuingBody"),
    specialties: form.get("specialties"),
    languages: form.get("languages"),
    yearsExperience: form.get("yearsExperience"),
    phone: form.get("phone"),
    telegram: form.get("telegram") ?? undefined,
    motivation: form.get("motivation") ?? undefined,
  });
  const license = await readLicense(form.get("document"));
  if (!fields.success || !license) return invalidInput();

  const values = fields.data;
  const { supabase, userId } = guard;
  const documentPath = `${userId}/${crypto.randomUUID()}.${license.extension}`;

  // Save the row first: the one pending application rule stops a second
  // submission before any file is stored.
  const { data: row, error: insertError } = await supabase
    .from("professional_applications")
    .insert({
      user_id: userId,
      full_name: values.fullName,
      title: values.title,
      license_number: values.licenseNumber,
      issuing_body: values.issuingBody,
      document_path: documentPath,
      document_name: license.name,
      specialties: values.specialties,
      languages: values.languages,
      years_experience: values.yearsExperience,
      phone: values.phone,
      telegram: values.telegram,
      motivation: values.motivation || null,
    })
    .select(OWN_COLUMNS)
    .single<OwnRow>();

  if (insertError) {
    if (insertError.code === "23505") {
      return fail("invalid_input", "You already have an application waiting for review.", 409);
    }
    return fail("server_error", "We could not send your application.", 500);
  }

  const { error: uploadError } = await supabase.storage
    .from("licenses")
    .upload(documentPath, license.bytes, { contentType: license.contentType, upsert: false });

  if (uploadError) {
    // Applicants may withdraw a pending application, so this undo is allowed by RLS.
    await supabase.from("professional_applications").delete().eq("id", row.id);
    return fail("server_error", "We could not upload your license. Please try again.", 500);
  }

  return json<OwnApplicationResponse>({ application: toOwnApplication(row) }, 201);
}
