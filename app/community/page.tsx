"use client";

import { useState, useEffect } from "react";
import { DesktopNavigation } from "../_components/app-navigation";
import { BottomNav } from "../components/bottom-nav";
import { CommunityHomeView } from "./components/community-home-view";
import { AllGroupsView } from "./components/all-groups-view";
import { GroupDetailView } from "./components/group-detail-view";
import { JoinedSuccessModal } from "./components/joined-success-modal";
import { GroupHubView } from "./components/group-hub-view";
import { CommunityMenuModal } from "./components/community-menu-modal";
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
  | "menu";

export default function CommunityPage() {
  const [view, setView] = useState<CommunityView>("home");
  const [previousView, setPreviousView] = useState<CommunityView>("home");
  const [selectedGroupId, setSelectedGroupId] = useState("stress-burnout");

  // Groups and messages state initialized with server-safe defaults, hydrated on mount
  const [groups, setGroups] = useState<SupportGroup[]>(INITIAL_GROUPS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("arom_community_groups");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with INITIAL_GROUPS so new groups like depression-support and updated rules are loaded
          const merged = INITIAL_GROUPS.map((initial) => {
            const existing = parsed.find((p: SupportGroup) => p.id === initial.id);
            if (!existing) return initial;
            return {
              ...initial,
              isJoined: existing.isJoined,
              membersCount: existing.membersCount ?? initial.membersCount,
            };
          });
          setGroups(merged);
        }
      }

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

  const [activities, setActivities] = useState<GroupActivity[]>(INITIAL_ACTIVITIES);
  const [members, setMembers] = useState<GroupMember[]>(INITIAL_MEMBERS);

  const activeGroup =
    groups.find((g) => g.id === selectedGroupId) || groups[0];
  const myGroup =
    groups.find((g) => g.isJoined) || groups[0];
  const recommendedGroup =
    groups.find((g) => g.id === "academic-stress") || groups[1] || groups[0];

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
            />
          )}

          {view === "all-groups" && (
            <AllGroupsView
              groups={groups}
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
              messages={messages.filter((m) => m.groupId === selectedGroupId)}
              activities={activities.filter((a) => a.groupId === selectedGroupId)}
              members={members.filter((m) => m.groupId === selectedGroupId)}
              onBack={() => setView("home")}
              onSendMessage={handleSendMessage}
              onToggleActivityJoin={handleToggleActivityJoin}
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
