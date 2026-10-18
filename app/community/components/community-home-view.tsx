"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MessageCircle, Plus, Search, TrendingUp, UsersRound } from "lucide-react";
import { MaskIcon } from "./community-icons";
import { useLanguage } from "../../_components/language-provider";
import { useAuth } from "../../_components/auth-provider";
import { SupportGroup, type GroupsStatus } from "../community-data";
import { GROUP_TOPICS, TopicBadge, topicInfo, type GroupTopic } from "../group-topics";
import { TopHeader } from "../../components/top-header";

type CommunityHomeViewProps = {
  // Every real group from GET /api/community/groups.
  groups: SupportGroup[];
  groupsStatus: GroupsStatus;
  onSelectGroup: (groupId: string) => void;
  onOpenChat: (groupId: string) => void;
  onOpenAllGroups: () => void;
  onOpenTopic: (topic: GroupTopic) => void;
  onOpenMenu: () => void;
  onCreateGroup: () => void;
};

/**
 * Community home: find a group (redesign of 19 Oct 2026, from Rith's design,
 * in AROM colours). Hero banner, topic tiles with real counts, popular groups
 * with Join (which opens the group's details and rules first), and the
 * groups you are in, whose chats live in Messages.
 */
export function CommunityHomeView({
  groups,
  groupsStatus,
  onSelectGroup,
  onOpenChat,
  onOpenAllGroups,
  onOpenTopic,
  onOpenMenu,
  onCreateGroup,
}: CommunityHomeViewProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const canCreateGroup = user?.role === "professional" || user?.role === "admin";

  const openGroups = groups.filter((group) => group.status !== "closed");
  const myGroups = groups.filter((group) => group.isJoined);
  // Most members first; groups you are already in are under "Your groups".
  const popular = openGroups
    .filter((group) => !group.isJoined)
    .sort((a, b) => b.membersCount - a.membersCount)
    .slice(0, 3);
  const countFor = (topic: GroupTopic) => openGroups.filter((group) => group.iconType === topic).length;
  const ready = groupsStatus === "ready";
  const noGroupsYet = ready && groups.length === 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-3 sm:px-6">
      <TopHeader />

      {/* Title, with search on the right */}
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
            {t("សហគមន៍ (Community)", "Community")}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#4b5563] sm:text-base">
            {t(
              "អ្នកមិនឯកាទេ។ ស្វែងរកមនុស្សដែលយល់ពីអ្នក គាំទ្រអ្នក និងរីកចម្រើនជាមួយគ្នា។",
              "You're not alone. Find people who understand, support you, and grow together.",
            )}
          </p>
        </div>
        {ready && groups.length > 0 && (
          <button
            type="button"
            onClick={onOpenAllGroups}
            aria-label={t("ស្វែងរកក្រុម", "Search groups")}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-[#1f6f5b] shadow-sm hover:bg-[#eaf5f1]"
          >
            <Search size={20} />
          </button>
        )}
      </div>

      {/* Hero banner. Photo: Helena Lopes on Pexels (free licence), people
          seen from behind; the crop keeps the upper part (sky and people). */}
      <section className="relative mt-6 overflow-hidden rounded-[28px] shadow-[0_10px_30px_rgba(15,61,51,0.18)]">
        <Image
          src="/images/community/friends-sunset.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 896px, 100vw"
          className="object-cover object-[60%_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f3d33]/90 via-[#1b5e4c]/65 to-[#1b5e4c]/5" aria-hidden="true" />
        <div className="relative flex min-h-56 flex-col justify-center p-6 sm:min-h-64 sm:p-8">
          <h2 className="max-w-sm text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {t("មនុស្សពិត។ ដំណើរជាមួយគ្នា។", "Real people. Shared journeys.")}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/90">
            {t(
              "ចូលរួមក្រុមដែលត្រូវនឹងតម្រូវការរបស់អ្នក ហើយបោះជំហានបន្ទាប់ជាមួយគ្នា។",
              "Join a group that matches your needs and take the next step, together.",
            )}
          </p>
          <button
            type="button"
            onClick={onOpenAllGroups}
            className="mt-5 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1a5d4d] shadow-md transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            {t("ស្វែងរកក្រុមរបស់អ្នក", "Find your group")}
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Professionals and admins can start a new support group */}
      {canCreateGroup && (
        <button
          type="button"
          onClick={onCreateGroup}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#1a5d4d]/30 bg-white py-3 text-sm font-bold text-[#1a5d4d] shadow-sm transition-colors hover:bg-[#eaf5f1]"
        >
          <Plus size={18} />
          {t("បង្កើតក្រុម (Create a group)", "Create a group")}
        </button>
      )}

      {/* Follows the same rule as the group chat: professionals and admins
          always show their name; a client shows as Anonymous while their
          "Hide my identity" switch is on (the default). */}
      <div className="mt-5 flex items-center gap-3.5 rounded-[22px] bg-[#dff2ec] p-4 text-[#1b4332] shadow-sm">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#1b5e4c] text-white shadow-sm">
          <MaskIcon className="size-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          {canCreateGroup ? (
            <>
              <p className="text-sm font-bold leading-snug">{t("ឈ្មោះរបស់អ្នកបង្ហាញក្នុងក្រុម", "Your name is shown in groups")}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#2d6a54]">
                {t(
                  "សមាជិកឃើញឈ្មោះអ្នកជំនាញ ដើម្បីដឹងថាអ្នកណាដឹកនាំក្រុម។ សមាជិកអាចនៅអនាមិក។",
                  "Members see a professional's name so they know who leads the group. Members can stay anonymous.",
                )}
              </p>
            </>
          ) : user && user.hideIdentity === false ? (
            <>
              <p className="text-sm font-bold leading-snug">{t("ឈ្មោះរបស់អ្នកបង្ហាញក្នុងក្រុម", "Your name is shown in groups")}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#2d6a54]">
                {t("សមាជិកផ្សេងទៀតឃើញឈ្មោះរបស់អ្នក។ អ្នកអាចលាក់វាបាននៅក្នុង ", "Other members see your name. You can hide it in ")}
                <Link href="/profile" className="font-semibold underline underline-offset-2">
                  {t("ការកំណត់ប្រវត្តិរូប", "Profile settings")}
                </Link>
                {t("។", ".")}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold leading-snug">{t("អ្នកមានភាពអនាមិកនៅទីនេះ (Anonymous)", "You are anonymous here")}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#2d6a54]">
                {t(
                  "សមាជិកផ្សេងទៀតឃើញអ្នកជា អនាមិក។ ឈ្មោះ និងព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកមិនត្រូវបានបង្ហាញឡើយ។",
                  "Other members see you as Anonymous. Your name and personal information are not shown.",
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {/* What to show while loading, signed out, failed or empty */}
      {groupsStatus === "loading" && <p className="mt-7 text-sm text-[#6b7280]">{t("កំពុងផ្ទុកក្រុមគាំទ្រ...", "Loading support groups...")}</p>}

      {groupsStatus === "failed" && (
        <p role="alert" className="mt-7 text-sm text-red-600">
          {t("មិនអាចផ្ទុកក្រុមគាំទ្របានទេ។ សូមព្យាយាមម្តងទៀតពេលក្រោយ។", "Support groups could not be loaded. Please try again later.")}
        </p>
      )}

      {groupsStatus === "signed_out" && (
        <div className="mt-7 rounded-[22px] border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-bold text-[#111827]">{t("ចូលគណនីដើម្បីចូលរួមក្រុមគាំទ្រ", "Log in to join a support group")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#4b5563]">
            {t("ក្រុមគាំទ្របើកសម្រាប់សមាជិក AROM ប៉ុណ្ណោះ ដើម្បីរក្សាសុវត្ថិភាព។", "Support groups are open to AROM members only, to keep them safe.")}
          </p>
          <Link href="/login" className="mt-4 inline-flex rounded-[16px] bg-[#1a5d4d] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#144b3e]">
            {t("ចូលគណនី (Log in)", "Log in")}
          </Link>
        </div>
      )}

      {noGroupsYet && (
        <div className="mt-7 rounded-[22px] border border-gray-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-bold text-[#111827]">{t("មិនទាន់មានក្រុមគាំទ្រនៅឡើយទេ", "No support groups yet")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#4b5563]">
            {canCreateGroup
              ? t("ចាប់ផ្តើមក្រុមដំបូងដោយប្រើប៊ូតុង បង្កើតក្រុម ខាងលើ។", "Start the first one with Create a group above.")
              : t("អ្នកជំនាញកំពុងរៀបចំក្រុម។ សូមត្រឡប់មកមើលម្តងទៀតឆាប់ៗនេះ។", "Professionals are setting them up. Please check back soon.")}
          </p>
        </div>
      )}

      {/* Your groups: their chats are in Messages */}
      {ready && myGroups.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-[#111827]">{t("ក្រុមរបស់អ្នក", "Your groups")}</h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {myGroups.map((group) => (
              <li key={group.id} className="flex items-center gap-3 rounded-[20px] border border-gray-100 bg-white p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <TopicBadge topic={group.iconType} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-[#111827]">{km ? group.nameKm : group.name}</span>
                  <span className="block text-xs text-[#6b7280]">
                    {group.membersCount}/{group.maxMembers} {t("សមាជិក", "members")}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenChat(group.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#1a5d4d]/25 px-3.5 py-2 text-xs font-semibold text-[#1a5d4d] hover:bg-[#eaf5f1]"
                >
                  <MessageCircle size={15} aria-hidden="true" />
                  {t("បើកការជជែក", "Open chat")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Find your community: topic tiles with real counts */}
      {ready && groups.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-[#111827] sm:text-xl">{t("ស្វែងរកសហគមន៍របស់អ្នក", "Find your community")}</h2>
          <p className="mt-1 text-sm text-[#4b5563]">{t("ជ្រើសរើសអ្វីដែលអ្នកត្រូវការឥឡូវនេះ។", "Choose what you need right now.")}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {GROUP_TOPICS.map((topic) => {
              const count = countFor(topic.id);
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onOpenTopic(topic.id)}
                  className={`flex flex-col items-start rounded-[20px] p-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.99] ${topic.tile}`}
                >
                  <span className={`flex size-10 items-center justify-center rounded-full ${topic.circle} ${topic.ink}`}>
                    <topic.Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="mt-3 text-sm font-bold text-[#111827]">{km ? topic.km : topic.en}</span>
                  <span className="mt-0.5 flex w-full items-center justify-between text-xs text-[#4b5563]">
                    {km ? `${count} ក្រុម` : `${count} ${count === 1 ? "group" : "groups"}`}
                    <ChevronRight size={15} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Popular groups: Join opens the details and rules first */}
      {ready && popular.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#111827] sm:text-xl">
              <TrendingUp size={20} className="text-[#1f6f5b]" aria-hidden="true" />
              {t("ក្រុមពេញនិយម", "Popular groups")}
            </h2>
            <button type="button" onClick={onOpenAllGroups} className="flex items-center gap-1 text-sm font-semibold text-[#1f6f5b] hover:underline">
              {t("មើលទាំងអស់", "See all")}
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {popular.map((group) => {
              const topic = topicInfo(group.iconType);
              const full = group.membersCount >= group.maxMembers;
              const about = km ? group.aboutKm || group.about : group.about;
              return (
                <li key={group.id} className="flex flex-col gap-4 rounded-[22px] border border-gray-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <TopicBadge topic={group.iconType} size="lg" />
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#111827]">{km ? group.nameKm : group.name}</h3>
                      {about && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#4b5563]">{about}</p>}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {[km ? topic.km : topic.en, t("អនាមិក", "Anonymous"), t("ការគាំទ្រគ្នា", "Peer support")].map((tag) => (
                          <span key={tag} className="rounded-full bg-[#eef6f3] px-2.5 py-0.5 text-[11px] font-semibold text-[#2d6a54]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <span className="flex items-center gap-1.5 text-xs text-[#4b5563]">
                      <UsersRound size={15} aria-hidden="true" />
                      {group.membersCount}/{group.maxMembers} {t("សមាជិក", "members")}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectGroup(group.id)}
                      className={`rounded-full px-6 py-2 text-sm font-bold shadow-sm ${full ? "bg-gray-100 text-[#6b7280]" : "bg-[#1a5d4d] text-white hover:bg-[#144b3e]"}`}
                    >
                      {full ? t("ពេញ", "Full") : t("ចូលរួម", "Join")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Quick links */}
      <div className="mt-8 flex flex-col gap-2">
        <button
          onClick={onOpenAllGroups}
          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-[#1f6f5b] transition-colors hover:bg-[#eaf5f1]"
        >
          <span>{t("ស្វែងរកក្រុមគាំទ្រទាំងអស់ (Explore All Groups)", "Explore All Support Groups")}</span>
          <ChevronRight size={18} />
        </button>
        <button
          onClick={onOpenMenu}
          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <span>{t("គោលការណ៍សហគមន៍ និងការកំណត់", "Community Guidelines & Options")}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
