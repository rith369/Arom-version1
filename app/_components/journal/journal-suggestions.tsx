"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Check, Compass, Lightbulb, Plus, Wind, type LucideIcon } from "lucide-react";
import { ALL_LESSONS } from "../learn/learn-data";
import { ALL_TIPS } from "../tips/tips-data";
import { ALL_PRACTICES } from "../practice/practice-data";
import { toggleCustomPlanItem, usePlan, type DailyPlanSource } from "../daily-plan-store";
import { UpStudentBadge } from "../up-student/up-badge";
import { formatPrice } from "@/lib/pricing";
import type { JournalSummary } from "@/lib/journal-summary";
import type { ProfessionalCard } from "@/lib/therapists";
import { TOPIC_CONTENT, weekTopics, type WellbeingTopic } from "@/lib/wellbeing-topics";
import type { WeekEntry } from "./journal-week-summary";

/** A week with this many days marked Not Good or Very difficult puts the professionals first. */
const HARD_WEEK_DAYS = 3;

type Suggestion = {
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

function suggestionsFor(topic: WellbeingTopic): Suggestion[] {
  const content = TOPIC_CONTENT[topic];
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

/**
 * "Suggested for you" under the journal week (BACKEND-HANDOFF.md section 22).
 * The topic comes from the feelings the person picked, plus Gemini's topics
 * when the summary is on. Plain code turns it into real lessons, tips,
 * practices and professionals. Each item can be added to the Home plan.
 * Professionals are a gentle last row, and come first on a hard week.
 */
export function JournalSuggestions({
  km,
  entries,
  summary,
}: {
  km: boolean;
  entries: WeekEntry[];
  summary: JournalSummary | null;
}) {
  const [chosen, setChosen] = useState<WellbeingTopic | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalCard[]>([]);
  const plan = usePlan();

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

  // Something heavy came up: the summary shows the helplines instead.
  if (summary?.kind === "support") return null;

  const topics = weekTopics(
    entries.flatMap((entry) => entry.tags),
    summary?.kind === "summary" ? (summary.topics ?? []) : [],
  ).slice(0, 2);
  const topic = chosen && topics.includes(chosen) ? chosen : topics[0];
  if (!topic) return null;

  const content = TOPIC_CONTENT[topic];
  const label = km ? content.km : content.en;
  const items = suggestionsFor(topic);
  const hardDays = new Set(
    entries.filter((entry) => entry.mood === "Not Good" || entry.mood === "Very difficult").map((entry) => entry.date),
  ).size;
  const hardWeek = hardDays >= HARD_WEEK_DAYS;

  // UP only professionals (free for UP students) first, then free ones.
  const matched = professionals
    // Also matches specialties professionals typed themselves, like "Stress and burnout".
    .filter((pro) =>
      pro.specialties.some((specialty) =>
        content.specialties.some((wanted) => specialty.toLowerCase().includes(wanted.toLowerCase())),
      ),
    )
    .sort(
      (a, b) =>
        Number(Boolean(b.upStudentsOnly)) - Number(Boolean(a.upStudentsOnly)) ||
        Number(b.price?.kind === "free") - Number(a.price?.kind === "free"),
    )
    .slice(0, 2);

  const inPlan = (id: string) => plan.tasks.some((task) => task.itemKey === id);

  const professionalBlock = (
    <div className={`rounded-2xl border p-3 ${hardWeek ? "border-[#1f6f5b]/30 bg-[#e3f4ee]" : "border-[#1f6f5b]/10 bg-white/80"}`}>
      <p className="text-sm font-bold text-[#111827]">{km ? "និយាយជាមួយអ្នកជំនាញ" : "Talk to a professional"}</p>
      <p className="mt-1 text-xs leading-relaxed text-[#1f2d29]">
        {hardWeek
          ? km
            ? "សប្តាហ៍នេះពិបាកសម្រាប់អ្នក។ ការនិយាយជាមួយនរណាម្នាក់អាចជួយបានច្រើន ហើយអ្នកមិនចាំបាច់រង់ចាំឱ្យកាន់តែធ្ងន់ទេ។"
            : "This week has been hard. Talking to someone can really help, and you do not have to wait until it gets worse."
          : km
            ? `ប្រសិនបើការនិយាយជាមួយនរណាម្នាក់អាចជួយបាន អ្នកជំនាញទាំងនេះជួយលើ ${content.km}។`
            : `If it would help to talk it through, these professionals help with ${content.en.toLowerCase()}.`}
      </p>
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

  return (
    <section className="mt-4 rounded-[24px] border border-[#bce5d8] bg-gradient-to-br from-[#ebf7f3] via-[#f8fdfb] to-[#e4f5ee] p-4 shadow-[0_4px_22px_rgba(31,111,91,0.06)] sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[#dff3ee] text-[#1f6f5b]">
          <Compass size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-[#111827] sm:text-base">{km ? "ណែនាំសម្រាប់អ្នក" : "Suggested for you"}</h2>
          <p className="text-[11px] text-[#4b5563]">
            {km ? `សម្រាប់ ${label} សប្តាហ៍នេះ` : `For ${content.en.toLowerCase()} this week`}
          </p>
        </div>
      </div>

      {topics.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={km ? "ប្រធានបទ" : "Topic"}>
          {topics.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={item === topic}
              onClick={() => setChosen(item)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                item === topic ? "bg-[#1f6f5b] text-white" : "bg-white text-[#1f6f5b] hover:bg-[#dff3ee]"
              }`}
            >
              {km ? TOPIC_CONTENT[item].km : TOPIC_CONTENT[item].en}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {hardWeek && professionalBlock}

        {items.map((item) => {
          const added = inPlan(item.id);
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#1f6f5b]/10 bg-white/80 p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#dff3ee] text-[#1f6f5b]">
                <Icon size={18} aria-hidden="true" />
              </span>
              <Link href={item.href} className="min-w-0 flex-1 hover:underline">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  {km ? KIND_LABEL[item.kind].km : KIND_LABEL[item.kind].en} · {km ? item.durationKm : item.duration}
                </span>
                <span className="block text-sm font-semibold leading-snug text-[#111827]">
                  {km ? item.titleKm : item.title}
                </span>
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
        })}

        {!hardWeek && professionalBlock}
      </div>
    </section>
  );
}
