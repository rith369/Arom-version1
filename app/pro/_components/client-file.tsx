'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Archive, ArchiveRestore, ArrowLeft, CalendarCheck, FileText, Lock, MessageCircle, Monitor, NotebookPen, Pin, Search, Share2, UserRound } from 'lucide-react';

import { BookingDialog } from './bookings-view';
import { CarePlanCard } from './care-plan-card';
import { SuggestSessionDialog } from './suggest-session-dialog';
import { usePro, useSharedByClient } from './pro-provider';
import { useLanguage } from '../../_components/language-provider';
import { MAX_NOTE, type ProBooking } from '../_data/bookings';
import {
  FREQUENCY_LABELS,
  LEVEL_LABELS,
  PRIOR_SUPPORT_LABELS,
  SYMPTOM_TYPE_LABELS,
  clientsFrom,
  sharingFor,
  type SymptomLevel,
} from '../_data/clients';

const TIME_ZONE = 'Asia/Phnom_Penh';
const endOf = (booking: ProBooking) => Date.parse(booking.startsAt) + booking.durationMinutes * 60_000;

const levelStyles: Record<SymptomLevel, string> = {
  none: 'bg-arom-wash text-ink-muted',
  low: 'bg-arom-soft text-arom-deep',
  medium: 'bg-arom-warning-soft text-arom-warning',
  high: 'bg-arom-danger-soft text-arom-danger',
};

function Card({ title, icon: Icon, hint, children }: { title: string; icon: typeof Pin; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <Icon size={18} aria-hidden="true" className="text-arom" />
        {title}
      </h2>
      {hint && <p className="mt-1 text-xs leading-5 text-ink-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ClientFile({ clientId }: { clientId: string }) {
  const { bookings, sessionNotes, summaryNotes, saveSummaryNote, archivedClients, setClientArchived } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const locale = km ? 'km-KH' : 'en-GB';

  const [now] = useState(() => Date.now());
  const [summary, setSummary] = useState(summaryNotes[clientId]?.text ?? '');
  const [summaryStatus, setSummaryStatus] = useState('');
  const [noteSearch, setNoteSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);

  const client = clientsFrom(bookings, now).find((item) => item.id === clientId);
  const sessions = bookings
    .filter((item) => item.clientId === clientId)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const archived = archivedClients.includes(clientId);
  const sharing = sharingFor(bookings, clientId);
  const shared = useSharedByClient(clientId, sharing.survey || sharing.symptomChecks);
  const latestIntake = [...sessions].sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
  const openBooking = sessions.find((item) => item.id === openId) ?? null;
  const savedSummary = summaryNotes[clientId];
  const latestEnded = sessions.find((item) => item.status !== 'cancelled' && endOf(item) <= now);

  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: TIME_ZONE });
  const dayTime = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE });
  const stamp = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE });

  if (!client) {
    return (
      <div className="rounded-3xl border border-arom-border bg-white p-10 text-center">
        <p className="font-medium text-ink">{t('រកមិនឃើញអតិថិជននេះទេ', 'This client was not found')}</p>
        <p className="mt-1 text-sm text-ink-muted">{t('អ្នកអាចមើលបានតែមនុស្សដែលបានកក់ជាមួយអ្នកប៉ុណ្ណោះ។', 'You can only see people who booked with you.')}</p>
        <Link href="/pro/clients" className="mt-4 inline-block text-sm font-semibold text-arom underline">
          {t('ត្រឡប់ទៅអតិថិជនរបស់ខ្ញុំ', 'Back to My clients')}
        </Link>
      </div>
    );
  }

  const search = noteSearch.trim().toLocaleLowerCase();
  const visibleSessions = search
    ? sessions.filter((item) => (sessionNotes[item.id]?.text ?? '').toLocaleLowerCase().includes(search))
    : sessions;

  const statusLabel = (booking: ProBooking) => {
    if (booking.status === 'booked' && endOf(booking) > now) return { label: t('បានកក់', 'Booked'), style: 'bg-arom-soft text-arom' };
    if (booking.status === 'booked') return { label: t('ត្រូវកត់លទ្ធផល', 'Add outcome'), style: 'bg-arom-warning-soft text-arom-warning' };
    if (booking.status === 'completed') return { label: t('បានបញ្ចប់', 'Completed'), style: 'bg-arom-wash text-ink-muted' };
    if (booking.status === 'no_show') return { label: t('មិនបានមក', 'Did not come'), style: 'bg-gray-100 text-gray-600' };
    return { label: t('បានបោះបង់', 'Cancelled'), style: 'bg-arom-danger-soft text-arom-danger' };
  };

  return (
    <>
      <Link href="/pro/clients" className="inline-flex items-center gap-2 text-sm font-semibold text-arom hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        {t('អតិថិជនរបស់ខ្ញុំ', 'My clients')}
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {client.name}
            {archived && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{t('អតិថិជនចាស់', 'Past client')}</span>}
          </h1>
          <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
            <div>
              <dt className="inline">{t('អតិថិជនតាំងពី', 'Client since')} </dt>
              <dd className="inline font-medium text-ink">{day.format(new Date(client.firstSessionAt))}</dd>
            </div>
            <div>
              <dt className="inline">{t('វគ្គបានបញ្ចប់', 'Sessions completed')} </dt>
              <dd className="inline font-medium text-ink">{client.completedSessions}</dd>
            </div>
            <div>
              <dt className="inline">{t('វគ្គបន្ទាប់', 'Next session')} </dt>
              <dd className="inline font-medium text-ink">{client.nextSessionAt ? dayTime.format(new Date(client.nextSessionAt)) : t('មិនទាន់កក់', 'None booked')}</dd>
            </div>
            <div>
              <dt className="inline">{t('ភាសា', 'Language')} </dt>
              <dd className="inline font-medium text-ink">{client.preferredLanguage === 'km' ? t('ខ្មែរ', 'Khmer') : t('អង់គ្លេស', 'English')}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
        <Link
          href={`/pro/messages/${clientId}`}
          className="flex items-center gap-2 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep">
          <MessageCircle size={16} aria-hidden="true" />
          {t('ផ្ញើសារ', 'Message')}
        </Link>
        {!archived && (
          <button
            type="button"
            onClick={() => setSuggesting(true)}
            className="flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-2 text-sm font-medium text-arom hover:bg-arom-wash">
            <CalendarCheck size={16} aria-hidden="true" />
            {t('ណែនាំវគ្គ', 'Suggest a session')}
          </button>
        )}
        <button
          type="button"
          onClick={() => setClientArchived(clientId, !archived)}
          className="flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash">
          {archived ? <ArchiveRestore size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}
          {archived ? t('ស្ដារជាអតិថិជនសកម្ម', 'Restore client') : t('ដាក់ជាអតិថិជនចាស់', 'Archive client')}
        </button>
        </div>
      </header>
      {!archived && (
        <p className="mt-2 text-xs text-ink-muted">
          {t('ដាក់ជាអតិថិជនចាស់ នៅពេលការពិគ្រោះបានបញ្ចប់។ កំណត់ចំណាំទាំងអស់ត្រូវបានរក្សាទុក។', 'Archive when therapy has ended. All notes are kept.')}
        </p>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-5">
          <Card
            title={t('កំណត់ចំណាំសង្ខេប', 'Summary note')}
            icon={Pin}
            hint={t(
              'កំណត់ចំណាំមួយដែលអ្នកធ្វើបច្ចុប្បន្នភាពតាមពេលវេលា: កង្វល់សំខាន់ គោលដៅ អ្វីដែលជួយ និងអ្វីដែលត្រូវចាំ។ មានតែអ្នកទេដែលមើលឃើញ។',
              'One note you keep up to date: main concerns, goals, what helps and things to remember. Only you can see it.',
            )}>
            <textarea
              value={summary}
              onChange={(event) => {
                setSummary(event.target.value);
                setSummaryStatus('');
              }}
              rows={6}
              maxLength={MAX_NOTE}
              placeholder={t('ឧ. ចូលចិត្តនិយាយភាសាខ្មែរ។ គោលដៅ: គេងបានល្អជាងមុន។', 'For example: prefers Khmer. Goal: sleep better. Breathing exercises help.')}
              className="w-full rounded-xl border border-arom/30 bg-arom-wash/60 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-arom focus:bg-white focus:ring-4 focus:ring-arom/10"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={summary === (savedSummary?.text ?? '')}
                onClick={async () => {
                  const result = await saveSummaryNote(clientId, summary);
                  setSummaryStatus(result.ok ? t('បានរក្សាទុក។', 'Saved.') : t('មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។', 'This could not be saved. Please try again.'));
                }}
                className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-40">
                {t('រក្សាទុក', 'Save summary')}
              </button>
              <span role="status" aria-live="polite" className="flex items-center gap-1.5 text-xs text-ink-muted">
                <Lock size={12} aria-hidden="true" />
                {summaryStatus || (savedSummary ? `${t('បានរក្សាទុក', 'Last saved')} ${stamp.format(new Date(savedSummary.updatedAt))}` : t('ឯកជន', 'Private'))}
              </span>
            </div>
          </Card>

          <CarePlanCard clientId={clientId} clientName={client.name} archived={archived} latestSessionId={latestEnded?.id ?? null} />

          <Card title={t('ប្រវត្តិការពិគ្រោះ និងកំណត់ចំណាំ', 'Sessions and notes')} icon={NotebookPen}>
            <div className="relative">
              <Search size={16} aria-hidden="true" className="absolute left-3 top-2.5 text-ink-muted" />
              <input
                type="search"
                value={noteSearch}
                onChange={(event) => setNoteSearch(event.target.value)}
                aria-label={t('ស្វែងរកក្នុងកំណត់ចំណាំ', 'Search notes')}
                placeholder={t('ស្វែងរកក្នុងកំណត់ចំណាំ...', 'Search in notes...')}
                className="w-full rounded-xl border border-arom-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
              />
            </div>
            {visibleSessions.length === 0 ? (
              <p className="mt-4 text-sm text-ink-muted">{t('រកមិនឃើញកំណត់ចំណាំ។', 'No notes match.')}</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {visibleSessions.map((session) => {
                  const chip = statusLabel(session);
                  const note = sessionNotes[session.id];
                  return (
                    <li key={session.id} className="rounded-2xl border border-arom-border p-4">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="text-sm font-semibold text-ink">{dayTime.format(new Date(session.startsAt))}</span>
                        <span className="flex items-center gap-1 text-xs text-ink-muted">
                          {session.sessionType === 'online' ? <Monitor size={13} aria-hidden="true" /> : <UserRound size={13} aria-hidden="true" />}
                          {session.sessionType === 'online' ? t('អនឡាញ', 'Online') : t('ជួបផ្ទាល់', 'In person')}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${chip.style}`}>{chip.label}</span>
                        <button type="button" onClick={() => setOpenId(session.id)} className="ml-auto text-xs font-semibold text-arom hover:underline">
                          {note || (session.status === 'booked' && endOf(session) > now) || session.status === 'cancelled'
                            ? t('បើក', 'Open')
                            : t('សរសេរកំណត់ចំណាំ', 'Write a note')}
                        </button>
                      </div>
                      {note?.text ? (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink">{note.text}</p>
                      ) : (
                        <p className="mt-2 text-xs text-ink-muted">{t('គ្មានកំណត់ចំណាំសម្រាប់វគ្គនេះ។', 'No note for this session.')}</p>
                      )}
                      {session.status === 'cancelled' && session.cancelReason && (
                        <p className="mt-1 text-xs text-ink-muted">{session.cancelReason}</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card
            title={t('អតិថិជនបានចែករំលែក', 'Shared by the client')}
            icon={Share2}
            hint={t(
              'មានតែអ្វីដែលអតិថិជនបានជ្រើសរើសចែករំលែកសម្រាប់ការពិគ្រោះជាមួយអ្នក។ ពួកគេអាចបិទវាគ្រប់ពេល។ មិនមែនជាការធ្វើរោគវិនិច្ឆ័យទេ។',
              'Only what the client chose to share for their sessions with you. They can turn it off at any time. Not a diagnosis.',
            )}>
            {!sharing.survey && !sharing.symptomChecks ? (
              <p className="rounded-2xl bg-arom-wash/70 p-3.5 text-sm text-ink-muted">
                {t('អតិថិជននេះមិនបានចែករំលែកអ្វីទេ។ នេះជាជម្រើសរបស់ពួកគេ។', 'This client has not shared anything. That is their choice.')}
              </p>
            ) : (
              <div className="space-y-5">
                {sharing.symptomChecks && shared.symptomChecks && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('ការពិនិត្យរោគសញ្ញា', 'Symptom checks')}</h3>
                    <ul className="mt-2 space-y-2">
                      {[...shared.symptomChecks]
                        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                        .map((check) => (
                          <li key={check.createdAt} className="flex items-center gap-3 text-sm">
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium text-ink">{km ? SYMPTOM_TYPE_LABELS[check.type].km : SYMPTOM_TYPE_LABELS[check.type].en}</span>
                              <span className="block text-xs text-ink-muted">
                                {day.format(new Date(check.createdAt))} · {check.score}/{check.maxScore}
                              </span>
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelStyles[check.level]}`}>
                              {km ? LEVEL_LABELS[check.level].km : LEVEL_LABELS[check.level].en}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {sharing.survey && shared.survey && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('ការស្ទង់មតិពេលចូលរួម', 'Welcome survey')}</h3>
                    <dl className="mt-2 space-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-ink-muted">{t('អារម្មណ៍', 'Feelings')}</dt>
                        <dd className="text-ink">{shared.survey.feelings.join(', ')}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-muted">{t('ញឹកញាប់ប៉ុណ្ណា', 'How often')}</dt>
                        <dd className="text-ink">{km ? FREQUENCY_LABELS[shared.survey.frequency].km : FREQUENCY_LABELS[shared.survey.frequency].en}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-muted">{t('ផលប៉ះពាល់លើជីវិតប្រចាំថ្ងៃ', 'Effect on daily life')}</dt>
                        <dd className="text-ink">{shared.survey.impact} / 5</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-muted">{t('បញ្ហាប្រឈម', 'Challenges')}</dt>
                        <dd className="text-ink">{shared.survey.challenges.join(', ')}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-muted">{t('ជំនួយពីមុន', 'Support before')}</dt>
                        <dd className="text-ink">{km ? PRIOR_SUPPORT_LABELS[shared.survey.priorSupport].km : PRIOR_SUPPORT_LABELS[shared.survey.priorSupport].en}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-muted">{t('គោលដៅ', 'Goals')}</dt>
                        <dd className="text-ink">{shared.survey.goals.join(', ')}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            )}
          </Card>

          {latestIntake && (
            <Card title={t('ចម្លើយចុងក្រោយពេលកក់', 'Latest intake answers')} icon={FileText}>
              <p className="text-xs text-ink-muted">{day.format(new Date(latestIntake.startsAt))}</p>
              {latestIntake.intakeNote && <p className="mt-2 rounded-2xl bg-arom-wash/70 p-3 text-sm text-ink">&ldquo;{latestIntake.intakeNote}&rdquo;</p>}
              <dl className="mt-3 space-y-2.5">
                {latestIntake.intakeAnswers.map((item) => (
                  <div key={item.question.en}>
                    <dt className="text-xs text-ink-muted">{km ? item.question.km : item.question.en}</dt>
                    <dd className="text-sm text-ink">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}
        </aside>
      </div>

      {suggesting && (
        <SuggestSessionDialog
          clientId={clientId}
          clientName={client.name}
          defaultType={sessions[0]?.sessionType ?? 'online'}
          onClose={() => setSuggesting(false)}
        />
      )}

      {openBooking && (
        <BookingDialog key={openBooking.id} booking={openBooking} now={now} showClientLink={false} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
