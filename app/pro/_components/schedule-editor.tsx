'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { CalendarOff, Copy, Plus, Save, Trash2, Undo2 } from 'lucide-react';

import { usePro } from './pro-provider';
import { useLanguage } from '../../_components/language-provider';
import { useUnsavedChangesGuard } from '../../_components/unsaved-changes-guard';
import type { SessionType } from '../_data/profile';
import {
  addDays,
  cambodiaDate,
  checkDay,
  isMeetingUrl,
  openSlots,
  WEEKDAYS,
  type DayHours,
  type Schedule,
  type TimeRange,
  type Weekday,
} from '../_data/schedule';

const inputClass =
  'mt-1 w-full rounded-xl border border-arom/30 bg-arom-wash/60 px-3 py-2 text-sm text-ink outline-none focus:border-arom focus:bg-white focus:ring-4 focus:ring-arom/10';

function Section({ title, hint, children, id }: { title: string; hint?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-base font-bold text-ink sm:text-lg">{title}</h2>
      {hint && <p className="mt-1 text-sm leading-6 text-ink-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// The database stores the schedule as jsonb, which reorders object keys, so
// compare with sorted keys. Otherwise a saved schedule still looks changed.
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

const sameSchedule = (a: Schedule, b: Schedule) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

export function ScheduleEditor() {
  const { schedule, saveSchedule, profile, bookings } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [draft, setDraft] = useState<Schedule>(schedule);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [now] = useState(() => Date.now());
  const [offFrom, setOffFrom] = useState('');
  const [offTo, setOffTo] = useState('');
  const [offNote, setOffNote] = useState('');

  const isDirty = !sameSchedule(draft, schedule);
  const offered = profile.sessionTypes;
  const problems = draft.week.flatMap((day) => checkDay(day, draft.sessionMinutes, offered));
  const today = cambodiaDate(now);

  // What users would see: the next 7 days, minus sessions already booked.
  const booked = bookings.filter((item) => item.status !== 'cancelled');
  const preview = openSlots(draft, { fromDate: today, days: 7, now, booked });
  const weekSlots = openSlots(draft, { fromDate: today, days: 7, now, booked: [] }).length;

  const leaveGuard = useUnsavedChangesGuard(isDirty, km);

  function update(next: Partial<Schedule>) {
    setDraft((current) => ({ ...current, ...next }));
    setNotice(null);
  }

  function updateDay(day: Weekday, change: (current: DayHours) => DayHours) {
    update({ week: draft.week.map((item) => (item.day === day ? change(item) : item)) });
  }

  function updateRange(day: Weekday, id: string, change: Partial<TimeRange>) {
    updateDay(day, (current) => ({
      ...current,
      ranges: current.ranges.map((item) => (item.id === id ? { ...item, ...change } : item)),
    }));
  }

  function addRange(day: Weekday) {
    updateDay(day, (current) => {
      const last = current.ranges.at(-1);
      const start = last ? last.end : '09:00';
      const startHour = Number(start.slice(0, 2));
      const end = `${String(Math.min(startHour + 3, 22)).padStart(2, '0')}:00`;
      return {
        ...current,
        enabled: true,
        ranges: [...current.ranges, { id: crypto.randomUUID(), start, end, sessionTypes: [...offered] }],
      };
    });
  }

  function copyMondayToWeekdays() {
    const monday = draft.week.find((item) => item.day === 1);
    if (!monday) return;
    update({
      week: draft.week.map((item) =>
        item.day >= 2 && item.day <= 5
          ? { ...item, enabled: monday.enabled, ranges: monday.ranges.map((entry) => ({ ...entry, id: crypto.randomUUID() })) }
          : item,
      ),
    });
    setNotice({ tone: 'ok', text: t('បានចម្លងម៉ោងថ្ងៃច័ន្ទទៅថ្ងៃអង្គារ ដល់ថ្ងៃសុក្រ។ កុំភ្លេចរក្សាទុក។', "Monday's hours copied to Tuesday to Friday. Remember to save.") });
  }

  function addTimeOff() {
    if (!offFrom) {
      setNotice({ tone: 'error', text: t('សូមជ្រើសរើសថ្ងៃចាប់ផ្តើម។', 'Choose the first day off.') });
      return;
    }
    if (offTo && offTo < offFrom) {
      setNotice({ tone: 'error', text: t('ថ្ងៃចុងក្រោយត្រូវនៅក្រោយថ្ងៃដំបូង។', 'The last day must be after the first day.') });
      return;
    }
    update({
      timeOff: [...draft.timeOff, { id: crypto.randomUUID(), from: offFrom, to: offTo || offFrom, note: offNote.trim() }].sort((a, b) =>
        a.from.localeCompare(b.from),
      ),
    });
    setOffFrom('');
    setOffTo('');
    setOffNote('');
  }

  async function save() {
    if (saving) return;
    if (problems.length > 0) {
      setNotice({ tone: 'error', text: t('សូមកែម៉ោងដែលមានសញ្ញាក្រហមជាមុនសិន។', 'Fix the times marked in red first.') });
      document.getElementById(`range-${problems[0].rangeId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (draft.meetingUrl.trim() && !isMeetingUrl(draft.meetingUrl)) {
      setNotice({ tone: 'error', text: t('តំណប្រជុំត្រូវតែចាប់ផ្តើមដោយ https://', 'The meeting link must start with https://') });
      document.getElementById('meeting-link')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSaving(true);
    const result = await saveSchedule({ ...draft, meetingUrl: draft.meetingUrl.trim() });
    setSaving(false);
    setNotice(
      result.ok
        ? { tone: 'ok', text: t('បានរក្សាទុកកាលវិភាគ។ ម៉ោងទំនេរត្រូវបានធ្វើបច្ចុប្បន្នភាព។', 'Schedule saved. Your open times are updated.') }
        : { tone: 'error', text: result.message },
    );
  }

  const dateLabel = (date: string) =>
    new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));

  const chip = (selected: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
      selected ? 'border-arom bg-arom text-white' : 'border-arom-border bg-white text-ink hover:border-arom/50'
    }`;

  const typeLabel = (type: SessionType) => (type === 'online' ? t('អនឡាញ', 'Online') : t('ជួបផ្ទាល់', 'In person'));

  return (
    <>
      {leaveGuard}
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t('កាលវិភាគរបស់ខ្ញុំ', 'My schedule')}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t('ម៉ោងដែលអ្នកប្រើអាចកក់ការពិគ្រោះជាមួយអ្នក ម៉ោងកម្ពុជា។ ការកក់គឺភ្លាមៗ ដូច្នេះសូមបើកតែម៉ោងដែលអ្នកទំនេរពិតប្រាកដ។', 'The times people can book a session with you, in Cambodia time. Booking is instant, so only open times you are really free.')}
      </p>

      <div className="sticky top-0 z-10 mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-arom-border bg-white/95 p-3 shadow-sm backdrop-blur">
        <span className="text-sm text-ink-muted">
          {t(`${weekSlots} ម៉ោងបើកក្នុង ៧ ថ្ងៃខាងមុខ`, `${weekSlots} open time${weekSlots === 1 ? '' : 's'} in the next 7 days`)}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {isDirty && <span className="text-xs font-medium text-arom-warning">{t('មិនទាន់រក្សាទុក', 'Unsaved changes')}</span>}
          <button
            type="button"
            onClick={() => {
              setDraft(schedule);
              setNotice(null);
            }}
            disabled={!isDirty}
            className="flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm text-ink-muted hover:bg-arom-wash disabled:opacity-40">
            <Undo2 size={15} aria-hidden="true" />
            {t('មិនធ្វើវិញ', 'Undo')}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!isDirty || saving}
            className="flex items-center gap-1.5 rounded-full bg-arom px-5 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-40">
            <Save size={15} aria-hidden="true" />
            {saving ? t('កំពុងរក្សាទុក...', 'Saving...') : t('រក្សាទុក', 'Save schedule')}
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className={`mt-3 min-h-5 text-sm ${notice?.tone === 'error' ? 'text-arom-danger' : 'text-arom'}`}>
        {notice?.text}
      </p>

      {offered.length === 0 && (
        <p className="mt-2 rounded-2xl bg-arom-warning-soft p-4 text-sm text-arom-warning">
          {t('សូមជ្រើសរើសអនឡាញ ឬជួបផ្ទាល់ក្នុង ', 'Choose online or in person in ')}
          <Link href="/pro/profile#pro-sessions" className="font-semibold underline">
            {t('ប្រវត្តិរូបរបស់ខ្ញុំ', 'My profile')}
          </Link>
          {t(' ជាមុនសិន ដើម្បីឱ្យអ្នកអាចបើកម៉ោងបាន។', ' first, so you can open times.')}
        </p>
      )}

      <div className="mt-2 grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <Section title={t('ម៉ោងប្រចាំសប្តាហ៍', 'Weekly hours')} hint={t('បើកថ្ងៃមួយ ហើយបន្ថែមម៉ោងមួយ ឬច្រើន។', 'Turn a day on and add one or more blocks of time.')}>
            <button
              type="button"
              onClick={copyMondayToWeekdays}
              className="mb-4 flex items-center gap-1.5 rounded-full border border-arom-border px-3.5 py-1.5 text-xs font-medium text-arom hover:bg-arom-wash">
              <Copy size={14} aria-hidden="true" />
              {t('ចម្លងថ្ងៃច័ន្ទទៅថ្ងៃអង្គារ ដល់ថ្ងៃសុក្រ', 'Copy Monday to Tuesday to Friday')}
            </button>

            <ul className="divide-y divide-arom-border">
              {WEEKDAYS.map(({ day, en, km: kmDay }) => {
                const hours = draft.week.find((item) => item.day === day)!;
                const dayProblems = problems.filter((problem) => hours.ranges.some((range) => range.id === problem.rangeId));

                return (
                  <li key={day} className="py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={hours.enabled}
                        aria-label={km ? kmDay : en}
                        onClick={() =>
                          hours.enabled || hours.ranges.length > 0
                            ? updateDay(day, (current) => ({ ...current, enabled: !current.enabled }))
                            : addRange(day)
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${hours.enabled ? 'bg-arom' : 'bg-gray-300'}`}>
                        <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${hours.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                      <span className="w-28 text-sm font-semibold text-ink">{km ? kmDay : en}</span>
                      {!hours.enabled && <span className="text-sm text-ink-muted">{t('មិនទំនេរ', 'Not available')}</span>}
                    </div>

                    {hours.enabled && (
                      <div className="mt-3 space-y-3 sm:pl-14">
                        {hours.ranges.map((range) => {
                          const rangeProblems = dayProblems.filter((problem) => problem.rangeId === range.id);
                          return (
                            <div
                              key={range.id}
                              id={`range-${range.id}`}
                              className={`relative rounded-2xl border p-3 pr-12 ${rangeProblems.length ? 'border-arom-danger/40 bg-arom-danger-soft/40' : 'border-arom-border'}`}>
                              <div className="flex flex-wrap items-end gap-3">
                                <label className="text-xs font-medium text-ink-muted">
                                  {t('ពី', 'From')}
                                  <input type="time" step={900} value={range.start} onChange={(event) => updateRange(day, range.id, { start: event.target.value })} className={inputClass} />
                                </label>
                                <label className="text-xs font-medium text-ink-muted">
                                  {t('ដល់', 'To')}
                                  <input type="time" step={900} value={range.end} onChange={(event) => updateRange(day, range.id, { end: event.target.value })} className={inputClass} />
                                </label>
                                <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('ប្រភេទការពិគ្រោះ', 'Session type')}>
                                  {(['online', 'in_person'] as SessionType[]).map((type) => (
                                    <button
                                      key={type}
                                      type="button"
                                      aria-pressed={range.sessionTypes.includes(type)}
                                      disabled={!offered.includes(type)}
                                      onClick={() =>
                                        updateRange(day, range.id, {
                                          sessionTypes: range.sessionTypes.includes(type)
                                            ? range.sessionTypes.filter((item) => item !== type)
                                            : [...range.sessionTypes, type],
                                        })
                                      }
                                      className={`${chip(range.sessionTypes.includes(type))} disabled:cursor-not-allowed disabled:opacity-40`}>
                                      {typeLabel(type)}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => updateDay(day, (current) => ({ ...current, ranges: current.ranges.filter((item) => item.id !== range.id) }))}
                                  aria-label={t('លុបម៉ោងនេះ', 'Remove these hours')}
                                  className="absolute right-3 top-3 rounded-lg border border-arom-border p-2 text-arom-danger hover:bg-arom-danger-soft">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                              {rangeProblems.map((problem) => (
                                <p key={problem.message.en} role="alert" className="mt-2 text-xs font-medium text-arom-danger">
                                  {km ? problem.message.km : problem.message.en}
                                </p>
                              ))}
                            </div>
                          );
                        })}
                        <button type="button" onClick={() => addRange(day)} className="flex items-center gap-1.5 text-sm font-medium text-arom hover:underline">
                          <Plus size={15} aria-hidden="true" />
                          {t('បន្ថែមម៉ោង', 'Add hours')}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title={t('ការកំណត់ការពិគ្រោះ', 'Session settings')}>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { key: 'sessionMinutes' as const, label: t('រយៈពេលមួយវគ្គ', 'Session length'), options: [45, 60, 90], format: (value: number) => t(`${value} នាទី`, `${value} min`) },
                { key: 'breakMinutes' as const, label: t('សម្រាករវាងវគ្គ', 'Break between sessions'), options: [0, 10, 15], format: (value: number) => (value === 0 ? t('គ្មាន', 'None') : t(`${value} នាទី`, `${value} min`)) },
                { key: 'bookingWindowWeeks' as const, label: t('អ្នកប្រើអាចកក់ទុកមុនបាន', 'People can book up to'), options: [2, 4, 8], format: (value: number) => t(`${value} សប្តាហ៍`, `${value} weeks ahead`) },
                { key: 'minNoticeHours' as const, label: t('ការកក់យ៉ាងហោចណាស់', 'Bookings need at least'), options: [2, 12, 24], format: (value: number) => t(`${value} ម៉ោងមុន`, `${value} hours notice`) },
              ].map((setting) => (
                <fieldset key={setting.key}>
                  <legend className="text-sm font-medium text-ink">{setting.label}</legend>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {setting.options.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={draft[setting.key] === value}
                        onClick={() => update({ [setting.key]: value } as Partial<Schedule>)}
                        className={chip(draft[setting.key] === value)}>
                        {setting.format(value)}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </Section>

          {offered.includes('online') && (
            <Section
              id="meeting-link"
              title={t('តំណប្រជុំសម្រាប់វគ្គអនឡាញ', 'Meeting link for online sessions')}
              hint={t(
                'បន្ទប់ប្រជុំផ្ទាល់ខ្លួនរបស់អ្នក (Google Meet, Zoom ឬ Jitsi)។ វាត្រូវបានបន្ថែមទៅវគ្គអនឡាញនីមួយៗ ហើយអតិថិជនចុច "ចូលរួមវគ្គ" ១០ នាទីមុនម៉ោងចាប់ផ្តើម។ អ្នកអាចប្តូរវាសម្រាប់វគ្គមួយៗក្នុងការកក់របស់ខ្ញុំ។',
                'Your own meeting room (Google Meet, Zoom or Jitsi). It is added to each online session, and the client taps "Join session" 10 minutes before the start. You can change it for one session in My bookings.',
              )}>
              <input
                type="url"
                value={draft.meetingUrl}
                onChange={(event) => update({ meetingUrl: event.target.value })}
                placeholder="https://meet.google.com/..."
                aria-label={t('តំណប្រជុំ', 'Meeting link')}
                className="w-full rounded-xl border border-arom-border px-3.5 py-2.5 text-sm outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
              />
              <p className="mt-2 text-xs leading-5 text-ink-muted">
                {t(
                  'ពេលអ្នកប្តូរតំណនេះ វគ្គអនឡាញខាងមុខដែលប្រើតំណចាស់នឹងប្រើតំណថ្មី។ កុំប្រើតំណដែលអ្នកដទៃក៏ប្រើដែរ។',
                  'When you change it, upcoming online sessions that used the old link move to the new one. Use a room only you control.',
                )}
              </p>
            </Section>
          )}

          <Section title={t('ថ្ងៃឈប់សម្រាក', 'Time off')} hint={t('ថ្ងៃដែលអ្នកមិនទំនេរ ដូចជាថ្ងៃបុណ្យ ឬការធ្វើដំណើរ។ ការណាត់ជួបដែលមានស្រាប់មិនត្រូវបានលុបទេ។', 'Days you are away, such as holidays or trips. Sessions already booked are not removed.')}>
            {draft.timeOff.length > 0 && (
              <ul className="mb-4 space-y-2">
                {draft.timeOff.map((off) => (
                  <li key={off.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-arom-wash/70 px-4 py-2.5 text-sm">
                    <CalendarOff size={16} aria-hidden="true" className="text-arom" />
                    <span className="font-medium text-ink">
                      {dateLabel(off.from)}
                      {off.to !== off.from && ` ${t('ដល់', 'to')} ${dateLabel(off.to)}`}
                    </span>
                    {off.note && <span className="text-ink-muted">{off.note}</span>}
                    <button
                      type="button"
                      onClick={() => update({ timeOff: draft.timeOff.filter((item) => item.id !== off.id) })}
                      aria-label={t('លុបថ្ងៃឈប់នេះ', 'Remove this time off')}
                      className="ml-auto rounded-lg p-1.5 text-arom-danger hover:bg-arom-danger-soft">
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-medium text-ink-muted">
                {t('ពីថ្ងៃ', 'From')}
                <input type="date" min={today} value={offFrom} onChange={(event) => setOffFrom(event.target.value)} className={inputClass} />
              </label>
              <label className="text-xs font-medium text-ink-muted">
                {t('ដល់ថ្ងៃ (ស្រេចចិត្ត)', 'To (optional)')}
                <input type="date" min={offFrom || today} value={offTo} onChange={(event) => setOffTo(event.target.value)} className={inputClass} />
              </label>
              <label className="min-w-40 flex-1 text-xs font-medium text-ink-muted">
                {t('កំណត់ចំណាំ (ស្រេចចិត្ត)', 'Note (optional)')}
                <input value={offNote} maxLength={80} placeholder={t('ឧ. ពិធីបុណ្យភ្ជុំបិណ្ឌ', 'For example, Pchum Ben')} onChange={(event) => setOffNote(event.target.value)} className={inputClass} />
              </label>
              <button type="button" onClick={addTimeOff} className="flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-arom hover:bg-arom-wash">
                <Plus size={15} aria-hidden="true" />
                {t('បន្ថែម', 'Add')}
              </button>
            </div>
          </Section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-ink">{t('អ្វីដែលអ្នកប្រើនឹងឃើញ', 'What people will see')}</h2>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              {t('ម៉ោងទំនេរក្នុង ៧ ថ្ងៃខាងមុខ ដោយប្រើការកែរបស់អ្នក។ ម៉ោងដែលបានកក់រួចមិនបង្ហាញទេ។', 'Open times for the next 7 days, using your edits. Times already booked are left out.')}
            </p>
            <ul className="mt-4 space-y-3">
              {Array.from({ length: 7 }, (_, index) => addDays(today, index)).map((date) => {
                const daySlots = preview.filter((slot) => slot.date === date);
                return (
                  <li key={date}>
                    <p className="text-xs font-semibold text-ink">{date === today ? t('ថ្ងៃនេះ', 'Today') : dateLabel(date)}</p>
                    {daySlots.length === 0 ? (
                      <p className="mt-1 text-xs text-ink-muted">{t('គ្មានម៉ោងទំនេរ', 'No open times')}</p>
                    ) : (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {daySlots.map((slot) => (
                          <span key={slot.start} className="rounded-lg bg-arom-soft px-2 py-1 text-xs font-medium tabular-nums text-arom-deep">
                            {slot.start}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
