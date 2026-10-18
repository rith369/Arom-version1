'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DesktopNavigation } from '../_components/app-navigation';
import { useAuth } from '../_components/auth-provider';
import { BottomNav } from '../components/bottom-nav';
import { CommunityHomeView } from './components/community-home-view';
import { AllGroupsView } from './components/all-groups-view';
import { GroupDetailView } from './components/group-detail-view';
import { JoinedSuccessModal } from './components/joined-success-modal';
import { CommunityMenuModal } from './components/community-menu-modal';
import { CreateGroupView } from './components/create-group-view';

import { SupportGroup, GroupsStatus } from './community-data';
import { createSupportGroup, groupChatHref, toSupportGroup, type ApiGroup } from './group-api';
import type { GroupTopic } from './group-topics';

type CommunityView =
  | 'home'
  | 'all-groups'
  | 'group-detail'
  | 'joined-success'
  | 'menu'
  | 'create-group';

// Community is where people find and join a group. The group chats themselves
// live in Messages, next to the private chats (18 Oct 2026, like Telegram).
export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView] = useState<CommunityView>('home');
  const [previousView, setPreviousView] = useState<CommunityView>('home');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  // Only real groups from the database. The sample groups in community-data.ts
  // are no longer shown: nobody real would answer in them (18 Oct 2026).
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [groupsStatus, setGroupsStatus] = useState<GroupsStatus>('loading');

  const [createGroupError, setCreateGroupError] = useState('');
  const [joinError, setJoinError] = useState('');

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

        const result: { groups: ApiGroup[] } = await response.json();
        if (!active) return;

        const realGroups = result.groups.map(toSupportGroup);
        setGroups(realGroups);
        setGroupsStatus('ready');

        // /community?group=<id> opens that group's details (Join).
        const wanted = new URLSearchParams(window.location.search).get('group');
        const target = realGroups.find((group) => group.id === wanted && !group.isJoined);
        if (target) {
          setSelectedGroupId(target.id);
          setView('group-detail');
        }
      } catch {
        if (active) setGroupsStatus('failed');
      }
    }

    void loadRealGroups();
    return () => {
      active = false;
    };
  }, []);

  function openChat(groupId: string) {
    router.push(groupChatHref(user?.role, groupId));
  }

  const activeGroup = groups.find((g) => g.id === selectedGroupId);

  const openGroups = groups.filter((g) => g.status !== 'closed');
  // Set when a topic tile opens the list already filtered.
  const [topicFilter, setTopicFilter] = useState<GroupTopic | null>(null);
  // Set when the search button opens the list.
  const [searchFocus, setSearchFocus] = useState(false);

  function handleSelectGroup(groupId: string) {
    const grp = groups.find((g) => g.id === groupId);
    setSelectedGroupId(groupId);

    if (grp?.isJoined) {
      // Already in this group: its chat is in Messages.
      openChat(groupId);
    } else {
      // User is not in this group -> show detail/rules first so they can read and touch join
      setPreviousView(view === 'group-detail' ? 'home' : view);
      setView('group-detail');
    }
  }

  async function handleJoinGroup(groupId: string) {
    setJoinError('');
    if (groups.find((g) => g.id === groupId)?.status === 'closed') return;

    try {
      const response = await fetch(`/api/community/groups/${groupId}/join`, {
        method: 'POST',
      });

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
                membersCount: Math.min(group.maxMembers, group.membersCount + 1),
              }
            : group,
        ),
      );
      setView('joined-success');
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : 'Could not join this group.');
    }
  }

  async function handleCreateGroup(group: SupportGroup) {
    setCreateGroupError('');
    const result = await createSupportGroup(group);
    if (!result.ok) {
      setCreateGroupError(result.error);
      return;
    }

    openChat(result.id);
  }

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#14221f] lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      {/* Desktop Sidebar Navigation */}
      <DesktopNavigation active="Community" />

      {/* Main Content Area */}
      <div className="min-w-0 pb-20 lg:pb-12">
        <main className="mx-auto w-full max-w-[440px] md:max-w-xl lg:max-w-3xl xl:max-w-4xl lg:pt-6">
          {view === 'home' && (
            <CommunityHomeView
              groups={groups}
              groupsStatus={groupsStatus}
              onSelectGroup={handleSelectGroup}
              onOpenChat={openChat}
              onOpenTopic={(topic) => {
                setTopicFilter(topic);
                setSearchFocus(false);
                setView('all-groups');
              }}
              onOpenAllGroups={() => {
                setTopicFilter(null);
                setSearchFocus(false);
                setView('all-groups');
              }}
              onOpenSearch={() => {
                setTopicFilter(null);
                setSearchFocus(true);
                setView('all-groups');
              }}
              onCreateGroup={() => setView('create-group')}
            />
          )}

          {view === 'all-groups' && (
            <AllGroupsView
              key={`${topicFilter ?? 'all'}-${searchFocus}`}
              initialTopic={topicFilter}
              focusSearch={searchFocus}
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
                onOpenGroupHub={openChat}
              />
            </>
          )}

          {view === 'joined-success' && activeGroup && (
            <JoinedSuccessModal
              group={activeGroup}
              onGoToGroup={openChat}
              onExploreMore={() => setView('all-groups')}
              onBack={() => setView('home')}
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

      {/* Figma Bottom Navigation (Mobile/Tablet) */}
      <div className="lg:hidden">
        <BottomNav activeTab="Community" />
      </div>
    </div>
  );
}
