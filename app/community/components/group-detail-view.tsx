"use client";

import { ChevronLeft } from "lucide-react";
import { useLanguage } from "../../_components/language-provider";
import { SupportGroup, DEFAULT_GROUP_RULES, DEFAULT_GROUP_RULES_KM } from "../community-data";

type GroupDetailViewProps = {
  group: SupportGroup;
  onBack: () => void;
  onJoinGroup: (groupId: string) => void;
  onOpenGroupHub: (groupId: string) => void;
};

export function GroupDetailView({
  group,
  onBack,
  onJoinGroup,
  onOpenGroupHub,
}: GroupDetailViewProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const isClosed = group.status === "closed";

  const mentorName = group.mentor
    ? km
      ? group.mentor.nameKm
      : group.mentor.name
    : km
    ? "ដារ៉ា"
    : "Dara";

  const mentorDisplay =
    (km ? group.mentorTitleKm : group.mentorTitle) ||
    `${mentorName}, ${km ? "អ្នកណែនាំ ARom ផ្លូវការ (Verified Mentor)" : "Verified ARom Mentor"}`;

  const expectations =
    km && group.expectationsKm?.length
      ? group.expectationsKm
      : group.expectations;

  const rules =
    km && group.rulesKm?.length
      ? group.rulesKm
      : group.rules || (km ? DEFAULT_GROUP_RULES_KM : DEFAULT_GROUP_RULES);

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-5 pt-3">
      {/* Back Button matching Screenshot */}
      <div className="flex items-center py-2">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full bg-[#f0f2f1] text-[#111827] hover:bg-[#e4e7e5] transition-colors"
          aria-label={km ? "ត្រឡប់ក្រោយ" : "Back"}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* Group Title matching Screenshot */}
      <h1 className="mt-3 text-2xl sm:text-[1.7rem] font-bold tracking-tight text-[#111827]">
        {km ? group.nameKm : group.name}
      </h1>

      {/* Info Card (Members & Mentor) matching Screenshot */}
      <div className="mt-4 rounded-[20px] bg-white border border-[#edf2f0] p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2.5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-normal text-[#9ca3af]">
            {km ? "សមាជិក" : "Members"}
          </span>
          <span className="font-semibold text-[#111827] text-right">
            {group.membersCount} / {group.maxMembers} {km ? "សមាជិក" : "members"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm border-t border-gray-100/90 pt-2.5">
          <span className="font-normal text-[#9ca3af]">
            {km ? "អ្នកសម្របសម្រួល (Mentor)" : "Mentor"}
          </span>
          <span className="font-semibold text-[#111827] text-right truncate">
            {mentorDisplay}
          </span>
        </div>
      </div>

      {/* About This Group */}
      <div className="mt-6">
        <h2 className="text-base font-bold text-[#111827]">
          {km ? "អំពីក្រុមនេះ (About Group)" : "About This Group"}
        </h2>
        <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">
          {km ? group.aboutKm : group.about}
        </p>
      </div>

      {/* What You Can Expect matching Screenshot */}
      {expectations.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-bold text-[#111827]">
            {km ? "អ្វីដែលអ្នកអាចរំពឹងទុក (What to Expect)" : "What You Can Expect"}
          </h2>

          <ul className="mt-2.5 space-y-2">
            {expectations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-[#374151]">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#1b5e4c]" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Group Rules matching Screenshot */}
      <div className="mt-6">
        <h2 className="text-base font-bold text-[#111827]">
          {km ? "គោលការណ៍ណែនាំក្រុម (Group Rules)" : "Group Rules"}
        </h2>

        <ul className="mt-2.5 space-y-2">
          {rules.map((rule, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-[#374151]">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#1b5e4c]" />
              <span className="leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-[14px] bg-[#f2f9f6] p-3 text-xs text-[#2d6a54] leading-relaxed">
          {km
            ? "ក្រុមការងារសុវត្ថិភាព AROM អាចអានការសន្ទនានេះ ដើម្បីរក្សាសុវត្ថិភាព។"
            : "The AROM safety team can read this chat to keep it safe."}
        </p>
      </div>

      {/* Action Button: User reads info and touches Join */}
      <div className="mt-8 pt-2">
        {isClosed && (
          <p className="mb-3 rounded-[14px] bg-gray-100 p-3 text-center text-sm text-[#4b5563]">
            {km ? "ក្រុមនេះត្រូវបានបិទដោយក្រុមការងារ AROM។" : "This group was closed by the AROM team."}
          </p>
        )}
        {(!isClosed || group.isJoined) && (
          <button
            onClick={() => {
              if (group.isJoined) {
                onOpenGroupHub(group.id);
              } else {
                onJoinGroup(group.id);
              }
            }}
            className="w-full rounded-[18px] bg-[#1a5d4d] py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-lg shadow-[#1a5d4d]/25 transition-all duration-200 hover:bg-[#144b3e] active:scale-[0.99]"
          >
            {group.isJoined
              ? km ? "ចូលទៅកាន់ក្រុម (Enter Group)" : "Enter Group Hub"
              : km ? "ចូលរួម (Join)" : "Join"}
          </button>
        )}
      </div>
    </div>
  );
}
