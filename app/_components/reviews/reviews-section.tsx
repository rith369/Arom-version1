"use client";

import { ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { summarize, type PublicReview } from "@/lib/reviews";
import { reviewMonth, starsLabel, StarRow } from "./stars";

const FIRST_SHOWN = 5;

/** Reviews on a professional's public profile. Writers are never named. */
export function ReviewsSection({
  reviews,
  average,
  count,
  professionalName,
  km,
}: {
  reviews: PublicReview[];
  average: number;
  count: number;
  professionalName: string;
  km: boolean;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [showAll, setShowAll] = useState(false);
  // The summary comes from the database; fall back to the list if it did not load.
  const summary = count > 0 ? { average, count } : summarize(reviews);
  const shown = showAll ? reviews : reviews.slice(0, FIRST_SHOWN);

  return (
    <section aria-labelledby="reviews-heading" className="mt-8 scroll-mt-6 border-t border-arom-border pt-6">
      <h2 id="reviews-heading" className="text-xl font-bold tracking-[-0.02em] text-ink">
        {t("ការវាយតម្លៃ (Reviews)", "Reviews")}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-3xl font-bold tracking-tight text-ink">{summary.average.toFixed(1)}</span>
        <StarRow rating={summary.average} size={20} label={starsLabel(summary.average, km)} />
        <span className="text-sm text-ink-muted">
          {summary.count} {t("ការវាយតម្លៃ", summary.count === 1 ? "review" : "reviews")}
        </span>
      </div>
      <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-ink-muted">
        <ShieldCheck aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-arom" />
        {t(
          "ពីអតិថិជនដែលបានបញ្ចប់វគ្គ។ យើងមិនបង្ហាញឈ្មោះរបស់ពួកគេទេ។",
          "From clients who finished a session. We never show their names.",
        )}
      </p>

      <ul className="mt-4 space-y-3">
        {shown.map((review) => (
          <li key={review.id} className="rounded-2xl border border-arom-border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StarRow rating={review.rating} label={starsLabel(review.rating, km)} />
              <span className="text-xs text-ink-muted">{reviewMonth(review.createdAt, km)}</span>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
              <UserRound aria-hidden="true" size={13} />
              {t("អតិថិជន AROM", "AROM client")}
            </p>
            {review.comment && (
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-ink">{review.comment}</p>
            )}
            {review.reply && (
              <div className="mt-3 rounded-xl bg-arom-wash/70 px-3.5 py-2.5">
                <p className="text-xs font-semibold text-arom-deep">
                  {t(`ការឆ្លើយតបពី ${professionalName}`, `Reply from ${professionalName}`)}
                </p>
                <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-ink">{review.reply}</p>
              </div>
            )}
          </li>
        ))}
      </ul>

      {reviews.length > FIRST_SHOWN && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          aria-expanded={showAll}
          className="mt-3 rounded-full px-3 py-1.5 text-sm font-semibold text-arom hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
        >
          {showAll
            ? t("បង្ហាញតិចជាងនេះ", "Show fewer")
            : t(`មើលការវាយតម្លៃទាំង ${reviews.length}`, `Show all ${reviews.length} reviews`)}
        </button>
      )}
    </section>
  );
}
