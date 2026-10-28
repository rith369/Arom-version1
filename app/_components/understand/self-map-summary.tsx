"use client";

import {
  COPING_STYLES,
  COPING_STYLE_INFO,
  LIVING_OPTIONS,
  TRAITS,
  TRAIT_INFO,
  valueCard,
  type CopingResult,
  type PersonalityResult,
  type ValuesAnswers,
} from "@/lib/self-map";

/**
 * The five traits, each a line between two friendly ends with a dot where
 * the person sits. Neither end is better. `showBigFive` adds the Big Five
 * names for professionals.
 */
export function TraitBars({ result, km, showBigFive = false }: { result: PersonalityResult; km: boolean; showBigFive?: boolean }) {
  return (
    <ul className="space-y-4">
      {TRAITS.map((trait) => {
        const info = TRAIT_INFO[trait];
        const percent = result.traits[trait];
        const side = percent > 50 ? info.high : percent < 50 ? info.low : null;
        return (
          <li key={trait}>
            <p className="text-sm font-semibold text-ink">
              {km ? info.name.km : info.name.en}
              {showBigFive && <span className="font-normal text-ink-muted"> ({info.bigFive})</span>}
            </p>
            <div className="relative mt-2 h-2 rounded-full bg-arom-soft" aria-hidden="true">
              <span
                className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-arom shadow"
                style={{ left: `${Math.min(96, Math.max(4, percent))}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between gap-3 text-xs text-ink-muted">
              <span>{km ? info.low.km : info.low.en}</span>
              <span className="text-right">{km ? info.high.km : info.high.en}</span>
            </div>
            <p className="sr-only">
              {side
                ? km
                  ? `ទំនោរទៅរក ${side.km}`
                  : `Leans toward ${side.en}`
                : km
                  ? "នៅកណ្តាល"
                  : "In the middle"}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

// Self map pieces shown to the person (/understand) and, when they share it,
// to their professional (client file and Prepare). BACKEND-HANDOFF.md section 38.

/** How much of a coping style, in words. Never a number or a level. */
export function styleAmount(percent: number, km: boolean) {
  if (percent < 34) return km ? "តិចតួច" : "A little";
  if (percent < 67) return km ? "ខ្លះៗ" : "Some";
  return km ? "ច្រើន" : "A lot";
}

/** The picked values in order, each with how much it was lived. */
export function ValuesList({ answers, km, showDescription = true }: { answers: ValuesAnswers; km: boolean; showDescription?: boolean }) {
  return (
    <ol className="space-y-2.5">
      {answers.picks.map((pick, index) => {
        const card = valueCard(pick.id);
        if (!card) return null;
        return (
          <li key={pick.id} className="flex items-start gap-3 rounded-2xl border border-arom-border bg-white p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-arom-soft text-sm font-bold text-arom-deep">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{km ? card.name.km : card.name.en}</span>
              {showDescription && (
                <span className="block text-xs leading-5 text-ink-muted">{km ? card.description.km : card.description.en}</span>
              )}
              <span className="mt-1.5 flex items-center gap-2">
                <span className="flex gap-1" aria-hidden="true">
                  {LIVING_OPTIONS.slice(1).map((_, dot) => (
                    <span key={dot} className={`h-1.5 w-5 rounded-full ${dot < pick.living ? "bg-arom" : "bg-arom-soft"}`} />
                  ))}
                </span>
                <span className="text-xs text-ink-muted">
                  {km ? "បានរស់នៅតាម៖ " : "Lived: "}
                  {km ? LIVING_OPTIONS[pick.living].km : LIVING_OPTIONS[pick.living].en}
                </span>
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** The three coping styles as simple bars, with words instead of numbers. */
export function CopingStyleBars({ result, km, showDescription = true }: { result: CopingResult; km: boolean; showDescription?: boolean }) {
  return (
    <ul className="space-y-3">
      {COPING_STYLES.map((style) => {
        const info = COPING_STYLE_INFO[style];
        const percent = result.styles[style];
        return (
          <li key={style}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-ink">{km ? info.name.km : info.name.en}</span>
              <span className="shrink-0 text-xs font-medium text-ink-muted">{styleAmount(percent, km)}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-arom-soft" aria-hidden="true">
              <div
                className={`h-full rounded-full ${style === "avoid" ? "bg-arom-warning" : "bg-arom"}`}
                style={{ width: `${Math.max(percent, 4)}%` }}
              />
            </div>
            {showDescription && <p className="mt-1 text-xs leading-5 text-ink-muted">{km ? info.description.km : info.description.en}</p>}
          </li>
        );
      })}
    </ul>
  );
}
