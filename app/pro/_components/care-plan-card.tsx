'use client';

import { useRef, useState } from 'react';
import { BellRing, BookOpen, Check, ClipboardList, Compass, Footprints, Lock, Plus, Target, X } from 'lucide-react';

import { MindGuidePicker } from './mindguide-picker';
import { usePro } from './pro-provider';
import { SheetDialog } from '../../_components/sheet-dialog';
import { useConfirm } from '../../_components/confirm-dialog';
import { useLanguage } from '../../_components/language-provider';
import {
  EVERY_DAY,
  KIND_LABELS,
  MAX_TASK_NOTE,
  MAX_TASK_TITLE,
  MINDGUIDE_OPTIONS,
  MINDGUIDE_TYPE_LABELS,
  WEEKDAY_LABELS,
  addCareTasks,
  cambodiaToday,
  isActive,
  mindguideOption,
  recentProgress,
  scheduleLabel,
  sharingKey,
  shiftDate,
  stopCareTask,
  taskTitle,
  useCareStore,
  type CareCheckIn,
  type CareTask,
  type CareTaskKind,
  type CareWeekday,
} from '../../_components/care/care-store';

const KIND_ICONS: Record<CareTaskKind, typeof Target> = {
  mindguide: BookOpen,
  mission: Footprints,
  goal: Target,
  reminder: BellRing,
};

const inputClass =
  'w-full rounded-xl border border-arom-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10';

type Repeat = 'once' | 'daily' | 'days';

function Progress({ task, checkIns, today, km, format }: { task: CareTask; checkIns: CareCheckIn[]; today: string; km: boolean; format: Intl.DateTimeFormat }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const days = recentProgress(task, checkIns, today);
  if (!days) {
    const check = checkIns.find((item) => item.taskId === task.id);
    return check ? (
      <p className="flex items-center gap-1.5 text-xs font-medium text-arom">
        <Check size={13} aria-hidden="true" />
        {task.kind === 'goal' ? t('បានសម្រេច', 'Reached') : t('បានធ្វើ', 'Done')} {format.format(new Date(`${check.date}T00:00:00Z`))}
      </p>
    ) : (
      <p className="text-xs text-ink-muted">{t('មិនទាន់', 'Not yet')}</p>
    );
  }
  const due = days.filter((day) => day.due);
  const done = due.filter((day) => day.done).length;
  return (
    <div className="flex items-center gap-2">
      <span className="flex gap-1" aria-hidden="true">
        {days.map((day) => (
          <span
            key={day.date}
            title={day.date}
            className={`size-2.5 rounded-full ${!day.due ? 'bg-transparent ring-1 ring-arom-border' : day.done ? 'bg-arom' : 'bg-gray-200'}`}
          />
        ))}
      </span>
      <span className="text-xs text-ink-muted">
        {due.length === 0
          ? t('មិនមានថ្ងៃត្រូវធ្វើក្នុង ៧ ថ្ងៃចុងក្រោយ', 'Not due in the last 7 days')
          : t(`ធ្វើបាន ${done} ក្នុង ${due.length} ថ្ងៃ (៧ ថ្ងៃចុងក្រោយ)`, `Done ${done} of ${due.length} days (last 7 days)`)}
      </span>
    </div>
  );
}

export function AddTaskDialog({ clientId, clientName, bookingId, today, onClose }: { clientId: string; clientName: string; bookingId: string | null; today: string; onClose: () => void }) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [kind, setKind] = useState<CareTaskKind>('mindguide');
  // Chosen in the MindGuide browser, as "type:id".
  const [itemKey, setItemKey] = useState('');
  const [browsing, setBrowsing] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [repeat, setRepeat] = useState<Repeat>('once');
  const [days, setDays] = useState<CareWeekday[]>([1, 3, 5]);
  const [endDate, setEndDate] = useState(shiftDate(today, 14));
  const [reminderTime, setReminderTime] = useState('');
  const [error, setError] = useState('');
  // Titles given while this window stayed open ("Give and add another").
  const [given, setGiven] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  // Plays the exit before the window is removed.
  const [closing, setClosing] = useState(false);
  const close = () => setClosing(true);

  const selectedOption = MINDGUIDE_OPTIONS.find((item) => `${item.type}:${item.id}` === itemKey);
  // A 2 week program is done once, when the client starts it; the program has its own daily steps.
  const isProgram = kind === 'mindguide' && selectedOption?.type === 'program';

  const chooseKind = (next: CareTaskKind) => {
    setKind(next);
    setError('');
    // Sensible starting points: a practice or reminder usually repeats, a lesson is done once.
    setRepeat(next === 'mindguide' ? (itemKey.startsWith('practice:') ? 'daily' : 'once') : next === 'goal' ? 'once' : 'daily');
    setEndDate(shiftDate(today, next === 'goal' ? 28 : 14));
  };

  const [saving, setSaving] = useState(false);

  const save = async (addAnother: boolean) => {
    if (saving) return;
    const option = MINDGUIDE_OPTIONS.find((item) => `${item.type}:${item.id}` === itemKey);
    if (kind === 'mindguide' && !option) return setError(t('សូមជ្រើសរើសមាតិកា MindGuide។', 'Choose a MindGuide item.'));
    if (kind !== 'mindguide' && !title.trim()) return setError(t('សូមសរសេរអ្វីដែលអតិថិជនត្រូវធ្វើ។', 'Write what the client should do.'));
    if (kind === 'goal' && !endDate) return setError(t('សូមជ្រើសរើសថ្ងៃកំណត់។', 'Choose a date to reach it by.'));
    if (repeat === 'days' && days.length === 0) return setError(t('សូមជ្រើសរើសយ៉ាងហោចណាស់មួយថ្ងៃ។', 'Choose at least one day.'));
    if (endDate && endDate < today) return setError(t('ថ្ងៃបញ្ចប់មិនអាចនៅមុនថ្ងៃនេះទេ។', 'The end date cannot be before today.'));

    setSaving(true);
    const result = await addCareTasks([
      {
        clientId,
        bookingId,
        kind,
        mindguide: kind === 'mindguide' && option ? { type: option.type, itemId: option.id } : null,
        title: kind === 'mindguide' ? '' : title.trim(),
        note: note.trim(),
        repeat: kind === 'goal' || repeat === 'once' || isProgram ? { type: 'once' } : { type: 'days', days: repeat === 'daily' ? EVERY_DAY : [...days].sort((a, b) => a - b) },
        endDate: endDate || null,
        reminderTime: kind === 'goal' ? null : reminderTime || null,
      },
    ]);
    setSaving(false);
    if (!result.ok) return setError(result.message);
    if (!addAnother) {
      close();
      return;
    }
    // Keep the type and schedule (often the same), clear what the task says.
    setGiven([...given, kind === 'mindguide' && option ? (km ? option.kmTitle : option.title) : title.trim()]);
    setTitle('');
    setNote('');
    setItemKey('');
    setError('');
    panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <SheetDialog
      closing={closing}
      onClosed={onClose}
      labelledBy="care-task-title"
      panelRef={panelRef}
      panelClassName="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl sm:p-6"
      after={
        browsing && (
          <MindGuidePicker
            clientName={clientName}
            onClose={() => setBrowsing(false)}
            onChoose={(type, id) => {
              if (!MINDGUIDE_OPTIONS.some((item) => item.type === type && item.id === id)) return;
              setItemKey(`${type}:${id}`);
              // A practice usually repeats; a lesson, tip or program is done once.
              setRepeat(type === 'practice' ? 'daily' : 'once');
              setError('');
              setBrowsing(false);
            }}
          />
        )
      }>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="care-task-title" className="text-lg font-bold text-ink">{t('ផ្ដល់កិច្ចការថែទាំ', 'Give a care task')}</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            {t(`បង្ហាញក្នុង "ផែនការប្រចាំថ្ងៃ" របស់ ${clientName}`, `Shows in ${clientName}'s "Your Plan For Today"`)}
          </p>
        </div>
        <button type="button" onClick={close} aria-label={t('បិទ', 'Close')} className="rounded-full p-2 hover:bg-arom-wash">
          <X size={20} />
        </button>
      </div>

      {given.length > 0 && (
        <div role="status" aria-live="polite" className="mt-4 rounded-2xl bg-arom-wash px-4 py-3 text-sm text-ink">
          <p className="flex items-center gap-1.5 font-semibold text-arom-deep">
            <Check size={15} aria-hidden="true" />
            {t(`បានផ្ដល់ ${given.length} កិច្ចការទៅ ${clientName}`, `${given.length} ${given.length === 1 ? 'task' : 'tasks'} given to ${clientName}`)}
          </p>
          <ul className="mt-1 list-inside list-disc text-xs text-ink-muted">
            {given.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-ink">{t('ប្រភេទ', 'Type')}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(Object.keys(KIND_LABELS) as CareTaskKind[]).map((value) => {
            const Icon = KIND_ICONS[value];
            const selected = kind === value;
            return (
              <label
                key={value}
                className={`cursor-pointer rounded-2xl border p-3 transition-colors ${selected ? 'border-arom bg-arom-wash' : 'border-arom-border hover:bg-arom-wash/50'}`}>
                <input type="radio" name="care-kind" value={value} checked={selected} onChange={() => chooseKind(value)} className="sr-only" />
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Icon size={16} aria-hidden="true" className="text-arom" />
                  {km ? KIND_LABELS[value].km : KIND_LABELS[value].en}
                </span>
                <span className="mt-1 block text-xs leading-5 text-ink-muted">{km ? KIND_LABELS[value].kmHint : KIND_LABELS[value].hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {kind === 'mindguide' ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-ink">{t('មាតិកា MindGuide', 'MindGuide item')}</p>
          {selectedOption ? (
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-arom bg-arom-wash px-3.5 py-3">
              <BookOpen size={18} aria-hidden="true" className="shrink-0 text-arom" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{km ? selectedOption.kmTitle : selectedOption.title}</span>
                <span className="text-xs text-ink-muted">
                  {km ? MINDGUIDE_TYPE_LABELS[selectedOption.type].km : MINDGUIDE_TYPE_LABELS[selectedOption.type].en} · {km ? selectedOption.kmDuration : selectedOption.duration}
                </span>
              </span>
              <button type="button" onClick={() => setBrowsing(true)} className="shrink-0 text-sm font-semibold text-arom hover:underline">
                {t('ប្តូរ', 'Change')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setBrowsing(true)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-arom/50 bg-arom-wash/50 px-4 py-4 text-sm font-semibold text-arom hover:bg-arom-wash">
              <Compass size={18} aria-hidden="true" />
              {t('រុករក MindGuide', 'Browse MindGuide')}
            </button>
          )}
          <p className="mt-1.5 text-xs text-ink-muted">
            {isProgram
              ? t(
                  'អតិថិជនចាប់ផ្តើមវគ្គដោយខ្លួនឯង ដោយមិនចាំបាច់ធ្វើការពិនិត្យជាមុន។ កិច្ចការនេះរួចរាល់នៅពេលពួកគេចាប់ផ្តើម។ នៅលើទំព័រដើម វាបង្ហាញថា "ចាប់ផ្តើមវគ្គ ២ សប្តាហ៍របស់អ្នក" ដោយមិនដាក់ប្រធានបទ។',
                  'The client starts the program themselves, with no check needed first. This task is done when they start. On their Home it shows as "Start your 2 week program", without the topic.',
                )
              : t('មើលមេរៀន លំហាត់ គន្លឹះ និងវគ្គ ២ សប្តាហ៍ ដូចអ្នកប្រើឃើញ។ មានតែមាតិកាដែលបានផ្សព្វផ្សាយប៉ុណ្ណោះ។', 'See lessons, practices, tips and 2 week programs the way users do. Only published items can be chosen.')}
          </p>
        </div>
      ) : (
        <label className="mt-5 block text-sm font-semibold text-ink">
          {kind === 'goal' ? t('គោលដៅ', 'Goal') : kind === 'reminder' ? t('រំលឹកអំពីអ្វី', 'Reminder') : t('បេសកកម្ម', 'Mission')}
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError('');
            }}
            maxLength={MAX_TASK_TITLE}
            placeholder={
              kind === 'goal'
                ? t('ឧ. ចូលគេងមុនម៉ោង ១១ យប់ ភាគច្រើននៃយប់', 'For example: go to bed before 11 pm on most nights')
                : kind === 'reminder'
                  ? t('ឧ. លេបថ្នាំតាមវេជ្ជបញ្ជារបស់វេជ្ជបណ្ឌិត', 'For example: take medicine as prescribed by your doctor')
                  : t('ឧ. ដើរ ១០ នាទីក្រោយអាហារថ្ងៃត្រង់', 'For example: take a 10 minute walk after lunch')
            }
            className={`mt-1.5 font-normal ${inputClass}`}
          />
          {kind === 'reminder' && (
            <span className="mt-1.5 block text-xs font-normal leading-5 text-ink-muted">
              {t('AROM មិនចេញវេជ្ជបញ្ជាទេ។ សូមរំលឹកតែអ្វីដែលវេជ្ជបណ្ឌិតរបស់ពួកគេបានចេញវេជ្ជបញ្ជាប៉ុណ្ណោះ។', 'AROM does not prescribe. Only remind about medicine their doctor has prescribed.')}
            </span>
          )}
        </label>
      )}

      <label className="mt-5 block text-sm font-semibold text-ink">
        {t('កំណត់ចំណាំទៅអតិថិជន (ស្រេចចិត្ត)', 'Note to the client (optional)')}
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={MAX_TASK_NOTE}
          rows={2}
          placeholder={t('ឧ. មុនចូលគេង ទោះបីតែ ២ នាទីក៏ដោយ។', 'For example: before bed, even if you only manage two minutes.')}
          className={`mt-1.5 font-normal ${inputClass}`}
        />
        <span className="mt-1 block text-right text-xs font-normal text-ink-muted">
          {note.length}/{MAX_TASK_NOTE}
        </span>
      </label>

      {kind !== 'goal' && !isProgram && (
        <fieldset className="mt-3">
          <legend className="text-sm font-semibold text-ink">{t('ញឹកញាប់ប៉ុណ្ណា', 'How often')}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {([
              ['once', t('ម្តង', 'Once')],
              ['daily', t('រៀងរាល់ថ្ងៃ', 'Every day')],
              ['days', t('ជ្រើសរើសថ្ងៃ', 'Some days')],
            ] as [Repeat, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={repeat === value}
                onClick={() => setRepeat(value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${repeat === value ? 'border-arom bg-arom text-white' : 'border-arom-border bg-white text-ink hover:bg-arom-wash'}`}>
                {label}
              </button>
            ))}
          </div>
          {repeat === 'days' && (
            <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={t('ថ្ងៃ', 'Days')}>
              {EVERY_DAY.map((day) => {
                const on = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDays(on ? days.filter((item) => item !== day) : [...days, day])}
                    className={`min-w-11 rounded-xl border px-2.5 py-1.5 text-xs font-semibold ${on ? 'border-arom bg-arom-soft text-arom-deep' : 'border-arom-border bg-white text-ink-muted'}`}>
                    {km ? WEEKDAY_LABELS[day].km : WEEKDAY_LABELS[day].en}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink">
          {kind === 'goal' ? t('សម្រេចមុនថ្ងៃ', 'Reach by') : t('បញ្ចប់នៅថ្ងៃ', 'Ends on')}
          <input type="date" value={endDate} min={today} onChange={(event) => setEndDate(event.target.value)} className={`mt-1.5 font-normal ${inputClass}`} />
          {kind !== 'goal' && <span className="mt-1 block text-xs font-normal text-ink-muted">{t('ទុកទទេ ដើម្បីបន្តរហូតដល់អ្នកបញ្ឈប់។', 'Leave empty to keep it until you stop it.')}</span>}
        </label>
        {kind !== 'goal' && (
          <label className="block text-sm font-semibold text-ink">
            {t('ម៉ោងរំលឹក (ស្រេចចិត្ត)', 'Reminder time (optional)')}
            <input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} className={`mt-1.5 font-normal ${inputClass}`} />
            <span className="mt-1 block text-xs font-normal text-ink-muted">{t('ផ្ញើតាម Telegram ពេលភ្ជាប់រួច។ មិនទាន់ផ្ញើពេលសាកល្បងទេ។', 'Sent on Telegram once connected. Not sent during testing.')}</span>
          </label>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-arom-danger-soft px-3.5 py-2.5 text-sm text-arom-danger">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={close} className="rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash">
          {given.length > 0 ? t('រួចរាល់', 'Done') : t('បោះបង់', 'Cancel')}
        </button>
        <button type="button" disabled={saving} onClick={() => void save(true)} className="rounded-full border border-arom bg-white px-4 py-2 text-sm font-semibold text-arom hover:bg-arom-wash disabled:opacity-50">
          {t('ផ្ដល់ ហើយបន្ថែមមួយទៀត', 'Give and add another')}
        </button>
        <button type="button" disabled={saving} onClick={() => void save(false)} className="rounded-full bg-arom px-5 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-50">
          {t('ផ្ដល់កិច្ចការ', 'Give task')}
        </button>
      </div>
    </SheetDialog>
  );
}

export function CarePlanCard({ clientId, clientName, archived, latestSessionId }: { clientId: string; clientName: string; archived: boolean; latestSessionId: string | null }) {
  const { profile } = usePro();
  const { tasks, checkIns, sharing } = useCareStore('professional');
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [today] = useState(() => cambodiaToday(Date.now()));
  const [adding, setAdding] = useState(false);
  const format = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

  const mine = tasks.filter((task) => task.professionalId === profile.slug && task.clientId === clientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const current = mine.filter((task) => isActive(task, today));
  const past = mine.filter((task) => !isActive(task, today));
  const shares = sharing[sharingKey(profile.slug, clientId)] === true;

  const row = (task: CareTask, isPast: boolean) => {
    const Icon = KIND_ICONS[task.kind];
    const option = mindguideOption(task);
    return (
      <li key={task.id} className="rounded-2xl border border-arom-border p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-arom-wash text-arom">
            <Icon size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-ink">
              {taskTitle(task, km)}
              <span className="rounded-full bg-arom-wash px-2 py-0.5 text-[0.7rem] font-medium text-ink-muted">
                {option ? (km ? MINDGUIDE_TYPE_LABELS[option.type].km : MINDGUIDE_TYPE_LABELS[option.type].en) : km ? KIND_LABELS[task.kind].km : KIND_LABELS[task.kind].en}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">{scheduleLabel(task, km)}</p>
            {task.note && <p className="mt-1.5 text-sm text-ink">&ldquo;{task.note}&rdquo;</p>}
            {isPast ? (
              <p className="mt-2 text-xs text-ink-muted">
                {task.stoppedAt
                  ? t(`បានបញ្ឈប់ ${format.format(new Date(`${task.stoppedAt.slice(0, 10)}T00:00:00Z`))}`, `Stopped ${format.format(new Date(`${task.stoppedAt.slice(0, 10)}T00:00:00Z`))}`)
                  : t('បានបញ្ចប់', 'Ended')}
              </p>
            ) : (
              shares && (
                <div className="mt-2">
                  <Progress task={task} checkIns={checkIns} today={today} km={km} format={format} />
                </div>
              )
            )}
          </div>
          {!isPast && (
            <button
              type="button"
              onClick={async () => {
                const stop = await confirm({
                  title: t('បញ្ឈប់កិច្ចការនេះ?', 'Stop this task?'),
                  message: t('វានឹងលែងបង្ហាញក្នុងផែនការរបស់អតិថិជន។', "It will no longer show in the client's plan."),
                  confirmLabel: t('បញ្ឈប់', 'Stop task'),
                  cancelLabel: t('បោះបង់', 'Cancel'),
                  tone: 'danger',
                });
                if (stop) void stopCareTask(task.id);
              }}
              className="shrink-0 text-xs font-semibold text-ink-muted hover:text-arom-danger hover:underline">
              {t('បញ្ឈប់', 'Stop')}
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <section id="care-plan" className="scroll-mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <ClipboardList size={18} aria-hidden="true" className="text-arom" />
            {t('ផែនការថែទាំ', 'Care plan')}
          </h2>
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            {t('អ្វីដែលអតិថិជនត្រូវធ្វើរវាងវគ្គ។ បង្ហាញក្នុង "ផែនការប្រចាំថ្ងៃ" របស់ពួកគេ។', 'What the client works on between sessions. It shows in their "Your Plan For Today".')}
          </p>
        </div>
        <button
          type="button"
          disabled={archived}
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-40">
          <Plus size={16} aria-hidden="true" />
          {t('ផ្ដល់កិច្ចការ', 'Give a task')}
        </button>
      </div>

      <p className="mt-3 flex items-start gap-1.5 rounded-2xl bg-arom-wash/70 px-3.5 py-2.5 text-xs leading-5 text-ink-muted">
        <Lock size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
        {shares
          ? t(`${clientName} ចែករំលែកវឌ្ឍនភាពរបស់ពួកគេជាមួយអ្នក។ ពួកគេអាចបិទវាគ្រប់ពេល។`, `${clientName} shares their progress with you. They can turn it off at any time.`)
          : t(`${clientName} មិនបានចែករំលែកវឌ្ឍនភាពទេ។ អ្នកឃើញតែកិច្ចការប៉ុណ្ណោះ។ នេះជាជម្រើសរបស់ពួកគេ។`, `${clientName} has not shared their progress. You see the tasks only. That is their choice.`)}
      </p>

      {current.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">
          {archived ? t('គ្មានកិច្ចការសកម្ម។', 'No active tasks.') : t('មិនទាន់មានកិច្ចការ។ ផ្ដល់កិច្ចការដំបូងបន្ទាប់ពីវគ្គ។', 'No tasks yet. Give the first one after a session.')}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">{current.map((task) => row(task, false))}</ul>
      )}

      {past.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-arom">
            {t(`កិច្ចការមុនៗ (${past.length})`, `Past tasks (${past.length})`)}
          </summary>
          <ul className="mt-3 space-y-3 opacity-80">{past.map((task) => row(task, true))}</ul>
        </details>
      )}

      {adding && <AddTaskDialog clientId={clientId} clientName={clientName} bookingId={latestSessionId} today={today} onClose={() => setAdding(false)} />}
      {confirmDialog}
    </section>
  );
}
