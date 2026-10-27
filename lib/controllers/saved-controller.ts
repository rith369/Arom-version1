import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  SAVED_KINDS,
  lessonProgressSaveSchema,
  savedChangeSchema,
  savedImportSchema,
  type LessonProgress,
  type LessonProgressResponse,
  type SavedIds,
  type SavedKind,
  type SavedResponse,
} from "@/lib/saved";
import { databaseError, fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * Saved items and lesson progress (BACKEND-HANDOFF.md section 30). Runs as the
 * signed in person: RLS on saved_items and lesson_progress allows only their
 * own rows. No professional or admin access. Never log answers.
 */

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

type Session = NonNullable<Awaited<ReturnType<typeof signedIn>>>;

async function loadSaved(session: Session): Promise<SavedIds | null> {
  const { data, error } = await session.supabase
    .from("saved_items")
    .select("kind, item_id")
    .order("created_at", { ascending: true })
    .returns<{ kind: SavedKind; item_id: string }[]>();
  if (error) return null;

  const saved = Object.fromEntries(SAVED_KINDS.map((kind) => [kind, [] as string[]])) as SavedIds;
  for (const row of data ?? []) saved[row.kind]?.push(row.item_id);
  return saved;
}

async function savedReply(session: Session) {
  const saved = await loadSaved(session);
  if (!saved) return fail("server_error", "We could not load your saved items.", 500);
  return json<SavedResponse>({ saved });
}

/** GET /api/saved: the person's saved ids of each kind, oldest first. */
export async function getSaved() {
  const session = await signedIn();
  if (!session) return unauthorized();
  return savedReply(session);
}

/** PUT /api/saved `{ kind, id, saved }`: saves or removes one item. */
export async function setSaved(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = savedChangeSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();
  const { kind, id, saved } = body.data;

  const { error } = saved
    ? await session.supabase
        .from("saved_items")
        .upsert({ user_id: session.userId, kind, item_id: id }, { onConflict: "user_id,kind,item_id", ignoreDuplicates: true })
    : await session.supabase.from("saved_items").delete().eq("kind", kind).eq("item_id", id);
  if (error) return databaseError(error, "That could not be saved. Please try again.");
  return json({ ok: true, saved });
}

/** POST /api/saved `{ items }`: adds items kept in the browser before logging in. */
export async function importSaved(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = savedImportSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await session.supabase.from("saved_items").upsert(
    body.data.items.map((item) => ({ user_id: session.userId, kind: item.kind, item_id: item.id })),
    { onConflict: "user_id,kind,item_id", ignoreDuplicates: true },
  );
  if (error) return databaseError(error, "Your saved items could not be moved. Please try again.");
  return savedReply(session);
}

interface ProgressRow {
  lesson_id: string;
  completed_sections: number;
  total_sections: number;
  is_complete: boolean;
  last_visited_section: number;
  quiz_answer: string | null;
  reflection_answer: string | null;
}

function toProgress(row: ProgressRow): LessonProgress {
  return {
    completedSections: row.completed_sections,
    totalSections: row.total_sections,
    isComplete: row.is_complete,
    lastVisitedSection: row.last_visited_section,
    ...(row.quiz_answer ? { quizAnswer: row.quiz_answer } : {}),
    ...(row.reflection_answer ? { reflectionAnswer: row.reflection_answer } : {}),
  };
}

async function progressReply(session: Session) {
  const { data, error } = await session.supabase
    .from("lesson_progress")
    .select("lesson_id, completed_sections, total_sections, is_complete, last_visited_section, quiz_answer, reflection_answer")
    .returns<ProgressRow[]>();
  if (error) return fail("server_error", "We could not load your lesson progress.", 500);
  return json<LessonProgressResponse>({
    progress: Object.fromEntries((data ?? []).map((row) => [row.lesson_id, toProgress(row)])),
  });
}

/** GET /api/lesson-progress: progress by lesson id. */
export async function getLessonProgress() {
  const session = await signedIn();
  if (!session) return unauthorized();
  return progressReply(session);
}

/** PUT /api/lesson-progress `{ items, keepExisting? }`: saves progress for one or more lessons. */
export async function saveLessonProgress(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = lessonProgressSaveSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await session.supabase.from("lesson_progress").upsert(
    body.data.items.map(({ lessonId, progress }) => ({
      user_id: session.userId,
      lesson_id: lessonId,
      completed_sections: progress.completedSections,
      total_sections: progress.totalSections,
      is_complete: progress.isComplete,
      last_visited_section: progress.lastVisitedSection,
      quiz_answer: progress.quizAnswer ?? null,
      reflection_answer: progress.reflectionAnswer ?? null,
    })),
    { onConflict: "user_id,lesson_id", ignoreDuplicates: body.data.keepExisting === true },
  );
  if (error) return databaseError(error, "Your progress could not be saved. Please try again.");
  return progressReply(session);
}
