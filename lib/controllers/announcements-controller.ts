import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  ANNOUNCEMENT_MAX_LENGTH,
  isValidAppLink,
  type Announcement,
} from "@/app/_components/announcements";
import { createClient } from "@/lib/supabase/server";
import { databaseError, fail, invalidInput, json, readJson } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM announcements (BACKEND-HANDOFF.md section 15). Everyone reads the
 * newest running one. Only admins publish and end them, through
 * publish_announcement() and end_announcement(), both audit logged.
 */

const COLUMNS =
  "id, text_km, text_en, tone, link, created_at, ends_at, ended_at, creator:profiles!announcements_created_by_fkey(full_name)";

interface AnnouncementRow {
  id: string;
  text_km: string;
  text_en: string;
  tone: Announcement["tone"];
  link: string;
  created_at: string;
  ends_at: string | null;
  ended_at: string | null;
  creator: { full_name: string | null } | null;
}

function toAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    kmText: row.text_km,
    enText: row.text_en,
    tone: row.tone,
    link: row.link,
    createdAt: row.created_at,
    createdBy: row.creator?.full_name || "Admin",
    endsAt: row.ends_at,
    endedAt: row.ended_at,
  };
}

/** GET /api/announcements/current: the newest running one, or null. Public. */
export async function getCurrentAnnouncement() {
  const supabase = await createClient();
  // RLS returns only running announcements to everyone but admins.
  const { data, error } = await supabase
    .from("announcements")
    .select("id, text_km, text_en, tone, link, created_at, ends_at, ended_at")
    .is("ended_at", null)
    .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Omit<AnnouncementRow, "creator">>();
  if (error) return fail("server_error", "The announcement could not be loaded.", 500);

  // The banner never shows who wrote it.
  return json({ announcement: data ? { ...toAnnouncement({ ...data, creator: null }), createdBy: "" } : null });
}

/** GET /api/admin/announcements: every announcement, newest first. */
export async function listAnnouncements() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase
    .from("announcements")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<AnnouncementRow[]>();
  if (error) return fail("server_error", "Announcements could not be loaded.", 500);
  return json({ announcements: (data ?? []).map(toAnnouncement) });
}

const publishSchema = z.object({
  kmText: z.string().trim().min(1).max(ANNOUNCEMENT_MAX_LENGTH),
  enText: z.string().trim().max(ANNOUNCEMENT_MAX_LENGTH),
  tone: z.enum(["info", "good", "important"]),
  link: z
    .string()
    .trim()
    .max(200)
    .refine((value) => value === "" || isValidAppLink(value)),
  endsAt: z.string().datetime({ offset: true }).nullable(),
});

/** POST /api/admin/announcements `{ kmText, enText, tone, link, endsAt }`. */
export async function publishAnnouncement(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const body = publishSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await guard.supabase.rpc("publish_announcement", {
    p_text_km: body.data.kmText,
    p_text_en: body.data.enText,
    p_tone: body.data.tone,
    p_link: body.data.link,
    p_ends_at: body.data.endsAt,
  });
  if (error) return databaseError(error, "The announcement could not be published. Please try again.");
  return listAnnouncements();
}

/** POST /api/admin/announcements/:id/end */
export async function endAnnouncement(announcementId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = z.string().uuid().safeParse(announcementId);
  if (!id.success) return invalidInput();

  const { error } = await guard.supabase.rpc("end_announcement", { p_id: id.data });
  if (error) return databaseError(error, "The announcement could not be ended. Please try again.");
  return listAnnouncements();
}
