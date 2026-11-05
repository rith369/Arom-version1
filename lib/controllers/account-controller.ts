import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { deleteAccountSchema } from "@/lib/auth";
import { LIMITS, clearRateLimit, overLimit } from "@/lib/rate-limit";
import { createPrivateStorageClient } from "@/lib/supabase/private-storage";
import { createClient } from "@/lib/supabase/server";
import { passwordIsRight } from "./auth-controller";
import { NO_STORE, fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * Export and delete of a person's own account (BACKEND-HANDOFF.md section 41).
 *
 * Export runs as the signed in person, so RLS and the *_safe functions decide
 * what can be read. Always filter by the person's id as well: an admin's RLS can
 * see more than their own rows. Therapist notes are never included.
 *
 * Delete uses the server only secret key, after checking who is asking. Never
 * log what is exported or deleted, only the error code.
 */

type Row = Record<string, unknown>;

const RECENT_LOGIN_SECONDS = 15 * 60;

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

/** Rows the person owns. Throws, because an export must not quietly leave things out. */
async function ownRows(supabase: SupabaseClient, table: string, column: string, id: string) {
  const { data, error } = await supabase.from(table).select("*").eq(column, id);
  if (error) throw new Error(`export:${table}:${error.code}`);
  return (data ?? []) as Row[];
}

async function rowsIn(supabase: SupabaseClient, table: string, column: string, ids: unknown[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from(table).select("*").in(column, ids as string[]);
  if (error) throw new Error(`export:${table}:${error.code}`);
  return (data ?? []) as Row[];
}

async function rpcRows(supabase: SupabaseClient, fn: string, args?: Record<string, unknown>) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(`export:${fn}:${error.code}`);
  return (data ?? []) as Row[];
}

/** GET /api/account/export: everything the person can read about themselves, as a file. */
export async function exportAccount() {
  const session = await signedIn();
  if (!session) return unauthorized();
  const { supabase, user } = session;
  const id = user.id;

  try {
    const [
      profile,
      journal,
      journalSummary,
      moods,
      screening,
      surveys,
      insights,
      supportJourneys,
      appointments,
      clinicRequests,
      planItems,
      planTasks,
      planChecks,
      planStarts,
      saved,
      lessons,
      activity,
      contentActivity,
      careTasks,
      careSharing,
      suggestions,
      reviews,
      applications,
      groupMemberships,
      groupMessages,
      selfMap,
      selfMapShares,
      childhoodAnswers,
    ] = await Promise.all([
      ownRows(supabase, "profiles", "id", id),
      ownRows(supabase, "journal_entries", "user_id", id),
      ownRows(supabase, "journal_ai_summaries", "user_id", id),
      ownRows(supabase, "mood_checkins", "user_id", id),
      ownRows(supabase, "symptom_checks", "user_id", id),
      ownRows(supabase, "onboarding_surveys", "user_id", id),
      ownRows(supabase, "mental_health_insights", "user_id", id),
      ownRows(supabase, "support_journeys", "user_id", id),
      ownRows(supabase, "appointments", "user_id", id),
      ownRows(supabase, "clinic_booking_requests", "user_id", id),
      ownRows(supabase, "plan_items", "user_id", id),
      ownRows(supabase, "plan_tasks", "user_id", id),
      ownRows(supabase, "plan_task_checks", "user_id", id),
      ownRows(supabase, "plan_starts", "user_id", id),
      ownRows(supabase, "saved_items", "user_id", id),
      ownRows(supabase, "lesson_progress", "user_id", id),
      ownRows(supabase, "activity_log", "user_id", id),
      ownRows(supabase, "user_content_activity", "user_id", id),
      ownRows(supabase, "care_tasks", "client_id", id),
      ownRows(supabase, "care_sharing", "client_id", id),
      ownRows(supabase, "session_suggestions", "client_id", id),
      ownRows(supabase, "professional_reviews", "user_id", id),
      ownRows(supabase, "professional_applications", "user_id", id),
      ownRows(supabase, "group_members", "user_id", id),
      ownRows(supabase, "community_messages", "author_id", id),
      rpcRows(supabase, "my_self_map"),
      rpcRows(supabase, "my_self_map_shares"),
      rpcRows(supabase, "my_ace_intakes"),
    ]);

    const [intakeAnswers, careCheckIns] = await Promise.all([
      rowsIn(supabase, "intake_answers", "appointment_id", appointments.map((row) => row.id)),
      rowsIn(supabase, "care_check_ins", "task_id", careTasks.map((row) => row.id)),
    ]);

    // Private chats with professionals, newest 300 messages of each.
    const conversations = await rpcRows(supabase, "my_conversations_safe", { p_as: "client" });
    const privateChats = await Promise.all(
      conversations
        .filter((chat) => chat.conversation_id)
        .map(async (chat) => ({
          professional: chat.display_name,
          messages: await rpcRows(supabase, "read_private_messages_safe", {
            p_conversation_id: chat.conversation_id,
            p_limit: 300,
          }),
        })),
    );

    // Chats with clinic desks, newest 300 messages of each.
    const clinics = await rpcRows(supabase, "my_clinic_chats");
    const clinicChats = await Promise.all(
      clinics.map(async (chat) => ({
        clinic: chat.clinic_name,
        messages: await rpcRows(supabase, "read_my_clinic_chat", { p_slug: chat.clinic_slug, p_limit: 300 }),
      })),
    );

    const body = {
      about: {
        exportedAt: new Date().toISOString(),
        note: "Your data from AROM. Keep this file safe: it holds private information. Voice messages, photos and PDFs are listed by name but are not inside this file. Your therapist's private notes are not included.",
      },
      account: {
        id,
        email: user.email ?? null,
        createdAt: user.created_at,
        loginMethods: (user.identities ?? []).map((identity) => identity.provider),
        profile: profile[0] ?? null,
      },
      journal: { entries: journal, weeklySummary: journalSummary[0] ?? null },
      moods,
      screeningResults: screening,
      onboarding: { surveys, insights, supportJourneys },
      selfMap: { parts: selfMap, sharedWith: selfMapShares },
      childhoodExperienceAnswers: childhoodAnswers,
      bookings: { appointments, intakeAnswers, clinicRequests, sessionSuggestions: suggestions },
      care: { tasks: careTasks, checkIns: careCheckIns, sharing: careSharing },
      plan: { items: planItems, tasks: planTasks, checks: planChecks, starts: planStarts },
      learning: { saved, lessons, activity, contentActivity },
      messages: { privateChats, clinicChats },
      groups: { memberships: groupMemberships, messagesYouSent: groupMessages },
      reviewsYouWrote: reviews,
      professionalApplications: applications,
    };

    const day = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(body, null, 2), {
      status: 200,
      headers: {
        ...NO_STORE,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="arom-my-data-${day}.json"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    // The message holds only the table and an error code, never data.
    console.error("Account export failed:", error instanceof Error ? error.message : "unknown");
    return fail("server_error", "Your data could not be prepared. Please try again.", 500);
  }
}

/** True when this session logged in a short time ago, so deleting needs no password. */
async function loggedInRecently(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getClaims();
  const entries: unknown = data?.claims?.amr;
  if (!Array.isArray(entries)) return false;
  const now = Math.floor(Date.now() / 1000);
  return entries.some((entry: unknown) => {
    if (typeof entry !== "object" || entry === null) return false;
    const { timestamp } = entry as { timestamp?: unknown };
    return typeof timestamp === "number" && now - timestamp < RECENT_LOGIN_SECONDS;
  });
}

const FILE_BUCKETS = {
  voice: "message-voice",
  attachments: "message-attachments",
  community: "community-media",
  profilePhotos: "user-profile-photos",
  proPhotos: "professional-photos",
  licenses: "licenses",
} as const;

type Bucket = (typeof FILE_BUCKETS)[keyof typeof FILE_BUCKETS];

/** Every path in a folder, including uploads that never became a message. */
async function listFolder(service: SupabaseClient, bucket: Bucket, folder: string) {
  const { data, error } = await service.storage.from(bucket).list(folder, { limit: 1000 });
  if (error) throw new Error(`files:list:${bucket}`);
  return (data ?? []).filter((item) => item.id).map((item) => `${folder}/${item.name}`);
}

async function selectRows(service: SupabaseClient, table: string, columns: string, column: string, value: string) {
  const { data, error } = await service.from(table).select(columns).eq(column, value);
  if (error) throw new Error(`files:${table}:${error.code}`);
  return (data ?? []) as unknown as Row[];
}

async function selectRowsIn(service: SupabaseClient, table: string, columns: string, column: string, values: string[]) {
  if (values.length === 0) return [];
  const { data, error } = await service.from(table).select(columns).in(column, values);
  if (error) throw new Error(`files:${table}:${error.code}`);
  return (data ?? []) as unknown as Row[];
}

const asPath = (value: unknown) => (typeof value === "string" && value ? value : null);

/**
 * Removes the person's files. Deleting the account removes database rows but
 * not files, so this runs first. Both sides of their private and clinic chats
 * go, because those chats are deleted too.
 */
async function removeFiles(service: SupabaseClient, userId: string) {
  const paths = new Map<Bucket, Set<string>>();
  const add = (bucket: Bucket, path: string | null) => {
    if (!path) return;
    if (!paths.has(bucket)) paths.set(bucket, new Set());
    paths.get(bucket)?.add(path);
  };

  const conversations = await selectRows(service, "conversations", "id", "client_id", userId);
  const conversationIds = conversations.map((row) => String(row.id));
  const messages = await selectRowsIn(service, "messages", "audio_path, attachment_path", "conversation_id", conversationIds);
  for (const row of messages) {
    add(FILE_BUCKETS.voice, asPath(row.audio_path));
    add(FILE_BUCKETS.attachments, asPath(row.attachment_path));
  }

  const clinicChats = await selectRows(service, "clinic_conversations", "id", "user_id", userId);
  const clinicMessages = await selectRowsIn(
    service,
    "clinic_messages",
    "audio_path, attachment_path",
    "conversation_id",
    clinicChats.map((row) => String(row.id)),
  );
  for (const row of clinicMessages) {
    add(FILE_BUCKETS.voice, asPath(row.audio_path));
    add(FILE_BUCKETS.attachments, asPath(row.attachment_path));
  }

  const groupMessages = await selectRows(service, "community_messages", "group_id, attachment_path", "author_id", userId);
  for (const row of groupMessages) add(FILE_BUCKETS.community, asPath(row.attachment_path));

  // Uploads that never became a message, kept in folders named after the person.
  const memberships = await selectRows(service, "group_members", "group_id", "user_id", userId);
  const groupIds = new Set([...memberships, ...groupMessages].map((row) => String(row.group_id)));
  const folders: [Bucket, string][] = [
    [FILE_BUCKETS.profilePhotos, userId],
    [FILE_BUCKETS.proPhotos, userId],
    [FILE_BUCKETS.licenses, userId],
    ...conversationIds.flatMap((id): [Bucket, string][] => [
      [FILE_BUCKETS.voice, `${id}/${userId}`],
      [FILE_BUCKETS.attachments, `${id}/${userId}`],
    ]),
    ...[...groupIds].map((id): [Bucket, string] => [FILE_BUCKETS.community, `${id}/${userId}`]),
  ];
  for (const [bucket, folder] of folders) {
    for (const path of await listFolder(service, bucket, folder)) add(bucket, path);
  }

  for (const [bucket, set] of paths) {
    const list = [...set];
    for (let start = 0; start < list.length; start += 100) {
      const { error } = await service.storage.from(bucket).remove(list.slice(start, start + 100));
      if (error) throw new Error(`files:remove:${bucket}`);
    }
  }
}

/** Why this account cannot be deleted yet, or null when it can. */
async function deleteBlocker(service: SupabaseClient, user: User) {
  const { data: profile, error: profileError } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string }>();
  if (profileError || !profile) {
    return fail("server_error", "Your account could not be deleted. Please try again.", 500);
  }

  const staffMessage = "This account helps other people, so its removal must be done by the AROM team. Please contact AROM support.";
  // Deleting a professional would also delete their clients' bookings and notes.
  if (profile.role !== "user") return fail("staff_account", staffMessage, 403);

  const [{ count: clients, error: clientsError }, { count: groups, error: groupsError }] = await Promise.all([
    service.from("appointments").select("id", { count: "exact", head: true }).eq("professional_id", user.id),
    service.from("support_groups").select("id", { count: "exact", head: true }).eq("mentor_id", user.id),
  ]);
  if (clientsError || groupsError) {
    return fail("server_error", "Your account could not be deleted. Please try again.", 500);
  }
  // A former professional or mentor, whose role is now "user".
  if ((clients ?? 0) > 0 || (groups ?? 0) > 0) return fail("staff_account", staffMessage, 403);

  const { count: upcoming, error: upcomingError } = await service
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "booked")
    .gt("ends_at", new Date().toISOString());
  if (upcomingError) return fail("server_error", "Your account could not be deleted. Please try again.", 500);
  if ((upcoming ?? 0) > 0) {
    return fail(
      "upcoming_sessions",
      "You have an upcoming session. Please cancel it first, so your therapist is not left waiting.",
      409,
    );
  }

  return null;
}

/** POST /api/account/delete  body `{ confirm: "DELETE", password? }`. Permanent. */
export async function deleteAccount(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();
  const { supabase, user } = session;

  const parsed = deleteAccountSchema.safeParse(await readJson(request));
  if (!parsed.success) return invalidInput();

  // A left open browser is not enough: prove it is really them.
  if (parsed.data.password) {
    const limited = await overLimit([
      { name: "password-check", value: user.id, limit: LIMITS.passwordCheckPerUser },
    ]);
    if (limited) return fail("rate_limited", "Too many attempts. Please wait 15 minutes and try again.", 429);

    const check = user.email ? await passwordIsRight(user.email, parsed.data.password) : "wrong";
    if (check === "rate_limited") {
      return fail("rate_limited", "Too many attempts. Please wait a moment and try again.", 429);
    }
    if (check === "wrong") return fail("invalid_credentials", "That password is not right.", 400);
    await clearRateLimit("password-check", user.id);
  } else if (!(await loggedInRecently(supabase))) {
    return fail("reauth_required", "For your safety, please log out, log in again, and then try within 15 minutes.", 403);
  }

  let service: SupabaseClient;
  try {
    service = createPrivateStorageClient();
  } catch {
    return fail("server_error", "Your account could not be deleted right now. Please try again later.", 503);
  }

  const blocked = await deleteBlocker(service, user);
  if (blocked) return blocked;

  try {
    await removeFiles(service, user.id);
  } catch (error) {
    console.error("Account delete, files:", error instanceof Error ? error.message : "unknown");
    return fail("server_error", "Your account could not be deleted. Please try again.", 500);
  }

  const { error: deleteError } = await service.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Account delete, user:", deleteError.code ?? "unknown");
    return fail("server_error", "Your account could not be deleted. Please try again.", 500);
  }

  // Only that it happened, with no name or email.
  const { error: auditError } = await service.from("admin_audit_log").insert({
    admin_id: null,
    action: "account_deleted_by_owner",
    target_table: "profiles",
    target_id: user.id,
    details: {},
  });
  if (auditError) console.error("Account delete, audit:", auditError.code);

  // The account is gone, so this only clears the cookies in this browser.
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);

  return json({ ok: true });
}
