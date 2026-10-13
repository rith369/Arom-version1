"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { DesktopNavigation } from "../_components/app-navigation";
import { BottomNav } from "../components/bottom-nav";
import { CommunityHomeView } from "./components/community-home-view";
import { AllGroupsView } from "./components/all-groups-view";
import { GroupDetailView } from "./components/group-detail-view";
import { JoinedSuccessModal } from "./components/joined-success-modal";
import { GroupHubView } from "./components/group-hub-view";
import { CommunityMenuModal } from "./components/community-menu-modal";
import { CreateGroupView } from "./components/create-group-view";
import {
  getCommunitySnapshot,
  getServerCommunitySnapshot,
  readCreatedGroups,
  saveCreatedGroup,
  subscribeCommunityStore,
} from "./community-store";
import {
  INITIAL_GROUPS,
  INITIAL_MESSAGES,
  INITIAL_ACTIVITIES,
  INITIAL_MEMBERS,
  SupportGroup,
  ChatMessage,
  ChatAttachment,
  GroupActivity,
  GroupMember,
} from "./community-data";

type CommunityView =
  | "home"
  | "all-groups"
  | "group-detail"
  | "joined-success"
  | "group-hub"
  | "menu"
  | "create-group";

export default function CommunityPage() {
  const [view, setView] = useState<CommunityView>("home");
  const [previousView, setPreviousView] = useState<CommunityView>("home");
  const [selectedGroupId, setSelectedGroupId] = useState("stress-burnout");

  // Groups and messages state initialized with server-safe defaults, hydrated on mount
  const [savedGroups, setGroups] = useState<SupportGroup[]>(INITIAL_GROUPS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("arom_community_groups");
      const parsed: SupportGroup[] = stored ? JSON.parse(stored) : [];
      const saved = Array.isArray(parsed) ? parsed : [];

      // Merge with INITIAL_GROUPS so new groups like depression-support and updated rules are loaded,
      // then add groups created by professionals and admins.
      const merged = [...INITIAL_GROUPS, ...readCreatedGroups()].map((base) => {
        const existing = saved.find((p) => p.id === base.id);
        if (!existing) return base;
        return {
          ...base,
          isJoined: existing.isJoined,
          membersCount: existing.membersCount ?? base.membersCount,
        };
      });
      setGroups(merged);

      const storedMessages = localStorage.getItem("arom_community_messages");
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Admins shut groups down from /admin/community. Read closures live so the
  // closed notice shows without a reload.
  const { closures, removedMessages, removedMembers } = useSyncExternalStore(
    subscribeCommunityStore,
    getCommunitySnapshot,
    getServerCommunitySnapshot,
  );
  const groups: SupportGroup[] = savedGroups.map((group) => ({
    ...group,
    status: closures.some((item) => item.groupId === group.id) ? "closed" : "active",
  }));

  const [activities, setActivities] = useState<GroupActivity[]>(INITIAL_ACTIVITIES);
  const [members, setMembers] = useState<GroupMember[]>(INITIAL_MEMBERS);

  const activeGroup =
    groups.find((g) => g.id === selectedGroupId) || groups[0];
  const myGroup =
    groups.find((g) => g.isJoined) || groups[0];
  const openGroups = groups.filter((g) => g.status !== "closed");
  const recommendedGroup =
    openGroups.find((g) => g.id === "academic-stress") ||
    openGroups.find((g) => !g.isJoined) ||
    groups[0];

  function handleSelectGroup(groupId: string) {
    const grp = groups.find((g) => g.id === groupId);
    setSelectedGroupId(groupId);

    if (grp?.isJoined) {
      // User is already in this group -> directly open group hub (no need for detail screen)
      setView("group-hub");
    } else {
      // User is not in this group -> show detail/rules first so they can read and touch join
      setPreviousView(view === "group-detail" ? "home" : view);
      setView("group-detail");
    }
  }

  function handleJoinGroup(groupId: string) {
    if (groups.find((g) => g.id === groupId)?.status === "closed") return;
    setGroups((prev) => {
      const updated = prev.map((g) =>
        g.id === groupId
          ? { ...g, isJoined: true, membersCount: Math.min(g.maxMembers, g.membersCount + 1) }
          : g
      );
      try {
        localStorage.setItem("arom_community_groups", JSON.stringify(updated));
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
        name: "Anonymous (You)",
        nameKm: "អនាមិក (អ្នក)",
        isAnonymous: true,
        avatarType: "mask",
      },
    ]);
    setView("joined-success");
  }

  function handleSendMessage(text: string, attachment?: ChatAttachment, targetGroupId?: string) {
    const gid = targetGroupId || selectedGroupId || activeGroup.id;
    if (groups.find((g) => g.id === gid)?.status === "closed") return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      groupId: gid,
      senderName: "Anonymous (You)",
      senderNameKm: "អនាមិក (អ្នក)",
      isAnonymous: true,
      text,
      textKm: text,
      time: "Just now",
      timeKm: "ទើបតែឥឡូវនេះ",
      avatarType: "mask",
      attachment,
    };
    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem("arom_community_messages", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }

  function handleCreateGroup(group: SupportGroup) {
    saveCreatedGroup(group);
    setGroups((prev) => {
      const updated = [...prev, group];
      try {
        localStorage.setItem("arom_community_groups", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setSelectedGroupId(group.id);
    setView("group-hub");
  }

  function handleToggleActivityJoin(activityId: string) {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId ? { ...a, isJoined: !a.isJoined } : a
      )
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#14221f] lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      {/* Desktop Sidebar Navigation */}
      <DesktopNavigation active="Community" />

      {/* Main Content Area */}
      <div className={`min-w-0 ${view === "group-hub" ? "pb-4" : "pb-20 lg:pb-12"}`}>
        <main className="mx-auto w-full max-w-[440px] md:max-w-xl lg:max-w-3xl xl:max-w-4xl lg:pt-6">
          {view === "home" && (
            <CommunityHomeView
              myGroup={myGroup}
              recommendedGroup={recommendedGroup}
              onSelectGroup={handleSelectGroup}
              onOpenAllGroups={() => setView("all-groups")}
              onOpenMenu={() => setView("menu")}
              onCreateGroup={() => setView("create-group")}
            />
          )}

          {view === "all-groups" && (
            <AllGroupsView
              groups={openGroups}
              onBack={() => setView("home")}
              onSelectGroup={handleSelectGroup}
            />
          )}

          {view === "group-detail" && (
            <GroupDetailView
              group={activeGroup}
              onBack={() => setView(previousView)}
              onJoinGroup={handleJoinGroup}
              onOpenGroupHub={(id) => {
                setSelectedGroupId(id);
                setView("group-hub");
              }}
            />
          )}

          {view === "joined-success" && (
            <JoinedSuccessModal
              group={activeGroup}
              onGoToGroup={(id) => {
                setSelectedGroupId(id);
                setView("group-hub");
              }}
              onExploreMore={() => setView("all-groups")}
              onBack={() => setView("home")}
            />
          )}

          {view === "group-hub" && (
            <GroupHubView
              group={activeGroup}
              messages={messages
                .filter((m) => m.groupId === selectedGroupId)
                .map((m) =>
                  removedMessages.some((item) => item.messageId === m.id)
                    ? { ...m, removed: true }
                    : m
                )}
              activities={activities.filter((a) => a.groupId === selectedGroupId)}
              members={members.filter(
                (m) =>
                  m.groupId === selectedGroupId &&
                  !removedMembers.some(
                    (item) => item.groupId === m.groupId && item.memberLabel === m.name
                  )
              )}
              onBack={() => setView("home")}
              onSendMessage={handleSendMessage}
              onToggleActivityJoin={handleToggleActivityJoin}
            />
          )}

          {view === "create-group" && (
            <CreateGroupView
              onBack={() => setView("home")}
              onCreate={handleCreateGroup}
            />
          )}

          {view === "menu" && (
            <CommunityMenuModal
              groups={groups}
              onBack={() => setView("home")}
              onSelectGroup={(id) => {
                setSelectedGroupId(id);
                handleSelectGroup(id);
              }}
              onExploreAll={() => setView("all-groups")}
            />
          )}
        </main>
      </div>

      {/* Figma Bottom Navigation (Mobile/Tablet) - Hidden in Group Hub matching Figma Screen 5 */}
      {view !== "group-hub" && (
        <div className="lg:hidden">
          <BottomNav activeTab="Community" />
        </div>
      )}
    </div>
  );
}
