"use client";

import Image from "next/image";
import { ChevronRight, Plus } from "lucide-react";
import { MaskIcon, StressLightningIcon } from "./community-icons";
import { useLanguage } from "../../_components/language-provider";
import { useAuth } from "../../_components/auth-provider";
import { SupportGroup } from "../community-data";
import { TopHeader } from "../../components/top-header";

type CommunityHomeViewProps = {
  myGroup: SupportGroup;
  recommendedGroup: SupportGroup;
  onSelectGroup: (groupId: string) => void;
  onOpenAllGroups: () => void;
  onOpenMenu: () => void;
  onCreateGroup: () => void;
};

export function CommunityHomeView({
  myGroup,
  recommendedGroup,
  onSelectGroup,
  onOpenAllGroups,
  onOpenMenu,
  onCreateGroup,
}: CommunityHomeViewProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const km = language === "km";
  const canCreateGroup = user?.role === "professional" || user?.role === "admin";

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 pt-3">
      {/* Top Brand Header matching other pages */}
      <TopHeader />

      {/* Main Title & Subtitle */}
      <div className="mt-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
          {km ? "សហគមន៍ (Community)" : "Community"}
        </h1>
        <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">
          {km
            ? "កន្លែងសុវត្ថិភាព និងអនាមិក ដើម្បីចែករំលែក រៀនសូត្រ និងរីកចម្រើនជាមួយគ្នា។"
            : "A safe and anonymous space to share, learn, and grow together."}
        </p>
      </div>

      {/* Professionals and admins can start a new support group */}
      {canCreateGroup && (
        <button
          type="button"
          onClick={onCreateGroup}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#1a5d4d]/30 bg-white py-3 text-sm font-bold text-[#1a5d4d] shadow-sm transition-colors hover:bg-[#eaf5f1]"
        >
          <Plus size={18} />
          {km ? "បង្កើតក្រុម (Create a group)" : "Create a group"}
        </button>
      )}

      {/* Anonymous Banner Card matching Figma Screen 1 */}
      <div className="mt-5 flex items-center gap-3.5 rounded-[22px] bg-[#dff2ec] p-4 text-[#1b4332] shadow-sm">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1b5e4c] text-white shadow-sm">
          <MaskIcon className="size-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug">
            {km ? "អ្នកមានភាពអនាមិកនៅទីនេះ (Anonymous)" : "You are anonymous here"}
          </p>
          <p className="mt-0.5 text-xs text-[#2d6a54] leading-relaxed">
            {km
              ? "ឈ្មោះ និងព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកនឹងមិនត្រូវបានបង្ហាញដល់សមាជិកដទៃឡើយ។"
              : "Your name and personal information are not shown to other members."}
          </p>
        </div>
      </div>

      {/* Section: My support Group */}
      <div className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827]">
            {km ? "ក្រុមគាំទ្ររបស់ខ្ញុំ (My Support Group)" : "My support Group"}
          </h2>
          <button
            onClick={onOpenAllGroups}
            className="text-xs font-semibold text-[#1f6f5b] hover:underline"
          >
            {km ? "មើលទាំងអស់ (View All)" : "View All"}
          </button>
        </div>

        <div
          onClick={() => onSelectGroup(myGroup.id)}
          className="mt-3.5 group flex cursor-pointer items-center justify-between rounded-[22px] border border-gray-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#1f6f5b]/40 hover:shadow-md"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e3f4ef] text-[#1f6f5b] transition-transform group-hover:scale-105">
              <StressLightningIcon className="size-6 text-[#1f6f5b]" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-[#111827] group-hover:text-[#1f6f5b] transition-colors">
                {km ? myGroup.nameKm : myGroup.name}
              </h3>
              <p className="mt-0.5 text-xs text-[#6b7280]">
                {myGroup.membersCount}/{myGroup.maxMembers}{" "}
                {km ? "សមាជិក" : "members"}
              </p>
            </div>
          </div>
          <ChevronRight
            size={22}
            className="shrink-0 text-gray-400 group-hover:translate-x-0.5 group-hover:text-[#1f6f5b] transition-all"
          />
        </div>
      </div>

      {/* Section: Recommended for you */}
      <div className="mt-7">
        <h2 className="text-lg font-bold text-[#111827]">
          {km ? "ណែនាំសម្រាប់អ្នក (Recommended for You)" : "Recommended for you"}
        </h2>

        <div className="mt-3.5 overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
          {/* Banner Graphic matching Figma Screen 1 */}
          <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[#dcf0ea]">
            <Image
              src="/figma/community/recommended_banner.png"
              alt="Community peer support banner"
              fill
              className="object-cover object-center"
              unoptimized
            />
          </div>

          <div className="p-4 pt-3.5">
            <h3 className="text-lg font-bold text-[#111827]">
              {km ? recommendedGroup.nameKm : recommendedGroup.name}
            </h3>
            <p className="mt-1 text-xs text-[#6b7280]">
              {recommendedGroup.membersCount}/{recommendedGroup.maxMembers}{" "}
              {km ? "សមាជិក" : "members"}
            </p>

            <button
              onClick={() => onSelectGroup(recommendedGroup.id)}
              className="mt-4 w-full rounded-[16px] bg-[#1a5d4d] py-3 text-center text-base font-bold text-white shadow-md shadow-[#1a5d4d]/20 transition-all duration-200 hover:bg-[#144b3e] active:scale-[0.99]"
            >
              {km ? "មើលក្រុម (View Group)" : "View Group"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access to Community Accordion & Groups */}
      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={onOpenAllGroups}
          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-[#1f6f5b] hover:bg-[#eaf5f1] transition-colors"
        >
          <span>{km ? "ស្វែងរកក្រុមគាំទ្រទាំងអស់ (Explore All Groups)" : "Explore All Support Groups"}</span>
          <ChevronRight size={18} />
        </button>
        <button
          onClick={onOpenMenu}
          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span>{km ? "គោលការណ៍សហគមន៍ និងការកំណត់" : "Community Guidelines & Options"}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
