'use client';

import { useState, type FormEvent } from 'react';
import { Megaphone, Send } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { AnnouncementBar } from '../../_components/announcement-banner';
import {
  ANNOUNCEMENT_MAX_LENGTH,
  currentAnnouncement,
  isRunning,
  isValidAppLink,
  type AnnouncementTone,
} from '../../_components/announcements';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

type Ends = '1' | '7' | '30' | 'manual';

const TONES: { value: AnnouncementTone; label: string; chip: string }[] = [
  { value: 'info', label: 'Information', chip: 'bg-[#eef5fc] text-[#1d4f8a] border-[#cfe0f5]' },
  { value: 'good', label: 'Good news', chip: 'bg-arom-soft text-arom-deep border-arom/20' },
  { value: 'important', label: 'Important', chip: 'bg-arom-warning-soft text-arom-warning border-arom-warning/30' },
];

const ENDS: { value: Ends; label: string }[] = [
  { value: '1', label: 'In 1 day' },
  { value: '7', label: 'In 7 days' },
  { value: '30', label: 'In 30 days' },
  { value: 'manual', label: 'When I end it' },
];

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Phnom_Penh',
});

export function AnnouncementsSection() {
  const { announcements, publishAnnouncement, endAnnouncement } = useAdmin();

  const [kmText, setKmText] = useState('');
  const [enText, setEnText] = useState('');
  const [tone, setTone] = useState<AnnouncementTone>('info');
  const [link, setLink] = useState('');
  const [ends, setEnds] = useState<Ends>('7');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // Updated on publish and end, so statuses stay right without reading the clock while drawing.
  const [now, setNow] = useState(() => Date.now());

  const showing = currentAnnouncement(announcements, now);
  const left = ANNOUNCEMENT_MAX_LENGTH - kmText.length;
  const canPublish = kmText.trim().length > 0;
  const previewLink = isValidAppLink(link.trim()) ? link.trim() : '';

  function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanLink = link.trim();

    if (!kmText.trim()) {
      setError('Write the Khmer text.');
      return;
    }
    if (cleanLink && !isValidAppLink(cleanLink)) {
      setError('Use a page inside AROM that starts with /, for example /mindguide.');
      return;
    }

    const publishedAt = Date.now();
    publishAnnouncement({
      kmText: kmText.trim(),
      enText: enText.trim(),
      tone,
      link: cleanLink,
      endsAt:
        ends === 'manual'
          ? null
          : new Date(publishedAt + Number(ends) * 24 * 60 * 60 * 1000).toISOString(),
    });
    setNow(publishedAt);
    setKmText('');
    setEnText('');
    setLink('');
    setError('');
    setNotice('Published. It now shows at the top of every user page.');
  }

  return (
    <section className="rounded-3xl border border-arom-border bg-white p-6">
      <div className="flex items-center gap-3">
        <Megaphone size={38} aria-hidden="true" className="shrink-0 rounded-xl bg-arom-soft p-2 text-arom" />
        <div>
          <h2 className="text-lg font-semibold">Announcements</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            A short message every user sees at the top of the app, guests included, until it ends or you end it. One shows at a time: the newest.
          </p>
        </div>
      </div>

      <form onSubmit={publish} noValidate className="mt-6 space-y-5">
        <label className="block text-sm font-medium">
          Khmer text (required)
          <textarea
            value={kmText}
            onChange={(event) => {
              setKmText(event.target.value.slice(0, ANNOUNCEMENT_MAX_LENGTH));
              setError('');
              setNotice('');
            }}
            rows={3}
            maxLength={ANNOUNCEMENT_MAX_LENGTH}
            className={`${fieldClass} font-khmer`}
          />
          <span className={`mt-1 block text-xs font-normal ${left < 30 ? 'text-arom-warning' : 'text-ink-muted'}`}>
            {left} characters left
          </span>
        </label>

        <label className="block text-sm font-medium">
          English text (optional)
          <textarea
            value={enText}
            onChange={(event) => setEnText(event.target.value.slice(0, ANNOUNCEMENT_MAX_LENGTH))}
            rows={2}
            maxLength={ANNOUNCEMENT_MAX_LENGTH}
            className={fieldClass}
          />
          <span className="mt-1 block text-xs font-normal text-ink-muted">
            Shown when the app is in English. Without it, users see the Khmer.
          </span>
        </label>

        <fieldset>
          <legend className="text-sm font-medium">Colour</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TONES.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={tone === item.value}
                onClick={() => setTone(item.value)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${item.chip} ${
                  tone === item.value ? 'ring-2 ring-arom ring-offset-1' : 'opacity-70 hover:opacity-100'
                }`}>
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium">
          Link inside the app (optional)
          <input
            value={link}
            onChange={(event) => {
              setLink(event.target.value);
              setError('');
            }}
            placeholder="/mindguide"
            className={fieldClass}
          />
          <span className="mt-1 block text-xs font-normal text-ink-muted">
            A page such as /mindguide or /podcasts. Leave it empty for no button.
          </span>
        </label>

        <fieldset>
          <legend className="text-sm font-medium">Ends</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ENDS.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={ends === item.value}
                onClick={() => setEnds(item.value)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                  ends === item.value ? 'border-arom bg-arom text-white' : 'border-arom-border text-ink hover:bg-arom-wash'
                }`}>
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        {canPublish && (
          <div>
            <p className="text-sm font-medium">Preview</p>
            <div className="mt-2 overflow-hidden rounded-2xl border border-arom-border">
              <AnnouncementBar announcement={{ kmText, enText, tone, link: previewLink }} km />
              <AnnouncementBar announcement={{ kmText, enText, tone, link: previewLink }} km={false} />
            </div>
            <p className="mt-1 text-xs text-ink-muted">Top: Khmer app. Bottom: English app.</p>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-arom-danger">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canPublish}
            className="inline-flex items-center gap-2 rounded-full bg-arom px-5 py-2.5 text-sm font-medium text-white hover:bg-arom-deep disabled:cursor-not-allowed disabled:opacity-40">
            <Send size={16} aria-hidden="true" />
            Publish
          </button>
          <p role="status" aria-live="polite" className="text-sm text-arom">
            {notice}
          </p>
        </div>
      </form>

      <div className="mt-8 border-t border-arom-border pt-6">
        <h3 className="text-base font-semibold">All announcements</h3>

        {announcements.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No announcements yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {announcements.map((item) => {
              const running = isRunning(item, now);
              const status = running
                ? item.id === showing?.id
                  ? { label: 'Showing', style: 'bg-arom-soft text-arom' }
                  : { label: 'Not showing, a newer one is', style: 'bg-arom-warning-soft text-arom-warning' }
                : { label: 'Ended', style: 'bg-gray-100 text-gray-600' };
              const toneChip = TONES.find((entry) => entry.value === item.tone) ?? TONES[0];
              const endLabel = item.endedAt
                ? `Ended ${dateFormat.format(new Date(item.endedAt))}`
                : item.endsAt
                  ? `${running ? 'Ends' : 'Ended'} ${dateFormat.format(new Date(item.endsAt))}`
                  : 'Runs until you end it';

              return (
                <li key={item.id} className="rounded-2xl border border-arom-border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneChip.chip}`}>{toneChip.label}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.style}`}>{status.label}</span>
                  </div>
                  <p className="mt-2 font-khmer text-sm font-medium text-ink">{item.kmText}</p>
                  {item.enText && <p className="mt-0.5 text-sm text-ink-muted">{item.enText}</p>}
                  {item.link && <p className="mt-0.5 text-xs text-arom">Link: {item.link}</p>}
                  <p className="mt-2 text-xs text-ink-muted">
                    By {item.createdBy}, {dateFormat.format(new Date(item.createdAt))} · {endLabel}
                  </p>
                  {running && (
                    <button
                      type="button"
                      onClick={() => {
                        endAnnouncement(item.id);
                        setNow(Date.now());
                        setNotice('Announcement ended.');
                      }}
                      className="mt-3 rounded-full border border-arom-border px-4 py-1.5 text-xs font-medium text-ink hover:bg-arom-wash">
                      End now
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
