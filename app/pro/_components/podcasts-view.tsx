'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Headphones, Pencil, Plus, ShieldCheck, Trash2, Upload, X } from 'lucide-react';

import { usePro } from './pro-provider';
import { useLanguage } from '../../_components/language-provider';
import {
  AUDIO_TYPES,
  LIMITS,
  MAX_AUDIO_MB,
  MAX_AUDIO_MINUTES,
  MAX_CHAPTERS,
  MAX_EPISODES,
  MAX_TAKEAWAYS,
  deleteEpisode,
  emptyEpisode,
  formatClock,
  publishEpisode,
  saveEpisode,
  setEpisodeStatus,
  useProPodcasts,
  type EpisodeStatus,
  type ProEpisode,
} from '../../_components/podcasts/pro-podcast-store';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-arom-border bg-white px-3.5 py-2.5 text-sm font-normal text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10';

const statusStyles: Record<EpisodeStatus, string> = {
  draft: 'bg-arom-warning-soft text-arom-warning',
  published: 'bg-arom-soft text-arom-deep',
  hidden: 'bg-gray-100 text-gray-600',
};

// "4:05" or "65:30" to seconds; null when not a time.
function parseClock(value: string) {
  const match = /^(\d{1,3}):([0-5]\d)$/.exec(value.trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

type ChapterRow = { time: string; title: string; kmTitle: string };
type TakeawayRow = { en: string; km: string };

function EpisodeEditor({ episode, onClose }: { episode: ProEpisode; onClose: () => void }) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [draft, setDraft] = useState<ProEpisode>(episode);
  const [takeaways, setTakeaways] = useState<TakeawayRow[]>(() =>
    episode.takeaways.map((en, index) => ({ en, km: episode.kmTakeaways[index] ?? '' })),
  );
  const [chapters, setChapters] = useState<ChapterRow[]>(() =>
    episode.chapters.map((chapter) => ({ time: formatClock(chapter.seconds), title: chapter.title, kmTitle: chapter.kmTitle })),
  );
  const [checks, setChecks] = useState([false, false, false]);
  const [errors, setErrors] = useState<string[]>([]);
  const [audioError, setAudioError] = useState('');

  const published = episode.status === 'published';
  const update = (change: Partial<ProEpisode>) => setDraft((current) => ({ ...current, ...change }));

  function chooseAudio(file: File | undefined) {
    setAudioError('');
    if (!file) return;
    const typeOk = AUDIO_TYPES.includes(file.type) || /\.(mp3|m4a|aac|wav|ogg|webm)$/i.test(file.name);
    if (!typeOk) return setAudioError(t('សូមជ្រើសរើសឯកសារសំឡេង (MP3, M4A, WAV)។', 'Choose an audio file (MP3, M4A or WAV).'));
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) return setAudioError(t(`ឯកសារធំពេក។ អតិបរមា ${MAX_AUDIO_MB} MB។`, `The file is too large. The limit is ${MAX_AUDIO_MB} MB.`));
    const url = URL.createObjectURL(file);
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => {
      const seconds = Math.round(probe.duration);
      if (!Number.isFinite(seconds) || seconds <= 0) {
        URL.revokeObjectURL(url);
        setAudioError(t('មិនអាចអានឯកសារនេះបានទេ។', 'This file could not be read.'));
        return;
      }
      if (seconds > MAX_AUDIO_MINUTES * 60) {
        URL.revokeObjectURL(url);
        setAudioError(t(`វគ្គវែងពេក។ អតិបរមា ${MAX_AUDIO_MINUTES} នាទី។`, `The episode is too long. The limit is ${MAX_AUDIO_MINUTES} minutes.`));
        return;
      }
      update({ audioUrl: url, audioName: file.name, durationSeconds: seconds, duration: formatClock(seconds) });
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setAudioError(t('មិនអាចអានឯកសារនេះបានទេ។', 'This file could not be read.'));
    };
    probe.src = url;
  }

  // Turns the form rows into the episode shape. Missing Khmer falls back to English and back.
  function build(): { episode: ProEpisode; problems: string[] } {
    const problems: string[] = [];
    const rows = chapters.filter((row) => row.time.trim() || row.title.trim() || row.kmTitle.trim());
    const parsed = rows.map((row) => ({ ...row, seconds: parseClock(row.time) }));
    if (parsed.some((row) => row.seconds === null)) problems.push(t('ម៉ោងផ្នែកត្រូវជាទម្រង់ 4:05។', 'Chapter times must look like 4:05.'));
    if (parsed.some((row) => row.seconds !== null && draft.durationSeconds > 0 && row.seconds >= draft.durationSeconds))
      problems.push(t('ផ្នែកមួយចាប់ផ្តើមក្រោយពេលចប់។', 'A chapter starts after the episode ends.'));
    const kept = takeaways.filter((row) => row.en.trim() || row.km.trim());
    const pair = (en: string, kmValue: string) => [en.trim() || kmValue.trim(), kmValue.trim() || en.trim()];
    const [title, kmTitle] = pair(draft.title, draft.kmTitle);
    const [subtitle, kmSubtitle] = pair(draft.subtitle, draft.kmSubtitle);
    const [description, kmDescription] = pair(draft.description, draft.kmDescription);
    const [topic, kmTopic] = pair(draft.topic, draft.kmTopic);
    const [quote, kmQuote] = pair(draft.quote, draft.kmQuote);
    return {
      problems,
      episode: {
        ...draft,
        title,
        kmTitle,
        subtitle,
        kmSubtitle,
        description,
        kmDescription,
        topic,
        kmTopic,
        quote,
        kmQuote,
        takeaways: kept.map((row) => row.en.trim() || row.km.trim()),
        kmTakeaways: kept.map((row) => row.km.trim() || row.en.trim()),
        chapters: parsed
          .filter((row) => row.seconds !== null)
          .sort((a, b) => a.seconds! - b.seconds!)
          .map((row) => {
            const [chapterTitle, kmChapterTitle] = pair(row.title, row.kmTitle);
            return { seconds: row.seconds!, timestamp: formatClock(row.seconds!), title: chapterTitle, kmTitle: kmChapterTitle };
          }),
      },
    };
  }

  function saveDraft() {
    const { episode: built, problems } = build();
    if (!built.title && !built.audioUrl) problems.push(t('សូមបន្ថែមចំណងជើង ឬឯកសារសំឡេង។', 'Add a title or an audio file first.'));
    setErrors(problems);
    if (problems.length) return;
    saveEpisode(built);
    onClose();
  }

  function goLive() {
    const { episode: built, problems } = build();
    if (!built.audioUrl && !built.publishedAt) problems.push(t('សូមបង្ហោះឯកសារសំឡេង។', 'Upload the audio file.'));
    if (!built.title) problems.push(t('សូមសរសេរចំណងជើង។', 'Write a title.'));
    if (!built.subtitle) problems.push(t('សូមសរសេរសេចក្តីសង្ខេបខ្លី។', 'Write a short summary.'));
    if (checks.some((value) => !value)) problems.push(t('សូមបញ្ជាក់ទាំងបីចំណុចខាងក្រោម។', 'Confirm all three points below.'));
    setErrors(problems);
    if (problems.length) return;
    publishEpisode(built);
    onClose();
  }

  const field = (key: keyof ProEpisode, label: string, max: number, multiline = false, placeholder = '') => {
    const value = String(draft[key] ?? '');
    return (
      <label className="block text-sm font-semibold text-ink">
        {label}
        {multiline ? (
          <textarea value={value} onChange={(event) => update({ [key]: event.target.value } as Partial<ProEpisode>)} maxLength={max} rows={4} placeholder={placeholder} className={inputClass} />
        ) : (
          <input value={value} onChange={(event) => update({ [key]: event.target.value } as Partial<ProEpisode>)} maxLength={max} placeholder={placeholder} className={inputClass} />
        )}
      </label>
    );
  };

  const confirmations = [
    t('មិនមានរឿង ឬព័ត៌មានណាមួយដែលអាចបង្ហាញអត្តសញ្ញាណអតិថិជនទេ។', 'No client stories or details that could identify a client.'),
    t('សម្រាប់ការសិក្សាប៉ុណ្ណោះ មិនមែនជាការធ្វើរោគវិនិច្ឆ័យ ឬការព្យាបាលសម្រាប់បុគ្គលណាម្នាក់ទេ។', 'For learning only, not a diagnosis or treatment for any one person.'),
    t('ខ្ញុំជាម្ចាស់ការថតនេះ ហើយមានការអនុញ្ញាតពីអ្នកផ្សេងទៀតដែលនិយាយក្នុងនោះ។', 'I own this recording and have permission from anyone else who speaks in it.'),
  ];

  return (
    <>
      <button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-sm font-semibold text-arom hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        {t('ផតខាសរបស់ខ្ញុំ', 'My podcasts')}
      </button>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {episode.title ? t('កែសម្រួលភាគ', 'Edit episode') : t('ភាគថ្មី', 'New episode')}
      </h1>
      {published && (
        <p className="mt-1 text-sm text-ink-muted">{t('ភាគនេះកំពុងបង្ហាញ។ ការផ្លាស់ប្តូរនឹងបង្ហាញភ្លាមៗ។', 'This episode is live. Changes show right away.')}</p>
      )}

      <div className="mt-6 space-y-5">
        <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-base font-bold text-ink">{t('ឯកសារសំឡេង', 'Audio file')}</h2>
          <p className="mt-1 text-xs text-ink-muted">
            {t(`MP3, M4A ឬ WAV រហូតដល់ ${MAX_AUDIO_MB} MB និង ${MAX_AUDIO_MINUTES} នាទី។`, `MP3, M4A or WAV, up to ${MAX_AUDIO_MB} MB and ${MAX_AUDIO_MINUTES} minutes.`)}
          </p>
          {draft.audioUrl ? (
            <div className="mt-3 space-y-2">
              <audio src={draft.audioUrl} controls className="w-full" />
              <p className="text-xs text-ink-muted">
                {draft.audioName} · {draft.duration}
              </p>
            </div>
          ) : (
            draft.publishedAt && (
              <p className="mt-3 rounded-xl bg-arom-wash px-3.5 py-2.5 text-xs text-ink-muted">{t('ភាគគំរូ គ្មានឯកសារសំឡេង។', 'Sample episode, no audio file.')}</p>
            )
          )}
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-arom hover:bg-arom-wash focus-within:ring-4 focus-within:ring-arom/10">
            <Upload size={16} aria-hidden="true" />
            {draft.audioUrl ? t('ប្តូរឯកសារ', 'Replace file') : t('ជ្រើសរើសឯកសារ', 'Choose a file')}
            <input type="file" accept="audio/*" className="sr-only" onChange={(event) => chooseAudio(event.target.files?.[0])} />
          </label>
          {audioError && (
            <p role="alert" className="mt-2 text-sm text-arom-danger">
              {audioError}
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-base font-bold text-ink">{t('អំពីភាគនេះ', 'About this episode')}</h2>
          <p className="mt-1 text-xs text-ink-muted">{t('សរសេរយ៉ាងហោចណាស់មួយភាសា។ ភាសាដែលទទេនឹងប្រើភាសាផ្សេង។', 'Write at least one language. An empty language uses the other one.')}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field('title', t('ចំណងជើង (English)', 'Title (English)'), LIMITS.title)}
            {field('kmTitle', t('ចំណងជើង (ខ្មែរ)', 'Title (Khmer)'), LIMITS.title)}
            {field('subtitle', t('សេចក្តីសង្ខេបខ្លី (English)', 'Short summary (English)'), LIMITS.subtitle)}
            {field('kmSubtitle', t('សេចក្តីសង្ខេបខ្លី (ខ្មែរ)', 'Short summary (Khmer)'), LIMITS.subtitle)}
            {field('topic', t('ប្រធានបទ (English)', 'Topic (English)'), LIMITS.topic, false, 'Sleep and stress')}
            {field('kmTopic', t('ប្រធានបទ (ខ្មែរ)', 'Topic (Khmer)'), LIMITS.topic)}
            {field('description', t('ការពិពណ៌នា (English)', 'Description (English)'), LIMITS.description, true)}
            {field('kmDescription', t('ការពិពណ៌នា (ខ្មែរ)', 'Description (Khmer)'), LIMITS.description, true)}
            {field('quote', t('សម្រង់ (English, ស្រេចចិត្ត)', 'Quote (English, optional)'), LIMITS.quote)}
            {field('kmQuote', t('សម្រង់ (ខ្មែរ, ស្រេចចិត្ត)', 'Quote (Khmer, optional)'), LIMITS.quote)}
          </div>
        </section>

        <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-base font-bold text-ink">{t('ចំណុចសំខាន់', 'Key points')}</h2>
          <p className="mt-1 text-xs text-ink-muted">{t(`រហូតដល់ ${MAX_TAKEAWAYS} ចំណុច។`, `Up to ${MAX_TAKEAWAYS} points.`)}</p>
          <ul className="mt-3 space-y-3">
            {takeaways.map((row, index) => (
              <li key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input value={row.en} maxLength={LIMITS.takeaway} onChange={(event) => setTakeaways(takeaways.map((item, i) => (i === index ? { ...item, en: event.target.value } : item)))} aria-label={t(`ចំណុច ${index + 1} (English)`, `Point ${index + 1} (English)`)} placeholder="English" className={inputClass.replace('mt-1.5 ', '')} />
                <input value={row.km} maxLength={LIMITS.takeaway} onChange={(event) => setTakeaways(takeaways.map((item, i) => (i === index ? { ...item, km: event.target.value } : item)))} aria-label={t(`ចំណុច ${index + 1} (ខ្មែរ)`, `Point ${index + 1} (Khmer)`)} placeholder="ខ្មែរ" className={inputClass.replace('mt-1.5 ', '')} />
                <button type="button" onClick={() => setTakeaways(takeaways.filter((_, i) => i !== index))} aria-label={t('លុប', 'Remove')} className="justify-self-start rounded-full p-2 text-arom-danger hover:bg-arom-danger-soft">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          {takeaways.length < MAX_TAKEAWAYS && (
            <button type="button" onClick={() => setTakeaways([...takeaways, { en: '', km: '' }])} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-arom hover:underline">
              <Plus size={15} aria-hidden="true" />
              {t('បន្ថែមចំណុច', 'Add a point')}
            </button>
          )}
        </section>

        <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-base font-bold text-ink">{t('ផ្នែក (ស្រេចចិត្ត)', 'Chapters (optional)')}</h2>
          <p className="mt-1 text-xs text-ink-muted">{t('ជួយអ្នកស្តាប់លោតទៅផ្នែកដែលពួកគេចង់បាន។ ម៉ោងដូចជា 4:05។', 'Help listeners jump to the part they need. Times like 4:05.')}</p>
          <ul className="mt-3 space-y-3">
            {chapters.map((row, index) => (
              <li key={index} className="grid gap-2 sm:grid-cols-[6rem_1fr_1fr_auto]">
                <input value={row.time} onChange={(event) => setChapters(chapters.map((item, i) => (i === index ? { ...item, time: event.target.value } : item)))} aria-label={t('ម៉ោង', 'Time')} placeholder="0:00" className={`${inputClass.replace('mt-1.5 ', '')} tabular-nums`} />
                <input value={row.title} maxLength={LIMITS.chapter} onChange={(event) => setChapters(chapters.map((item, i) => (i === index ? { ...item, title: event.target.value } : item)))} aria-label={t('ចំណងជើង (English)', 'Title (English)')} placeholder="English" className={inputClass.replace('mt-1.5 ', '')} />
                <input value={row.kmTitle} maxLength={LIMITS.chapter} onChange={(event) => setChapters(chapters.map((item, i) => (i === index ? { ...item, kmTitle: event.target.value } : item)))} aria-label={t('ចំណងជើង (ខ្មែរ)', 'Title (Khmer)')} placeholder="ខ្មែរ" className={inputClass.replace('mt-1.5 ', '')} />
                <button type="button" onClick={() => setChapters(chapters.filter((_, i) => i !== index))} aria-label={t('លុប', 'Remove')} className="justify-self-start rounded-full p-2 text-arom-danger hover:bg-arom-danger-soft">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          {chapters.length < MAX_CHAPTERS && (
            <button type="button" onClick={() => setChapters([...chapters, { time: '', title: '', kmTitle: '' }])} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-arom hover:underline">
              <Plus size={15} aria-hidden="true" />
              {t('បន្ថែមផ្នែក', 'Add a chapter')}
            </button>
          )}
        </section>

        <section className="rounded-3xl border border-arom/30 bg-arom-wash/60 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <ShieldCheck size={18} aria-hidden="true" className="text-arom" />
            {t('មុនពេលផ្សព្វផ្សាយ', 'Before it goes live')}
          </h2>
          <div className="mt-3 space-y-2.5">
            {confirmations.map((text, index) => (
              <label key={text} className="flex items-start gap-3 text-sm text-ink">
                <input type="checkbox" checked={checks[index]} onChange={(event) => setChecks(checks.map((value, i) => (i === index ? event.target.checked : value)))} className="mt-0.5 size-4 accent-arom" />
                {text}
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            {t('អ្នកប្រើក៏ឃើញ "សម្រាប់ការសិក្សាប៉ុណ្ណោះ" នៅលើទំព័រផតខាសផងដែរ។ ក្រុម AROM អាចលាក់ភាគដែលមិនសមរម្យ។', 'Users also see "For learning only" on podcast pages. The AROM team can hide an episode that breaks these rules.')}
          </p>
        </section>

        {errors.length > 0 && (
          <ul role="alert" className="space-y-1 rounded-2xl bg-arom-danger-soft px-4 py-3 text-sm text-arom-danger">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap justify-end gap-2 pb-4">
          <button type="button" onClick={onClose} className="rounded-full border border-arom-border bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash">
            {t('បោះបង់', 'Cancel')}
          </button>
          {!published && (
            <button type="button" onClick={saveDraft} className="rounded-full border border-arom bg-white px-4 py-2 text-sm font-semibold text-arom hover:bg-arom-wash">
              {t('រក្សាទុកសេចក្តីព្រាង', 'Save draft')}
            </button>
          )}
          <button type="button" onClick={goLive} className="rounded-full bg-arom px-5 py-2 text-sm font-semibold text-white hover:bg-arom-deep">
            {published ? t('រក្សាទុកការផ្លាស់ប្តូរ', 'Save changes') : t('ផ្សព្វផ្សាយលើប្រវត្តិរូប', 'Publish on my profile')}
          </button>
        </div>
      </div>
    </>
  );
}

export function ProPodcastsView() {
  const { profile } = usePro();
  const { episodes } = useProPodcasts();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [editing, setEditing] = useState<ProEpisode | null>(null);
  const mine = episodes
    .filter((item) => item.professionalId === profile.slug)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const stamp = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Phnom_Penh' });
  const statusLabel = (status: EpisodeStatus) =>
    status === 'published' ? t('បង្ហាញលើប្រវត្តិរូប', 'On your profile') : status === 'hidden' ? t('បានលាក់', 'Hidden') : t('សេចក្តីព្រាង', 'Draft');

  if (editing) return <EpisodeEditor key={editing.id} episode={editing} onClose={() => setEditing(null)} />;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t('ផតខាសរបស់ខ្ញុំ', 'My podcasts')}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-muted">
            {t(
              'ភាគខ្លីៗនៅលើប្រវត្តិរូបសាធារណៈរបស់អ្នក ដើម្បីឱ្យមនុស្សបានឮសំឡេងអ្នកមុនពេលកក់។ ខុសពីផតខាស MindGuide ដែលក្រុម AROM ធ្វើ។',
              'Short episodes on your public profile, so people can hear you before they book. Separate from MindGuide podcasts, which the AROM team makes.',
            )}
          </p>
        </div>
        <button
          type="button"
          disabled={mine.length >= MAX_EPISODES}
          onClick={() => setEditing(emptyEpisode(profile.slug))}
          className="flex items-center gap-2 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-40">
          <Plus size={16} aria-hidden="true" />
          {t('ភាគថ្មី', 'New episode')}
        </button>
      </div>

      {mine.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-arom-border bg-white p-10 text-center">
          <Headphones size={30} aria-hidden="true" className="mx-auto text-ink-muted" />
          <p className="mt-3 font-medium text-ink">{t('មិនទាន់មានភាគទេ', 'No episodes yet')}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {t('ចាប់ផ្តើមដោយការណែនាំខ្លួនខ្លីៗ ៣ ទៅ ៥ នាទី: អ្នកជានរណា និងវគ្គដំបូងមានលក្ខណៈដូចម្តេច។', 'Start with a short 3 to 5 minute introduction: who you are and what a first session is like.')}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {mine.map((episode) => (
            <li key={episode.id} className="rounded-3xl border border-arom-border bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-arom-wash text-arom">
                  <Headphones size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{(km ? episode.kmTitle : episode.title) || t('គ្មានចំណងជើង', 'Untitled')}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[episode.status]}`}>{statusLabel(episode.status)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {[km ? episode.kmEpisodeNumber : episode.episodeNumber, episode.durationSeconds ? episode.duration : '', `${t('កែចុងក្រោយ', 'Updated')} ${stamp.format(new Date(episode.updatedAt))}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {(km ? episode.kmSubtitle : episode.subtitle) && <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{km ? episode.kmSubtitle : episode.subtitle}</p>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-arom-border pt-4">
                <button type="button" onClick={() => setEditing(episode)} className="flex items-center gap-1.5 rounded-full border border-arom-border px-3.5 py-1.5 text-sm font-medium text-arom hover:bg-arom-wash">
                  <Pencil size={14} aria-hidden="true" />
                  {t('កែសម្រួល', 'Edit')}
                </button>
                {episode.status === 'published' && (
                  <>
                    <Link href={`/professional/${profile.slug}/podcast?episode=${episode.id}`} className="flex items-center gap-1.5 rounded-full border border-arom-border px-3.5 py-1.5 text-sm font-medium text-arom hover:bg-arom-wash">
                      <Eye size={14} aria-hidden="true" />
                      {t('មើលដូចអ្នកប្រើ', 'View as a user')}
                    </Link>
                    <button type="button" onClick={() => setEpisodeStatus(episode.id, 'hidden')} className="flex items-center gap-1.5 rounded-full border border-arom-border px-3.5 py-1.5 text-sm font-medium text-ink hover:bg-arom-wash">
                      <EyeOff size={14} aria-hidden="true" />
                      {t('លាក់ពីប្រវត្តិរូប', 'Hide from profile')}
                    </button>
                  </>
                )}
                {episode.status === 'hidden' && (
                  <button type="button" onClick={() => setEpisodeStatus(episode.id, 'published')} className="flex items-center gap-1.5 rounded-full border border-arom-border px-3.5 py-1.5 text-sm font-medium text-arom hover:bg-arom-wash">
                    <Eye size={14} aria-hidden="true" />
                    {t('បង្ហាញម្តងទៀត', 'Show again')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t('លុបភាគនេះជាអចិន្ត្រៃយ៍?', 'Delete this episode for good?'))) deleteEpisode(episode.id);
                  }}
                  className="ml-auto flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-arom-danger hover:bg-arom-danger-soft">
                  <Trash2 size={14} aria-hidden="true" />
                  {t('លុប', 'Delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
