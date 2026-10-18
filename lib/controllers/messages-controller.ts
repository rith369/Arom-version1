import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

import { createPrivateStorageClient } from '@/lib/supabase/private-storage';
import { z } from 'zod';
import {
  FILE_TYPES,
  IMAGE_TYPES,
  MAX_FILE_BYTES,
  MAX_TEXT,
  MAX_VOICE_BYTES,
  MAX_VOICE_SECONDS,
  REPLY_TIMES,
  conversationKey,
  type ApiMessage,
  type ConversationSummary,
  type ConversationsResponse,
  type ReplyTime,
  type SendResponse,
  type Sender,
  type ThreadResponse,
} from '@/lib/messages';
import type { SessionSuggestion } from '@/lib/sessions';
import { createClient } from '@/lib/supabase/server';
import {
  NO_STORE,
  fail,
  invalidInput,
  json,
  readJson,
  unauthorized,
} from './shared';
import { requireRole } from './role-controller';
import {
  SUGGESTION_COLUMNS,
  toSuggestion,
  type SuggestionRow,
} from './sessions-controller';

/*
 * AROM messages controller (BACKEND-HANDOFF.md section 17). Runs as the
 * signed in person, so RLS returns only conversations they are in. Every
 * write goes through security definer functions that check for a booked or
 * completed session. There is no admin access. Never log message text or audio.
 */

const VOICE_BUCKET = 'message-voice';
const ATTACHMENT_BUCKET = 'message-attachments';

const THREAD_LIMIT = 300;

type Session = { supabase: SupabaseClient; userId: string };

/** Client side: any signed in account. Professional side: the professional role (or an admin's test profile). */
async function sessionFor(
  side: Sender,
): Promise<{ ok: true; session: Session } | { ok: false; response: Response }> {
  if (side === 'professional') {
    const guard = await requireRole('professional', 'admin');
    return guard.ok
      ? {
          ok: true,
          session: { supabase: guard.supabase, userId: guard.userId },
        }
      : guard;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user
    ? { ok: true, session: { supabase, userId: user.id } }
    : { ok: false, response: unauthorized() };
}

interface SummaryRow {
  conversation_id: string | null;
  professional_id: string;
  slug: string;
  display_name: string;
  display_name_km: string | null;
  photo_url: string | null;
  reply_time: string;
  client_id: string;
  closed: boolean | null;
  can_write: boolean | null;
  last_kind: ApiMessage['kind'] | null;
  last_mine: boolean | null;
  last_body: string | null;
  last_at: string | null;
  unread: number;
}

interface Pair extends ConversationSummary {
  conversationId: string | null;
  professionalUuid: string;
}

function toReplyTime(value: string): ReplyTime {
  return REPLY_TIMES.find((item) => item === value) ?? 'one_day';
}

function toPair(row: SummaryRow): Pair {
  return {
    key: conversationKey(row.slug, row.client_id),
    conversationId: row.conversation_id,
    professionalUuid: row.professional_id,
    professionalId: row.slug,
    professionalName: row.display_name,
    kmProfessionalName: row.display_name_km ?? '',
    photoUrl: row.photo_url ?? '',
    replyTime: toReplyTime(row.reply_time),
    clientId: row.client_id,
    closed: row.closed === true,
    canWrite: row.can_write === true,
    last:
      row.last_kind && row.last_at
        ? {
            kind: row.last_kind,
            mine: row.last_mine === true,
            text: row.last_body ?? '',
            createdAt: row.last_at,
          }
        : null,
    unread: row.unread ?? 0,
  };
}

/** Drops the internal ids before a summary is sent to the browser. */
function toSummary(pair: Pair): ConversationSummary {
  return {
    key: pair.key,
    professionalId: pair.professionalId,
    professionalName: pair.professionalName,
    kmProfessionalName: pair.kmProfessionalName,
    photoUrl: pair.photoUrl,
    replyTime: pair.replyTime,
    clientId: pair.clientId,
    closed: pair.closed,
    canWrite: pair.canWrite,
    last: pair.last,
    unread: pair.unread,
  };
}

async function loadPairs(
  supabase: SupabaseClient,
  side: Sender,
): Promise<Pair[] | null> {
  const { data, error } = await supabase.rpc('my_conversations_safe', {
    p_as: side,
  });
  if (error) return null;
  return ((data ?? []) as SummaryRow[]).map(toPair);
}

/** The conversation with one other person: a professional slug (client side) or a client id (professional side). */
async function findPair(supabase: SupabaseClient, side: Sender, other: string) {
  const pairs = await loadPairs(supabase, side);
  if (!pairs) return { error: true as const };
  const pair = pairs.find((item) =>
    side === 'client' ? item.professionalId === other : item.clientId === other,
  );
  return { error: false as const, pair };
}

const notFound = () => fail('invalid_input', 'Conversation not found.', 404);

/** Maps the database rule errors (see migration 20261014000700) to responses. */
function ruleError(error: PostgrestError) {
  if (error.code === 'PT403')
    return fail(
      'forbidden',
      'You can send messages after a booked session.',
      403,
    );
  if (error.code === 'PT409')
    return fail('invalid_input', 'This conversation is closed.', 409);
  if (error.code === 'PT404') return notFound();
  if (error.code === '22023') return fail('invalid_input', error.message, 400);
  return fail('server_error', 'Your message could not be sent.', 500);
}

interface MessageRow {
  id: string;
  sender_id: string | null;
  kind: ApiMessage['kind'];
  body: string | null;
  duration_seconds: number | null;
  suggestion_id: string | null;
  created_at: string;
  read_at: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
}

function toMessage(row: MessageRow, side: Sender, userId: string): ApiMessage {
  const mine = row.sender_id === userId;
  const other: Sender = side === 'client' ? 'professional' : 'client';
  return {
    id: row.id,
    sender: mine ? side : other,
    kind: row.kind,
    text: row.body ?? '',
    audioUrl: row.kind === 'voice' ? `/api/voice/${row.id}` : '',
    durationSeconds: row.duration_seconds ?? 0,
    suggestionId: row.suggestion_id ?? '',
    attachment:
      (row.kind === 'image' || row.kind === 'file') && row.attachment_name
        ? {
            url: `/api/attachments/${row.id}`,
            name: row.attachment_name,
            type: row.attachment_type ?? '',
            size: row.attachment_size ?? 0,
          }
        : null,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/** GET /api/messages and GET /api/pro/messages: the caller's conversation list for one side. */
export async function listConversations(side: Sender) {
  const auth = await sessionFor(side);
  if (!auth.ok) return auth.response;

  const pairs = await loadPairs(auth.session.supabase, side);
  if (!pairs)
    return fail('server_error', 'We could not load your messages.', 500);
  return json<ConversationsResponse>({ conversations: pairs.map(toSummary) });
}

/** GET /api/messages/:professionalSlug and GET /api/pro/messages/:clientId: one thread, oldest first. */
export async function getThread(side: Sender, other: string) {
  const auth = await sessionFor(side);
  if (!auth.ok) return auth.response;
  const { supabase, userId } = auth.session;

  const found = await findPair(supabase, side, other);
  if (found.error)
    return fail('server_error', 'We could not load your messages.', 500);
  if (!found.pair) return notFound();

  let messages: ApiMessage[] = [];
  let suggestions: SessionSuggestion[] = [];
  if (found.pair.conversationId) {
    const { data, error } = await supabase.rpc('read_private_messages_safe', {
      p_conversation_id: found.pair.conversationId,
      p_limit: THREAD_LIMIT,
    });

    if (error || !Array.isArray(data)) {
      return fail('server_error', 'We could not load your messages.', 500);
    }

    const messageRows = data as MessageRow[];

    messages = [...messageRows]
      .reverse()
      .map((row) => toMessage(row, side, userId));

    const ids = messages.map((item) => item.suggestionId).filter(Boolean);
    if (ids.length > 0) {
      const [rows, names] = await Promise.all([
        supabase.rpc('read_session_suggestions_safe', {
          p_as: side,
          p_ids: ids,
          p_limit: 300,
        }),

        side === 'professional'
          ? supabase.rpc('my_message_client_names')
          : Promise.resolve({ data: [] }),
      ]);
      if (rows.error || !Array.isArray(rows.data)) {
        return fail('server_error', 'Could not load session suggestions.', 500);
      }

      const suggestionData = rows.data as SuggestionRow[];
      const clientName =
        ((names.data ?? []) as { id: string; full_name: string | null }[]).find(
          (row) => row.id === found.pair?.clientId,
        )?.full_name ?? '';
      suggestions = suggestionData.map((row) =>
        toSuggestion(row, found.pair!.professionalId, clientName),
      );
    }
  }

  return json<ThreadResponse>({
    conversation: toSummary(found.pair),
    messages,
    suggestions,
  });
}

/** Recognises the recorded audio from its first bytes, not from the type the browser claims. */
export function voiceType(
  bytes: Uint8Array,
): { extension: string; contentType: string } | null {
  const text = (from: number, to: number) =>
    String.fromCharCode(...bytes.slice(from, to));
  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return { extension: 'webm', contentType: 'audio/webm' };
  }
  if (text(0, 4) === 'OggS')
    return { extension: 'ogg', contentType: 'audio/ogg' };
  if (text(4, 8) === 'ftyp')
    return { extension: 'm4a', contentType: 'audio/mp4' };
  return null;
}

/** Recognises a photo or PDF from its first bytes, not from the type the browser claims. */
export function attachmentType(
  bytes: Uint8Array,
): { kind: 'image' | 'file'; extension: string; contentType: string } | null {
  const text = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { kind: 'image', extension: 'jpg', contentType: 'image/jpeg' };
  if (bytes[0] === 0x89 && text(1, 4) === 'PNG')
    return { kind: 'image', extension: 'png', contentType: 'image/png' };
  if (text(0, 4) === 'RIFF' && text(8, 12) === 'WEBP')
    return { kind: 'image', extension: 'webp', contentType: 'image/webp' };
  if (text(0, 5) === '%PDF-')
    return { kind: 'file', extension: 'pdf', contentType: 'application/pdf' };
  return null;
}

/** A safe display name for an uploaded file: no folders, at most 120 characters. */
export function attachmentName(name: string, extension: string) {
  const base = name.split(/[\\/]/).pop()?.replace(/[\u0000-\u001f]/g, '').trim() ?? '';
  return (base || `file.${extension}`).slice(0, 120);
}

const textSchema = z.object({
  kind: z.literal('text'),
  text: z.string().trim().min(1).max(MAX_TEXT),
});

const durationSchema = z.coerce.number().int().min(1).max(MAX_VOICE_SECONDS);

/**
 * POST /api/messages/:professionalSlug and POST /api/pro/messages/:clientId.
 * JSON `{ kind: "text", text }`, or multipart `audio` (file) + `durationSeconds` for voice.
 */
export async function sendMessage(
  request: NextRequest,
  side: Sender,
  other: string,
) {
  const auth = await sessionFor(side);
  if (!auth.ok) return auth.response;
  const { supabase, userId } = auth.session;

  const found = await findPair(supabase, side, other);
  if (found.error)
    return fail('server_error', 'Your message could not be sent.', 500);
  if (!found.pair) return notFound();
  const otherId =
    side === 'client' ? found.pair.professionalUuid : found.pair.clientId;

  const isVoice =
    request.headers.get('content-type')?.startsWith('multipart/form-data') ??
    false;

  if (!isVoice) {
    const body = textSchema.safeParse(await readJson(request));
    if (!body.success) return invalidInput();
    const { data, error } = await supabase
      .rpc('send_message_safe', {
        p_other: otherId,
        p_as: side,
        p_kind: 'text',
        p_body: body.data.text,
      })
      .single<MessageRow>();
    if (error || !data)
      return error
        ? ruleError(error)
        : fail('server_error', 'Your message could not be sent.', 500);
    return json<SendResponse>({ message: toMessage(data, side, userId) }, 201);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return invalidInput();
  }

  // A photo or PDF (kind "attachment"); otherwise a voice message.
  if (form.get('kind') === 'attachment') {
    const upload = form.get('file');
    if (!(upload instanceof File) || upload.size === 0 || upload.size > MAX_FILE_BYTES) return invalidInput();
    const fileBytes = new Uint8Array(await upload.arrayBuffer());
    const detected = attachmentType(fileBytes);
    const allowed: readonly string[] = [...IMAGE_TYPES, ...FILE_TYPES];
    if (!detected || !allowed.includes(detected.contentType)) {
      return fail('invalid_input', 'Send a photo (JPG, PNG or WebP) or a PDF file.', 400);
    }

    // Creates the conversation if needed, and checks the sender may write.
    const { data: openId, error: openErr } = await supabase.rpc('open_conversation_safe', { p_other: otherId, p_as: side });
    if (openErr || typeof openId !== 'string') {
      return openErr ? ruleError(openErr) : fail('server_error', 'Your message could not be sent.', 500);
    }

    const filePath = `${openId}/${userId}/${crypto.randomUUID()}.${detected.extension}`;
    const stored = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(filePath, fileBytes, { contentType: detected.contentType, upsert: false });
    if (stored.error) return fail('server_error', 'Your file could not be uploaded.', 500);

    const { data: sent, error: sendErr } = await supabase
      .rpc('send_attachment_safe', {
        p_other: otherId,
        p_as: side,
        p_kind: detected.kind,
        p_path: filePath,
        p_name: attachmentName(upload.name, detected.extension),
        p_type: detected.contentType,
        p_size: fileBytes.byteLength,
      })
      .single<MessageRow>();
    if (sendErr || !sent) {
      // An upload that never became a message is removed again (the sender
      // has no delete rights on this bucket, so the server does it).
      await createPrivateStorageClient().storage.from(ATTACHMENT_BUCKET).remove([filePath]);
      return sendErr ? ruleError(sendErr) : fail('server_error', 'Your message could not be sent.', 500);
    }
    return json<SendResponse>({ message: toMessage(sent, side, userId) }, 201);
  }

  const file = form.get('audio');
  const duration = durationSchema.safeParse(form.get('durationSeconds'));
  if (
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > MAX_VOICE_BYTES ||
    !duration.success
  ) {
    return invalidInput();
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = voiceType(bytes);
  if (!type) return invalidInput();

  // Creates the conversation if needed, and checks the sender may write.
  const { data: conversationId, error: openError } = await supabase.rpc(
    'open_conversation_safe',
    {
      p_other: otherId,
      p_as: side,
    },
  );
  if (openError || typeof conversationId !== 'string') {
    return openError
      ? ruleError(openError)
      : fail('server_error', 'Your message could not be sent.', 500);
  }

  const path = `${conversationId}/${userId}/${crypto.randomUUID()}.${type.extension}`;
  const upload = await supabase.storage
    .from(VOICE_BUCKET)
    .upload(path, bytes, { contentType: type.contentType, upsert: false });
  if (upload.error)
    return fail(
      'server_error',
      'Your voice message could not be uploaded.',
      500,
    );

  // The safe version resolves the client alias, like text messages above.
  const { data, error } = await supabase
    .rpc('send_message_safe', {
      p_other: otherId,
      p_as: side,
      p_kind: 'voice',
      p_audio_path: path,
      p_duration_seconds: duration.data,
    })
    .single<MessageRow>();
  if (error || !data) {
    // An upload that never became a message is removed again.
    await supabase.storage.from(VOICE_BUCKET).remove([path]);
    return error
      ? ruleError(error)
      : fail('server_error', 'Your message could not be sent.', 500);
  }
  return json<SendResponse>({ message: toMessage(data, side, userId) }, 201);
}

/** POST /api/messages/:professionalSlug/read and POST /api/pro/messages/:clientId/read. */
export async function markThreadRead(side: Sender, other: string) {
  const auth = await sessionFor(side);
  if (!auth.ok) return auth.response;
  const { supabase } = auth.session;

  const found = await findPair(supabase, side, other);
  if (found.error) return fail('server_error', 'That could not be saved.', 500);
  if (!found.pair) return notFound();
  if (!found.pair.conversationId) return json({ marked: 0 });

  const { data, error } = await supabase.rpc('mark_conversation_read', {
    p_conversation_id: found.pair.conversationId,
  });
  if (error) return ruleError(error);
  return json({ marked: typeof data === 'number' ? data : 0 });
}

/** GET /api/voice/:messageId: redirects a conversation member to a short lived link for the audio. */
export async function openVoice(messageId: string) {
  const id = z.string().uuid().safeParse(messageId);
  if (!id.success) return invalidInput();

  // Authenticate using the user's normal cookie-based client.
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return unauthorized();

  // Read metadata on the server. Never return the storage path.
  const storageClient = privateStorage();
  if (!storageClient) return fail('server_error', 'Files cannot be opened right now.', 503);

  const { data: message, error: messageError } = await storageClient
    .from('messages')
    .select('conversation_id, audio_path')
    .eq('id', id.data)
    .eq('kind', 'voice')
    .maybeSingle();

  if (messageError) {
    return fail('server_error', 'Could not load voice message.', 500);
  }

  if (!message?.audio_path) return notFound();

  // Check membership as the signed-in user before downloading audio.
  const { data: isMember, error: membershipError } = await supabase.rpc(
    'is_conversation_member',
    {
      p_conversation_id: message.conversation_id,
    },
  );

  if (membershipError) {
    return fail('server_error', 'Could not load voice message.', 500);
  }

  if (isMember !== true) return notFound();

  const { data: audio, error: downloadError } = await storageClient.storage
    .from(VOICE_BUCKET)
    .download(message.audio_path);

  if (downloadError || !audio) {
    return fail('server_error', 'Could not load voice message.', 500);
  }

  return new Response(audio, {
    status: 200,
    headers: {
      ...NO_STORE,
      'Content-Type': audio.type || 'application/octet-stream',
      'Content-Length': String(audio.size),
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

// The server only client needs SUPABASE_SECRET_KEY; without it, files and
// voice cannot be opened, so answer calmly instead of crashing.
function privateStorage() {
  try {
    return createPrivateStorageClient();
  } catch {
    return null;
  }
}

/** GET /api/attachments/:messageId: streams a photo or PDF to a member of that conversation. */
export async function openAttachment(messageId: string) {
  const id = z.string().uuid().safeParse(messageId);
  if (!id.success) return invalidInput();

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return unauthorized();

  // Read the metadata on the server. Never return the storage path.
  const storageClient = privateStorage();
  if (!storageClient) return fail('server_error', 'Files cannot be opened right now.', 503);
  const { data: message, error: messageError } = await storageClient
    .from('messages')
    .select('conversation_id, attachment_path, attachment_type, attachment_name')
    .eq('id', id.data)
    .in('kind', ['image', 'file'])
    .maybeSingle();
  if (messageError) return fail('server_error', 'Could not load this file.', 500);
  if (!message?.attachment_path) return notFound();

  // Check membership as the signed in user before sending anything.
  const { data: isMember, error: membershipError } = await supabase.rpc('is_conversation_member', {
    p_conversation_id: message.conversation_id,
  });
  if (membershipError) return fail('server_error', 'Could not load this file.', 500);
  if (isMember !== true) return notFound();

  const { data: file, error: downloadError } = await storageClient.storage
    .from(ATTACHMENT_BUCKET)
    .download(message.attachment_path);
  if (downloadError || !file) return fail('server_error', 'Could not load this file.', 500);

  const safeName = encodeURIComponent(message.attachment_name ?? 'file');
  return new Response(file, {
    status: 200,
    headers: {
      ...NO_STORE,
      'Content-Type': message.attachment_type || 'application/octet-stream',
      'Content-Length': String(file.size),
      'Content-Disposition': `inline; filename*=UTF-8''${safeName}`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

const replyTimeSchema = z.object({
  replyTime: z.enum(['few_hours', 'one_day', 'two_days']),
});

/** PATCH /api/pro/messages `{ replyTime }`: the reply time clients see. */
export async function setReplyTime(request: NextRequest) {
  const guard = await requireRole('professional', 'admin');
  if (!guard.ok) return guard.response;

  const body = replyTimeSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { data, error } = await guard.supabase
    .from('professional_profiles')
    .update({ reply_time: body.data.replyTime })
    .eq('id', guard.userId)
    .select('reply_time')
    .maybeSingle<{ reply_time: string }>();
  if (error || !data)
    return fail('server_error', 'That could not be saved.', 500);
  return json({ replyTime: toReplyTime(data.reply_time) });
}

/** Client ids the professional has archived. Used by GET /api/pro/me. */
/** Returns archived client aliases for the signed-in professional. */
export async function loadArchivedClients(
  supabase: SupabaseClient,
  _userId: string,
): Promise<string[]> {
  const { data, error } = await supabase.rpc('my_archived_client_aliases');

  if (error) {
    console.error('Archived clients RPC failed:', {
      code: error.code,
      message: error.message,
    });

    throw new Error('Could not load archived clients');
  }

  const rows = (data ?? []) as {
    client_alias_id: string;
  }[];

  return rows.map((row) => row.client_alias_id);
}
