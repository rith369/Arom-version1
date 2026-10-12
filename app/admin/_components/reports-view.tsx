'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, Flag, Pencil, XCircle } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

import type { ReportReason } from '../../_components/content-reports';
import { getWorkingBody, type ContentType } from '../_data/content';
import type { AdminContentReport } from '../_data/reports';

type Tab = 'open' | 'closed';

const REASON_ORDER: ReportReason[] = ['harmful', 'wrong_info', 'broken', 'other'];

type ReportGroup = {
  itemId: string;
  type: ContentType;
  sourceId: string;
  reports: AdminContentReport[];
  hasHarmful: boolean;
  newest: string;
};

const reasonStyles: Record<ReportReason, string> = {
  harmful: 'bg-arom-danger-soft text-arom-danger',
  wrong_info: 'bg-arom-warning-soft text-arom-warning',
  broken: 'bg-arom-soft text-arom',
  other: 'bg-gray-100 text-gray-600',
};

export function ReportsView() {
  const { reports, contentRecords, resolveReports } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [tab, setTab] = useState<Tab>('open');
  const [notice, setNotice] = useState('');

  const reasonLabels: Record<ReportReason, string> = {
    harmful: t('ធ្វើឱ្យមិនស្រួលចិត្ត ឬអាចបង្កគ្រោះថ្នាក់', 'Upsetting or harmful'),
    wrong_info: t('ព័ត៌មានមិនត្រឹមត្រូវ', 'Wrong information'),
    broken: t('មានអ្វីមួយខូច', 'Something broken'),
    other: t('ផ្សេងទៀត', 'Other'),
  };

  const typeLabels: Record<ContentType, string> = {
    lesson: t('មេរៀន', 'Lesson'),
    tip: t('គន្លឹះ', 'Tip'),
    practice: t('ការអនុវត្ត', 'Practice'),
  };

  const dateFormatter = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Phnom_Penh',
  });

  const visible = reports.filter((item) =>
    tab === 'open' ? item.status === 'open' : item.status !== 'open',
  );

  // One card per item. Upsetting or harmful first, then the most reports, then newest.
  const groups = [...visible.reduce((map, item) => {
    const itemId = `${item.target.type}:${item.target.sourceId}`;
    const group: ReportGroup = map.get(itemId) ?? {
      itemId,
      type: item.target.type,
      sourceId: item.target.sourceId,
      reports: [],
      hasHarmful: false,
      newest: item.createdAt,
    };

    group.reports.push(item);
    group.hasHarmful ||= item.reason === 'harmful';
    if (item.createdAt > group.newest) group.newest = item.createdAt;

    return map.set(itemId, group);
  }, new Map<string, ReportGroup>()).values()].sort(
    (a, b) =>
      Number(b.hasHarmful) - Number(a.hasHarmful) ||
      b.reports.length - a.reports.length ||
      b.newest.localeCompare(a.newest),
  );

  function itemInfo(group: ReportGroup) {
    const record = contentRecords.find((item) => item.id === group.itemId);
    const body = record ? getWorkingBody(record) : null;
    const title = body ? (km && body.meta.kmTitle) || body.meta.title : group.sourceId;

    // Shows "Section 3" for a lesson section id, using its current position.
    function partLabel(partId?: string) {
      if (!partId) return t('ធាតុទាំងមូល', 'Whole item');
      if (body?.type === 'lesson') {
        const index = body.details.sections.findIndex((section) => String(section.id) === partId);
        return index >= 0
          ? `${t('ផ្នែកទី', 'Section')} ${index + 1}`
          : t('ផ្នែកដែលបានលុប', 'Section removed since');
      }
      return `${t('ផ្នែក', 'Part')} ${partId}`;
    }

    return { exists: Boolean(record), title, partLabel };
  }

  function resolve(group: ReportGroup, status: 'fixed' | 'not_a_problem', title: string) {
    resolveReports(group.itemId, status);
    setNotice(
      status === 'fixed'
        ? t(`បានបិទរបាយការណ៍លើ "${title}" ថាបានជួសជុល។`, `Reports on "${title}" closed as fixed.`)
        : t(`បានបិទរបាយការណ៍លើ "${title}" ថាមិនមែនជាបញ្ហា។`, `Reports on "${title}" closed as not a problem.`),
    );
  }

  const openCount = reports.filter((item) => item.status === 'open').length;

  return (
    <>
      <div>
        <p className="text-sm font-medium text-arom">
          {t('សុវត្ថិភាពមាតិកា', 'Content safety')}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {t('របាយការណ៍បញ្ហា', 'Reports')}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          {t(
            'បញ្ហាដែលអ្នកប្រើរាយការណ៍លើមេរៀន គន្លឹះ និងការអនុវត្ត។ របាយការណ៍មិនបង្ហាញថាអ្នកណាជាអ្នកផ្ញើទេ។',
            'Problems users reported on lessons, tips and practices. Reports never show who sent them.',
          )}
        </p>
      </div>

      <div role="tablist" aria-label={t('ស្ថានភាព', 'Status')} className="mt-8 flex gap-2">
        {(['open', 'closed'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => {
              setTab(value);
              setNotice('');
            }}
            className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium ${
              tab === value
                ? 'border-arom bg-arom text-white'
                : 'border-arom-border bg-white text-ink-muted hover:bg-arom-wash'
            }`}>
            {value === 'open' ? t('បើក', 'Open') : t('បានបិទ', 'Closed')}
            {value === 'open' && (
              <span className={`rounded-full px-2 py-0.5 text-xs ${tab === value ? 'bg-white/15' : 'bg-arom-wash text-arom'}`}>
                {openCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <p role="status" aria-live="polite" className="mt-4 min-h-5 text-sm text-arom">
        {notice}
      </p>

      <div className="mt-2 space-y-4">
        {groups.map((group) => {
          const { exists, title, partLabel } = itemInfo(group);
          const reasonCounts = group.reports.reduce<Partial<Record<ReportReason, number>>>(
            (counts, item) => ({ ...counts, [item.reason]: (counts[item.reason] ?? 0) + 1 }),
            {},
          );
          const firstPart = group.reports.find((item) => item.target.partId)?.target.partId;
          const editHref = `/admin/mindguide/${group.type}/${group.sourceId}${
            firstPart ? `?part=${encodeURIComponent(firstPart)}` : ''
          }`;

          return (
            <article
              key={group.itemId}
              className={`rounded-3xl border bg-white p-5 shadow-sm sm:p-6 ${
                group.hasHarmful && tab === 'open' ? 'border-arom-danger/40' : 'border-arom-border'
              }`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-arom">{typeLabels[group.type]}</p>
                  <h2 className="mt-1 text-lg font-semibold">{title}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {REASON_ORDER.filter((reason) => reasonCounts[reason])
                      .map((reason) => (
                        <span key={reason} className={`rounded-full px-2.5 py-1 text-xs font-medium ${reasonStyles[reason]}`}>
                          {reasonLabels[reason]} · {reasonCounts[reason]}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {exists && (
                    <Link
                      href={editHref}
                      className="flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-arom hover:bg-arom-soft">
                      <Pencil size={15} aria-hidden="true" />
                      {t('កែសម្រួល', 'Edit')}
                    </Link>
                  )}
                  {tab === 'open' && (
                    <>
                      <button
                        type="button"
                        onClick={() => resolve(group, 'fixed', title)}
                        className="flex items-center gap-2 rounded-full bg-arom px-4 py-2 text-sm font-medium text-white hover:bg-arom-deep">
                        <CheckCircle2 size={15} aria-hidden="true" />
                        {t('បានជួសជុល', 'Fixed')}
                      </button>
                      <button
                        type="button"
                        onClick={() => resolve(group, 'not_a_problem', title)}
                        className="flex items-center gap-2 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-ink-muted hover:bg-arom-wash">
                        <XCircle size={15} aria-hidden="true" />
                        {t('មិនមែនជាបញ្ហា', 'Not a problem')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <ul className="mt-5 divide-y divide-arom-border border-t border-arom-border">
                {group.reports
                  .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((item) => (
                    <li key={item.id} className="py-3 text-sm">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                        <span className={`rounded-full px-2 py-0.5 font-medium ${reasonStyles[item.reason]}`}>
                          {reasonLabels[item.reason]}
                        </span>
                        <span>{partLabel(item.target.partId)}</span>
                        <span>{dateFormatter.format(new Date(item.createdAt))}</span>
                        {item.status !== 'open' && item.resolvedAt && (
                          <span>
                            {item.status === 'fixed' ? t('បានជួសជុល', 'Fixed') : t('មិនមែនជាបញ្ហា', 'Not a problem')}
                            {' · '}
                            {item.resolvedBy} · {dateFormatter.format(new Date(item.resolvedAt))}
                          </span>
                        )}
                      </div>
                      <p className={`mt-1.5 leading-6 ${item.note ? 'text-ink' : 'text-ink-muted'}`}>
                        {item.note || t('គ្មានកំណត់ចំណាំ', 'No note')}
                      </p>
                    </li>
                  ))}
              </ul>
            </article>
          );
        })}

        {groups.length === 0 && (
          <div className="rounded-3xl border border-arom-border bg-white p-12 text-center">
            <Flag size={32} aria-hidden="true" className="mx-auto text-ink-muted" />
            <h2 className="mt-4 font-medium">
              {tab === 'open'
                ? t('គ្មានរបាយការណ៍បើកទេ', 'No open reports')
                : t('មិនទាន់មានរបាយការណ៍បានបិទ', 'No closed reports yet')}
            </h2>
          </div>
        )}
      </div>
    </>
  );
}
