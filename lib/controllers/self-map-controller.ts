import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import {
  SELF_MAP_PARTS,
  copingAnswersSchema,
  parsePart,
  valuesAnswersSchema,
  saveSelfMapSchema,
  shareSelfMapSchema,
  type ProClientSelfMap,
  type SelfMapPartDto,
  type SelfMapResponse,
  type SelfMapShareDto,
} from '@/lib/self-map';
import { fail, invalidInput, json, readJson } from './shared';
import { requireRole } from './role-controller';

/*
 * Understand yourself, "My self map" (BACKEND-HANDOFF.md section 38). Every
 * read and write goes through security definer functions; the tables have no
 * policies. Answers are never logged.
 */

function ruleError(error: PostgrestError, fallback: string) {
  if (error.code === 'PT403') return fail('forbidden', error.message, 403);
  if (error.code === 'PT404') return fail('invalid_input', 'Not found.', 404);
  if (error.code === '22023') return fail('invalid_input', error.message, 400);
  return fail('server_error', fallback, 500);
}

interface PartRow {
  part: string;
  answers: unknown;
  previous_answers: unknown;
  previous_at: string | null;
  updated_at: string;
}

interface ShareRow {
  professional_slug: string;
  display_name: string;
  display_name_km: string | null;
  photo_url: string | null;
  shared: boolean;
}

/** A saved row, or null when its answers no longer match the questions. */
function toPart(row: PartRow): SelfMapPartDto | null {
  const current = parsePart(row.part, row.answers);
  if (!current) return null;
  const previous = row.previous_answers === null ? null : parsePart(row.part, row.previous_answers);
  const base = { previousAt: previous ? row.previous_at : null, updatedAt: row.updated_at };
  return current.part === 'values'
    ? { part: 'values', answers: current.answers, previous: previous?.part === 'values' ? previous.answers : null, ...base }
    : { part: 'coping', answers: current.answers, previous: previous?.part === 'coping' ? previous.answers : null, ...base };
}

async function respondWithMine(supabase: SupabaseClient) {
  const [parts, shares] = await Promise.all([supabase.rpc('my_self_map'), supabase.rpc('my_self_map_shares')]);
  if (parts.error || shares.error) return fail('server_error', 'We could not load your self map.', 500);
  return json<SelfMapResponse>({
    parts: ((parts.data ?? []) as PartRow[]).map(toPart).filter((part): part is SelfMapPartDto => part !== null),
    shares: ((shares.data ?? []) as ShareRow[]).map<SelfMapShareDto>((row) => ({
      professionalSlug: row.professional_slug,
      name: row.display_name,
      nameKm: row.display_name_km,
      photoUrl: row.photo_url,
      shared: row.shared,
    })),
  });
}

/** GET /api/self-map: the caller's own parts and who they share them with. */
export async function getMySelfMap() {
  const guard = await requireRole('user', 'professional', 'admin');
  if (!guard.ok) return guard.response;
  return respondWithMine(guard.supabase);
}

/** PUT /api/self-map `{ part, answers }`: save a part again. The answers before it are kept as previous. */
export async function saveMySelfMap(request: NextRequest) {
  const guard = await requireRole('user', 'professional', 'admin');
  if (!guard.ok) return guard.response;

  const body = saveSelfMapSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await guard.supabase.rpc('save_self_map_part', {
    p_part: body.data.part,
    p_answers: body.data.answers,
  });
  if (error) return ruleError(error, 'Your answers could not be saved.');
  return respondWithMine(guard.supabase);
}

/** DELETE /api/self-map?part=<part>: delete one part, with its previous answers. */
export async function deleteMySelfMap(request: NextRequest) {
  const guard = await requireRole('user', 'professional', 'admin');
  if (!guard.ok) return guard.response;

  const part = z.enum(SELF_MAP_PARTS).safeParse(request.nextUrl.searchParams.get('part'));
  if (!part.success) return invalidInput();

  const { error } = await guard.supabase.rpc('delete_self_map_part', { p_part: part.data });
  if (error) return ruleError(error, 'Your answers could not be deleted.');
  return respondWithMine(guard.supabase);
}

/** PUT /api/self-map/sharing `{ professionalSlug, share }`: share with a booked professional, or stop. */
export async function setMySelfMapShare(request: NextRequest) {
  const guard = await requireRole('user', 'professional', 'admin');
  if (!guard.ok) return guard.response;

  const body = shareSelfMapSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await guard.supabase.rpc('set_self_map_share', {
    p_professional_slug: body.data.professionalSlug,
    p_share: body.data.share,
  });
  if (error) return ruleError(error, 'That could not be saved.');
  return respondWithMine(guard.supabase);
}

/** GET /api/pro/clients/:clientId/self-map: one client's shared self map, read only. */
export async function getProClientSelfMap(clientId: string) {
  const guard = await requireRole('professional', 'admin');
  if (!guard.ok) return guard.response;

  const id = z.string().uuid().safeParse(clientId);
  if (!id.success) return invalidInput();

  const { data, error } = await guard.supabase.rpc('pro_client_self_map_safe', { p_client_alias_id: id.data });
  if (error?.code === 'PT404') return fail('invalid_input', 'Client not found.', 404);
  if (error) return fail('server_error', 'We could not load this self map.', 500);
  if (data === null) return json<{ selfMap: ProClientSelfMap }>({ selfMap: null });

  const saved = data as Partial<Record<'values' | 'coping', { answers: unknown; updatedAt: string }>>;
  const values = saved.values ? valuesAnswersSchema.safeParse(saved.values.answers) : null;
  const coping = saved.coping ? copingAnswersSchema.safeParse(saved.coping.answers) : null;
  return json<{ selfMap: ProClientSelfMap }>({
    selfMap: {
      values: saved.values && values?.success ? { answers: values.data, updatedAt: saved.values.updatedAt } : null,
      coping: saved.coping && coping?.success ? { answers: coping.data, updatedAt: saved.coping.updatedAt } : null,
    },
  });
}
