'use client';

import { useSyncExternalStore } from 'react';

// Private messages between one client and one professional, only after the
// client has booked with them. Admins cannot read these. Mock store: kept in
// memory only (never in browser storage), so it resets on refresh.

export type Sender = 'client' | 'professional';

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: Sender;
  kind: 'text' | 'voice';
  text: string;
  // Voice only. Empty for sample voice messages that have no audio.
  audioUrl: string;
  durationSeconds: number;
  createdAt: string;
  readAt: string | null;
};

export type Conversation = {
  id: string; // `${professionalId}:${clientId}`
  professionalId: string;
  professionalName: string;
  kmProfessionalName: string;
  clientId: string;
  clientName: string;
};

export type ReplyTime = 'few_hours' | 'one_day' | 'two_days';

type State = {
  conversations: Conversation[];
  messages: ChatMessage[];
  replyTimes: Record<string, ReplyTime>;
};

export const MAX_VOICE_SECONDS = 120;
export const MAX_TEXT = 2000;

export const conversationId = (professionalId: string, clientId: string) => `${professionalId}:${clientId}`;

const SOPHEAP = { professionalId: 'sopheap-chan', professionalName: 'Dr. Sopheap Chan', kmProfessionalName: 'វេជ្ជបណ្ឌិត ចាន់ សុភាព' };

function seed(): State {
  const dara = conversationId('sopheap-chan', 'demo-user-001');
  const rachana = conversationId('sopheap-chan', 'demo-user-005');
  const message = (id: string, convo: string, sender: Sender, createdAt: string, text: string, read = true): ChatMessage => ({
    id,
    conversationId: convo,
    sender,
    kind: 'text',
    text,
    audioUrl: '',
    durationSeconds: 0,
    createdAt,
    readAt: read ? createdAt : null,
  });

  return {
    conversations: [
      { id: dara, ...SOPHEAP, clientId: 'demo-user-001', clientName: 'Sok Dara' },
      { id: rachana, ...SOPHEAP, clientId: 'demo-user-005', clientName: 'Heng Rachana' },
    ],
    messages: [
      message('m1', dara, 'professional', '2026-10-12T05:10:00Z', 'Thank you for today, Dara. As we discussed, try the 4 7 8 breathing before bed this week.'),
      message('m2', dara, 'client', '2026-10-12T13:42:00Z', 'Thank you! I tried it last night and fell asleep a bit faster.'),
      {
        id: 'm3',
        conversationId: dara,
        sender: 'client',
        kind: 'voice',
        text: '',
        audioUrl: '',
        durationSeconds: 34,
        createdAt: '2026-10-13T01:05:00Z',
        readAt: null,
      },
      message('m4', dara, 'client', '2026-10-13T01:06:00Z', 'Sorry, easier to say it in Khmer. Can we talk about work stress on Friday?', false),
      message('m5', rachana, 'client', '2026-10-11T10:20:00Z', 'Is it okay if my camera is off at the start of our session?'),
      message('m6', rachana, 'professional', '2026-10-11T11:02:00Z', 'Of course. Turn it on only when you feel ready.'),
    ],
    replyTimes: { 'sopheap-chan': 'one_day' },
  };
}

const initial = seed();
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

function ensureConversation(conversation: Conversation) {
  if (state.conversations.some((item) => item.id === conversation.id)) return state.conversations;
  return [...state.conversations, conversation];
}

export function sendMessage(
  conversation: Conversation,
  sender: Sender,
  content: { kind: 'text'; text: string } | { kind: 'voice'; audioUrl: string; durationSeconds: number },
) {
  const now = new Date().toISOString();
  setState({
    ...state,
    conversations: ensureConversation(conversation),
    messages: [
      ...state.messages,
      {
        id: crypto.randomUUID(),
        conversationId: conversation.id,
        sender,
        kind: content.kind,
        text: content.kind === 'text' ? content.text.slice(0, MAX_TEXT) : '',
        audioUrl: content.kind === 'voice' ? content.audioUrl : '',
        durationSeconds: content.kind === 'voice' ? content.durationSeconds : 0,
        createdAt: now,
        readAt: null,
      },
    ],
  });
}

// Marks the other person's messages as read when the viewer opens the chat.
export function markRead(id: string, viewer: Sender) {
  const now = new Date().toISOString();
  if (!state.messages.some((item) => item.conversationId === id && item.sender !== viewer && !item.readAt)) return;
  setState({
    ...state,
    messages: state.messages.map((item) =>
      item.conversationId === id && item.sender !== viewer && !item.readAt ? { ...item, readAt: now } : item,
    ),
  });
}

export function setReplyTime(professionalId: string, value: ReplyTime) {
  setState({ ...state, replyTimes: { ...state.replyTimes, [professionalId]: value } });
}

export function unreadCount(messages: ChatMessage[], id: string, viewer: Sender) {
  return messages.filter((item) => item.conversationId === id && item.sender !== viewer && !item.readAt).length;
}

export const REPLY_TIME_LABELS: Record<ReplyTime, { en: string; km: string }> = {
  few_hours: { en: 'Usually replies within a few hours', km: 'ជាធម្មតាឆ្លើយតបក្នុងរយៈពេលពីរបីម៉ោង' },
  one_day: { en: 'Usually replies within 1 working day', km: 'ជាធម្មតាឆ្លើយតបក្នុងរយៈពេល ១ ថ្ងៃធ្វើការ' },
  two_days: { en: 'Usually replies within 2 working days', km: 'ជាធម្មតាឆ្លើយតបក្នុងរយៈពេល ២ ថ្ងៃធ្វើការ' },
};
