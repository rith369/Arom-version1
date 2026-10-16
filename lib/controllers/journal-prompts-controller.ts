import type { NextRequest } from "next/server";
import { z } from "zod";
import { journalPromptSchema, type JournalPrompt } from "@/lib/journal";
import { createClient } from "@/lib/supabase/server";
import { databaseError, fail, invalidInput, json, readJson } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM journal prompts (BACKEND-HANDOFF.md section 26).
 * Everyone reads the active ones, which the journal page shows as its
 * guided questions. Only admins change them, through save_journal_prompt().
 */

const COLUMNS = "id, question, question_km, placeholder, placeholder_km, sort_order, is_active";

interface PromptRow {
  id: string;
  question: string;
  question_km: string;
  placeholder: string;
  placeholder_km: string;
  sort_order: number;
  is_active: boolean;
}

function toPrompt(row: PromptRow): JournalPrompt {
  return {
    id: row.id,
    question: row.question,
    kmQuestion: row.question_km,
    placeholder: row.placeholder,
    kmPlaceholder: row.placeholder_km,
    order: row.sort_order,
    isActive: row.is_active,
  };
}

const saveSchema = z.object({ prompt: journalPromptSchema });

/** GET /api/journal-prompts: active prompts in display order. Public. */
export async function listActivePrompts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_prompts")
    .select(COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<PromptRow[]>();
  if (error) return fail("server_error", "We could not load journal questions.", 500);

  return json({ prompts: (data ?? []).map(toPrompt) });
}

/** GET /api/admin/journal-prompts: every prompt, inactive ones included. */
export async function listAllPrompts() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase
    .from("journal_prompts")
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .returns<PromptRow[]>();
  if (error) return fail("server_error", "We could not load journal prompts.", 500);

  return json({ prompts: (data ?? []).map(toPrompt) });
}

/** PUT /api/admin/journal-prompts  body `{ prompt: JournalPrompt }`. Adds or updates one. */
export async function savePrompt(request: NextRequest) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const body = saveSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await guard.supabase.rpc("save_journal_prompt", {
    p_item: body.data.prompt,
  });
  if (error) return databaseError(error, "The prompt could not be saved. Please try again.");

  return listAllPrompts();
}
