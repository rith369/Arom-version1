import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { ACE_LENGTH, type AceAnswer, type MyAceIntake, type MyAceResponse, type ProClientAce } from '@/lib/ace';
import { fail, invalidInput, json, readJson } from './shared';
import { requireRole } from './role-controller';

/*
 * ACE in the therapist intake (BACKEND-HANDOFF.md section 37). Every read and
 * write goes through security definer functions; the ace_intakes table has no
 * policies. Answers are never logged.
 */

function ruleError(error: PostgrestError, fallback: string) {
  if (error.code === 'PT403') return fail('forbidden', error.message, 403);
  if (error.code === 'PT404') return fail('invalid_input', 'Not found.', 404);
  if (error.code === '22023') return fail('invalid_input', error.message, 400);
  return fail('server_error', fallback, 500);
}

interface MyAceRow {
  professional_slug: string;
  asks: boolean;
  can_answer: boolean;
  answers: AceAnswer[] | null;
  updated_at: string | null;
}

async function respondWithMine(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('my_ace_intakes');
  if (error) return fail('server_error', 'We could not load these questions.', 500);
  const intakes = ((data ?? []) as MyAceRow[]).map<MyAceIntake>((row) => ({
    professionalSlug: row.professional_slug,
    asks: row.asks,
    canAnswer: row.can_answer,
    answers: row.answers,
    updatedAt: row.updated_at,
  }));
  return json<MyAceResponse>({ intakes });
}

/** GET /api/ace: the professionals who ask ACE, and the caller's own answers. */
export async function getMyAce() {
  const guard = await requireRole('user', 'professional', 'admin');
  if (!guard.ok) return guard.response;
  return respondWithMine(guard.supabase);
}

const saveSchema = z.object({
  professionalSlug: z.string().min(1).max(100),
  answers: z.array(z.boolean().nullable()).length(ACE_LENGTH),
});

/** PUT /api/ace `{ professionalSlug, answers }`: save or change, before an upcoming session. */
export async function saveMyAce(request: NextRequest) {
  const guard = await requireRole('user', 'professional', 'admin');
  if (!guard.ok) return guard.response;

  const body = saveSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await guard.supabase.rpc('save_ace_intake', {
    p_professional_slug: body.data.professionalSlug,
    p_answers: body.data.answers,
  });
  if (error) return ruleError(error, 'Your answers could not be saved.');
  return respondWithMine(guard.supabase);
}

/** DELETE /api/ace?professional=<slug>: the client deletes their answers. Allowed at any time. */
export async function deleteMyAce(request: NextRequest) {
  const guard = await requireRole('user', 'professional', 'admin');
  if (!guard.ok) return guard.response;

  const slug = z.string().min(1).max(100).safeParse(request.nextUrl.searchParams.get('professional'));
  if (!slug.success) return invalidInput();

  const { error } = await guard.supabase.rpc('delete_ace_intake', { p_professional_slug: slug.data });
  if (error) return ruleError(error, 'Your answers could not be deleted.');
  return respondWithMine(guard.supabase);
}

/** GET /api/pro/ace: whether this professional asks ACE. */
export async function getProAskAce() {
  const guard = await requireRole('professional', 'admin');
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase.rpc('my_ask_ace');
  if (error) return fail('server_error', 'We could not load this setting.', 500);
  return json({ ask: data === true });
}

/** PUT /api/pro/ace `{ ask }`: turn the questions on or off for new answers. */
export async function setProAskAce(request: NextRequest) {
  const guard = await requireRole('professional', 'admin');
  if (!guard.ok) return guard.response;

  const body = z.object({ ask: z.boolean() }).safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { data, error } = await guard.supabase.rpc('set_ask_ace', { p_ask: body.data.ask });
  if (error) return ruleError(error, 'That could not be saved.');
  return json({ ask: data === true });
}

/** GET /api/pro/clients/:clientId/ace: one client's answers, read only, for this professional. */
export async function getProClientAce(clientId: string) {
  const guard = await requireRole('professional', 'admin');
  if (!guard.ok) return guard.response;

  const id = z.string().uuid().safeParse(clientId);
  if (!id.success) return invalidInput();

  const { data, error } = await guard.supabase.rpc('pro_client_ace_safe', { p_client_alias_id: id.data });
  if (error?.code === 'PT404') return fail('invalid_input', 'Client not found.', 404);
  if (error) return fail('server_error', 'We could not load these answers.', 500);
  return json<{ ace: ProClientAce }>({ ace: (data as ProClientAce) ?? null });
}
