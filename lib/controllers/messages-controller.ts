import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
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
} from "@/lib/messages";
import type { SessionSuggestion } from "@/lib/sessions";
import { createClient } from "@/lib/supabase/server";
import { NO_STORE, fail, invalidInput, json, readJson, unauthorized } from "./shared";
import { requireRole } from "./role-controller";
import { SUGGESTION_COLUMNS, toSuggestion, type SuggestionRow } from "./sessions-controller";

/*
 * AROM messages controller (BACKEND-HANDOFF.md section 17). Runs as the
 * signed in person, so RLS returns only conversations they are in. Every
 * write goes through security definer functions that check for a booked or
 * completed session. There is no admin access. Never log message text or audio.
 */

const VOICE_BUCKET = "message-voice";
const SIGNED_URL_SECONDS = 300;
const THREAD_LIMIT = 300;

type Session = { supabase: SupabaseClient; userId: string };

/** Client side: any signed in account. Professional side: the professional role (or an admin's test profile). */
async function sessionFor(side: Sender): Promise<{ ok: true; session: Session } | { ok: false; response: Response }> {
  if (side === "professional") {
    const guard = await requireRole("professional", "admin");
    return guard.ok ? { ok: true, session: { supabase: guard.supabase, userId: guard.userId } } : guard;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { ok: true, session: { supabase, userId: user.id } } : { ok: false, response: unauthorized() };
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
  last_kind: "text" | "voice" | "suggestion" | null;
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
  return REPLY_TIMES.find((item) => item === value) ?? "one_day";
}

function toPair(row: SummaryRow): Pair {
  return {
    key: conversationKey(row.slug, row.client_id),
    conversationId: row.conversation_id,
    professionalUuid: row.professional_id,
    professionalId: row.slug,
    professionalName: row.display_name,
    kmProfessionalName: row.display_name_km ?? "",
    photoUrl: row.photo_url ?? "",
    replyTime: toReplyTime(row.reply_time),
    clientId: row.client_id,
    closed: row.closed === true,
    canWrite: row.can_write === true,
    last:
      row.last_kind && row.last_at
        ? { kind: row.last_kind, mine: row.last_mine === true, text: row.last_body ?? "", createdAt: row.last_at }
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

async function loadPairs(supabase: SupabaseClient, side: Sender): Promise<Pair[] | null> {
  const { data, error } = await supabase.rpc("my_conversations", { p_as: side });
  if (error) return null;
  return ((data ?? []) as SummaryRow[]).map(toPair);
}

/** The conversation with one other person: a professional slug (client side) or a client id (professional side). */
async function findPair(supabase: SupabaseClient, side: Sender, other: string) {
  const pairs = await loadPairs(supabase, side);
  if (!pairs) return { error: true as const };
  const pair = pairs.find((item) => (side === "client" ? item.professionalId === other : item.clientId === other));
  return { error: false as const, pair };
}

const notFound = () => fail("invalid_input", "Conversation not found.", 404);

/** Maps the database rule errors (see migration 20261014000700) to responses. */
function ruleError(error: PostgrestError) {
  if (error.code === "PT403") return fail("forbidden", "You can send messages after a booked session.", 403);
  if (error.code === "PT409") return fail("invalid_input", "This conversation is closed.", 409);
  if (error.code === "PT404") return notFound();
  if (error.code === "22023") return fail("invalid_input", error.message, 400);
  return fail("server_error", "Your message could not be sent.", 500);
}

interface MessageRow {
  id: string;
  sender_id: string;
  kind: "text" | "voice" | "suggestion";
  body: string | null;
  duration_seconds: number | null;
  suggestion_id: string | null;
  created_at: string;
  read_at: string | null;
}

const MESSAGE_COLUMNS = "id, sender_id, kind, body, duration_seconds, suggestion_id, created_at, read_at";

function toMessage(row: MessageRow, side: Sender, userId: string): ApiMessage {
  const mine = row.sender_id === userId;
  const other: Sender = side === "client" ? "professional" : "client";
  return {
    id: row.id,
    sender: mine ? side : other,
    kind: row.kind,
    text: row.body ?? "",
    audioUrl: row.kind === "voice" ? `/api/voice/${row.id}` : "",
    durationSeconds: row.duration_seconds ?? 0,
    suggestionId: row.suggestion_id ?? "",
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
  if (!pairs) return fail("server_error", "We could not load your messages.", 500);
  return json<ConversationsResponse>({ conversations: pairs.map(toSummary) });
}

/** GET /api/messages/:professionalSlug and GET /api/pro/messages/:clientId: one thread, oldest first. */
export async function getThread(side: Sender, other: string) {
  const auth = await sessionFor(side);
  if (!auth.ok) return auth.response;
  const { supabase, userId } = auth.session;

  const found = await findPair(supabase, side, other);
  if (found.error) return fail("server_error", "We could not load your messages.", 500);
  if (!found.pair) return notFound();

  let messages: ApiMessage[] = [];
  let suggestions: SessionSuggestion[] = [];
  if (found.pair.conversationId) {
    const { data, error } = await supabase
      .from("messages")
      .select(MESSAGE_COLUMNS)
      .eq("conversation_id", found.pair.conversationId)
      .order("created_at", { ascending: false })
      .limit(THREAD_LIMIT)
      .returns<MessageRow[]>();
    if (error) return fail("server_error", "We could not load your messages.", 500);
    messages = (data ?? []).reverse().map((row) => toMessage(row, side, userId));

    const ids = messages.map((item) => item.suggestionId).filter(Boolean);
    if (ids.length > 0) {
      const [rows, names] = await Promise.all([
        supabase.from("session_suggestions").select(SUGGESTION_COLUMNS).in("id", ids).returns<SuggestionRow[]>(),
        side === "professional" ? supabase.rpc("my_client_names") : Promise.resolve({ data: [] }),
      ]);
      const clientName =
        ((names.data ?? []) as { id: string; full_name: string | null }[]).find((row) => row.id === found.pair?.clientId)?.full_name ?? "";
      suggestions = (rows.data ?? []).map((row) => toSuggestion(row, found.pair!.professionalId, clientName));
    }
  }

  return json<ThreadResponse>({ conversation: toSummary(found.pair), messages, suggestions });
}

/** Recognises the recorded audio from its first bytes, not from the type the browser claims. */
function voiceType(bytes: Uint8Array): { extension: string; contentType: string } | null {
  const text = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return { extension: "webm", contentType: "audio/webm" };
  }
  if (text(0, 4) === "OggS") return { extension: "ogg", contentType: "audio/ogg" };
  if (text(4, 8) === "ftyp") return { extension: "m4a", contentType: "audio/mp4" };
  return null;
}

const textSchema = z.object({
  kind: z.literal("text"),
  text: z.string().trim().min(1).max(MAX_TEXT),
});

const durationSchema = z.coerce.number().int().min(1).max(MAX_VOICE_SECONDS);

/**
 * POST /api/messages/:professionalSlug and POST /api/pro/messages/:clientId.
 * JSON `{ kind: "text", text }`, or multipart `audio` (file) + `durationSeconds` for voice.
 */
export async function sendMessage(request: NextRequest, side: Sender, other: string) {
  const auth = await sessionFor(side);
  if (!auth.ok) return auth.response;
  const { supabase, userId } = auth.session;

  const found = await findPair(supabase, side, other);
  if (found.error) return fail("server_error", "Your message could not be sent.", 500);
  if (!found.pair) return notFound();
  const otherId = side === "client" ? found.pair.professionalUuid : found.pair.clientId;

  const isVoice = request.headers.get("content-type")?.startsWith("multipart/form-data") ?? false;

  if (!isVoice) {
    const body = textSchema.safeParse(await readJson(request));
    if (!body.success) return invalidInput();
    const { data, error } = await supabase
      .rpc("send_message", { p_other: otherId, p_as: side, p_kind: "text", p_body: body.data.text })
      .single<MessageRow>();
    if (error || !data) return error ? ruleError(error) : fail("server_error", "Your message could not be sent.", 500);
    return json<SendResponse>({ message: toMessage(data, side, userId) }, 201);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return invalidInput();
  }
  const file = form.get("audio");
  const duration = durationSchema.safeParse(form.get("durationSeconds"));
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_VOICE_BYTES || !duration.success) {
    return invalidInput();
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = voiceType(bytes);
  if (!type) return invalidInput();

  // Creates the conversation if needed, and checks the sender may write.
  const { data: conversationId, error: openError } = await supabase.rpc("open_conversation", {
    p_other: otherId,
    p_as: side,
  });
  if (openError || typeof conversationId !== "string") {
    return openError ? ruleError(openError) : fail("server_error", "Your message could not be sent.", 500);
  }

  const path = `${conversationId}/${userId}/${crypto.randomUUID()}.${type.extension}`;
  const upload = await supabase.storage
    .from(VOICE_BUCKET)
    .upload(path, bytes, { contentType: type.contentType, upsert: false });
  if (upload.error) return fail("server_error", "Your voice message could not be uploaded.", 500);

  const { data, error } = await supabase
    .rpc("send_message", {
      p_other: otherId,
      p_as: side,
      p_kind: "voice",
      p_audio_path: path,
      p_duration_seconds: duration.data,
    })
    .single<MessageRow>();
  if (error || !data) {
    // An upload that never became a message is removed again.
    await supabase.storage.from(VOICE_BUCKET).remove([path]);
    return error ? ruleError(error) : fail("server_error", "Your message could not be sent.", 500);
  }
  return json<SendResponse>({ message: toMessage(data, side, userId) }, 201);
}

/** POST /api/messages/:professionalSlug/read and POST /api/pro/messages/:clientId/read. */
export async function markThreadRead(side: Sender, other: string) {
  const auth = await sessionFor(side);
  if (!auth.ok) return auth.response;
  const { supabase } = auth.session;

  const found = await findPair(supabase, side, other);
  if (found.error) return fail("server_error", "That could not be saved.", 500);
  if (!found.pair) return notFound();
  if (!found.pair.conversationId) return json({ marked: 0 });

  const { data, error } = await supabase.rpc("mark_conversation_read", { p_conversation_id: found.pair.conversationId });
  if (error) return ruleError(error);
  return json({ marked: typeof data === "number" ? data : 0 });
}

/** GET /api/voice/:messageId: redirects a conversation member to a short lived link for the audio. */
export async function openVoice(messageId: string) {
  const id = z.string().uuid().safeParse(messageId);
  if (!id.success) return invalidInput();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  // RLS returns the row only to the two people in the conversation.
  const { data: row } = await supabase
    .from("messages")
    .select("audio_path")
    .eq("id", id.data)
    .eq("kind", "voice")
    .maybeSingle<{ audio_path: string | null }>();
  if (!row?.audio_path) return notFound();

  const { data, error } = await supabase.storage.from(VOICE_BUCKET).createSignedUrl(row.audio_path, SIGNED_URL_SECONDS);
  if (error || !data?.signedUrl) return fail("server_error", "We could not open this voice message.", 500);

  return NextResponse.redirect(data.signedUrl, { status: 302, headers: NO_STORE });
}

const replyTimeSchema = z.object({ replyTime: z.enum(["few_hours", "one_day", "two_days"]) });

/** PATCH /api/pro/messages `{ replyTime }`: the reply time clients see. */
export async function setReplyTime(request: NextRequest) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;

  const body = replyTimeSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { data, error } = await guard.supabase
    .from("professional_profiles")
    .update({ reply_time: body.data.replyTime })
    .eq("id", guard.userId)
    .select("reply_time")
    .maybeSingle<{ reply_time: string }>();
  if (error || !data) return fail("server_error", "That could not be saved.", 500);
  return json({ replyTime: toReplyTime(data.reply_time) });
}

/** Client ids the professional has archived. Used by GET /api/pro/me. */
export async function loadArchivedClients(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("conversations")
    .select("client_id")
    .eq("professional_id", userId)
    .not("closed_at", "is", null);
  return (data ?? []).map((row) => row.client_id as string);
}
