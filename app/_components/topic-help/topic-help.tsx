"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Check, Lightbulb, Plus, UsersRound, Wind, type LucideIcon } from "lucide-react";
import { groupChatHref, type ApiGroup } from "../../community/group-api";
import { topicOf, type GroupTopic } from "../../community/group-topics";
import type { UserRole } from "@/lib/auth";
import { ALL_LESSONS } from "../learn/learn-data";
import { ALL_TIPS } from "../tips/tips-data";
import { ALL_PRACTICES } from "../practice/practice-data";
import { toggleCustomPlanItem, usePlan, type DailyPlanSource } from "../daily-plan-store";
import { UpStudentBadge } from "../up-student/up-badge";
import { formatPrice } from "@/lib/pricing";
import type { ProfessionalCard } from "@/lib/therapists";
import { HELP_CONTENT, type HelpTopic } from "@/lib/wellbeing-topics";

// Help for one topic: a real lesson, tip and practice, and the professionals
// who help with it (BACKEND-HANDOFF.md section 22). Shared by the journal's
// "Suggested for you" and the symptom check result.

export type Suggestion = {
  id: string;
  kind: "lesson" | "tip" | "practice";
  source: DailyPlanSource;
  icon: LucideIcon;
  planIcon: string;
  title: string;
  titleKm: string;
  subtitle: string;
  subtitleKm: string;
  duration: string;
  durationKm: string;
  href: string;
};

const KIND_LABEL = {
  lesson: { en: "Lesson", km: "មេរៀន (Lesson)" },
  tip: { en: "Tip", km: "គន្លឹះ (Tip)" },
  practice: { en: "Practice", km: "លំហាត់ (Practice)" },
};

/** The first available lesson, tip and practice for the topic. */
export function suggestionsFor(topic: HelpTopic): Suggestion[] {
  const content = HELP_CONTENT[topic];
  const lesson = content.lessons
    .map((id) => ALL_LESSONS.find((item) => item.id === id && item.isAvailable))
    .find(Boolean);
  const tip = content.tips.map((id) => ALL_TIPS.find((item) => item.id === id && item.isAvailable)).find(Boolean);
  const practice = content.practices
    .map((id) => ALL_PRACTICES.find((item) => item.id === id && item.isAvailable))
    .find(Boolean);

  const list: Suggestion[] = [];
  if (lesson) {
    list.push({
      id: lesson.id,
      kind: "lesson",
      source: "learn",
      icon: BookOpen,
      planIcon: "ant-design_play-circle-filled",
      title: lesson.title,
      titleKm: lesson.kmTitle || lesson.title,
      subtitle: lesson.subtitle,
      subtitleKm: lesson.kmSubtitle || lesson.subtitle,
      duration: lesson.duration,
      durationKm: lesson.kmDuration || lesson.duration,
      href: `/mindguide/learn?open=${encodeURIComponent(lesson.id)}`,
    });
  }
  if (tip) {
    list.push({
      id: tip.id,
      kind: "tip",
      source: "tip",
      icon: Lightbulb,
      planIcon: "boxicons_note-filled",
      title: tip.title,
      titleKm: tip.kmTitle || tip.title,
      subtitle: tip.subtitle,
      subtitleKm: tip.kmSubtitle || tip.subtitle,
      duration: tip.duration,
      durationKm: tip.kmDuration || tip.duration,
      href: `/mindguide/tips?open=${encodeURIComponent(tip.id)}`,
    });
  }
  if (practice) {
    list.push({
      id: practice.id,
      kind: "practice",
      source: "practice",
      icon: Wind,
      planIcon: "hugeicons_yoga-03",
      title: practice.title,
      titleKm: practice.kmTitle || practice.title,
      subtitle: practice.subtitle,
      subtitleKm: practice.kmSubtitle || practice.subtitle,
      duration: practice.duration,
      durationKm: practice.kmDuration || practice.duration,
      href: `/mindguide/practice?open=${encodeURIComponent(practice.id)}`,
    });
  }
  return list;
}

/** Public professional cards from GET /api/professionals. Empty until loaded or on error. */
export function useProfessionals(): ProfessionalCard[] {
  const [professionals, setProfessionals] = useState<ProfessionalCard[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/professionals", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { professionals?: ProfessionalCard[] } | null) => {
        if (active && data?.professionals) setProfessionals(data.professionals);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return professionals;
}

// Support groups (Community) for each help topic. Trauma has none: sharing
// hard experiences in a group can hurt, so a professional comes first.
const GROUP_TOPIC: Record<HelpTopic, GroupTopic | null> = {
  stress: "stress",
  anxiety: "anxiety",
  sleep: "sleep",
  low_mood: "depression",
  burnout: "burnout",
  relationships: "general",
  loneliness: "general",
  self_esteem: "self_growth",
  trauma: null,
};

/** A real, open support group to suggest. */
export type GroupSuggestion = { name: string; nameKm: string; href: string; joined: boolean };

/** Groups from GET /api/community/groups. Empty until loaded, when signed out or on error. */
export function useSupportGroups(): ApiGroup[] {
  const [groups, setGroups] = useState<ApiGroup[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/community/groups", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { groups?: ApiGroup[] } | null) => {
        if (active && data?.groups) setGroups(data.groups);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return groups;
}

/**
 * The group for a topic: the one the person is in, or else the open group
 * with room and the most members. Null when there is none, so nothing shows.
 */
export function matchGroup(groups: ApiGroup[], topic: HelpTopic, role: UserRole | undefined): GroupSuggestion | null {
  const groupTopic = GROUP_TOPIC[topic];
  if (!groupTopic) return null;
  const open = groups.filter((group) => group.status === "active" && topicOf(group.concern) === groupTopic);
  const joined = open.find((group) => group.isJoined);
  const pick =
    joined ?? open.filter((group) => group.membersCount < group.maxMembers).sort((a, b) => b.membersCount - a.membersCount)[0];
  if (!pick) return null;
  return {
    name: pick.name,
    nameKm: pick.nameKm || pick.name,
    joined: Boolean(joined),
    // /community?group=<id> opens the group's details with Join.
    href: joined ? groupChatHref(role, pick.id) : `/community?group=${pick.id}`,
  };
}

/** A support group row, next to the lesson, tip and practice. */
export function GroupRow({ group, km }: { group: GroupSuggestion; km: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#1f6f5b]/10 bg-white/80 p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#dff3ee] text-[#1f6f5b]">
        <UsersRound size={18} aria-hidden="true" />
      </span>
      <Link href={group.href} className="min-w-0 flex-1 hover:underline">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
          {km ? "ក្រុមគាំទ្រ (Support group)" : "Support group"}
        </span>
        <span className="block text-sm font-semibold leading-snug text-[#111827]">{km ? group.nameKm : group.name}</span>
        <span className="block text-xs text-[#4b5563]">
          {km
            ? "អ្នកដទៃដែលមានអារម្មណ៍ដូចគ្នា។ ការអានដោយមិនសរសេរក៏បានដែរ។"
            : "Others who feel the same. Reading without writing is fine."}
        </span>
      </Link>
      <Link
        href={group.href}
        className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-[#1f6f5b]/25 bg-white px-3 text-xs font-semibold text-[#1f6f5b] transition-colors hover:bg-[#f2faf7]"
      >
        {group.joined ? (km ? "បើកការជជែក" : "Open chat") : km ? "មើលក្រុម" : "See group"}
      </Link>
    </div>
  );
}

/** Up to 2 professionals with a specialty for the topic. UP only (free for UP students) first, then free ones. */
export function matchProfessionals(professionals: ProfessionalCard[], topic: HelpTopic): ProfessionalCard[] {
  const wanted = HELP_CONTENT[topic].specialties;
  return (
    professionals
      // Also matches specialties professionals typed themselves, like "Stress and burnout".
      .filter((pro) =>
        pro.specialties.some((specialty) => wanted.some((item) => specialty.toLowerCase().includes(item.toLowerCase()))),
      )
      .sort(
        (a, b) =>
          Number(Boolean(b.upStudentsOnly)) - Number(Boolean(a.upStudentsOnly)) ||
          Number(b.price?.kind === "free") - Number(a.price?.kind === "free"),
      )
      .slice(0, 2)
  );
}

/** One lesson, tip or practice, with Add to Home. */
export function SuggestionRow({ item, km }: { item: Suggestion; km: boolean }) {
  const plan = usePlan();
  const added = plan.tasks.some((task) => task.itemKey === item.id);
  const Icon = item.icon;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#1f6f5b]/10 bg-white/80 p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#dff3ee] text-[#1f6f5b]">
        <Icon size={18} aria-hidden="true" />
      </span>
      <Link href={item.href} className="min-w-0 flex-1 hover:underline">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
          {km ? KIND_LABEL[item.kind].km : KIND_LABEL[item.kind].en} · {km ? item.durationKm : item.duration}
        </span>
        <span className="block text-sm font-semibold leading-snug text-[#111827]">{km ? item.titleKm : item.title}</span>
      </Link>
      <button
        type="button"
        aria-pressed={added}
        onClick={() =>
          toggleCustomPlanItem({
            id: item.id,
            source: item.source,
            title: item.title,
            titleKm: item.titleKm,
            subtitle: `${item.duration} • ${item.subtitle}`,
            subtitleKm: `${item.durationKm} • ${item.subtitleKm}`,
            icon: item.planIcon,
            href: item.href,
          })
        }
        className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border px-3 text-xs font-semibold transition-colors ${
          added ? "border-[#1f6f5b] bg-[#dff3ee] text-[#1f6f5b]" : "border-[#1f6f5b]/25 bg-white text-[#1f6f5b] hover:bg-[#f2faf7]"
        }`}
      >
        {added ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
        {added ? (km ? "នៅទំព័រដើម" : "On Home") : km ? "បន្ថែមទៅទំព័រដើម" : "Add to Home"}
      </button>
    </div>
  );
}

/** "Talk to a professional" with up to 2 matched professionals. `highlight` makes it stand out. */
export function ProfessionalBlock({
  km,
  highlight,
  message,
  matched,
}: {
  km: boolean;
  highlight: boolean;
  message: string;
  matched: ProfessionalCard[];
}) {
  return (
    <div className={`rounded-2xl border p-3 ${highlight ? "border-[#1f6f5b]/30 bg-[#e3f4ee]" : "border-[#1f6f5b]/10 bg-white/80"}`}>
      <p className="text-sm font-bold text-[#111827]">{km ? "និយាយជាមួយអ្នកជំនាញ" : "Talk to a professional"}</p>
      <p className="mt-1 text-xs leading-relaxed text-[#1f2d29]">{message}</p>
      {matched.length > 0 && (
        <ul className="mt-2.5 space-y-2">
          {matched.map((pro) => (
            <li key={pro.slug}>
              <Link
                href={`/professional/${pro.slug}`}
                className="flex items-center gap-3 rounded-xl bg-white p-2 transition-colors hover:bg-[#f2faf7]"
              >
                <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-[#dff3ee]">
                  <Image
                    src={pro.image}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                    style={{ objectPosition: pro.imagePosition }}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#111827]">
                    {km ? pro.kmName || pro.name : pro.name}
                  </span>
                  <span className="block truncate text-xs text-[#6b7280]">{km ? pro.kmRole || pro.role : pro.role}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    {pro.upStudentsOnly && <UpStudentBadge km={km} />}
                    {pro.price && <span className="text-[11px] font-semibold text-[#1f6f5b]">{formatPrice(pro.price, km)}</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/professional" className="mt-2.5 inline-flex text-xs font-semibold text-[#1f6f5b] hover:underline">
        {km ? "មើលអ្នកជំនាញទាំងអស់" : "See all professionals"}
      </Link>
    </div>
  );
}
