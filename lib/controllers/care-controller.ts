import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  MAX_TASK_NOTE,
  MAX_TASK_TITLE,
  isPublishedMindGuide,
  sharingKey,
  type CareCheckIn,
  type CarePlanResponse,
  type CareProfessional,
  type CareTask,
  type CareWeekday,
} from "@/lib/care";
import { createClient } from "@/lib/supabase/server";
import { fail, invalidInput, json, readJson, unauthorized } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM care plan controller (BACKEND-HANDOFF.md section 18). Runs as the
 * signed in person: RLS returns a task only to its client and professional,
 * and check ins to the professional only while the client shares progress.
 * Every write goes through a security definer function. No admin access.
 * Never log task titles, notes or check ins.
 */

const TASK_COLUMNS =
  "id, professional_id, client_id, appointment_id, kind, mindguide_type, mindguide_item_id, title, note, repeat_days, start_date, end_date, reminder_time, created_at, stopped_at";

interface TaskRow {
  id: string;
  professional_id: string;
  client_id: string;
  appointment_id: string | null;
  kind: CareTask["kind"];
  mindguide_type: "lesson" | "tip" | "practice" | null;
  mindguide_item_id: string | null;
  title: string;
  note: string;
  repeat_days: number[] | null;
  start_date: string;
  end_date: string | null;
  reminder_time: string | null;
  created_at: string;
  stopped_at: string | null;
}

function toTask(row: TaskRow, slugOf: (id: string) => string): CareTask {
  return {
    id: row.id,
    professionalId: slugOf(row.professional_id),
    clientId: row.client_id,
    bookingId: row.appointment_id,
    kind: row.kind,
    mindguide:
      row.kind === "mindguide" && row.mindguide_type && row.mindguide_item_id
        ? { type: row.mindguide_type, itemId: row.mindguide_item_id }
        : null,
    title: row.title,
    note: row.note,
    repeat: row.repeat_days
      ? { type: "days", days: [...row.repeat_days].sort((a, b) => a - b) as CareWeekday[] }
      : { type: "once" },
    startDate: row.start_date,
    endDate: row.end_date,
    reminderTime: row.reminder_time ? row.reminder_time.slice(0, 5) : null,
    createdAt: row.created_at,
    stoppedAt: row.stopped_at,
  };
}

async function loadCheckIns(supabase: SupabaseClient, taskIds: string[]): Promise<CareCheckIn[] | null> {
  if (taskIds.length === 0) return [];
  const { data, error } = await supabase
    .from("care_check_ins")
    .select("task_id, check_date, done_at")
    .in("task_id", taskIds);
  if (error) return null;
  return (data ?? []).map((row) => ({ taskId: row.task_id, date: row.check_date, doneAt: row.done_at }));
}

function ruleError(error: PostgrestError) {
  if (error.code === "PT403") return fail("forbidden", error.message, 403);
  if (error.code === "PT404") return fail("invalid_input", "Not found.", 404);
  if (error.code === "22023") return fail("invalid_input", error.message, 400);
  return fail("server_error", "That could not be saved.", 500);
}

// ---------------------------------------------------------------------------
// Client side
// ---------------------------------------------------------------------------

interface ProfessionalRow {
  id: string;
  slug: string;
  display_name: string;
  display_name_km: string | null;
  photo_url: string | null;
}

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

async function myProfessionals(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc("my_care_professionals");
  if (error) return null;
  return (data ?? []) as ProfessionalRow[];
}

async function loadClientPlan(supabase: SupabaseClient, userId: string): Promise<CarePlanResponse | null> {
  const [tasks, professionals, sharing] = await Promise.all([
    supabase
      .from("care_tasks")
      .select(TASK_COLUMNS)
      .eq("client_id", userId)
      .order("created_at", { ascending: false })
      .limit(300)
      .returns<TaskRow[]>(),
    myProfessionals(supabase),
    supabase.from("care_sharing").select("professional_id, share_progress").eq("client_id", userId),
  ]);
  if (tasks.error || !professionals || sharing.error) return null;

  const slugs = new Map(professionals.map((row) => [row.id, row.slug]));
  const slugOf = (id: string) => slugs.get(id) ?? id;
  const rows = tasks.data ?? [];
  const checkIns = await loadCheckIns(
    supabase,
    rows.map((row) => row.id),
  );
  if (!checkIns) return null;

  return {
    tasks: rows.map((row) => toTask(row, slugOf)),
    checkIns,
    sharing: Object.fromEntries(
      (sharing.data ?? []).map((row) => [sharingKey(slugOf(row.professional_id), userId), row.share_progress === true]),
    ),
    professionals: professionals.map<CareProfessional>((row) => ({
      slug: row.slug,
      name: row.display_name,
      kmName: row.display_name_km ?? "",
      photoUrl: row.photo_url ?? "",
    })),
  };
}

async function respondWithClientPlan(supabase: SupabaseClient, userId: string) {
  const plan = await loadClientPlan(supabase, userId);
  if (!plan) return fail("server_error", "We could not load your care plan.", 500);
  return json<CarePlanResponse>(plan);
}

/** GET /api/care-plan: the signed in client's tasks, ticks and sharing choices. */
export async function getMyCarePlan() {
  const session = await signedIn();
  if (!session) return unauthorized();
  return respondWithClientPlan(session.supabase, session.userId);
}

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const checkInSchema = z.object({ taskId: z.string().uuid(), date, done: z.boolean() });

/** POST /api/care-plan/check-ins `{ taskId, date, done }`: tick or untick a task. */
export async function setMyCheckIn(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = checkInSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await session.supabase.rpc("set_care_check_in", {
    p_task_id: body.data.taskId,
    p_date: body.data.date,
    p_done: body.data.done,
  });
  if (error) return ruleError(error);
  return respondWithClientPlan(session.supabase, session.userId);
}

const sharingSchema = z.object({ professionalId: z.string().min(1).max(100), share: z.boolean() });

/** PUT /api/care-plan/sharing `{ professionalId (slug), share }`. */
export async function setMySharing(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = sharingSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const professionals = await myProfessionals(session.supabase);
  const professional = professionals?.find((row) => row.slug === body.data.professionalId);
  if (!professional) return fail("invalid_input", "Not found.", 404);

  const { error } = await session.supabase.rpc("set_care_sharing", {
    p_professional_id: professional.id,
    p_share: body.data.share,
  });
  if (error) return ruleError(error);
  return respondWithClientPlan(session.supabase, session.userId);
}

// ---------------------------------------------------------------------------
// Professional side
// ---------------------------------------------------------------------------

async function loadProPlan(supabase: SupabaseClient, userId: string): Promise<CarePlanResponse | null> {
  const [profile, tasks, sharing] = await Promise.all([
    supabase.from("professional_profiles").select("slug").eq("id", userId).maybeSingle<{ slug: string }>(),
    supabase
      .from("care_tasks")
      .select(TASK_COLUMNS)
      .eq("professional_id", userId)
      .order("created_at", { ascending: false })
      .limit(1000)
      .returns<TaskRow[]>(),
    supabase.from("care_sharing").select("client_id, share_progress").eq("professional_id", userId),
  ]);
  if (!profile.data || tasks.error || sharing.error) return null;

  const slug = profile.data.slug;
  const rows = tasks.data ?? [];
  // RLS returns only the ticks of clients who share them.
  const checkIns = await loadCheckIns(
    supabase,
    rows.map((row) => row.id),
  );
  if (!checkIns) return null;

  return {
    tasks: rows.map((row) => toTask(row, () => slug)),
    checkIns,
    sharing: Object.fromEntries(
      (sharing.data ?? []).map((row) => [sharingKey(slug, row.client_id), row.share_progress === true]),
    ),
    professionals: [],
  };
}

async function respondWithProPlan(supabase: SupabaseClient, userId: string) {
  const plan = await loadProPlan(supabase, userId);
  if (!plan) return fail("server_error", "We could not load care plans.", 500);
  return json<CarePlanResponse>(plan);
}

/** GET /api/pro/care: every task this professional gave, and the ticks clients share. */
export async function getProCare() {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;
  return respondWithProPlan(guard.supabase, guard.userId);
}

const weekday = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7)]);

const newTaskSchema = z
  .object({
    clientId: z.string().uuid(),
    bookingId: z.string().uuid().nullable(),
    kind: z.enum(["mindguide", "mission", "goal", "reminder"]),
    mindguide: z.object({ type: z.enum(["lesson", "tip", "practice"]), itemId: z.string().min(1).max(100) }).nullable(),
    title: z.string().trim().max(MAX_TASK_TITLE),
    note: z.string().trim().max(MAX_TASK_NOTE),
    repeat: z.discriminatedUnion("type", [
      z.object({ type: z.literal("once") }),
      z.object({ type: z.literal("days"), days: z.array(weekday).min(1).max(7) }),
    ]),
    endDate: date.nullable(),
    reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
  })
  .refine((task) => (task.kind === "mindguide" ? task.mindguide !== null : task.title.length > 0))
  .refine((task) => task.kind !== "goal" || task.endDate !== null);

/** POST /api/pro/care: give one task to a client. MindGuide items must be published. */
export async function giveCareTask(request: NextRequest) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;

  const body = newTaskSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();
  const task = body.data;
  if (task.kind === "mindguide" && task.mindguide && !isPublishedMindGuide(task.mindguide.type, task.mindguide.itemId)) {
    return fail("invalid_input", "That MindGuide item is not published.", 400);
  }

  const { error } = await guard.supabase.rpc("give_care_task", {
    p_client_id: task.clientId,
    p_appointment_id: task.bookingId,
    p_kind: task.kind,
    p_mindguide_type: task.mindguide?.type ?? null,
    p_mindguide_item_id: task.mindguide?.itemId ?? null,
    p_title: task.title,
    p_note: task.note,
    p_repeat_days: task.repeat.type === "days" ? [...new Set(task.repeat.days)] : null,
    p_end_date: task.endDate,
    p_reminder_time: task.kind === "goal" ? null : task.reminderTime,
  });
  if (error) return ruleError(error);
  return respondWithProPlan(guard.supabase, guard.userId);
}

/** POST /api/pro/care/:taskId/stop: the task leaves the client's plan and stays in past tasks. */
export async function stopCareTask(taskId: string) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;

  const id = z.string().uuid().safeParse(taskId);
  if (!id.success) return invalidInput();

  const { error } = await guard.supabase.rpc("stop_care_task", { p_task_id: id.data });
  if (error) return ruleError(error);
  return respondWithProPlan(guard.supabase, guard.userId);
}
