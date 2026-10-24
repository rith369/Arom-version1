"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ClinicSendResponse,
  ClinicThreadResponse,
  DeskChat,
  DeskChatsResponse,
  MyClinicChat,
  MyClinicChatsResponse,
} from "@/lib/clinic-chat";
import { MAX_TEXT, MAX_VOICE_SECONDS, type ApiMessage, type Sender } from "@/lib/messages";
import type { SendContent } from "../messages/chat-thread";
import type { ChatMessage, SendResult } from "../messages/message-store";

/*
 * Clinic chats (BACKEND-HANDOFF.md section 35), loaded from the API and
 * checked again while a page is open: lists every 30 seconds, an open chat
 * every 10 seconds. The student uses /api/clinic-chat/:slug, the desk
 * /api/clinic-desk/:slug/chats/:id. Both send the same shapes as therapist
 * chats so ChatThreadView draws them.
 */

async function getJson<T>(url: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  try {
    const response = await fetch(url, { cache: "no-store", ...init });
    if (!response.ok) return { ok: false, status: response.status };
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, status: 0 };
  }
}

const toChat = (message: ApiMessage, key: string): ChatMessage => ({ ...message, conversationId: key });

function usePolling(load: () => Promise<void>, everyMs: number, active: boolean) {
  useEffect(() => {
    if (!active) return;
    void load();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, everyMs);
    return () => window.clearInterval(id);
  }, [load, everyMs, active]);
}

type ListState<T> = { status: "loading" | "ready" | "error"; chats: T[] };

/** The student's clinic chats. */
export function useMyClinicChats() {
  const [state, setState] = useState<ListState<MyClinicChat>>({ status: "loading", chats: [] });
  const load = useCallback(async () => {
    const result = await getJson<MyClinicChatsResponse>("/api/clinic-chat");
    if (result.ok) setState({ status: "ready", chats: result.data.chats });
    else setState((current) => (current.status === "ready" ? current : { status: "error", chats: [] }));
  }, []);
  usePolling(load, 30_000, true);
  return { ...state, reload: load };
}

/** A clinic desk's student chats. */
export function useDeskChats(slug: string) {
  const [state, setState] = useState<ListState<DeskChat>>({ status: "loading", chats: [] });
  const load = useCallback(async () => {
    const result = await getJson<DeskChatsResponse>(`/api/clinic-desk/${slug}/chats`);
    if (result.ok) setState({ status: "ready", chats: result.data.chats });
    else setState((current) => (current.status === "ready" ? current : { status: "error", chats: [] }));
  }, [slug]);
  usePolling(load, 30_000, Boolean(slug));
  return { ...state, reload: load };
}

/**
 * One open clinic chat. `url` is the thread endpoint; `viewer` is the side
 * of whoever looks at it ("client" for the student, "professional" for the
 * desk). `onChange` runs after a send or read so the list can refresh.
 */
export function useClinicThread(url: string | null, viewer: Sender, onChange?: () => void) {
  const [state, setState] = useState<{ url: string; loaded: boolean; canWrite: boolean; messages: ChatMessage[] } | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const load = useCallback(async () => {
    if (!url) return;
    const result = await getJson<ClinicThreadResponse>(url);
    if (!result.ok) return;
    setState({ url, loaded: true, canWrite: result.data.canWrite, messages: result.data.messages.map((item) => toChat(item, url)) });
  }, [url]);
  usePolling(load, 10_000, Boolean(url));

  const current = state && state.url === url ? state : null;

  async function send(content: SendContent): Promise<SendResult> {
    if (!url) return { ok: false, reason: "failed" };
    let init: RequestInit;
    if (content.kind === "text") {
      init = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "text", text: content.text.slice(0, MAX_TEXT) }),
      };
    } else if (content.kind === "attachment") {
      const body = new FormData();
      body.set("kind", "attachment");
      body.set("file", content.file, content.file.name);
      init = { method: "POST", body };
    } else {
      const body = new FormData();
      body.set("audio", content.audio, "voice");
      body.set("durationSeconds", String(Math.min(MAX_VOICE_SECONDS, Math.max(1, Math.round(content.durationSeconds)))));
      init = { method: "POST", body };
    }
    const result = await getJson<ClinicSendResponse>(url, init);
    if (!result.ok) return { ok: false, reason: result.status === 409 ? "closed" : result.status === 403 ? "not_allowed" : "failed" };
    const message = toChat(result.data.message, url);
    setState((previous) =>
      previous && previous.url === url ? { ...previous, messages: [...previous.messages, message] } : previous,
    );
    onChangeRef.current?.();
    return { ok: true };
  }

  function markSeen() {
    if (!url || !current) return;
    if (!current.messages.some((item) => item.sender !== viewer && !item.readAt)) return;
    const now = new Date().toISOString();
    setState((previous) =>
      previous && previous.url === url
        ? { ...previous, messages: previous.messages.map((item) => (item.sender !== viewer && !item.readAt ? { ...item, readAt: now } : item)) }
        : previous,
    );
    void getJson(`${url}/read`, { method: "POST" }).then(() => onChangeRef.current?.());
  }

  return {
    loaded: current?.loaded ?? false,
    canWrite: current?.canWrite ?? false,
    messages: current?.messages ?? [],
    send,
    markSeen,
  };
}
