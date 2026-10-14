/*
 * Private messages between a client and a professional
 * (BACKEND-HANDOFF.md section 17). Only the two people in a conversation
 * can read it. Admins cannot. Returned by /api/messages (client side) and
 * /api/pro/messages (professional side).
 */

export type Sender = "client" | "professional";

export type ReplyTime = "few_hours" | "one_day" | "two_days";
export const REPLY_TIMES: readonly ReplyTime[] = ["few_hours", "one_day", "two_days"];

export const MAX_TEXT = 2000;
export const MAX_VOICE_SECONDS = 120;
export const MAX_VOICE_BYTES = 5 * 1024 * 1024;

export interface ApiMessage {
  id: string;
  sender: Sender;
  kind: "text" | "voice";
  text: string;
  // Voice only: a same site link that redirects to a short lived signed URL.
  audioUrl: string;
  durationSeconds: number;
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
  last: { kind: "text" | "voice"; mine: boolean; text: string; createdAt: string } | null;
  unread: number;
}

export interface ConversationsResponse {
  conversations: ConversationSummary[];
}

export interface ThreadResponse {
  conversation: ConversationSummary;
  messages: ApiMessage[];
}

export interface SendResponse {
  message: ApiMessage;
}

export const conversationKey = (professionalSlug: string, clientId: string) => `${professionalSlug}:${clientId}`;
