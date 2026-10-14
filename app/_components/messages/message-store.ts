'use client';

import { useEffect, useSyncExternalStore } from 'react';
import {
  MAX_TEXT,
  MAX_VOICE_SECONDS,
  conversationKey,
  type ApiMessage,
  type ConversationSummary,
  type ConversationsResponse,
  type ReplyTime,
  type SendResponse,
  type Sender,
  type ThreadResponse,
} from '@/lib/messages';
import {
  MAX_QUICK_REPLIES,
  MAX_QUICK_REPLY,
  type QuickRepliesResponse,
  type QuickReply,
} from '@/lib/sessions';
import { mergeSuggestions } from '../sessions/session-store';

// Private messages between one client and one professional, only after the
// client has booked with them. Admins cannot read these. Conversations and
// messages come from the API (BACKEND-HANDOFF.md section 17) and are checked
// again every few seconds while a page is open. Suggestions arrive with each
// thread and are kept in sessions/session-store.ts. Quick replies come from
// /api/pro/quick-replies (section 19).

export { MAX_QUICK_REPLIES, MAX_QUICK_REPLY, MAX_TEXT, MAX_VOICE_SECONDS };
export type { ConversationSummary, QuickReply, ReplyTime, Sender };

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: Sender;
  // suggestion: times for the next session (see sessions/session-store.ts).
  kind: 'text' | 'voice' | 'suggestion';
  text: string;
  // Voice only.
  audioUrl: string;
  durationSeconds: number;
  suggestionId: string;
  createdAt: string;
  readAt: string | null;
};

export type Conversation = {
  id: string; // `${professionalId}:${clientId}`
  professionalId: string; // slug
  professionalName: string;
  kmProfessionalName: string;
  clientId: string;
  clientName: string;
};

type ListState = { status: 'loading' | 'ready' | 'error'; conversations: ConversationSummary[] };

type State = {
  // One list per side, so a professional can also use /messages as a client.
  lists: Record<Sender, ListState>;
  threads: Record<string, ChatMessage[]>;
  replyTimes: Record<string, ReplyTime>;
  // The signed in professional's own quick replies. Null until loaded.
  quickReplies: QuickReply[] | null;
};

export const conversationId = conversationKey;

const initial: State = {
  lists: { client: { status: 'loading', conversations: [] }, professional: { status: 'loading', conversations: [] } },
  threads: {},
  replyTimes: {},
  quickReplies: null,
};
let state: State = initial;
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMessageStore() {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

const threadUrl = (conversation: Pick<Conversation, 'professionalId' | 'clientId'>, viewer: Sender) =>
  viewer === 'client'
    ? `/api/messages/${encodeURIComponent(conversation.professionalId)}`
    : `/api/pro/messages/${encodeURIComponent(conversation.clientId)}`;

async function getJson<T>(url: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  try {
    const response = await fetch(url, { cache: 'no-store', ...init });
    if (!response.ok) return { ok: false, status: response.status };
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, status: 0 };
  }
}

function toChatMessage(message: ApiMessage, key: string): ChatMessage {
  return { ...message, conversationId: key };
}

function withReplyTimes(conversations: ConversationSummary[]) {
  const replyTimes = { ...state.replyTimes };
  for (const item of conversations) replyTimes[item.professionalId] = item.replyTime;
  return replyTimes;
}

function replaceSummary(viewer: Sender, summary: ConversationSummary): Record<Sender, ListState> {
  const list = state.lists[viewer];
  const exists = list.conversations.some((item) => item.key === summary.key);
  return {
    ...state.lists,
    [viewer]: {
      ...list,
      conversations: exists
        ? list.conversations.map((item) => (item.key === summary.key ? summary : item))
        : [...list.conversations, summary],
    },
  };
}

export async function loadConversations(viewer: Sender) {
  const result = await getJson<ConversationsResponse>(viewer === 'client' ? '/api/messages' : '/api/pro/messages');
  if (!result.ok) {
    // Keep what is already shown if a later refresh fails.
    if (state.lists[viewer].status !== 'ready') {
      setState({ ...state, lists: { ...state.lists, [viewer]: { status: 'error', conversations: [] } } });
    }
    return;
  }
  const conversations = result.data.conversations;
  setState({
    ...state,
    lists: { ...state.lists, [viewer]: { status: 'ready', conversations } },
    replyTimes: withReplyTimes(conversations),
  });
}

export async function loadThread(conversation: Conversation, viewer: Sender) {
  const result = await getJson<ThreadResponse>(threadUrl(conversation, viewer));
  if (!result.ok) return;
  const { conversation: summary, messages, suggestions } = result.data;
  mergeSuggestions(suggestions);
  setState({
    ...state,
    lists: replaceSummary(viewer, summary),
    threads: { ...state.threads, [summary.key]: messages.map((item) => toChatMessage(item, summary.key)) },
    replyTimes: withReplyTimes([summary]),
  });
}

/** Loads the conversation list for one side and checks it again every 30 seconds. */
export function useConversations(viewer: Sender) {
  const store = useMessageStore();
  useEffect(() => {
    void loadConversations(viewer);
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadConversations(viewer);
    }, 30_000);
    return () => window.clearInterval(id);
  }, [viewer]);
  return store.lists[viewer];
}

/** Loads one thread and checks it again every 10 seconds while it is open. */
export function useThread(conversation: Conversation | undefined, viewer: Sender) {
  const store = useMessageStore();
  const professionalId = conversation?.professionalId;
  const clientId = conversation?.clientId;
  useEffect(() => {
    if (!professionalId || !clientId) return;
    const target = { id: conversationKey(professionalId, clientId), professionalId, clientId, professionalName: '', kmProfessionalName: '', clientName: '' };
    void loadThread(target, viewer);
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadThread(target, viewer);
    }, 10_000);
    return () => window.clearInterval(id);
  }, [professionalId, clientId, viewer]);

  if (!conversation) return { loaded: false, messages: [] as ChatMessage[], summary: undefined };
  const loaded = conversation.id in store.threads;
  const messages = store.threads[conversation.id] ?? [];
  const summary = store.lists[viewer].conversations.find((item) => item.key === conversation.id);
  return { loaded, messages, summary };
}

export type SendResult = { ok: true } | { ok: false; reason: 'not_allowed' | 'closed' | 'failed' };

function sendFailure(status: number): SendResult {
  return { ok: false, reason: status === 403 ? 'not_allowed' : status === 409 ? 'closed' : 'failed' };
}

export async function sendMessage(
  conversation: Conversation,
  sender: Sender,
  content:
    | { kind: 'text'; text: string }
    | { kind: 'voice'; audio: Blob; durationSeconds: number },
): Promise<SendResult> {
  let init: RequestInit;
  if (content.kind === 'text') {
    init = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'text', text: content.text.slice(0, MAX_TEXT) }),
    };
  } else {
    const body = new FormData();
    body.set('audio', content.audio, 'voice');
    body.set('durationSeconds', String(Math.min(MAX_VOICE_SECONDS, Math.max(1, Math.round(content.durationSeconds)))));
    init = { method: 'POST', body };
  }

  const result = await getJson<SendResponse>(threadUrl(conversation, sender), init);
  if (!result.ok) return sendFailure(result.status);

  const message = toChatMessage(result.data.message, conversation.id);
  setState({ ...state, threads: { ...state.threads, [conversation.id]: [...(state.threads[conversation.id] ?? []), message] } });
  void loadConversations(sender);
  return { ok: true };
}

// Marks the other person's messages as read when the viewer opens the chat.
export function markRead(conversation: Conversation, viewer: Sender) {
  const thread = state.threads[conversation.id] ?? [];
  if (!thread.some((item) => item.sender !== viewer && !item.readAt)) return;
  const now = new Date().toISOString();
  const list = state.lists[viewer];
  setState({
    ...state,
    threads: {
      ...state.threads,
      [conversation.id]: thread.map((item) => (item.sender !== viewer && !item.readAt ? { ...item, readAt: now } : item)),
    },
    lists: {
      ...state.lists,
      [viewer]: { ...list, conversations: list.conversations.map((item) => (item.key === conversation.id ? { ...item, unread: 0 } : item)) },
    },
  });
  void getJson(`${threadUrl(conversation, viewer)}/read`, { method: 'POST' });
}

export async function setReplyTime(professionalId: string, value: ReplyTime) {
  const previous = state.replyTimes[professionalId];
  setState({ ...state, replyTimes: { ...state.replyTimes, [professionalId]: value } });
  const result = await getJson('/api/pro/messages', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ replyTime: value }),
  });
  if (!result.ok && previous) setState({ ...state, replyTimes: { ...state.replyTimes, [professionalId]: previous } });
}

/** The professional's quick replies, loaded once when first needed. */
export function useQuickReplies(enabled: boolean) {
  const store = useMessageStore();
  useEffect(() => {
    if (!enabled || state.quickReplies !== null) return;
    void getJson<QuickRepliesResponse>('/api/pro/quick-replies').then((result) => {
      if (result.ok) setState({ ...state, quickReplies: result.data.quickReplies });
    });
  }, [enabled]);
  return store.quickReplies ?? [];
}

/** Replaces the whole list. Shown at once, then saved. */
export async function saveQuickReplies(replies: QuickReply[]) {
  const previous = state.quickReplies;
  const next = replies.slice(0, MAX_QUICK_REPLIES).map((item) => ({ ...item, text: item.text.slice(0, MAX_QUICK_REPLY) }));
  setState({ ...state, quickReplies: next });
  const result = await getJson<QuickRepliesResponse>('/api/pro/quick-replies', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quickReplies: next.map((item) => ({ text: item.text })) }),
  });
  setState({ ...state, quickReplies: result.ok ? result.data.quickReplies : previous });
  return result.ok;
}

// Fills {name}, {link} and {next}. Unknown values are left empty.
export function fillQuickReply(text: string, values: { name: string; link: string; next: string }) {
  return text.replaceAll('{name}', values.name).replaceAll('{link}', values.link).replaceAll('{next}', values.next);
}

/** Unread messages from the other person in one conversation. */
export function unreadCount(list: ListState, id: string) {
  return list.conversations.find((item) => item.key === id)?.unread ?? 0;
}

export const REPLY_TIME_LABELS: Record<ReplyTime, { en: string; km: string }> = {
  few_hours: { en: 'Usually replies within a few hours', km: 'ជាធម្មតាឆ្លើយតបក្នុងរយៈពេលពីរបីម៉ោង' },
  one_day: { en: 'Usually replies within 1 working day', km: 'ជាធម្មតាឆ្លើយតបក្នុងរយៈពេល ១ ថ្ងៃធ្វើការ' },
  two_days: { en: 'Usually replies within 2 working days', km: 'ជាធម្មតាឆ្លើយតបក្នុងរយៈពេល ២ ថ្ងៃធ្វើការ' },
};
