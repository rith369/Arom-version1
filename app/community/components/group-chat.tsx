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
export function GroupChat({
  group,
  onBack,
  layout = 'pane',
}: {
  group: SupportGroup;
  onBack: () => void;
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
    void (async () => {
      try {
        const response = await fetch(`/api/community/groups/${groupId}/messages`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Could not load messages.');
        const result: { messages: ApiMessage[] } = await response.json();
        if (!active) return;
        setMessages(result.messages.map((message) => toChatMessage(message, groupId)));
      } catch {
        if (active) setMessageError('Could not load messages. Please try again.');
      }
    })();
    return () => {
      active = false;
    };
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

  async function handleSendMessage(text: string, attachment?: ChatAttachment) {
    if (group.status === 'closed') return false;
    setMessageError('');

    if (attachment) {
      setMessageError('Attachments are not available in real groups yet.');
      return false;
    }
    if (!text.trim()) return false;

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
        layout={layout}
      />
    </div>
  );
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
  };
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
