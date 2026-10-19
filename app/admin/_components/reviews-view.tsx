'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Search, ShieldCheck } from 'lucide-react';

import { starsLabel, StarRow } from '../../_components/reviews/stars';
import { MAX_HIDE_REASON, type AdminReview, type AdminReviewsResponse } from '@/lib/reviews';

type Tab = 'shown' | 'hidden';
type Status = 'loading' | 'ready' | 'failed';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Phnom_Penh',
});

async function setHidden(id: string, body: { hidden: true; reason: string } | { hidden: false }) {
  try {
    const response = await fetch(`/api/admin/reviews/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => null)) as
      | (AdminReviewsResponse & { error?: { message?: string } })
      | null;
    if (!response.ok || !data?.reviews) return { ok: false as const, message: data?.error?.message ?? null };
    return { ok: true as const, reviews: data.reviews };
  } catch {
    return { ok: false as const, message: null };
  }
}

function ReviewRow({ review, onChange }: { review: AdminReview; onChange: (reviews: AdminReview[]) => void }) {
  const [hiding, setHiding] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(body: { hidden: true; reason: string } | { hidden: false }) {
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await setHidden(review.id, body);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? 'That review could not be changed. Please try again.');
      return;
    }
    setHiding(false);
    setReason('');
    onChange(result.reviews);
  }

  return (
    <li className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StarRow rating={review.rating} label={starsLabel(review.rating, false)} />
            <span className="text-xs text-ink-muted">{dateFormatter.format(new Date(review.createdAt))}</span>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            For{' '}
            <Link href={`/professional/${review.professionalSlug}`} className="font-medium text-arom underline">
              {review.professionalName}
            </Link>
          </p>
          {review.comment ? (
            <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-ink">{review.comment}</p>
          ) : (
            <p className="mt-2 text-sm italic text-ink-muted">Stars only, no comment.</p>
          )}
          {review.reply && (
            <div className="mt-3 rounded-xl bg-arom-wash/70 px-3.5 py-2.5">
              <p className="text-xs font-semibold text-arom-deep">Reply from the professional</p>
              <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-ink">{review.reply}</p>
            </div>
          )}
          {review.hiddenAt && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-arom-warning-soft px-3 py-2 text-xs leading-5 text-ink">
              <EyeOff aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-arom-warning" />
              <span>
                Hidden on {dateFormatter.format(new Date(review.hiddenAt))}. Reason: {review.hiddenReason}
              </span>
            </p>
          )}
        </div>

        {!hiding &&
          (review.hiddenAt ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit({ hidden: false })}
              className="flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm text-ink hover:bg-arom-soft disabled:opacity-60"
            >
              <Eye aria-hidden="true" size={16} className="text-arom" />
              {busy ? 'Showing...' : 'Show again'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setHiding(true)}
              className="flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm text-ink hover:bg-arom-soft"
            >
              <EyeOff aria-hidden="true" size={16} className="text-arom-danger" />
              Hide
            </button>
          ))}
      </div>

      {hiding && (
        <div className="mt-4 rounded-2xl border border-arom-danger/20 p-4">
          <label className="block text-sm font-medium">
            Reason for hiding (the writer and the professional see it)
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
              maxLength={MAX_HIDE_REASON}
              placeholder="For example: names a client, rude language, not about the sessions."
              className="mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !reason.trim()}
              onClick={() => void submit({ hidden: true, reason: reason.trim() })}
              className="rounded-full bg-arom-danger px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy ? 'Hiding...' : 'Hide review'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setHiding(false);
                setReason('');
              }}
              className="rounded-full border border-arom-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-arom-danger">
          {error}
        </p>
      )}
    </li>
  );
}

/** /admin/reviews: every review of a professional. Admins can hide one with a reason. */
export function ReviewsView() {
  const [status, setStatus] = useState<Status>('loading');
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [tab, setTab] = useState<Tab>('shown');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/reviews', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('failed');
        const data = (await response.json()) as AdminReviewsResponse;
        if (!active) return;
        setReviews(data.reviews);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('failed');
      });
    return () => {
      active = false;
    };
  }, []);

  const needle = query.trim().toLowerCase();
  const hiddenCount = reviews.filter((review) => review.hiddenAt).length;
  const visible = reviews.filter(
    (review) =>
      (tab === 'hidden') === Boolean(review.hiddenAt) &&
      (!needle ||
        review.professionalName.toLowerCase().includes(needle) ||
        review.comment.toLowerCase().includes(needle)),
  );

  return (
    <div>
      <p className="text-sm font-medium text-arom">Professionals</p>
      <h1 className="mt-2 text-3xl font-semibold">Reviews</h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-muted">
        Clients review a professional after a completed session. Reviews show on the profile at once. Hide one that
        breaks the rules, for example one that names a person or is abusive.
      </p>
      <p className="mt-3 flex max-w-2xl items-start gap-2 text-sm text-ink-muted">
        <ShieldCheck aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-arom" />
        Reviews are anonymous. Nobody, including admins, can see who wrote one. Hiding and showing are written to the
        audit log.
      </p>

      <section className="mt-8 overflow-hidden rounded-3xl border border-arom-border bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-arom-border p-5">
          <div className="flex gap-1 rounded-full bg-arom-wash p-1" role="tablist" aria-label="Review status">
            {(
              [
                ['shown', `Shown (${reviews.length - hiddenCount})`],
                ['hidden', `Hidden (${hiddenCount})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`rounded-full px-4 py-1.5 text-sm ${tab === value ? 'bg-white font-medium text-ink shadow-sm' : 'text-ink-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative min-w-48 flex-1">
            <Search aria-hidden="true" size={17} className="absolute left-3 top-3 text-ink-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by professional or words in the review"
              aria-label="Search reviews"
              className="w-full rounded-xl border border-arom-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15"
            />
          </div>
        </div>

        {status === 'loading' && (
          <p role="status" className="p-10 text-center text-sm text-ink-muted">
            Loading reviews...
          </p>
        )}
        {status === 'failed' && (
          <p role="alert" className="p-10 text-center text-sm text-arom-danger">
            We could not load reviews. Please reload the page.
          </p>
        )}
        {status === 'ready' && visible.length === 0 && (
          <p className="p-10 text-center text-sm text-ink-muted">
            {reviews.length === 0 ? 'No reviews yet.' : 'No reviews match.'}
          </p>
        )}
        {status === 'ready' && visible.length > 0 && (
          <ul className="divide-y divide-arom-border">
            {visible.map((review) => (
              <ReviewRow key={review.id} review={review} onChange={setReviews} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
