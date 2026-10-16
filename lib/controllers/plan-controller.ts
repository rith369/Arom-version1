import type { NextRequest } from "next/server";
import { z } from "zod";
import { cambodiaDay } from "@/lib/mood";
import {
  PLAN_STARTERS,
  editPlanTaskSchema,
  newPlanTaskSchema,
  planCheckSchema,
  planOrderSchema,
  weekdayOf,
  type PlanRepeat,
  type PlanResponse,
  type PlanSource,
  type PlanTask,
} from "@/lib/plan";
import { createClient } from "@/lib/supabase/server";
import { databaseError, fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * Your Plan For Today (BACKEND-HANDOFF.md section 27). Runs as the signed in
 * person: RLS on plan_tasks, plan_task_checks and plan_starts allows only
 * their own rows. No professional or admin access. Never log task text.
 */

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

type Session = NonNullable<Awaited<ReturnType<typeof signedIn>>>;

const COLUMNS =
  "id, item_key, source, title, title_km, subtitle, subtitle_km, href, icon, repeat, weekdays, once_day, sort_order";

interface TaskRow {
  id: string;
  item_key: string;
  source: PlanSource;
  title: string;
  title_km: string | null;
  subtitle: string | null;
  subtitle_km: string | null;
  href: string | null;
  icon: string | null;
  repeat: PlanRepeat;
  weekdays: number[] | null;
  once_day: string | null;
  sort_order: number;
}

function toTask(row: TaskRow, done: Set<string>): PlanTask {
  return {
    id: row.id,
    itemKey: row.item_key,
    source: row.source,
    title: row.title,
    titleKm: row.title_km ?? "",
    subtitle: row.subtitle ?? "",
    subtitleKm: row.subtitle_km ?? "",
    href: row.href,
    icon: row.icon,
    repeat: row.repeat,
    weekdays: row.weekdays ?? [],
    onceDay: row.once_day,
    sortOrder: row.sort_order,
    doneToday: done.has(row.id),
  };
}

const today = () => cambodiaDay(Date.now());

/** The repeat columns for a task: unused ones are null, as the table requires. */
function repeatColumns(repeat: PlanRepeat, weekdays: number[] | undefined, day: string) {
  return {
    repeat,
    weekdays: repeat === "weekdays" ? [...new Set(weekdays)].sort() : null,
    once_day: repeat === "once" ? day : null,
  };
}

/** Gives the starter tasks the first time only, so deleting them all is final. */
async function ensureStarted(session: Session) {
  const { data: started, error } = await session.supabase
    .from("plan_starts")
    .upsert({ user_id: session.userId }, { onConflict: "user_id", ignoreDuplicates: true })
    .select("user_id");
  if (error || !started?.length) return;

  await session.supabase.from("plan_tasks").upsert(
    PLAN_STARTERS.map((task, index) => ({
      user_id: session.userId,
      item_key: task.itemKey,
      source: task.source,
      title: task.title,
      title_km: task.titleKm || null,
      subtitle: task.subtitle || null,
      subtitle_km: task.subtitleKm || null,
      href: task.href ?? null,
      icon: task.icon ?? null,
      repeat: "daily",
      sort_order: index,
    })),
    { onConflict: "user_id,item_key", ignoreDuplicates: true },
  );
}

async function loadPlan(session: Session) {
  const day = today();
  // "Today only" tasks from earlier days are finished with; remove them.
  await session.supabase.from("plan_tasks").delete().eq("repeat", "once").lt("once_day", day);

  const [tasks, checks] = await Promise.all([
    session.supabase
      .from("plan_tasks")
      .select(COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<TaskRow[]>(),
    session.supabase.from("plan_task_checks").select("task_id").eq("day", day).returns<{ task_id: string }[]>(),
  ]);
  if (tasks.error || checks.error) return null;

  const done = new Set((checks.data ?? []).map((row) => row.task_id));
  return { day, weekday: weekdayOf(day), tasks: (tasks.data ?? []).map((row) => toTask(row, done)) };
}

/** GET /api/plan: the person's tasks, with which are done today. */
export async function getPlan() {
  const session = await signedIn();
  if (!session) return unauthorized();

  await ensureStarted(session);
  const plan = await loadPlan(session);
  if (!plan) return fail("server_error", "We could not load your plan.", 500);
  return json<PlanResponse>(plan);
}

/** POST /api/plan/tasks: adds one task at the end of the list. */
export async function createPlanTask(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = newPlanTaskSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();
  const task = body.data;

  const { data: last } = await session.supabase
    .from("plan_tasks")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();

  const { data, error } = await session.supabase
    .from("plan_tasks")
    .insert({
      user_id: session.userId,
      item_key: task.itemKey ?? `custom:${crypto.randomUUID()}`,
      source: task.source,
      title: task.title,
      title_km: task.titleKm || null,
      subtitle: task.subtitle || null,
      subtitle_km: task.subtitleKm || null,
      href: task.href,
      icon: task.icon,
      ...repeatColumns(task.repeat, task.weekdays, today()),
      sort_order: (last?.sort_order ?? -1) + 1,
    })
    .select(COLUMNS)
    .single<TaskRow>();
  if (error) {
    if (error.code === "23505") return fail("invalid_input", "This is already in your plan.", 409);
    return databaseError(error, "The task could not be added. Please try again.");
  }
  return json<PlanTask>(toTask(data, new Set()), 201);
}

const idSchema = z.string().uuid();

/** PATCH /api/plan/tasks/:id: renames a task or changes how often it repeats. */
export async function updatePlanTask(taskId: string, request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const id = idSchema.safeParse(taskId);
  const body = editPlanTaskSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { data, error } = await session.supabase
    .from("plan_tasks")
    .update({
      title: body.data.title,
      title_km: body.data.titleKm || null,
      ...repeatColumns(body.data.repeat, body.data.weekdays, today()),
    })
    .eq("id", id.data)
    .select(COLUMNS)
    .maybeSingle<TaskRow>();
  if (error) return databaseError(error, "The task could not be saved. Please try again.");
  if (!data) return fail("invalid_input", "Not found.", 404);

  const { data: check } = await session.supabase
    .from("plan_task_checks")
    .select("task_id")
    .eq("task_id", data.id)
    .eq("day", today())
    .maybeSingle();
  return json<PlanTask>(toTask(data, new Set(check ? [data.id] : [])));
}

/** DELETE /api/plan/tasks/:id: removes a task and its checks. */
export async function deletePlanTask(taskId: string) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const id = idSchema.safeParse(taskId);
  if (!id.success) return invalidInput();

  const { data, error } = await session.supabase.from("plan_tasks").delete().eq("id", id.data).select("id");
  if (error) return fail("server_error", "The task could not be removed. Please try again.", 500);
  if (!data?.length) return fail("invalid_input", "Not found.", 404);
  return json({ ok: true });
}

/** PUT /api/plan/tasks/:id/check `{ done }`: ticks or unticks a task for today. */
export async function setPlanTaskDone(taskId: string, request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const id = idSchema.safeParse(taskId);
  const body = planCheckSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const day = today();
  const { error } = body.data.done
    ? await session.supabase
        .from("plan_task_checks")
        .upsert({ task_id: id.data, user_id: session.userId, day }, { onConflict: "task_id,day", ignoreDuplicates: true })
    : await session.supabase.from("plan_task_checks").delete().eq("task_id", id.data).eq("day", day);
  // RLS refuses a task that is not the person's own (42501).
  if (error) return fail("server_error", "That could not be saved. Please try again.", 500);
  return json({ ok: true, done: body.data.done });
}

/** PUT /api/plan/order `{ ids }`: saves the order the person chose. */
export async function reorderPlan(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = planOrderSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const results = await Promise.all(
    body.data.ids.map((id, index) => session.supabase.from("plan_tasks").update({ sort_order: index }).eq("id", id)),
  );
  if (results.some((result) => result.error)) {
    return fail("server_error", "The new order could not be saved. Please try again.", 500);
  }
  return json({ ok: true });
}
