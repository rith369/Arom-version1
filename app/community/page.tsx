'use client';

import { useState, useEffect } from 'react';
import { DesktopNavigation } from '../_components/app-navigation';
import { BottomNav } from '../components/bottom-nav';
import { CommunityHomeView } from './components/community-home-view';
import { AllGroupsView } from './components/all-groups-view';
import { GroupDetailView } from './components/group-detail-view';
import { JoinedSuccessModal } from './components/joined-success-modal';
import { GroupHubView } from './components/group-hub-view';
import { CommunityMenuModal } from './components/community-menu-modal';
import { CreateGroupView } from './components/create-group-view';

import {
  SupportGroup,
  ChatMessage,
  ChatAttachment,
  GroupActivity,
  GroupMember,
  GroupsStatus,
} from './community-data';

type CommunityView =
  | 'home'
  | 'all-groups'
  | 'group-detail'
  | 'joined-success'
  | 'group-hub'
  | 'menu'
  | 'create-group';

export default function CommunityPage() {
  const [view, setView] = useState<CommunityView>('home');
  const [previousView, setPreviousView] = useState<CommunityView>('home');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  // Only real groups from the database. The sample groups in community-data.ts
  // are no longer shown: nobody real would answer in them (18 Oct 2026).
  const [savedGroups, setGroups] = useState<SupportGroup[]>([]);
  const [groupsStatus, setGroupsStatus] = useState<GroupsStatus>('loading');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [createGroupError, setCreateGroupError] = useState('');
  const [joinError, setJoinError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [messageRefresh, setMessageRefresh] = useState(0);

  // Add real Supabase groups to the Community list.
  useEffect(() => {
    let active = true;

    async function loadRealGroups() {
      try {
        const response = await fetch('/api/community/groups', {
          cache: 'no-store',
        });
        if (!response.ok) {
          if (active) setGroupsStatus(response.status === 401 ? 'signed_out' : 'failed');
          return;
        }

        const result: {
          groups: Array<{
            id: string;
            name: string;
            nameKm: string | null;
            concern: string;
            description: string | null;
            descriptionKm: string | null;
            maxMembers: number;
            membersCount: number;
            isJoined: boolean;
            status: 'active' | 'closed';
          }>;
        } = await response.json();

        if (!active) return;

        const realGroups: SupportGroup[] = result.groups.map((group) => ({
          id: group.id,
          name: group.name,
          nameKm: group.nameKm || group.name,
          about: group.description || '',
          aboutKm: group.descriptionKm || group.description || '',
          iconType: (['academic', 'stress', 'anxiety', 'depression'].includes(
            group.concern,
          )
            ? group.concern
            : 'stress') as SupportGroup['iconType'],
          membersCount: group.membersCount,
          maxMembers: group.maxMembers,
          isAnonymous: true,
          expectations: [],
          expectationsKm: [],
          isJoined: group.isJoined,
          status: group.status,
          createdBy: 'professional',
        }));

        setGroups(realGroups);
        setGroupsStatus('ready');
      } catch {
        if (active) setGroupsStatus('failed');
      }
    }

    void loadRealGroups();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (view !== 'group-hub') return;

    const groupId = selectedGroupId;
    const isRealGroup =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId);

    if (!isRealGroup) return;

    let active = true;
    setMessageError('');
    setMessages((current) =>
      current.filter((message) => message.groupId !== groupId),
    );

    async function loadMessages() {
      try {
        const response = await fetch(
          `/api/community/groups/${groupId}/messages`,
          { cache: 'no-store' },
        );

        if (!response.ok) throw new Error('Could not load messages.');

        const result: {
          messages: Array<{
            id: string;
            content: string;
            created_at: string;
            display_name: string;
            is_own: boolean;
            is_mentor: boolean;
            is_removed?: boolean;
          }>;
        } = await response.json();

        if (!active) return;

        const loaded: ChatMessage[] = result.messages.map((message) => ({
          id: message.id,
          groupId,
          senderName: message.display_name,
          senderNameKm: message.display_name,
          isAnonymous:
            message.display_name === 'Anonymous' ||
            message.display_name === 'Anonymous (You)',
          isOwn: message.is_own,
          isMentor: message.is_mentor,
          text: message.content,
          textKm: message.content,
          time: new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          avatarType: message.is_mentor ? 'mentor' : 'mask',
          // Removed by the AROM team: the text is not sent, a placeholder shows.
          removed: message.is_removed === true,
        }));

        setMessages((current) => [
          ...current.filter((message) => message.groupId !== groupId),
          ...loaded,
        ]);
      } catch {
        if (active)
          setMessageError('Could not load messages. Please try again.');
      }
    }

    void loadMessages();
    return () => {
      active = false;
    };
  }, [view, selectedGroupId, messageRefresh]);

  // Admins shut groups down from /admin/community; the closed state comes
  // with each group from GET /api/community/groups.
  const groups: SupportGroup[] = savedGroups;

  // Group activities are not connected yet (section 23), so none are shown.
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);

  const activeGroup = groups.find((g) => g.id === selectedGroupId);

  // Undefined when the user has not joined a group, or none is open to join.
  const myGroup = groups.find((group) => group.isJoined);
  const openGroups = groups.filter((g) => g.status !== 'closed');
  const recommendedGroup = openGroups.find((g) => !g.isJoined);

  function handleSelectGroup(groupId: string) {
    const grp = groups.find((g) => g.id === groupId);
    setSelectedGroupId(groupId);

    if (grp?.isJoined) {
      // User is already in this group -> directly open group hub (no need for detail screen)
      setView('group-hub');
    } else {
      // User is not in this group -> show detail/rules first so they can read and touch join
      setPreviousView(view === 'group-detail' ? 'home' : view);
      setView('group-detail');
    }
  }

  async function handleJoinGroup(groupId: string) {
    setJoinError('');
    if (groups.find((g) => g.id === groupId)?.status === 'closed') return;

    const isRealGroup =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        groupId,
      );

    if (isRealGroup) {
      try {
        const response = await fetch(
          `/api/community/groups/${groupId}/join`,
          {
            method: 'POST',
          },
        );

        if (!response.ok) {
          const result: { error?: string } = await response.json();
          throw new Error(result.error || 'Could not join this group.');
        }

        setGroups((current) =>
          current.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  isJoined: true,
                  membersCount: Math.min(
                    group.maxMembers,
                    group.membersCount + 1,
                  ),
                }
              : group,
          ),
        );
        setView('joined-success');
      } catch (error) {
        setJoinError(
          error instanceof Error
            ? error.message
            : 'Could not join this group.',
        );
      }
      return;
    }
    setGroups((prev) => {
      const updated = prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              isJoined: true,
              membersCount: Math.min(g.maxMembers, g.membersCount + 1),
            }
          : g,
      );
      try {
        localStorage.setItem(
          'arom_community_groups',
          JSON.stringify(updated),
        );
      } catch {
        // ignore
      }
      return updated;
    });

    // Add current user to members list
    setMembers((prev) => [
      ...prev,
      {
        id: `mem-${Date.now()}`,
        groupId,
        name: 'Anonymous (You)',
        nameKm: 'អនាមិក (អ្នក)',
        isAnonymous: true,
        avatarType: 'mask',
      },
    ]);
    setView('joined-success');
  }

  // Real groups only: the server saves the message and decides the name shown
  // (the member's "Hide my identity" choice), then the chat reloads.
  async function handleSendMessage(
    text: string,
    attachment?: ChatAttachment,
    targetGroupId?: string,
  ) {
    const gid = targetGroupId || selectedGroupId;
    if (!gid) return false;
    if (groups.find((g) => g.id === gid)?.status === 'closed') return false;
    setMessageError('');

    if (attachment) {
      setMessageError('Attachments are not available in real groups yet.');
      return false;
    }

    if (!text.trim()) return false;

    try {
      const response = await fetch(`/api/community/groups/${gid}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() }),
      });

      if (!response.ok) {
        const result: { error?: string } = await response.json();
        throw new Error(result.error || 'Could not send message.');
      }

      setMessageRefresh((current) => current + 1);
      return true;
    } catch (error) {
      setMessageError(
        error instanceof Error ? error.message : 'Could not send message.',
      );
      return false;
    }
  }

  async function handleCreateGroup(group: SupportGroup) {
    setCreateGroupError('');

    if (group.createdBy !== 'professional') {
      setCreateGroupError(
        'A verified professional account is required to create a group.',
      );
      return;
    }

    try {
      const response = await fetch('/api/community/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: group.name,
          nameKm: group.nameKm,
          concern: group.iconType,
          description: group.about,
          descriptionKm: group.aboutKm,
          maxMembers: group.maxMembers,
        }),
      });

      if (!response.ok) {
        const result: { error?: string } = await response.json();
        throw new Error(result.error || 'Could not create group.');
      }

      const result: { group: { id: string; name: string } } =
        await response.json();
      const savedGroup: SupportGroup = { ...group, id: result.group.id };

      setGroups((current) => [...current, savedGroup]);
      setSelectedGroupId(savedGroup.id);
      setView('group-hub');
    } catch (error) {
      setCreateGroupError(
        error instanceof Error ? error.message : 'Could not create group.',
      );
    }
  }

  function handleToggleActivityJoin(activityId: string) {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId ? { ...a, isJoined: !a.isJoined } : a,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#14221f] lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      {/* Desktop Sidebar Navigation */}
      <DesktopNavigation active="Community" />

      {/* Main Content Area */}
      <div
        className={`min-w-0 ${view === 'group-hub' ? 'pb-4' : 'pb-20 lg:pb-12'}`}>
        <main className="mx-auto w-full max-w-[440px] md:max-w-xl lg:max-w-3xl xl:max-w-4xl lg:pt-6">
          {view === 'home' && (
            <CommunityHomeView
              myGroup={myGroup}
              recommendedGroup={recommendedGroup}
              groupsStatus={groupsStatus}
              onSelectGroup={handleSelectGroup}
              onOpenAllGroups={() => setView('all-groups')}
              onOpenMenu={() => setView('menu')}
              onCreateGroup={() => setView('create-group')}
            />
          )}

          {view === 'all-groups' && (
            <AllGroupsView
              groups={openGroups}
              onBack={() => setView('home')}
              onSelectGroup={handleSelectGroup}
            />
          )}

          {view === 'group-detail' && activeGroup && (
            <>
              {joinError && (
                <p
                  role="alert"
                  className="mx-auto max-w-lg px-4 pt-3 text-sm text-red-600">
                  {joinError}
                </p>
              )}
              <GroupDetailView
                group={activeGroup}
                onBack={() => setView(previousView)}
                onJoinGroup={handleJoinGroup}
                onOpenGroupHub={(id) => {
                  setSelectedGroupId(id);
                  setView('group-hub');
                }}
              />
            </>
          )}

          {view === 'joined-success' && activeGroup && (
            <JoinedSuccessModal
              group={activeGroup}
              onGoToGroup={(id) => {
                setSelectedGroupId(id);
                setView('group-hub');
              }}
              onExploreMore={() => setView('all-groups')}
              onBack={() => setView('home')}
            />
          )}

          {view === 'group-hub' && messageError && (
            <p
              role="alert"
              className="mx-auto max-w-lg px-4 pt-3 text-sm text-red-600">
              {messageError}
            </p>
          )}

          {view === 'group-hub' && activeGroup && (
            <GroupHubView
              group={activeGroup}
              messages={messages.filter((m) => m.groupId === selectedGroupId)}
              activities={activities.filter(
                (a) => a.groupId === selectedGroupId,
              )}
              members={members.filter((m) => m.groupId === selectedGroupId)}
              onBack={() => setView('home')}
              onSendMessage={handleSendMessage}
              onToggleActivityJoin={handleToggleActivityJoin}
            />
          )}

          {view === 'create-group' && (
            <>
              {createGroupError && (
                <p
                  role="alert"
                  className="mx-auto max-w-lg px-4 pt-3 text-sm text-red-600">
                  {createGroupError}
                </p>
              )}
              <CreateGroupView
                onBack={() => setView('home')}
                onCreate={handleCreateGroup}
              />
            </>
          )}

          {view === 'menu' && (
            <CommunityMenuModal
              groups={groups}
              onBack={() => setView('home')}
              onSelectGroup={(id) => {
                setSelectedGroupId(id);
                handleSelectGroup(id);
              }}
              onExploreAll={() => setView('all-groups')}
            />
          )}
        </main>
      </div>

      {/* Figma Bottom Navigation (Mobile/Tablet) - Hidden in Group Hub matching Figma Screen 5 */}
      {view !== 'group-hub' && (
        <div className="lg:hidden">
          <BottomNav activeTab="Community" />
        </div>
      )}
    </div>
  );
}
