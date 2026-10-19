"use client";

import { EyeOff, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import { MAX_REVIEW_COMMENT, type MyReview, type MyReviewsResponse } from "@/lib/reviews";
import { reviewMonth, StarPicker, starsLabel, StarRow } from "../reviews/stars";

type Result = { ok: true; reviews: MyReview[] } | { ok: false; message: string | null };

async function sendReview(method: "PUT" | "DELETE", slug: string, body?: { rating: number; comment: string }): Promise<Result> {
  try {
    const response = await fetch(method === "DELETE" ? `/api/reviews?slug=${encodeURIComponent(slug)}` : "/api/reviews", {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify({ slug, ...body }) : undefined,
    });
    const data = (await response.json().catch(() => null)) as
      | (MyReviewsResponse & { error?: { message?: string } })
      | null;
    if (!response.ok || !data?.reviews) return { ok: false, message: data?.error?.message ?? null };
    return { ok: true, reviews: data.reviews };
  } catch {
    return { ok: false, message: null };
  }
}

/**
 * Write, edit or delete the one review a user keeps per professional.
 * Shown on their latest completed session with that professional.
 */
export function ReviewPanel({
  slug,
  professionalName,
  review,
  km,
  onChange,
}: {
  slug: string;
  professionalName: string;
  review: MyReview | null;
  km: boolean;
  onChange: (reviews: MyReview[]) => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fallback = t("មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។", "That could not be saved. Please try again.");

  function startEditing() {
    setRating(review?.rating ?? 0);
    setComment(review?.comment ?? "");
    setError("");
    setConfirmDelete(false);
    setEditing(true);
  }

  async function save() {
    if (busy) return;
    if (rating < 1) {
      setError(t("សូមជ្រើសរើសផ្កាយ ១ ដល់ ៥។", "Please choose 1 to 5 stars."));
      return;
    }
    setBusy(true);
    setError("");
    const result = await sendReview("PUT", slug, { rating, comment: comment.trim() });
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? fallback);
      return;
    }
    setEditing(false);
    onChange(result.reviews);
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await sendReview("DELETE", slug);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? fallback);
      return;
    }
    setConfirmDelete(false);
    onChange(result.reviews);
  }

  const privacyNote = (
    <p className="flex items-start gap-2 text-xs leading-5 text-ink-muted">
      <ShieldCheck aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-arom" />
      {t(
        "បង្ហាញលើប្រវត្តិរូបរបស់ពួកគេជា «អតិថិជន AROM»។ ឈ្មោះរបស់អ្នកមិនត្រូវបានបង្ហាញទេ សូម្បីតែចំពោះអ្នកជំនាញក៏ដោយ។",
        "Shown on their profile as \"AROM client\". Your name is never shown, not even to your professional.",
      )}
    </p>
  );

  if (editing) {
    return (
      <div className="mt-4 rounded-2xl border border-arom-border p-3.5">
        <StarPicker
          value={rating}
          onChange={setRating}
          name={`rating-${slug}`}
          legend={t(`តើវគ្គជាមួយ ${professionalName} យ៉ាងដូចម្តេច?`, `How was your time with ${professionalName}?`)}
          km={km}
          disabled={busy}
        />
        <label className="mt-3 block text-sm font-medium text-ink">
          {t("សរសេរបន្ថែម (ស្រេចចិត្ត)", "Tell others more (optional)")}
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            maxLength={MAX_REVIEW_COMMENT}
            disabled={busy}
            placeholder={t(
              "អ្វីដែលបានជួយអ្នក។ សូមកុំសរសេរព័ត៌មានផ្ទាល់ខ្លួន។",
              "What helped you. Please leave out personal details.",
            )}
            className="mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted/70 focus:border-arom focus:ring-4 focus:ring-arom/10"
          />
        </label>
        <p className="mt-1 text-right text-xs text-ink-muted">
          {comment.length}/{MAX_REVIEW_COMMENT}
        </p>
        <div className="mt-1">{privacyNote}</div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-arom-danger">
            {error}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-60"
          >
            {busy ? t("កំពុងរក្សាទុក...", "Saving...") : review ? t("រក្សាទុកការកែប្រែ", "Save changes") : t("ផ្ញើការវាយតម្លៃ", "Post review")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setEditing(false)}
            className="rounded-full border border-arom-border px-4 py-2 text-sm text-ink hover:bg-arom-wash"
          >
            {t("បោះបង់", "Cancel")}
          </button>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-arom-wash/70 px-3.5 py-3">
        <p className="min-w-0 flex-1 text-sm text-ink">
          {t(
            `តើវគ្គជាមួយ ${professionalName} យ៉ាងដូចម្តេច? ការវាយតម្លៃរបស់អ្នកជួយអ្នកដទៃរកជំនួយដែលត្រូវនឹងពួកគេ។`,
            `How was your time with ${professionalName}? Your review helps others find the right support.`,
          )}
        </p>
        <button
          type="button"
          onClick={startEditing}
          className="inline-flex items-center gap-1.5 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep"
        >
          <Star aria-hidden="true" size={16} />
          {t("វាយតម្លៃ", "Write a review")}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl bg-arom-wash/70 px-3.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
          {t("ការវាយតម្លៃរបស់អ្នក", "Your review")}
          <StarRow rating={review.rating} label={starsLabel(review.rating, km)} />
        </p>
        <span className="text-xs text-ink-muted">{reviewMonth(review.createdAt, km)}</span>
      </div>
      {review.comment && (
        <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-6 text-ink">{review.comment}</p>
      )}
      {review.hiddenReason !== null && (
        <p className="mt-2 flex items-start gap-2 rounded-xl bg-arom-warning-soft px-3 py-2 text-xs leading-5 text-ink">
          <EyeOff aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-arom-warning" />
          <span>
            {t(
              "ក្រុម AROM បានលាក់ការវាយតម្លៃនេះពីប្រវត្តិរូប។",
              "The AROM team hid this review from the profile.",
            )}
            {review.hiddenReason && ` ${t("មូលហេតុ", "Reason")}: ${review.hiddenReason}`}
          </span>
        </p>
      )}
      {review.reply && (
        <div className="mt-2 rounded-xl bg-white px-3 py-2">
          <p className="text-xs font-semibold text-arom-deep">
            {t(`ការឆ្លើយតបពី ${professionalName}`, `Reply from ${professionalName}`)}
          </p>
          <p className="mt-0.5 whitespace-pre-line break-words text-sm leading-6 text-ink">{review.reply}</p>
        </div>
      )}

      {confirmDelete ? (
        <div className="mt-3">
          <p className="text-sm text-ink">{t("លុបការវាយតម្លៃរបស់អ្នក?", "Delete your review?")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void remove()}
              className="rounded-full bg-arom-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy ? t("កំពុងលុប...", "Deleting...") : t("លុប", "Delete")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(false)}
              className="rounded-full border border-arom-border bg-white px-4 py-2 text-sm text-ink hover:bg-arom-wash"
            >
              {t("រក្សាទុក", "Keep it")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={startEditing}
            className="rounded-full px-2.5 py-1 text-sm font-semibold text-arom hover:bg-white"
          >
            {t("កែប្រែ", "Edit")}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-full px-2.5 py-1 text-sm font-medium text-arom-danger hover:bg-white"
          >
            {t("លុប", "Delete")}
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-arom-danger">
          {error}
        </p>
      )}
    </div>
  );
}
