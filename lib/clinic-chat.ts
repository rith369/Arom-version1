/*
 * Chat between a clinic desk and a student (BACKEND-HANDOFF.md section 35).
 * The student sees the clinic, never the desk person's name. The desk sees
 * the student by the name they share (usually "Anonymous") and a short code.
 * Messages use the same shape as therapist chats (lib/messages.ts) so the
 * same chat view draws them: "client" is the student, "professional" is the
 * clinic side.
 */

import type { ApiMessage, MessageKind } from "@/lib/messages";

export type ClinicChatLast = { kind: MessageKind; mine: boolean; text: string; createdAt: string } | null;

/** One clinic chat in the student's Messages list. */
export interface MyClinicChat {
  clinicSlug: string;
  clinicName: string;
  clinicKmName: string;
  // False 30 days after the last request or clinic session. Messages are kept.
  canWrite: boolean;
  last: ClinicChatLast;
  unread: number;
}

export interface MyClinicChatsResponse {
  chats: MyClinicChat[];
}

/** One student chat on the clinic desk. */
export interface DeskChat {
  id: string;
  reference: string;
  clientName: string;
  canWrite: boolean;
  // Every request of this student at this clinic, newest first.
  requestIds: string[];
  last: ClinicChatLast;
  unread: number;
}

export interface DeskChatsResponse {
  chats: DeskChat[];
}

export interface ClinicThreadResponse {
  canWrite: boolean;
  messages: ApiMessage[];
}

export interface ClinicSendResponse {
  message: ApiMessage;
}
