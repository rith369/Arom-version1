"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import type { JournalSummary } from "@/lib/journal-summary";
import { TOPIC_CONTENT, weekTopics, type WellbeingTopic } from "@/lib/wellbeing-topics";
import { useAuth } from "../auth-provider";
import {
  GroupRow,
  ProfessionalBlock,
  SuggestionRow,
  matchGroup,
  matchProfessionals,
  suggestionsFor,
  useProfessionals,
  useSupportGroups,
} from "../topic-help/topic-help";
import type { WeekEntry } from "./journal-week-summary";

/** A week with this many days marked Not Good or Very difficult puts the professionals first. */
const HARD_WEEK_DAYS = 3;

/**
 * "Suggested for you" under the journal week (BACKEND-HANDOFF.md section 22).
 * The topic comes from the feelings the person picked, plus Gemini's topics
 * when the summary is on. Plain code turns it into real lessons, tips,
 * practices, a support group and professionals. Each item can be added to the
 * Home plan. Professionals are a gentle last row, and come first on a hard week.
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
  const professionals = useProfessionals();
  const groups = useSupportGroups();
  const { user } = useAuth();

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
  const group = matchGroup(groups, topic, user?.role);
  const hardDays = new Set(
    entries.filter((entry) => entry.mood === "Not Good" || entry.mood === "Very difficult").map((entry) => entry.date),
  ).size;
  const hardWeek = hardDays >= HARD_WEEK_DAYS;

  const professionalBlock = (
    <ProfessionalBlock
      km={km}
      highlight={hardWeek}
      matched={matchProfessionals(professionals, topic)}
      message={
        hardWeek
          ? km
            ? "សប្តាហ៍នេះពិបាកសម្រាប់អ្នក។ ការនិយាយជាមួយនរណាម្នាក់អាចជួយបានច្រើន ហើយអ្នកមិនចាំបាច់រង់ចាំឱ្យកាន់តែធ្ងន់ទេ។"
            : "This week has been hard. Talking to someone can really help, and you do not have to wait until it gets worse."
          : km
            ? `ប្រសិនបើការនិយាយជាមួយនរណាម្នាក់អាចជួយបាន អ្នកជំនាញទាំងនេះជួយលើ ${content.km}។`
            : `If it would help to talk it through, these professionals help with ${content.en.toLowerCase()}.`
      }
    />
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

        {items.map((item) => (
          <SuggestionRow key={item.id} item={item} km={km} />
        ))}

        {group && <GroupRow group={group} km={km} />}

        {!hardWeek && professionalBlock}
      </div>
    </section>
  );
}
