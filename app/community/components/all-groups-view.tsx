"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useLanguage } from "../../_components/language-provider";
import { SupportGroup } from "../community-data";
import { GROUP_TOPICS, TopicBadge, topicInfo, type GroupTopic } from "../group-topics";

type AllGroupsViewProps = {
  groups: SupportGroup[];
  onBack: () => void;
  onSelectGroup: (groupId: string) => void;
  // Opened from a topic tile on the Community home: starts filtered.
  initialTopic?: GroupTopic | null;
};

export function AllGroupsView({
  groups,
  onBack,
  onSelectGroup,
  initialTopic = null,
}: AllGroupsViewProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const [searchQuery, setSearchQuery] = useState("");
  const [topic, setTopic] = useState<GroupTopic | null>(initialTopic);

  const filtered = groups.filter((g) => {
    const q = searchQuery.toLowerCase();
    return (
      (!topic || g.iconType === topic) &&
      (g.name.toLowerCase().includes(q) ||
        g.nameKm.toLowerCase().includes(q) ||
        g.about.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 pt-3">
      {/* Top Navigation */}
      <div className="flex items-center gap-2 py-2">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-[#1f6f5b] hover:bg-[#eaf5f1] transition-colors"
          aria-label={km ? "ត្រឡប់ក្រោយ" : "Back"}
        >
          <ChevronLeft size={28} />
        </button>
      </div>

      {/* Title */}
      <div className="mt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
          {topic
            ? km
              ? `${topicInfo(topic).km} (${topicInfo(topic).en})`
              : topicInfo(topic).en
            : km
              ? "ក្រុមគាំទ្រទាំងអស់ (All Groups)"
              : "All Support Groups"}
        </h1>
      </div>

      {/* Search Input matching Figma Screen 2 */}
      <div className="mt-5 relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={km ? "ស្វែងរកក្រុម..." : "Search Groups..."}
          className="w-full rounded-[22px] border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#1f6f5b] focus:outline-none focus:ring-2 focus:ring-[#1f6f5b]/20"
        />
      </div>

      {/* Topic filter */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label={km ? "ប្រធានបទ" : "Topics"}>
        <button
          type="button"
          onClick={() => setTopic(null)}
          aria-pressed={topic === null}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${topic === null ? "border-[#1b5e4c] bg-[#1b5e4c] text-white" : "border-gray-200 bg-white text-[#374151]"}`}
        >
          {km ? "ទាំងអស់" : "All"}
        </button>
        {GROUP_TOPICS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTopic(item.id)}
            aria-pressed={topic === item.id}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${topic === item.id ? "border-[#1b5e4c] bg-[#1b5e4c] text-white" : "border-gray-200 bg-white text-[#374151]"}`}
          >
            {km ? item.km : item.en}
          </button>
        ))}
      </div>

      {/* Groups List */}
      <div className="mt-6 flex flex-col gap-3.5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            {km ? "រកមិនឃើញក្រុមដែលត្រូវគ្នាទេ" : "No matching groups found."}
          </div>
        ) : (
          filtered.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className="group flex cursor-pointer items-center justify-between rounded-[22px] border border-gray-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#1f6f5b]/40 hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center gap-4 min-w-0">
                <TopicBadge topic={group.iconType} size="lg" />
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-[#111827] group-hover:text-[#1f6f5b] transition-colors">
                    {km ? group.nameKm : group.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#6b7280]">
                    {group.membersCount}/{group.maxMembers}{" "}
                    {km ? "សមាជិក" : "Members"}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={22}
                className="shrink-0 text-gray-400 group-hover:translate-x-0.5 group-hover:text-[#1f6f5b] transition-all"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
