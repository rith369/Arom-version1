"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../../_components/language-provider";
import { SupportGroup } from "../community-data";

type CommunityMenuModalProps = {
  groups: SupportGroup[];
  onBack: () => void;
  onSelectGroup: (groupId: string) => void;
  onExploreAll: () => void;
};

export function CommunityMenuModal({
  groups,
  onBack,
  onSelectGroup,
  onExploreAll,
}: CommunityMenuModalProps) {
  const { language } = useLanguage();
  const km = language === "km";

  const [expanded, setExpanded] = useState<string | null>("guidelines");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const myGroups = groups.filter((g) => g.isJoined);
  const recommended = groups.filter((g) => !g.isJoined && g.status !== "closed");

  function toggle(section: string) {
    setExpanded(expanded === section ? null : section);
  }

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 pt-3">
      {/* Top Bar matching Figma Screen 9 */}
      <div className="flex items-center gap-2 py-2">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-[#1f6f5b] hover:bg-[#eaf5f1] transition-colors"
          aria-label={km ? "ត្រឡប់ក្រោយ" : "Back"}
        >
          <ChevronLeft size={28} />
        </button>
      </div>

      {/* Title matching Figma Screen 9 */}
      <div className="mt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
          {km ? "សហគមន៍ (Community)" : "Community"}
        </h1>
      </div>

      {/* Accordion Menu with Exact Figma Icons matching Screen 9 */}
      <div className="mt-6 flex flex-col gap-3">
        {/* 1. My Groups */}
        <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
          <button
            onClick={() => toggle("my-groups")}
            className="flex w-full items-center justify-between p-3.5 sm:p-4 text-left hover:bg-gray-50/70 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative size-8 shrink-0 overflow-hidden">
                <Image
                  src="/figma/community/icons/my_groups.png"
                  alt="My Groups"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-bold text-[#111827]">
                {km ? "ក្រុមរបស់ខ្ញុំ (My Groups)" : "My Groups"}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-[#1b5e4c] transition-transform duration-200 ${
                expanded === "my-groups" ? "rotate-180" : ""
              }`}
            />
          </button>
          {expanded === "my-groups" && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-2">
              {myGroups.length === 0 ? (
                <p className="text-xs text-gray-500">
                  {km ? "អ្នកមិនទាន់បានចូលរួមក្រុមណាមួយនៅឡើយទេ" : "You haven't joined any groups yet."}
                </p>
              ) : (
                myGroups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => onSelectGroup(g.id)}
                    className="flex w-full items-center justify-between rounded-xl bg-white p-3 text-xs font-semibold text-[#111827] shadow-sm hover:border-[#1f6f5b] transition-all"
                  >
                    <span>{km ? g.nameKm : g.name}</span>
                    {g.status === "closed" ? (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                        {km ? "បានបិទ (Closed)" : "Closed"}
                      </span>
                    ) : (
                      <span className="text-[#1f6f5b]">
                        {g.membersCount}/{g.maxMembers}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 2. Recommend for You */}
        <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
          <button
            onClick={() => toggle("recommend")}
            className="flex w-full items-center justify-between p-3.5 sm:p-4 text-left hover:bg-gray-50/70 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative size-8 shrink-0 overflow-hidden">
                <Image
                  src="/figma/community/icons/recommend.png"
                  alt="Recommend for You"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-bold text-[#111827]">
                {km ? "ណែនាំសម្រាប់អ្នក (Recommend for You)" : "Recommend for You"}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-[#1b5e4c] transition-transform duration-200 ${
                expanded === "recommend" ? "rotate-180" : ""
              }`}
            />
          </button>
          {expanded === "recommend" && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-2">
              {recommended.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onSelectGroup(g.id)}
                  className="flex w-full items-center justify-between rounded-xl bg-white p-3 text-xs font-semibold text-[#111827] shadow-sm hover:border-[#1f6f5b] transition-all"
                >
                  <span>{km ? g.nameKm : g.name}</span>
                  <span className="text-[#1f6f5b]">{km ? "មើល (View)" : "View"} →</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Explore All Groups */}
        <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
          <button
            onClick={() => {
              toggle("explore");
              onExploreAll();
            }}
            className="flex w-full items-center justify-between p-3.5 sm:p-4 text-left hover:bg-gray-50/70 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative size-8 shrink-0 overflow-hidden">
                <Image
                  src="/figma/community/icons/explore.png"
                  alt="Explore All Groups"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-bold text-[#111827]">
                {km ? "ស្វែងរកក្រុមទាំងអស់ (Explore All Groups)" : "Explore All Groups"}
              </span>
            </div>
            <ChevronDown size={18} className="text-[#1b5e4c]" />
          </button>
        </div>

        {/* 4. Community Guidelines */}
        <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
          <button
            onClick={() => toggle("guidelines")}
            className="flex w-full items-center justify-between p-3.5 sm:p-4 text-left hover:bg-gray-50/70 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative size-8 shrink-0 overflow-hidden">
                <Image
                  src="/figma/community/icons/guidelines.png"
                  alt="Community Guidelines"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-bold text-[#111827]">
                {km ? "គោលការណ៍ណែនាំសហគមន៍ (Guidelines)" : "Community Guidelines"}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-[#1b5e4c] transition-transform duration-200 ${
                expanded === "guidelines" ? "rotate-180" : ""
              }`}
            />
          </button>
          {expanded === "guidelines" && (
            <div className="border-t border-gray-100 bg-[#f9fbfb] p-4 text-xs text-[#374151] space-y-2.5 leading-relaxed">
              <p>• <strong>{km ? "ភាពសប្បុរសធម៌ (Kindness)" : "Kindness"}:</strong> {km ? "សូមគោរពសមាជិកទាំងអស់ដោយក្តីយល់ចិត្ត និងសេចក្តីថ្លៃថ្នូរ។" : "Treat everyone with empathy and dignity."}</p>
              <p>• <strong>{km ? "អនាមិកភាព (Anonymity)" : "Anonymity"}:</strong> {km ? "កុំចែករំលែកឈ្មោះពិត លេខទូរស័ព្ទ ឬព័ត៌មានសម្ងាត់។" : "Never reveal real identities, phone numbers, or private details."}</p>
              <p>• <strong>{km ? "សុវត្ថិភាព (Safety)" : "Safety"}:</strong> {km ? "សហគមន៍នេះមិនជំនួសការព្យាបាលវេជ្ជសាស្ត្រអាសន្នឡើយ។" : "Community support is not a replacement for emergency medical care."}</p>
            </div>
          )}
        </div>

        {/* 5. Report a Group */}
        <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
          <button
            onClick={() => toggle("report")}
            className="flex w-full items-center justify-between p-3.5 sm:p-4 text-left hover:bg-gray-50/70 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative size-8 shrink-0 overflow-hidden">
                <Image
                  src="/figma/community/icons/report.png"
                  alt="Report a Group"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-bold text-[#111827]">
                {km ? "រាយការណ៍អំពីក្រុម (Report a Group)" : "Report a Group"}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-[#1b5e4c] transition-transform duration-200 ${
                expanded === "report" ? "rotate-180" : ""
              }`}
            />
          </button>
          {expanded === "report" && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
              {reportSent ? (
                <div className="rounded-xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800">
                  ✓ {km ? "អរគុណ! របាយការណ៍ត្រូវបានផ្ញើជូនក្រុមការងារត្រួតពិនិត្យ។" : "Thank you. Your report has been submitted to moderators."}
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-600">
                    {km
                      ? "ប្រសិនបើអ្នកឃើញខ្លឹមសារមិនសមរម្យ ឬបំពានគោលការណ៍ សូមរាយការណ៍មកកាន់ក្រុមការងាររបស់យើង។"
                      : "If you observe harmful or rule-violating behavior, let our moderation team know."}
                  </p>
                  <button
                    onClick={() => setReportSent(true)}
                    className="w-full rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
                  >
                    {km ? "ដាក់ស្នើរាយការណ៍ (Submit Report)" : "Submit Report to Moderation"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 6. Give Feedback */}
        <div className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
          <button
            onClick={() => toggle("feedback")}
            className="flex w-full items-center justify-between p-3.5 sm:p-4 text-left hover:bg-gray-50/70 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative size-8 shrink-0 overflow-hidden">
                <Image
                  src="/figma/community/icons/feedback.png"
                  alt="Give Feedback"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-bold text-[#111827]">
                {km ? "ផ្តល់មតិកែលម្អ (Give Feedback)" : "Give Feedback"}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-[#1b5e4c] transition-transform duration-200 ${
                expanded === "feedback" ? "rotate-180" : ""
              }`}
            />
          </button>
          {expanded === "feedback" && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
              {feedbackSent ? (
                <div className="rounded-xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800">
                  ✓ {km ? "អរគុណសម្រាប់មតិកែលម្អរបស់អ្នក!" : "Thank you for your feedback!"}
                </div>
              ) : (
                <>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={km ? "តើយើងអាចកែលម្អសហគមន៍ ARom ឱ្យកាន់តែប្រសើរដោយរបៀបណា?..." : "How can we make Arom Community better?..."}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#1f6f5b]/20"
                  />
                  <button
                    disabled={!feedbackText.trim()}
                    onClick={() => {
                      setFeedbackSent(true);
                      setFeedbackText("");
                    }}
                    className="w-full rounded-xl bg-[#1b5e4c] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#144b3e] disabled:opacity-40 transition-colors"
                  >
                    {km ? "ផ្ញើមតិកែលម្អ (Send Feedback)" : "Send Feedback"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
