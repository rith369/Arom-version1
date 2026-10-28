"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Bookmark, Compass, HeartPulse, Lightbulb, Trash2 } from "lucide-react";
import { SuggestionRow, suggestionsFor } from "../../_components/topic-help/topic-help";
import { CopingStyleBars, ValuesList } from "../../_components/understand/self-map-summary";
import {
  COPING_CREDIT,
  COPING_SCALE_INFO,
  COPING_STYLES,
  COPING_STYLE_INFO,
  scoreCoping,
  usesSubstances,
  valueCard,
  valueToGrowInto,
  type CopingScale,
  type SelfMapPartDto,
} from "@/lib/self-map";
import { focusRing, primaryButton, secondaryButton } from "./styles";

type Pair = { en: string; km: string };

function formatDate(iso: string, km: boolean) {
  return new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Phnom_Penh" }).format(
    new Date(iso),
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Compass; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <Icon size={18} aria-hidden="true" className="text-arom" />
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ScaleNotes({ scales, km }: { scales: CopingScale[]; km: boolean }) {
  return (
    <ul className="space-y-2.5">
      {scales.map((scale) => {
        const info = COPING_SCALE_INFO[scale];
        return (
          <li key={scale} className="rounded-2xl bg-arom-wash/70 p-3">
            <p className="text-sm font-semibold text-ink">{km ? info.name.km : info.name.en}</p>
            <p className="mt-0.5 text-xs leading-5 text-ink-muted">{km ? info.note.km : info.note.en}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** Delete one part, after asking once. */
function DeletePart({ km, onDelete }: { km: boolean; onDelete: () => Promise<boolean> }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className={`mx-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-ink-muted hover:text-arom-danger ${focusRing}`}
      >
        <Trash2 size={14} aria-hidden="true" />
        {km ? "លុបចម្លើយទាំងនេះ" : "Delete these answers"}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-arom-border bg-white p-4 text-sm">
      <p className="text-ink">
        {km
          ? "លុបចម្លើយទាំងនេះ និងចម្លើយលើកមុនមែនទេ? វាមិនអាចយកមកវិញបានទេ។"
          : "Delete these answers and the ones before them? This cannot be undone."}
      </p>
      {failed && (
        <p role="alert" className="mt-2 text-arom-danger">
          {km ? "មិនអាចលុបបានទេ។ សូមព្យាយាមម្តងទៀត។" : "That could not be deleted. Please try again."}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setFailed(false);
            const ok = await onDelete();
            setBusy(false);
            if (!ok) setFailed(true);
          }}
          className={`rounded-full bg-arom-danger px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 ${focusRing}`}
        >
          {busy ? (km ? "កំពុងលុប..." : "Deleting...") : km ? "លុប" : "Delete"}
        </button>
        <button type="button" onClick={() => setAsking(false)} className={`rounded-full border border-arom-border px-4 py-2 text-xs font-semibold text-ink ${focusRing}`}>
          {km ? "បោះបង់" : "Cancel"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// My values
// ---------------------------------------------------------------------------

export function ValuesResult({
  km,
  part,
  onAgain,
  onDone,
  onDelete,
}: {
  km: boolean;
  part: Extract<SelfMapPartDto, { part: "values" }>;
  onAgain: () => void;
  onDone: () => void;
  onDelete: () => Promise<boolean>;
}) {
  const grow = valueToGrowInto(part.answers);
  const growCard = grow ? valueCard(grow.id) : undefined;
  const ids = part.answers.picks.map((pick) => pick.id);
  const before = part.previous?.picks.map((pick) => pick.id) ?? [];
  const added = part.previous ? ids.filter((id) => !before.includes(id)) : [];
  const dropped = part.previous ? before.filter((id) => !ids.includes(id)) : [];
  const names = (list: string[]) =>
    list
      .map((id) => valueCard(id))
      .filter((card) => card !== undefined)
      .map((card) => (km ? card.name.km : card.name.en))
      .join(km ? " និង " : ", ");

  return (
    <div className="mt-3 space-y-4 animate-in fade-in duration-200">
      <p className="text-xs text-ink-muted">{km ? `ឆ្លើយនៅថ្ងៃ ${formatDate(part.updatedAt, km)}` : `Answered ${formatDate(part.updatedAt, km)}`}</p>

      <Section icon={Compass} title={km ? "អ្វីដែលសំខាន់បំផុតសម្រាប់អ្នក" : "What matters most to you"}>
        <ValuesList answers={part.answers} km={km} />
      </Section>

      {growCard && (
        <Section icon={Lightbulb} title={km ? "តម្លៃមួយដែលត្រូវផ្តល់ពេលបន្ថែម" : "One value to give more time to"}>
          <p className="text-sm leading-6 text-ink">
            {km
              ? `${growCard.name.km} សំខាន់សម្រាប់អ្នក ប៉ុន្តែថ្មីៗនេះមិនសូវមានកន្លែងក្នុងជីវិតរបស់អ្នកទេ។ ជំហានតូចមួយសម្រាប់សប្តាហ៍នេះ៖`
              : `${growCard.name.en} matters to you, but it has had little room in your life lately. One small step for this week:`}
          </p>
          <p className="mt-2 rounded-2xl bg-arom-wash/70 p-3 text-sm font-medium leading-6 text-ink">{km ? growCard.smallStep.km : growCard.smallStep.en}</p>
        </Section>
      )}

      {!growCard && (
        <p className="rounded-2xl bg-arom-wash p-4 text-sm leading-6 text-ink">
          {km
            ? "អ្នកកំពុងរស់នៅជិតនឹងអ្វីដែលសំខាន់សម្រាប់អ្នក។ នោះជាការពិតដែលគួរឱ្យរីករាយ។ សូមបន្ត។"
            : "You are living close to what matters to you. That is worth noticing. Keep going."}
        </p>
      )}

      {part.previous && part.previousAt && (
        <Section icon={Bookmark} title={km ? "តាំងពីលើកមុន" : "Since last time"}>
          <p className="text-sm leading-6 text-ink">
            {added.length === 0 && dropped.length === 0
              ? km
                ? `តម្លៃរបស់អ្នកដូចគ្នានឹងថ្ងៃ ${formatDate(part.previousAt, km)}។`
                : `Your values are the same as on ${formatDate(part.previousAt, km)}.`
              : km
                ? `ធៀបនឹងថ្ងៃ ${formatDate(part.previousAt, km)}៖${added.length ? ` ថ្មី ${names(added)}។` : ""}${dropped.length ? ` លែងនៅក្នុងបញ្ជី ${names(dropped)}។` : ""}`
                : `Compared with ${formatDate(part.previousAt, km)}:${added.length ? ` new, ${names(added)}.` : ""}${dropped.length ? ` no longer on your list, ${names(dropped)}.` : ""}`}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {km ? "តម្លៃផ្លាស់ប្តូរនៅពេលជីវិតផ្លាស់ប្តូរ។ នោះជារឿងធម្មតា។" : "Values change as life changes. That is normal."}
          </p>
        </Section>
      )}

      <div className="grid gap-2.5">
        <button type="button" onClick={onDone} className={primaryButton}>
          {km ? "ត្រឡប់ទៅផែនទីរបស់ខ្ញុំ" : "Back to my self map"}
        </button>
        <button type="button" onClick={onAgain} className={secondaryButton}>
          {km ? "ធ្វើម្តងទៀត" : "Do it again"}
        </button>
      </div>
      <DeletePart km={km} onDelete={onDelete} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// How I handle stress
// ---------------------------------------------------------------------------

export function CopingResult({
  km,
  part,
  onAgain,
  onDone,
  onDelete,
}: {
  km: boolean;
  part: Extract<SelfMapPartDto, { part: "coping" }>;
  onAgain: () => void;
  onDone: () => void;
  onDelete: () => Promise<boolean>;
}) {
  const result = scoreCoping(part.answers);
  const previous = part.previous ? scoreCoping(part.previous) : null;
  const substances = usesSubstances(part.answers);
  const suggestions = [...suggestionsFor("stress"), ...(result.stuck.includes("self_blame") ? suggestionsFor("self_esteem") : [])];
  const changes: Pair[] = previous
    ? COPING_STYLES.flatMap((style) => {
        const difference = result.styles[style] - previous.styles[style];
        if (Math.abs(difference) < 15) return [];
        const name = COPING_STYLE_INFO[style].name;
        return [
          difference > 0
            ? { en: `More ${name.en.toLowerCase()} than before.`, km: `${name.km} ច្រើនជាងមុន។` }
            : { en: `Less ${name.en.toLowerCase()} than before.`, km: `${name.km} តិចជាងមុន។` },
        ];
      })
    : [];

  return (
    <div className="mt-3 space-y-4 animate-in fade-in duration-200">
      <p className="text-xs text-ink-muted">{km ? `ឆ្លើយនៅថ្ងៃ ${formatDate(part.updatedAt, km)}` : `Answered ${formatDate(part.updatedAt, km)}`}</p>

      <Section icon={Compass} title={km ? "របៀបដែលអ្នកទប់ទល់នឹងភាពតានតឹង" : "How you tend to handle stress"}>
        <p className="mb-4 text-sm leading-6 text-ink-muted">
          {km
            ? "មនុស្សគ្រប់គ្នាប្រើវិធីច្រើនបែបលាយគ្នា។ នេះបង្ហាញថាអ្នកប្រើវិធីនីមួយៗច្រើនប៉ុណ្ណា នាពេលថ្មីៗនេះ។"
            : "Everyone uses a mix of ways. This shows how much you have used each one lately."}
        </p>
        <CopingStyleBars result={result} km={km} />
      </Section>

      {result.most.length > 0 && (
        <Section icon={Activity} title={km ? "អ្វីដែលអ្នកធ្វើច្រើនជាងគេ" : "What you do most"}>
          <ScaleNotes scales={result.most} km={km} />
        </Section>
      )}

      {result.stuck.length > 0 && (
        <Section icon={HeartPulse} title={km ? "វិធីដែលអាចធ្វើឱ្យអ្នកជាប់គាំង" : "Ways that may keep you stuck"}>
          <p className="mb-3 text-sm leading-6 text-ink-muted">
            {km
              ? "វិធីទាំងនេះជួយឱ្យឆ្លងកាត់ពេលលំបាកបាន។ ប៉ុន្តែពេលប្រើច្រើន វាអាចធ្វើឱ្យភាពតានតឹងនៅយូរ។"
              : "These ways help people get through hard moments. Used a lot, they can make stress last longer."}
          </p>
          <ScaleNotes scales={result.stuck} km={km} />
        </Section>
      )}

      {substances && (
        <div className="rounded-2xl border border-arom-warning/30 bg-arom-warning-soft p-4 text-sm leading-6 text-ink">
          <p>{km ? COPING_SCALE_INFO.substance_use.note.km : COPING_SCALE_INFO.substance_use.note.en}</p>
          <Link href="/professional" className={`mt-2 inline-block font-semibold text-arom-deep underline ${focusRing}`}>
            {km ? "ពិភាក្សាជាមួយអ្នកជំនាញ" : "Talk to a professional"}
          </Link>
        </div>
      )}

      {result.tryMore.length > 0 && (
        <Section icon={Lightbulb} title={km ? "គួរសាកល្បងបន្ថែម" : "Worth trying more"}>
          <ScaleNotes scales={result.tryMore} km={km} />
        </Section>
      )}

      {suggestions.length > 0 && (
        <Section icon={Bookmark} title={km ? "អ្វីដែលអាចជួយ" : "What can help"}>
          <div className="space-y-2.5">
            {suggestions.map((item) => (
              <SuggestionRow key={`${item.kind}-${item.id}`} item={item} km={km} />
            ))}
          </div>
        </Section>
      )}

      {previous && part.previousAt && (
        <Section icon={Bookmark} title={km ? "តាំងពីលើកមុន" : "Since last time"}>
          <p className="text-sm leading-6 text-ink">
            {changes.length === 0
              ? km
                ? `ស្ទើរតែដូចគ្នានឹងថ្ងៃ ${formatDate(part.previousAt, km)}។`
                : `About the same as on ${formatDate(part.previousAt, km)}.`
              : `${km ? `ធៀបនឹងថ្ងៃ ${formatDate(part.previousAt, km)}៖` : `Compared with ${formatDate(part.previousAt, km)}:`} ${changes
                  .map((change) => (km ? change.km : change.en))
                  .join(" ")}`}
          </p>
        </Section>
      )}

      <div className="grid gap-2.5">
        <button type="button" onClick={onDone} className={primaryButton}>
          {km ? "ត្រឡប់ទៅផែនទីរបស់ខ្ញុំ" : "Back to my self map"}
        </button>
        <button type="button" onClick={onAgain} className={secondaryButton}>
          {km ? "ធ្វើម្តងទៀត" : "Do it again"}
        </button>
      </div>
      <p className="text-[0.7rem] leading-5 text-ink-muted">{km ? COPING_CREDIT.km : COPING_CREDIT.en}</p>
      <DeletePart km={km} onDelete={onDelete} />
    </div>
  );
}
