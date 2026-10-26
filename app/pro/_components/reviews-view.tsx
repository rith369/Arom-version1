'use client';

import { EyeOff, MessageSquareReply, ShieldCheck, Star, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProAttention } from './pro-attention';
import { useLanguage } from '../../_components/language-provider';
import { reviewMonth, starsLabel, StarRow } from '../../_components/reviews/stars';
import { MAX_REVIEW_REPLY, summarize, type ProReview, type ProReviewsResponse } from '@/lib/reviews';

type Status = 'loading' | 'ready' | 'failed';

async function saveReply(id: string, reply: string) {
  try {
    const response = await fetch(`/api/pro/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    });
    const data = (await response.json().catch(() => null)) as
      | (ProReviewsResponse & { error?: { message?: string } })
      | null;
    if (!response.ok || !data?.reviews) return { ok: false as const, message: data?.error?.message ?? null };
    return { ok: true as const, reviews: data.reviews };
  } catch {
    return { ok: false as const, message: null };
  }
}

function ReviewCard({
  review,
  km,
  onChange,
}: {
  review: ProReview;
  km: boolean;
  onChange: (reviews: ProReview[]) => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [editing, setEditing] = useState(false);
  const [reply, setReply] = useState(review.reply);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(text: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await saveReply(review.id, text);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? t('មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។', 'That could not be saved. Please try again.'));
      return;
    }
    setEditing(false);
    onChange(result.reviews);
  }

  return (
    <li className="rounded-3xl border border-arom-border bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StarRow rating={review.rating} size={18} label={starsLabel(review.rating, km)} />
        <span className="text-xs text-ink-muted">{reviewMonth(review.createdAt, km)}</span>
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
        <UserRound aria-hidden="true" size={13} />
        {t('អតិថិជន AROM', 'AROM client')}
      </p>
      {review.comment ? (
        <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-ink">{review.comment}</p>
      ) : (
        <p className="mt-2 text-sm italic text-ink-muted">{t('ផ្កាយតែប៉ុណ្ណោះ គ្មានមតិ។', 'Stars only, no comment.')}</p>
      )}

      {review.hidden && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-arom-warning-soft px-3 py-2 text-xs leading-5 text-ink">
          <EyeOff aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-arom-warning" />
          <span>
            {t('ក្រុម AROM បានលាក់ការវាយតម្លៃនេះពីប្រវត្តិរូបរបស់អ្នក។', 'The AROM team hid this review from your profile.')}
            {review.hiddenReason && ` ${t('មូលហេតុ', 'Reason')}: ${review.hiddenReason}`}
          </span>
        </p>
      )}

      {editing ? (
        <div className="mt-3">
          <label className="block text-sm font-medium text-ink">
            {t('ការឆ្លើយតបរបស់អ្នក (សាធារណៈ)', 'Your reply (public)')}
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={3}
              maxLength={MAX_REVIEW_REPLY}
              disabled={busy}
              className="mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
            />
          </label>
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            {t(
              'អ្នកណាក៏អាចអានវាបាន។ សូមកុំនិយាយអំពីវគ្គ ឬព័ត៌មានលម្អិតរបស់អតិថិជន។',
              'Everyone can read it. Please do not mention the session or any client details.',
            )}
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm text-arom-danger">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !reply.trim()}
              onClick={() => void submit(reply.trim())}
              className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-60"
            >
              {busy ? t('កំពុងរក្សាទុក...', 'Saving...') : t('បង្ហោះការឆ្លើយតប', 'Post reply')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setReply(review.reply);
                setEditing(false);
              }}
              className="rounded-full border border-arom-border px-4 py-2 text-sm text-ink hover:bg-arom-wash"
            >
              {t('បោះបង់', 'Cancel')}
            </button>
          </div>
        </div>
      ) : review.reply ? (
        <div className="mt-3 rounded-xl bg-arom-wash/70 px-3.5 py-2.5">
          <p className="text-xs font-semibold text-arom-deep">{t('ការឆ្លើយតបរបស់អ្នក', 'Your reply')}</p>
          <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-ink">{review.reply}</p>
          <div className="mt-1.5 flex gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full px-2.5 py-1 text-sm font-semibold text-arom hover:bg-white"
            >
              {t('កែប្រែ', 'Edit')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit('')}
              className="rounded-full px-2.5 py-1 text-sm font-medium text-arom-danger hover:bg-white disabled:opacity-60"
            >
              {t('លុបការឆ្លើយតប', 'Remove reply')}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-sm text-arom-danger">
              {error}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash"
        >
          <MessageSquareReply aria-hidden="true" size={16} className="text-arom" />
          {t('ឆ្លើយតប', 'Reply')}
        </button>
      )}
    </li>
  );
}

/** /pro/reviews: what clients said, with a public reply to each. Writers are never named. */
export function ProReviewsView() {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [status, setStatus] = useState<Status>('loading');
  const [reviews, setReviews] = useState<ProReview[]>([]);
  // Keeps the Reviews count in the menu right after a reply is posted or removed.
  const { refreshReviews } = useProAttention();

  useEffect(() => {
    let active = true;
    fetch('/api/pro/reviews', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('failed');
        const data = (await response.json()) as ProReviewsResponse;
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

  const visible = reviews.filter((review) => !review.hidden);
  const summary = summarize(visible);
  const counts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: visible.filter((review) => review.rating === stars).length,
  }));

  return (
    <div className="mt-6 max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t('ការវាយតម្លៃ', 'Reviews')}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t(
          'អ្វីដែលអតិថិជនបាននិយាយបន្ទាប់ពីវគ្គដែលបានបញ្ចប់។ ការឆ្លើយតបរបស់អ្នកបង្ហាញលើប្រវត្តិរូបរបស់អ្នក។',
          'What clients said after a completed session. Your replies show on your profile.',
        )}
      </p>
      <p className="mt-3 flex items-start gap-2 rounded-2xl bg-arom-wash/70 px-4 py-3 text-sm text-ink">
        <ShieldCheck aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-arom" />
        {t(
          'ការវាយតម្លៃគឺអនាមិក។ អ្នកមិនឃើញថាអ្នកណាជាអ្នកសរសេរទេ ដូច្នេះអតិថិជនអាចនិយាយដោយស្មោះត្រង់។',
          'Reviews are anonymous. You do not see who wrote them, so clients can be honest.',
        )}
      </p>

      {status === 'loading' && (
        <p role="status" className="mt-8 text-sm text-ink-muted">
          {t('កំពុងផ្ទុក...', 'Loading...')}
        </p>
      )}
      {status === 'failed' && (
        <p role="alert" className="mt-8 text-sm text-arom-danger">
          {t('មិនអាចផ្ទុកការវាយតម្លៃបានទេ។ សូមផ្ទុកទំព័រម្តងទៀត។', 'We could not load your reviews. Please reload the page.')}
        </p>
      )}

      {status === 'ready' && reviews.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-arom/30 bg-white px-6 py-10 text-center">
          <Star aria-hidden="true" size={28} className="mx-auto text-arom" />
          <p className="mt-2 font-semibold text-ink">{t('មិនទាន់មានការវាយតម្លៃទេ', 'No reviews yet')}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {t(
              'អតិថិជនអាចវាយតម្លៃបន្ទាប់ពីអ្នកកំណត់វគ្គថា «បានបញ្ចប់»។',
              'Clients can write one after you mark a session as completed.',
            )}
          </p>
        </div>
      )}

      {status === 'ready' && reviews.length > 0 && (
        <>
          <section
            aria-label={t('សង្ខេប', 'Summary')}
            className="mt-6 grid gap-5 rounded-3xl border border-arom-border bg-white p-5 shadow-sm sm:grid-cols-[auto_1fr] sm:items-center"
          >
            <div>
              <p className="text-4xl font-bold tracking-tight text-ink">{summary.average.toFixed(1)}</p>
              <StarRow rating={summary.average} size={18} label={starsLabel(summary.average, km)} />
              <p className="mt-1 text-sm text-ink-muted">
                {summary.count} {t('ការវាយតម្លៃលើប្រវត្តិរូប', summary.count === 1 ? 'review on your profile' : 'reviews on your profile')}
              </p>
            </div>
            <ul className="space-y-1.5">
              {counts.map(({ stars, count }) => (
                <li key={stars} className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className="w-3 text-right font-semibold text-ink">{stars}</span>
                  <Star aria-hidden="true" size={12} className="fill-[#f6c445] text-[#f6c445]" />
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-arom-wash">
                    <span
                      className="block h-full rounded-full bg-[#f6c445]"
                      style={{ width: `${summary.count ? (count / summary.count) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="w-6 text-right">{count}</span>
                </li>
              ))}
            </ul>
          </section>

          <ul className="mt-6 space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                km={km}
                onChange={(next) => {
                  setReviews(next);
                  refreshReviews();
                }}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
