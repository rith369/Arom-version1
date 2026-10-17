'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  History,
  Pencil,
  RotateCcw,
  Save,
  Send,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';

import { useAdmin, type ContentActionResult } from './admin-provider';
import { ContentMetaFields } from './content-meta-fields';
import { ContentPreview } from './content-preview';
import { PublishStateChip } from './content-status';
import { LessonFields } from './lesson-editor';
import { PracticeFields } from './practice-editor';
import { TipFields } from './tip-editor';
import { useLanguage } from '../../_components/language-provider';
import { useConfirm } from '../../_components/confirm-dialog';
import { useUnsavedChangesGuard } from '../../_components/unsaved-changes-guard';

import {
  getLiveBody,
  getPublishState,
  getWorkingBody,
  type ContentBody,
  type ContentRecord,
  type ContentType,
} from '../_data/content';
import { checkForPublish, type ContentProblem } from '../_data/content-checks';
import { summarizeChanges } from '../_data/content-diff';

const sameBody = (a: ContentBody, b: ContentBody) =>
  JSON.stringify(a) === JSON.stringify(b);

function useFormatDateTime() {
  const { language } = useLanguage();
  const formatter = new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Phnom_Penh',
  });

  return (value: string) => formatter.format(new Date(value));
}

// Destructive actions take two taps: the first tap arms the button for a few seconds.
function TwoTapButton({
  label,
  confirmLabel,
  icon: Icon,
  onConfirm,
  disabled,
}: {
  label: string;
  confirmLabel: string;
  icon: typeof Trash2;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
      className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
        armed
          ? 'border-arom-danger bg-arom-danger text-white'
          : 'border-arom-danger/25 text-arom-danger hover:bg-arom-danger-soft'
      }`}>
      <Icon size={16} aria-hidden="true" />
      {armed ? confirmLabel : label}
    </button>
  );
}

function Card({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-3xl border border-arom-border bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function PublishDialog({
  title,
  nextVersion,
  changes,
  warnings,
  onCancel,
  onConfirm,
}: {
  title: string;
  nextVersion: number;
  changes: string[];
  warnings: ContentProblem[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      aria-labelledby="publish-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-arom-border bg-white p-6 text-ink shadow-card backdrop:bg-ink/35">
      <div className="flex items-start justify-between gap-4">
        <h2 id="publish-title" className="text-xl font-semibold">
          {t('ផ្សព្វផ្សាយទៅអ្នកប្រើ?', 'Publish to users?')}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label={t('បោះបង់', 'Cancel')}
          className="rounded-full p-2 hover:bg-arom-wash">
          <X size={20} />
        </button>
      </div>

      <p className="mt-3 text-sm leading-6 text-ink-muted">
        {t(
          `"${title}" កំណែទី ${nextVersion} នឹងបង្ហាញដល់អ្នកប្រើទាំងអស់ភ្លាមៗ។ កំណែចាស់ត្រូវបានរក្សាទុកក្នុងប្រវត្តិ។`,
          `"${title}" version ${nextVersion} goes live for every user right away. Older versions stay in the history.`,
        )}
      </p>

      <h3 className="mt-5 text-sm font-semibold">
        {t('អ្វីដែលនឹងផ្លាស់ប្តូរ', 'What will change')}
      </h3>
      <ul className="mt-2 space-y-1.5 rounded-2xl bg-arom-wash p-4 text-sm">
        {changes.map((change) => (
          <li key={change} className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
            {change}
          </li>
        ))}
      </ul>

      {warnings.length > 0 && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-arom-warning-soft p-3 text-sm text-arom-warning">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t(
            `មានការព្រមាន ${warnings.length}។ អ្នកនៅតែអាចផ្សព្វផ្សាយបាន។`,
            `${warnings.length} warning${warnings.length > 1 ? 's' : ''}, such as missing Khmer text. You can still publish.`,
          )}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          className="rounded-full border border-arom-border px-5 py-2.5 text-sm">
          {t('បោះបង់', 'Cancel')}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex items-center gap-2 rounded-full bg-arom px-5 py-2.5 text-sm font-medium text-white hover:bg-arom-deep">
          <Send size={16} aria-hidden="true" />
          {t('ផ្សព្វផ្សាយ', 'Publish now')}
        </button>
      </div>
    </dialog>
  );
}

// Field to open at when the editor is reached from a report about one part.
function partFieldId(type: ContentType, part: string) {
  const prefix = type === 'lesson' ? 'section' : type === 'tip' ? 'step' : 'instruction';
  return `cf-${prefix}-${part}-title`;
}

function focusField(fieldId: string) {
  const element = document.getElementById(fieldId);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  element?.focus({ preventScroll: true });
}

function ContentEditor({
  record,
  focusPart,
}: {
  record: ContentRecord;
  focusPart?: string;
}) {
  const router = useRouter();
  const {
    saveContentDraft,
    publishContent,
    discardContentDraft,
    setContentHidden,
    restoreContentVersion,
    deleteContent,
  } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const formatDateTime = useFormatDateTime();

  // What was last loaded or saved. Used for "unsaved changes" and the no overwrite check.
  const [loaded, setLoaded] = useState(() => ({
    body: getWorkingBody(record),
    updatedAt: record.draft?.updatedAt ?? null,
  }));
  const [working, setWorking] = useState<ContentBody>(loaded.body);
  // Bumped to reload the fields after Undo or Restore.
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  const isDirty = !sameBody(working, loaded.body);
  const state = getPublishState(record);
  const liveBody = getLiveBody(record);
  const problems = checkForPublish(working, km);
  const errors = problems.filter((problem) => problem.level === 'error');
  const warnings = problems.filter((problem) => problem.level === 'warning');
  const latestVersion = record.versions.at(-1)?.version ?? 0;
  const backHref = `/admin/mindguide?tab=${record.type}`;

  const typeLabels: Record<ContentType, string> = {
    lesson: t('មេរៀន', 'Lesson'),
    tip: t('គន្លឹះ', 'Tip'),
    practice: t('ការអនុវត្ត', 'Practice'),
  };

  const contentTitles: Record<ContentType, string> = {
    lesson: t('ផ្នែកមេរៀន និងឯកសារយោង', 'Lesson sections and references'),
    tip: t('ជំហាន ប្រភព និងប្រអប់ជំនួយ', 'Steps, source and support box'),
    practice: t('ជំហាន និងការដកដង្ហើម', 'Instructions and breathing'),
  };

  // Section ids are never reused, so reports that point at a section stay correct.
  const nextSectionId =
    Math.max(
      0,
      ...[...record.versions.map((item) => item.body), record.draft?.body, working]
        .filter((body): body is ContentBody => body?.type === 'lesson')
        .flatMap((body) =>
          body.type === 'lesson' ? body.details.sections.map((section) => section.id) : [],
        ),
    ) + 1;

  // Warn before leaving with unsaved changes: browser close or refresh, and links inside the app.
  const leaveGuard = useUnsavedChangesGuard(isDirty, km);
  const { confirm, dialog: confirmDialog } = useConfirm();

  function reload(body: ContentBody, updatedAt: string | null) {
    setLoaded({ body, updatedAt });
    setWorking(body);
    setRevision((current) => current + 1);
  }

  const [busy, setBusy] = useState(false);

  // Shows why a change was refused. Returns true when the change went through.
  function handled(result: ContentActionResult) {
    if (result.ok) return true;
    if (result.code === 'error') setNotice({ tone: 'error', text: result.message });
    else if (result.code === 'stale') staleMessage();
    else
      setNotice({
        tone: 'error',
        text: t('ពិនិត្យវាលដែលមានសញ្ញាក្រហម ហើយសាកល្បងម្តងទៀត។', 'Check the fields marked in red, then try again.'),
      });
    return false;
  }

  function staleMessage() {
    setNotice({
      tone: 'error',
      text: t(
        'អ្នកគ្រប់គ្រងម្នាក់ទៀតបានរក្សាទុកធាតុនេះ។ ការផ្លាស់ប្តូររបស់អ្នកមិនបានជាន់លើទេ។ សូមចម្លងការកែរបស់អ្នក ផ្ទុកទំព័រឡើងវិញ ហើយសាកល្បងម្តងទៀត។',
        'Another admin saved this item after you opened it, so nothing was overwritten. Copy your edits, reload the page and try again.',
      ),
    });
  }

  async function saveDraft() {
    if (busy) return;
    setBusy(true);
    const result = await saveContentDraft(record.id, working, loaded.updatedAt);
    setBusy(false);

    if (!handled(result) || !result.ok) return;

    setLoaded({ body: working, updatedAt: result.updatedAt });
    setNotice({ tone: 'ok', text: t('បានរក្សាទុកសេចក្តីព្រាង។ អ្នកប្រើមិនទាន់ឃើញទេ។', 'Draft saved. Users do not see it yet.') });
  }

  async function publish() {
    if (busy) return;
    setBusy(true);
    const result = await publishContent(record.id, loaded.updatedAt);
    setBusy(false);
    setIsPublishing(false);

    if (!handled(result)) return;

    setLoaded({ body: working, updatedAt: null });
    setNotice({
      tone: 'ok',
      text: t(
        `កំណែទី ${latestVersion + 1} ត្រូវបានផ្សព្វផ្សាយ។`,
        `Version ${latestVersion + 1} is published. Users see it once the app reads MindGuide from the database.`,
      ),
    });
  }

  async function discardDraft() {
    if (busy) return;
    if (state === 'notPublished') {
      setBusy(true);
      const deleted = await deleteContent(record.id);
      setBusy(false);
      if (handled(deleted)) router.push(backHref);
      return;
    }

    setBusy(true);
    const result = await discardContentDraft(record.id);
    setBusy(false);
    if (!handled(result)) return;
    reload(liveBody ?? working, null);
    setNotice({ tone: 'ok', text: t('បានលុបសេចក្តីព្រាង។', 'Draft discarded. Showing the live version.') });
  }

  async function restore(version: number) {
    if (
      (isDirty || record.draft) &&
      !(await confirm({
        title: t(`ស្តារកំណែទី ${version}?`, `Restore version ${version}?`),
        message: t(
          'វានឹងជំនួសសេចក្តីព្រាង និងការផ្លាស់ប្តូរដែលមិនទាន់រក្សាទុក។ បន្ត?',
          'This replaces your current draft and any unsaved changes. Continue?',
        ),
        confirmLabel: 'Restore',
        cancelLabel: 'Cancel',
      }))
    ) {
      return;
    }

    setBusy(true);
    const result = await restoreContentVersion(record.id, version);
    setBusy(false);
    if (!handled(result) || !result.ok) return;
    const source = record.versions.find((item) => item.version === version);

    if (source) reload(structuredClone(source.body), result.updatedAt);
    setNotice({
      tone: 'ok',
      text: t(
        `បានចម្លងកំណែទី ${version} ទៅសេចក្តីព្រាង។ ពិនិត្យ ហើយចុចផ្សព្វផ្សាយ។`,
        `Version ${version} copied into the draft. Review it, then publish.`,
      ),
    });
  }

  function jumpTo(fieldId: string) {
    setView('edit');
    // Wait one frame so the fields are on screen after leaving the preview.
    window.requestAnimationFrame(() => focusField(fieldId));
  }

  // Opened from a report: go straight to the reported section or step.
  useEffect(() => {
    if (!focusPart) return;
    const frame = window.requestAnimationFrame(() =>
      focusField(partFieldId(record.type, focusPart)),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [focusPart, record.type]);



  const publishBlockedReason = !record.draft
    ? t('គ្មានសេចក្តីព្រាងដើម្បីផ្សព្វផ្សាយ', 'Nothing new to publish')
    : isDirty
      ? t('រក្សាទុកសេចក្តីព្រាងជាមុនសិន', 'Save the draft first')
      : errors.length
        ? t('ដោះស្រាយបញ្ហាក្នុងការត្រួតពិនិត្យជាមុនសិន', 'Fix the problems in Checks first')
        : null;

  const statusLine = isDirty
    ? t('មានការផ្លាស់ប្តូរមិនទាន់រក្សាទុក', 'Unsaved changes')
    : record.draft
      ? `${t('សេចក្តីព្រាងបានរក្សាទុក', 'Draft saved')} ${formatDateTime(record.draft.updatedAt)} ${t('ដោយ', 'by')} ${record.draft.updatedBy}`
      : record.liveVersion
        ? `${t('កំណែទី', 'Version')} ${record.liveVersion} ${t('កំពុងបង្ហាញ', 'is live')}`
        : t('មិនទាន់ផ្សព្វផ្សាយ', 'Not published');

  const displayTitle = (km && working.meta.kmTitle) || working.meta.title || t('គ្មានចំណងជើង', 'Untitled');

  return (
    <>
      {leaveGuard}
      {confirmDialog}
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-arom hover:underline">
        <ArrowLeft size={16} aria-hidden="true" />
        {t('មគ្គុទ្ទេសក៍ចិត្ត', 'MindGuide')}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-arom">{typeLabels[record.type]}</p>
          <h1 className="mt-1 break-words text-3xl font-semibold tracking-tight">{displayTitle}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <PublishStateChip state={state} />
            <span className={isDirty ? 'font-medium text-arom-warning' : ''}>{statusLine}</span>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 -mx-1 mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-arom-border bg-white/95 p-3 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={() => void saveDraft()}
          disabled={!isDirty || busy}
          className="flex items-center gap-2 rounded-full border border-arom px-4 py-2 text-sm font-medium text-arom hover:bg-arom-soft disabled:cursor-not-allowed disabled:border-arom-border disabled:text-ink-muted">
          <Save size={16} aria-hidden="true" />
          {t('រក្សាទុកសេចក្តីព្រាង', 'Save draft')}
        </button>

        <button
          type="button"
          onClick={() => reload(loaded.body, loaded.updatedAt)}
          disabled={!isDirty || busy}
          className="flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm text-ink-muted hover:bg-arom-wash disabled:cursor-not-allowed disabled:opacity-40">
          <Undo2 size={16} aria-hidden="true" />
          {t('មិនធ្វើការផ្លាស់ប្តូរវិញ', 'Undo changes')}
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {publishBlockedReason && (
            <span className="text-xs text-ink-muted">{publishBlockedReason}</span>
          )}
          <button
            type="button"
            onClick={() => setIsPublishing(true)}
            disabled={Boolean(publishBlockedReason)}
            className="flex items-center gap-2 rounded-full bg-arom px-5 py-2 text-sm font-medium text-white hover:bg-arom-deep disabled:cursor-not-allowed disabled:opacity-40">
            <Send size={16} aria-hidden="true" />
            {t('ផ្សព្វផ្សាយ', 'Publish')}
          </button>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-5 text-sm ${notice?.tone === 'error' ? 'text-arom-danger' : 'text-arom'}`}>
        {notice?.text}
      </p>

      <div className="mt-3 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div key={revision} className="min-w-0 space-y-6">
          <div
            role="tablist"
            aria-label={t('របៀបមើល', 'View')}
            className="flex w-fit gap-1 rounded-full border border-arom-border bg-white p-1">
            {(['edit', 'preview'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={view === value}
                onClick={() => setView(value)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                  view === value ? 'bg-arom text-white' : 'text-ink-muted hover:bg-arom-wash'
                }`}>
                {value === 'edit' ? (
                  <Pencil size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
                {value === 'edit' ? t('កែសម្រួល', 'Edit') : t('មើលជាមុន', 'Preview')}
              </button>
            ))}
          </div>

          {view === 'preview' ? (
            <ContentPreview body={working} />
          ) : (
          <>
          <Card title={t('ព័ត៌មានមូលដ្ឋាន', 'Basic information')}>
            <ContentMetaFields
              value={working.meta}
              onChange={(meta) => setWorking({ ...working, meta })}
            />
          </Card>

          <Card title={contentTitles[record.type]}>
            {working.type === 'lesson' && (
              <LessonFields
                value={working.details}
                nextSectionId={nextSectionId}
                onChange={(details) => setWorking({ ...working, details })}
              />
            )}
            {working.type === 'tip' && (
              <TipFields
                value={working.details}
                onChange={(details) => setWorking({ ...working, details })}
              />
            )}
            {working.type === 'practice' && (
              <PracticeFields
                value={working.details}
                onChange={(details) => setWorking({ ...working, details })}
              />
            )}
          </Card>
          </>
          )}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              {errors.length ? (
                <AlertTriangle size={18} className="text-arom-danger" aria-hidden="true" />
              ) : (
                <CheckCircle2 size={18} className="text-arom" aria-hidden="true" />
              )}
              {t('ការត្រួតពិនិត្យ', 'Checks')}
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              {errors.length
                ? t(
                    `បញ្ហា ${errors.length} ត្រូវដោះស្រាយមុនផ្សព្វផ្សាយ។ អ្នកនៅតែអាចរក្សាទុកសេចក្តីព្រាងបាន។`,
                    `${errors.length} problem${errors.length > 1 ? 's' : ''} to fix before publishing. You can still save the draft.`,
                  )
                : t('រួចរាល់សម្រាប់ផ្សព្វផ្សាយ។', 'Ready to publish.')}
            </p>

            {problems.length > 0 && (
              <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
                {problems.map((problem, index) => (
                  <li key={`${problem.fieldId}-${index}`}>
                    <button
                      type="button"
                      onClick={() => jumpTo(problem.fieldId)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm hover:underline ${
                        problem.level === 'error'
                          ? 'bg-arom-danger-soft text-arom-danger'
                          : 'bg-arom-warning-soft text-arom-warning'
                      }`}>
                      {problem.message}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() => setShowHistory((current) => !current)}
              aria-expanded={showHistory}
              className="flex w-full items-center justify-between gap-2 text-base font-semibold">
              <span className="flex items-center gap-2">
                <History size={18} className="text-arom" aria-hidden="true" />
                {t('ប្រវត្តិកំណែ', 'Version history')}
              </span>
              <span className="text-xs font-normal text-ink-muted">{record.versions.length}</span>
            </button>

            {showHistory && (
              <ol className="mt-4 space-y-3">
                {record.versions.length === 0 && (
                  <li className="text-sm text-ink-muted">
                    {t('មិនទាន់មានកំណែដែលបានផ្សព្វផ្សាយ។', 'No published versions yet.')}
                  </li>
                )}
                {[...record.versions].reverse().map((item) => (
                  <li key={item.version} className="rounded-2xl bg-arom-wash p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">
                        {t('កំណែទី', 'Version')} {item.version}
                      </span>
                      {item.version === record.liveVersion && (
                        <span className="rounded-full bg-arom-soft px-2 py-0.5 text-xs text-arom">
                          {t('កំពុងបង្ហាញ', 'Live')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      {formatDateTime(item.publishedAt)} · {item.publishedBy}
                    </p>
                    <button
                      type="button"
                      onClick={() => void restore(item.version)}
                      className="mt-2 flex items-center gap-1.5 text-xs font-medium text-arom hover:underline">
                      <RotateCcw size={14} aria-hidden="true" />
                      {t('ស្ដារជាសេចក្តីព្រាង', 'Restore as draft')}
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="space-y-2 rounded-3xl border border-arom-border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold">{t('សកម្មភាពផ្សេងទៀត', 'More actions')}</h2>

            {state === 'hidden' ? (
              <button
                type="button"
                onClick={async () => {
                  if (handled(await setContentHidden(record.id, false))) {
                    setNotice({ tone: 'ok', text: t('កំពុងបង្ហាញម្តងទៀត។', 'Shown again.') });
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-arom hover:bg-arom-soft">
                <Eye size={16} aria-hidden="true" />
                {t(`បង្ហាញកំណែទី ${latestVersion} ម្តងទៀត`, `Show version ${latestVersion} again`)}
              </button>
            ) : (
              <TwoTapButton
                label={t('លាក់ពីអ្នកប្រើ', 'Hide from users')}
                confirmLabel={t('ចុចម្តងទៀតដើម្បីលាក់', 'Tap again to hide')}
                icon={EyeOff}
                disabled={record.liveVersion === null}
                onConfirm={async () => {
                  if (handled(await setContentHidden(record.id, true))) {
                    setNotice({ tone: 'ok', text: t('បានលាក់ពីអ្នកប្រើ។', 'Hidden from users.') });
                  }
                }}
              />
            )}

            <TwoTapButton
              label={
                state === 'notPublished'
                  ? t('លុបធាតុនេះ', 'Delete this item')
                  : t('លុបសេចក្តីព្រាង', 'Discard draft')
              }
              confirmLabel={t('ចុចម្តងទៀតដើម្បីលុប', 'Tap again to discard')}
              icon={Trash2}
              disabled={!record.draft}
              onConfirm={() => void discardDraft()}
            />
          </section>
        </aside>
      </div>

      {isPublishing && (
        <PublishDialog
          title={working.meta.title}
          nextVersion={latestVersion + 1}
          changes={summarizeChanges(liveBody, working, km)}
          warnings={warnings}
          onCancel={() => setIsPublishing(false)}
          onConfirm={() => void publish()}
        />
      )}
    </>
  );
}

export function ContentEditorPage({
  type,
  sourceId,
  focusPart,
}: {
  type: ContentType;
  sourceId: string;
  focusPart?: string;
}) {
  const { contentRecords, contentLoad } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';
  const record = contentRecords.find(
    (item) => item.type === type && item.sourceId === sourceId,
  );

  if (contentLoad !== 'ready') {
    return (
      <p
        role={contentLoad === 'error' ? 'alert' : 'status'}
        className={`rounded-3xl border border-arom-border bg-white p-10 text-center text-sm ${
          contentLoad === 'error' ? 'text-arom-danger' : 'text-ink-muted'
        }`}>
        {contentLoad === 'error'
          ? 'Content could not be loaded. Refresh the page to try again.'
          : 'Loading content...'}
      </p>
    );
  }

  if (!record) {
    return (
      <div className="rounded-3xl border border-arom-border bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">
          {km ? 'រកមិនឃើញមាតិកានេះទេ' : 'This content was not found'}
        </h1>
        <Link
          href={`/admin/mindguide?tab=${type}`}
          className="mt-4 inline-block text-sm font-medium text-arom underline">
          {km ? 'ត្រឡប់ទៅមគ្គុទ្ទេសក៍ចិត្ត' : 'Back to MindGuide'}
        </Link>
      </div>
    );
  }

  return <ContentEditor key={record.id} record={record} focusPart={focusPart} />;
}
