import type { NextRequest } from "next/server";
import { z } from "zod";
import type { AdminAuditEntry, AuditModule } from "@/app/admin/_data/audit-log";
import { fail, invalidInput, json } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM audit log controller. Reads admin_audit_log (admins only, by RLS)
 * and turns each stored action into a line people can read. The log holds
 * decisions and reasons only, never journals, answers or session notes.
 */

interface AuditRow {
  id: string;
  action: string;
  target_table: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  admin: { full_name: string | null } | { full_name: string | null }[] | null;
}

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** Readable action, module and detail for each stored action code. */
function describe(row: AuditRow): { action: string; module: AuditModule; detail: string } {
  const d = row.details ?? {};
  const fromTo = text(d.from) && text(d.to) ? `${text(d.from)} to ${text(d.to)}` : "";

  switch (row.action) {
    case "change_role":
      return { action: "Changed role", module: "users", detail: fromTo };
    case "change_account_status":
      return text(d.to) === "suspended"
        ? { action: "Suspended account", module: "users", detail: text(d.reason) }
        : { action: "Restored account", module: "users", detail: "" };
    case "reinstate_note":
      return { action: "Note on restoring account", module: "users", detail: text(d.note) };
    case "promote_professional":
      return {
        action: "Made a professional directly",
        module: "professionals",
        detail: [text(d.license_number) && `License ${text(d.license_number)}`, text(d.note)].filter(Boolean).join(". "),
      };
    case "change_verification":
      return { action: "Changed professional verification", module: "professionals", detail: fromTo };
    case "approve_application":
      return { action: "Approved application", module: "professionals", detail: text(d.note) };
    case "reject_application":
      return { action: "Rejected application", module: "professionals", detail: text(d.note) };
    case "approve_profile_changes":
      return { action: "Approved profile changes", module: "professionals", detail: text(d.note) };
    case "reject_profile_changes":
      return { action: "Declined profile changes", module: "professionals", detail: text(d.note) };
    case "save_crisis_resources": {
      const removed = Array.isArray(d.removed) ? d.removed.length : 0;
      return {
        action: "Saved crisis helplines",
        module: "settings",
        detail: `${Number(d.total ?? 0)} helplines, ${Number(d.active ?? 0)} shown${removed ? `, ${removed} removed` : ""}`,
      };
    }
    case "read_group_chat":
      return { action: "Opened a support group chat", module: "community", detail: text(d.reason) };
    case "change_flag_status":
      return { action: "Changed safety flag", module: "community", detail: fromTo };
    default:
      return { action: row.action.replace(/_/g, " "), module: "settings", detail: "" };
  }
}

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).default(500),
});

/** GET /api/admin/audit-log?limit=500 */
export async function listAuditLog(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;
  const { supabase } = guard;

  const query = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!query.success) return invalidInput();

  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("id, action, target_table, target_id, details, created_at, admin:profiles!admin_audit_log_admin_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(query.data.limit)
    .returns<AuditRow[]>();
  if (error) return fail("server_error", "We could not load the audit log.", 500);

  const rows = data ?? [];
  const idsFor = (table: string) => [
    ...new Set(rows.filter((row) => row.target_table === table && row.target_id).map((row) => row.target_id as string)),
  ];
  const personIds = [...new Set([...idsFor("profiles"), ...idsFor("professional_profiles")])];
  const applicationIds = idsFor("professional_applications");

  // Names only, so each line says who it was about.
  const [people, applications] = await Promise.all([
    personIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", personIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    applicationIds.length
      ? supabase.from("professional_applications").select("id, full_name").in("id", applicationIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
  ]);
  const names = new Map<string, string>();
  for (const person of people.data ?? []) names.set(person.id, person.full_name ?? "Account");
  for (const application of applications.data ?? []) names.set(application.id, application.full_name);

  const entries: AdminAuditEntry[] = rows.map((row) => {
    const admin = Array.isArray(row.admin) ? row.admin[0] : row.admin;
    const { action, module, detail } = describe(row);
    const targetLabel =
      row.target_table === "crisis_resources"
        ? "Crisis helplines"
        : row.target_table === "safety_flags"
          ? "Safety flag"
          : (row.target_id && names.get(row.target_id)) || "Deleted account";
    return {
      id: row.id,
      // No admin means the change was made in the Supabase dashboard.
      actorName: admin?.full_name ?? (row.admin === null ? "Supabase dashboard" : "Admin"),
      module,
      action,
      kmAction: action,
      targetLabel,
      detail,
      createdAt: row.created_at,
    };
  });

  return json({ entries });
}
