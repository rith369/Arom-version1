import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { z } from "zod";
import type {
  ClinicSendResponse,
  ClinicThreadResponse,
  DeskChat,
  DeskChatsResponse,
  MyClinicChat,
  MyClinicChatsResponse,
} from "@/lib/clinic-chat";
import {
  FILE_TYPES,
  IMAGE_TYPES,
  MAX_FILE_BYTES,
  MAX_TEXT,
  MAX_VOICE_BYTES,
  MAX_VOICE_SECONDS,
  type ApiMessage,
  type MessageKind,
} from "@/lib/messages";
import { createPrivateStorageClient } from "@/lib/supabase/private-storage";
import { createClient } from "@/lib/supabase/server";
import { attachmentName, attachmentType, voiceType } from "./messages-controller";
import { requireRole } from "./role-controller";
import { NO_STORE, fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * AROM clinic chat controller (BACKEND-HANDOFF.md section 35). Students chat
 * with a clinic; the clinic's desk accounts answer. Every read and write goes
 * through security definer functions that check who the caller is and that
 * the chat is still open (30 days after the last request or clinic session).
 * Voice and files are uploaded by this server with the server key, only after
 * those checks, into `clinic/<conversation id>/` in the private buckets.
 * Never log message text or audio.
 */

const VOICE_BUCKET = "message-voice";
const ATTACHMENT_BUCKET = "message-attachments";
const THREAD_LIMIT = 300;

const slugSchema = z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80);
const textSchema = z.object({ kind: z.literal("text"), text: z.string().trim().min(1).max(MAX_TEXT) });
const durationSchema = z.coerce.number().int().min(1).max(MAX_VOICE_SECONDS);

type Side = "client" | "clinic";

interface MessageRow {
  id: string;
  from_clinic: boolean;
  kind: MessageKind;
  body: string | null;
  duration_seconds: number | null;
  attachment_name: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
  created_at: string;
  read_at: string | null;
}

interface LastRow {
  last_kind: MessageKind | null;
  last_from_clinic: boolean | null;
  last_body: string | null;
  last_at: string | null;
}

/** The clinic side shows as "professional", the student as "client" (lib/clinic-chat.ts). */
function toMessage(row: MessageRow): ApiMessage {
  const file = `/api/clinic-chat-files/${row.id}`;
  return {
    id: row.id,
    sender: row.from_clinic ? "professional" : "client",
    kind: row.kind,
    text: row.body ?? "",
    audioUrl: row.kind === "voice" ? file : "",
    durationSeconds: row.duration_seconds ?? 0,
    suggestionId: "",
    attachment:
      (row.kind === "image" || row.kind === "file") && row.attachment_name
        ? { url: file, name: row.attachment_name, type: row.attachment_type ?? "", size: row.attachment_size ?? 0 }
        : null,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

function toLast(row: LastRow, side: Side) {
  if (!row.last_kind || !row.last_at) return null;
  return {
    kind: row.last_kind,
    mine: side === "clinic" ? row.last_from_clinic === true : row.last_from_clinic === false,
    text: row.last_body ?? "",
    createdAt: row.last_at,
  };
}

function ruleError(error: PostgrestError) {
  if (error.code === "PT409") return fail("invalid_input", "This chat is closed.", 409);
  if (error.code === "PT404") return fail("invalid_input", "Chat not found.", 404);
  if (error.code === "22023") return fail("invalid_input", error.message, 400);
  if (error.code === "P0001") return fail("invalid_input", error.message, 400);
  return fail("server_error", "Your message could not be sent.", 500);
}

/** Any signed in, active account. The database decides what it may see. */
function signedIn() {
  return requireRole("user", "professional", "admin");
}

function privateStorage() {
  try {
    return createPrivateStorageClient();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sending (shared by both sides)
// ---------------------------------------------------------------------------

interface Target {
  /** Checks the caller may write now and returns the chat id (the file folder). */
  open: () => PromiseLike<{ data: unknown; error: PostgrestError | null }>;
  /** Writes the message as the caller. */
  send: (args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: PostgrestError | null }>;
}

async function send(request: NextRequest, target: Target) {
  const multipart = request.headers.get("content-type")?.startsWith("multipart/form-data") ?? false;

  if (!multipart) {
    const body = textSchema.safeParse(await readJson(request));
    if (!body.success) return invalidInput();
    const { data, error } = await target.send({ p_kind: "text", p_body: body.data.text });
    const row = Array.isArray(data) ? (data[0] as MessageRow | undefined) : undefined;
    if (error || !row) return error ? ruleError(error) : fail("server_error", "Your message could not be sent.", 500);
    return json<ClinicSendResponse>({ message: toMessage(row) }, 201);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return invalidInput();
  }

  // Photo or PDF, otherwise a voice message. Checked from the bytes, not the claimed type.
  const isAttachment = form.get("kind") === "attachment";
  const upload = form.get(isAttachment ? "file" : "audio");
  if (!(upload instanceof File) || upload.size === 0) return invalidInput();
  if (upload.size > (isAttachment ? MAX_FILE_BYTES : MAX_VOICE_BYTES)) return invalidInput();
  const bytes = new Uint8Array(await upload.arrayBuffer());

  let bucket: string;
  let contentType: string;
  let extension: string;
  let args: Record<string, unknown>;
  if (isAttachment) {
    const detected = attachmentType(bytes);
    const allowed: readonly string[] = [...IMAGE_TYPES, ...FILE_TYPES];
    if (!detected || !allowed.includes(detected.contentType)) {
      return fail("invalid_input", "Send a photo (JPG, PNG or WebP) or a PDF file.", 400);
    }
    bucket = ATTACHMENT_BUCKET;
    contentType = detected.contentType;
    extension = detected.extension;
    args = {
      p_kind: detected.kind,
      p_attachment_name: attachmentName(upload.name, detected.extension),
      p_attachment_type: detected.contentType,
      p_attachment_size: bytes.byteLength,
    };
  } else {
    const duration = durationSchema.safeParse(form.get("durationSeconds"));
    const detected = voiceType(bytes);
    if (!duration.success || !detected) return invalidInput();
    bucket = VOICE_BUCKET;
    contentType = detected.contentType;
    extension = detected.extension;
    args = { p_kind: "voice", p_duration_seconds: duration.data };
  }

  const opened = await target.open();
  if (opened.error || typeof opened.data !== "string") {
    return opened.error ? ruleError(opened.error) : fail("server_error", "Your message could not be sent.", 500);
  }

  const storage = privateStorage();
  if (!storage) return fail("server_error", "Files cannot be sent right now.", 503);
  const path = `clinic/${opened.data}/${crypto.randomUUID()}.${extension}`;
  const stored = await storage.storage.from(bucket).upload(path, bytes, { contentType, upsert: false });
  if (stored.error) return fail("server_error", "Your file could not be uploaded.", 500);

  const { data, error } = await target.send({
    ...args,
    ...(isAttachment ? { p_attachment_path: path } : { p_audio_path: path }),
  });
  const row = Array.isArray(data) ? (data[0] as MessageRow | undefined) : undefined;
  if (error || !row) {
    // An upload that never became a message is removed again.
    await storage.storage.from(bucket).remove([path]);
    return error ? ruleError(error) : fail("server_error", "Your message could not be sent.", 500);
  }
  return json<ClinicSendResponse>({ message: toMessage(row) }, 201);
}

async function thread(supabase: SupabaseClient, rpc: string, args: Record<string, unknown>, canWrite: boolean) {
  const { data, error } = await supabase.rpc(rpc, { ...args, p_limit: THREAD_LIMIT });
  if (error) {
    return error.code === "PT404"
      ? fail("invalid_input", "Chat not found.", 404)
      : fail("server_error", "We could not load this chat.", 500);
  }
  const messages = [...((data ?? []) as MessageRow[])].reverse().map(toMessage);
  return json<ClinicThreadResponse>({ canWrite, messages });
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

interface MyChatRow extends LastRow {
  clinic_slug: string;
  clinic_name: string;
  clinic_name_km: string | null;
  can_write: boolean;
  unread: number;
}

async function loadMyChats(supabase: SupabaseClient): Promise<MyClinicChat[] | null> {
  const { data, error } = await supabase.rpc("my_clinic_chats");
  if (error) return null;
  return ((data ?? []) as MyChatRow[]).map((row) => ({
    clinicSlug: row.clinic_slug,
    clinicName: row.clinic_name,
    clinicKmName: row.clinic_name_km ?? "",
    canWrite: row.can_write,
    last: toLast(row, "client"),
    unread: row.unread ?? 0,
  }));
}

/** GET /api/clinic-chat: the student's clinic chats. */
export async function listMyClinicChats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const chats = await loadMyChats(supabase);
  if (!chats) return fail("server_error", "We could not load your messages.", 500);
  return json<MyClinicChatsResponse>({ chats });
}

/** GET /api/clinic-chat/:slug: one chat, oldest first. */
export async function getMyClinicThread(slug: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return invalidInput();

  const chat = (await loadMyChats(guard.supabase))?.find((item) => item.clinicSlug === parsed.data);
  if (!chat) return fail("invalid_input", "Chat not found.", 404);
  return thread(guard.supabase, "read_my_clinic_chat", { p_slug: parsed.data }, chat.canWrite);
}

/** POST /api/clinic-chat/:slug: JSON `{ kind: "text", text }`, or multipart voice or attachment. */
export async function sendMyClinicMessage(request: NextRequest, slug: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return invalidInput();

  const { supabase } = guard;
  return send(request, {
    open: () => supabase.rpc("open_my_clinic_chat", { p_slug: parsed.data }),
    send: (args) => supabase.rpc("send_my_clinic_message", { p_slug: parsed.data, ...args }),
  });
}

/** POST /api/clinic-chat/:slug/read */
export async function markMyClinicChatRead(slug: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return invalidInput();

  const { data, error } = await guard.supabase.rpc("mark_my_clinic_chat_read", { p_slug: parsed.data });
  if (error) return fail("server_error", "That could not be saved.", 500);
  return json({ marked: typeof data === "number" ? data : 0 });
}

// ---------------------------------------------------------------------------
// Clinic desk
// ---------------------------------------------------------------------------

interface DeskChatRow extends LastRow {
  conversation_id: string;
  reference: string;
  client_name: string;
  can_write: boolean;
  request_ids: string[] | null;
  unread: number;
}

async function loadDeskChats(supabase: SupabaseClient, slug: string): Promise<DeskChat[] | { error: PostgrestError }> {
  const { data, error } = await supabase.rpc("clinic_desk_chats", { p_slug: slug });
  if (error) return { error };
  return ((data ?? []) as DeskChatRow[]).map((row) => ({
    id: row.conversation_id,
    reference: row.reference,
    clientName: row.client_name,
    canWrite: row.can_write,
    requestIds: row.request_ids ?? [],
    last: toLast(row, "clinic"),
    unread: row.unread ?? 0,
  }));
}

/** GET /api/clinic-desk/:slug/chats */
export async function listDeskChats(slug: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return invalidInput();

  const chats = await loadDeskChats(guard.supabase, parsed.data);
  if ("error" in chats) {
    return chats.error.code === "P0001"
      ? fail("forbidden", "You do not have access to this clinic desk.", 403)
      : fail("server_error", "We could not load the chats.", 500);
  }
  return json<DeskChatsResponse>({ chats });
}

/** GET /api/clinic-desk/:slug/chats/:id */
export async function getDeskThread(slug: string, chatId: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;
  const parsed = slugSchema.safeParse(slug);
  const id = z.string().uuid().safeParse(chatId);
  if (!parsed.success || !id.success) return invalidInput();

  const chats = await loadDeskChats(guard.supabase, parsed.data);
  if ("error" in chats) return fail("forbidden", "You do not have access to this clinic desk.", 403);
  const chat = chats.find((item) => item.id === id.data);
  if (!chat) return fail("invalid_input", "Chat not found.", 404);
  return thread(guard.supabase, "read_clinic_desk_chat", { p_conversation_id: id.data }, chat.canWrite);
}

/** POST /api/clinic-desk/:slug/chats/:id: the database checks the caller works at this chat's desk. */
export async function sendDeskMessage(request: NextRequest, chatId: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;
  const id = z.string().uuid().safeParse(chatId);
  if (!id.success) return invalidInput();

  const { supabase } = guard;
  return send(request, {
    open: () => supabase.rpc("open_clinic_desk_chat", { p_conversation_id: id.data }),
    send: (args) => supabase.rpc("send_clinic_desk_message", { p_conversation_id: id.data, ...args }),
  });
}

/** POST /api/clinic-desk/:slug/chats/:id/read */
export async function markDeskChatRead(chatId: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;
  const id = z.string().uuid().safeParse(chatId);
  if (!id.success) return invalidInput();

  const { data, error } = await guard.supabase.rpc("mark_clinic_desk_chat_read", { p_conversation_id: id.data });
  if (error) return error.code === "PT404" ? fail("invalid_input", "Chat not found.", 404) : fail("server_error", "That could not be saved.", 500);
  return json({ marked: typeof data === "number" ? data : 0 });
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

/** GET /api/clinic-chat-files/:messageId: streams a voice message, photo or PDF to someone in that chat. */
export async function openClinicChatFile(messageId: string) {
  const id = z.string().uuid().safeParse(messageId);
  if (!id.success) return invalidInput();

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return unauthorized();

  const storage = privateStorage();
  if (!storage) return fail("server_error", "Files cannot be opened right now.", 503);

  // Read the metadata on the server. Never return the storage path.
  const { data: message, error } = await storage
    .from("clinic_messages")
    .select("kind, audio_path, attachment_path, attachment_type, attachment_name")
    .eq("id", id.data)
    .maybeSingle<{
      kind: MessageKind;
      audio_path: string | null;
      attachment_path: string | null;
      attachment_type: string | null;
      attachment_name: string | null;
    }>();
  if (error) return fail("server_error", "Could not load this file.", 500);
  const path = message?.kind === "voice" ? message.audio_path : message?.attachment_path;
  if (!message || !path) return fail("invalid_input", "File not found.", 404);

  // Check, as the signed in person, that they are in this chat.
  const { data: allowed, error: checkError } = await supabase.rpc("can_open_clinic_message", { p_message_id: id.data });
  if (checkError) return fail("server_error", "Could not load this file.", 500);
  if (allowed !== true) return fail("invalid_input", "File not found.", 404);

  const { data: file, error: downloadError } = await storage.storage
    .from(message.kind === "voice" ? VOICE_BUCKET : ATTACHMENT_BUCKET)
    .download(path);
  if (downloadError || !file) return fail("server_error", "Could not load this file.", 500);

  const headers: Record<string, string> = {
    ...NO_STORE,
    "Content-Type": (message.kind === "voice" ? file.type : message.attachment_type) || "application/octet-stream",
    "Content-Length": String(file.size),
    "X-Content-Type-Options": "nosniff",
  };
  if (message.kind !== "voice") {
    headers["Content-Disposition"] = `inline; filename*=UTF-8''${encodeURIComponent(message.attachment_name ?? "file")}`;
  }
  return new Response(file, { status: 200, headers });
}
