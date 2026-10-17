import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  isValidEmail,
  isValidPhone,
  isValidWebsite,
  type CrisisHelpline,
  type SupportContact,
} from "@/app/_components/support-contacts";
import { createClient } from "@/lib/supabase/server";
import { databaseError, fail, invalidInput, json, readJson } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM crisis helplines and support contact (BACKEND-HANDOFF.md section 13).
 * Everyone, signed out visitors included, reads the active helplines and the
 * support contact. Only admins change them, through save_crisis_resources()
 * and save_support_contact(), both audit logged.
 */

const COLUMNS =
  "id, name, name_km, description, description_km, phone, sms, website, available_hours, available_hours_km, is_active, sort_order";

interface HelplineRow {
  id: string;
  name: string;
  name_km: string | null;
  description: string | null;
  description_km: string | null;
  phone: string | null;
  sms: string | null;
  website: string | null;
  available_hours: string | null;
  available_hours_km: string | null;
  is_active: boolean;
  sort_order: number;
}

function toHelpline(row: HelplineRow): CrisisHelpline {
  return {
    id: row.id,
    name: row.name,
    kmName: row.name_km ?? "",
    description: row.description ?? "",
    kmDescription: row.description_km ?? "",
    phone: row.phone ?? "",
    sms: row.sms ?? "",
    website: row.website ?? "",
    hours: row.available_hours ?? "",
    kmHours: row.available_hours_km ?? "",
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

const text = (max: number) => z.string().trim().max(max);

const helplineSchema = z
  .object({
    id: z.string().uuid(),
    name: text(120).min(1),
    kmName: text(120).min(1),
    description: text(300),
    kmDescription: text(300),
    phone: text(30),
    sms: text(30),
    website: text(300),
    hours: text(120),
    kmHours: text(120),
    isActive: z.boolean(),
  })
  .refine((item) => item.phone || item.website)
  .refine((item) => !item.phone || isValidPhone(item.phone))
  .refine((item) => !item.sms || isValidPhone(item.sms))
  .refine((item) => !item.website || isValidWebsite(item.website));

const saveSchema = z.object({ helplines: z.array(helplineSchema).max(50) });

interface SupportRow {
  email: string;
  phone: string;
  hours: string;
  hours_km: string;
}

const EMPTY_SUPPORT: SupportContact = { email: "", phone: "", hours: "", kmHours: "" };

async function loadSupportContact(supabase: Awaited<ReturnType<typeof createClient>>): Promise<SupportContact | null> {
  const { data, error } = await supabase
    .from("support_contact")
    .select("email, phone, hours, hours_km")
    .maybeSingle<SupportRow>();
  if (error) return null;
  return data ? { email: data.email, phone: data.phone, hours: data.hours, kmHours: data.hours_km } : EMPTY_SUPPORT;
}

/** GET /api/crisis-resources: active helplines in the admin's order, and the support contact. Public. */
export async function listActiveHelplines() {
  const supabase = await createClient();
  const [{ data, error }, supportContact] = await Promise.all([
    supabase
      .from("crisis_resources")
      .select(COLUMNS)
      .eq("is_active", true)
      .eq("country_code", "KH")
      .order("sort_order", { ascending: true })
      .returns<HelplineRow[]>(),
    loadSupportContact(supabase),
  ]);
  if (error) return fail("server_error", "We could not load helplines.", 500);

  return json({ helplines: (data ?? []).map(toHelpline), supportContact: supportContact ?? EMPTY_SUPPORT });
}

/** GET /api/admin/support-contact */
export async function getSupportContact() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const supportContact = await loadSupportContact(guard.supabase);
  if (!supportContact) return fail("server_error", "We could not load the support contact.", 500);
  return json({ supportContact });
}

const supportSchema = z
  .object({ email: text(254), phone: text(40), hours: text(200), kmHours: text(250) })
  .refine((item) => !item.email || isValidEmail(item.email))
  .refine((item) => !item.phone || isValidPhone(item.phone));

/** PUT /api/admin/support-contact body `{ supportContact }`. Empty fields hide that line for users. */
export async function saveSupportContact(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const body = z.object({ supportContact: supportSchema }).safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const item = body.data.supportContact;
  const { error } = await guard.supabase.rpc("save_support_contact", {
    p_email: item.email,
    p_phone: item.phone,
    p_hours: item.hours,
    p_hours_km: item.kmHours,
  });
  if (error) return databaseError(error, "The support contact could not be saved. Please try again.");
  return getSupportContact();
}

/** GET /api/admin/crisis-resources: every helpline, hidden ones included. */
export async function listAllHelplines() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase
    .from("crisis_resources")
    .select(COLUMNS)
    .eq("country_code", "KH")
    .order("sort_order", { ascending: true })
    .returns<HelplineRow[]>();
  if (error) return fail("server_error", "We could not load helplines.", 500);

  return json({ helplines: (data ?? []).map(toHelpline) });
}

/** PUT /api/admin/crisis-resources  body `{ helplines: CrisisHelpline[] }` in display order. */
export async function saveHelplines(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const body = saveSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await guard.supabase.rpc("save_crisis_resources", {
    p_items: body.data.helplines,
  });
  if (error) return databaseError(error, "The helplines could not be saved. Please try again.");

  return listAllHelplines();
}
