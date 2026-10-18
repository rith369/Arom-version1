'use client';

import { useEffect, useState } from 'react';
import type { ChatAttachment, ChatMessage, GroupMember, GroupMentor, SupportGroup } from '../community-data';
import { GroupHubView } from './group-hub-view';

// One message from GET /api/community/groups/:id/messages.
type ApiMessage = {
  id: string;
  content: string;
  created_at: string;
  display_name: string;
  is_own: boolean;
  is_mentor: boolean;
  is_removed?: boolean;
  kind?: 'text' | 'voice' | 'image' | 'file';
  attachment_name?: string | null;
  attachment_size?: number | null;
  duration_seconds?: number | null;
};

// One row of GET /api/community/groups/:id/members.
type MemberRow = {
  member_key: string;
  display_name: string;
  display_name_km: string;
  is_mentor: boolean;
  is_you: boolean;
  mentor_title: string | null;
  mentor_title_km: string | null;
  mentor_years: number | null;
  photo_url: string | null;
};

/**
 * A real support group's chat: loads its messages and members, sends new
 * messages, and draws GroupHubView. Used in Messages (layout "pane").
 * The server decides each sender's name from their "Hide my identity" choice.
 */
// The open chat checks for new messages at the same pace as private chats.
const THREAD_REFRESH_MS = 10_000;

export function GroupChat({
  group,
  onBack,
  onRead,
  layout = 'pane',
}: {
  group: SupportGroup;
  onBack: () => void;
  // Clears this group's unread badge in the Messages list.
  onRead?: (groupId: string) => void;
  layout?: 'page' | 'pane';
}) {
  const groupId = group.id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [mentor, setMentor] = useState<GroupMentor | undefined>(undefined);
  const [messageError, setMessageError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(`/api/community/groups/${groupId}/messages`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Could not load messages.');
        const result: { messages: ApiMessage[] } = await response.json();
        if (!active) return;
        const next = result.messages.map((message) => toChatMessage(message, groupId));
        // Keep the same list when nothing changed, so the chat does not jump
        // to the bottom while someone is reading older messages.
        setMessages((current) => (sameMessages(current, next) ? current : next));
        // Everything on screen now counts as read.
        void fetch(`/api/community/groups/${groupId}/read`, { method: 'POST' }).catch(() => undefined);
        onRead?.(groupId);
      } catch {
        if (active) setMessageError('Could not load messages. Please try again.');
      }
    }

    void load();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, THREAD_REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(id);
    };
    // onRead is a new function on every render of the page; it is not a reason to reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, refresh]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch(`/api/community/groups/${groupId}/members`, { cache: 'no-store' });
        if (!response.ok) return;
        const result: { members: MemberRow[] } = await response.json();
        if (!active) return;
        const mentorRow = result.members.find((row) => row.is_mentor);
        setMentor(mentorRow ? toMentor(mentorRow) : undefined);
        setMembers(result.members.filter((row) => !row.is_mentor).map((row) => toMember(row, groupId)));
      } catch {
        // The Members tab stays empty; the chat still works.
      }
    })();
    return () => {
      active = false;
    };
  }, [groupId]);

  // Sends a voice message, photo or PDF as a form; the server checks it.
  async function postMedia(form: FormData) {
    const response = await fetch(`/api/community/groups/${groupId}/messages`, { method: 'POST', body: form });
    if (!response.ok) {
      const result: { error?: string } = await response.json().catch(() => ({}));
      throw new Error(result.error || 'Could not send message.');
    }
  }

  async function handleSendVoice(audio: Blob, seconds: number) {
    if (group.status === 'closed') return false;
    setMessageError('');
    try {
      const form = new FormData();
      form.set('kind', 'voice');
      form.set('file', audio, 'voice');
      form.set('durationSeconds', String(Math.min(120, Math.max(1, Math.round(seconds)))));
      await postMedia(form);
      setRefresh((value) => value + 1);
      return true;
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : 'Could not send message.');
      return false;
    }
  }

  async function handleSendMessage(text: string, attachment?: ChatAttachment) {
    if (group.status === 'closed') return false;
    setMessageError('');
    if (!text.trim() && !attachment?.file) return false;

    // A photo or PDF first, then the text (if any) as its own message.
    if (attachment?.file) {
      try {
        const form = new FormData();
        form.set('kind', 'attachment');
        form.set('file', attachment.file, attachment.file.name);
        await postMedia(form);
      } catch (error) {
        setMessageError(error instanceof Error ? error.message : 'Could not send message.');
        return false;
      }
      if (!text.trim()) {
        setRefresh((value) => value + 1);
        return true;
      }
    }

    try {
      const response = await fetch(`/api/community/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() }),
      });
      if (!response.ok) {
        const result: { error?: string } = await response.json();
        throw new Error(result.error || 'Could not send message.');
      }
      setRefresh((value) => value + 1);
      return true;
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : 'Could not send message.');
      return false;
    }
  }

  return (
    <div className={layout === 'pane' ? 'flex h-full min-h-0 flex-col' : undefined}>
      {messageError && (
        <p role="alert" className="px-4 pt-3 text-sm text-red-600">
          {messageError}
        </p>
      )}
      <GroupHubView
        group={{ ...group, mentor: mentor ?? group.mentor }}
        messages={messages}
        // Group activities are not connected yet (BACKEND-HANDOFF section 23).
        activities={[]}
        members={members}
        onBack={onBack}
        onSendMessage={handleSendMessage}
        onToggleActivityJoin={() => undefined}
        onSendVoice={handleSendVoice}
        layout={layout}
      />
    </div>
  );
}

function sameMessages(a: ChatMessage[], b: ChatMessage[]) {
  return a.length === b.length && a.every((message, index) => message.id === b[index].id && message.removed === b[index].removed);
}

function toChatMessage(message: ApiMessage, groupId: string): ChatMessage {
  return {
    id: message.id,
    groupId,
    senderName: message.display_name,
    senderNameKm: message.display_name,
    isAnonymous: message.display_name === 'Anonymous' || message.display_name === 'Anonymous (You)',
    isOwn: message.is_own,
    isMentor: message.is_mentor,
    text: message.content,
    textKm: message.content,
    time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatarType: message.is_mentor ? 'mentor' : 'mask',
    // Removed by the AROM team: the text is not sent, a placeholder shows.
    removed: message.is_removed === true,
    // Files stream from the server after it checks the viewer is in the group.
    attachment:
      (message.kind === 'image' || message.kind === 'file') && message.attachment_name
        ? {
            type: message.kind,
            name: message.attachment_name,
            url: `/api/community/messages/${message.id}/media`,
            sizeStr: formatSize(message.attachment_size ?? 0),
          }
        : undefined,
    voice:
      message.kind === 'voice' && !message.is_removed
        ? { url: `/api/community/messages/${message.id}/media`, seconds: message.duration_seconds ?? 0 }
        : undefined,
  };
}

function formatSize(bytes: number) {
  if (!bytes) return '';
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function toMentor(row: MemberRow): GroupMentor {
  const years = row.mentor_years;
  return {
    name: row.display_name,
    nameKm: row.display_name_km,
    role: row.mentor_title || 'Group mentor',
    roleKm: row.mentor_title_km || row.mentor_title || 'អ្នកណែនាំក្រុម',
    experience: years === null ? 'Verified AROM professional' : `${years} ${years === 1 ? 'year' : 'years'} of experience`,
    experienceKm: years === null ? 'អ្នកជំនាញ AROM ផ្លូវការ' : `បទពិសោធន៍ ${years} ឆ្នាំ`,
    avatarUrl: row.photo_url || undefined,
    badge: 'Group Mentor',
    badgeKm: 'អ្នកណែនាំក្រុម',
  };
}

function toMember(row: MemberRow, groupId: string): GroupMember {
  const anonymous = row.display_name === 'Anonymous';
  return {
    id: row.member_key,
    groupId,
    name: row.is_you ? (anonymous ? 'Anonymous (You)' : `${row.display_name} (You)`) : row.display_name,
    nameKm: row.is_you ? (anonymous ? 'អនាមិក (អ្នក)' : `${row.display_name_km} (អ្នក)`) : row.display_name_km,
    isAnonymous: anonymous,
    avatarType: anonymous ? 'mask' : 'user',
    isYou: row.is_you,
  };
}
