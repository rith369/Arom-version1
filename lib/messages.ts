/*
 * Private messages between a client and a professional
 * (BACKEND-HANDOFF.md section 17). Only the two people in a conversation
 * can read it. Admins cannot. Returned by /api/messages (client side) and
 * /api/pro/messages (professional side).
 */

import type { SessionSuggestion } from "@/lib/sessions";

export type Sender = "client" | "professional";

export type ReplyTime = "few_hours" | "one_day" | "two_days";
export const REPLY_TIMES: readonly ReplyTime[] = ["few_hours", "one_day", "two_days"];

export const MAX_TEXT = 2000;
export const MAX_VOICE_SECONDS = 120;
export const MAX_VOICE_BYTES = 5 * 1024 * 1024;

// Photos and PDF files in chats (private and group): 5 MB each.
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const FILE_TYPES = ["application/pdf"] as const;
// For file pickers.
export const ATTACHMENT_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export type MessageKind = "text" | "voice" | "suggestion" | "image" | "file";

// A photo or PDF in a message. url streams it after a membership check.
export interface MessageAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface ApiMessage {
  id: string;
  sender: Sender;
  // suggestion: times for the next session (lib/sessions.ts).
  // image and file: a photo or a PDF (attachment).
  kind: MessageKind;
  text: string;
  // Voice only: a same site link that redirects to a short lived signed URL.
  audioUrl: string;
  durationSeconds: number;
  suggestionId: string;
  attachment: MessageAttachment | null;
  createdAt: string;
  readAt: string | null;
}

export interface ConversationSummary {
  // `${professional slug}:${client id}`, the same on both sides.
  key: string;
  professionalId: string; // slug
  professionalName: string;
  kmProfessionalName: string;
  photoUrl: string;
  replyTime: ReplyTime;
  clientId: string;
  // Closed when the professional archives the client. Read only for both.
  closed: boolean;
  // False when closed, or when there is no booked or completed session.
  canWrite: boolean;
  last: { kind: MessageKind; mine: boolean; text: string; createdAt: string } | null;
  unread: number;
}

export interface ConversationsResponse {
  conversations: ConversationSummary[];
}

export interface ThreadResponse {
  conversation: ConversationSummary;
  messages: ApiMessage[];
  // The suggestions this thread's messages carry.
  suggestions: SessionSuggestion[];
}

export interface SendResponse {
  message: ApiMessage;
}

export const conversationKey = (professionalSlug: string, clientId: string) => `${professionalSlug}:${clientId}`;
