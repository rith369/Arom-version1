import type {
  ReportReason,
  ReportTarget,
} from '../../_components/content-reports';

// Mirrors what "Report a problem" sends. Reporter identity is kept by the
// backend only for the daily limit and is never shown to admins.
export type ReportStatus = 'open' | 'fixed' | 'not_a_problem';

export type AdminContentReport = {
  id: string;
  target: ReportTarget;
  reason: ReportReason;
  note: string;
  createdAt: string;
  status: ReportStatus;
  resolvedAt: string | null;
  resolvedBy: string | null;
};

function report(
  id: string,
  target: ReportTarget,
  reason: ReportReason,
  note: string,
  createdAt: string,
): AdminContentReport {
  return { id, target, reason, note, createdAt, status: 'open', resolvedAt: null, resolvedBy: null };
}

export const initialReports: AdminContentReport[] = [
  report(
    'report-001',
    { type: 'lesson', sourceId: 'learn-about-stress', partId: '3' },
    'harmful',
    'The example about skipping meals to cope could encourage unhealthy eating.',
    '2026-10-12T09:20:00Z',
  ),
  report(
    'report-002',
    { type: 'lesson', sourceId: 'learn-about-stress', partId: '3' },
    'wrong_info',
    '',
    '2026-10-12T15:02:00Z',
  ),
  report(
    'report-003',
    { type: 'lesson', sourceId: 'learn-about-stress', partId: '2' },
    'wrong_info',
    'The Khmer translation of "cortisol" is spelled differently from the English.',
    '2026-10-11T04:45:00Z',
  ),
  report(
    'report-004',
    { type: 'tip', sourceId: 'how-to-control-stress' },
    'broken',
    'The breathing button in step 6 does nothing on my phone.',
    '2026-10-12T22:10:00Z',
  ),
  report(
    'report-005',
    { type: 'tip', sourceId: 'how-to-control-stress' },
    'broken',
    '',
    '2026-10-13T01:30:00Z',
  ),
  report(
    'report-006',
    { type: 'practice', sourceId: 'sensory-grounding' },
    'other',
    'Could this have an audio version?',
    '2026-10-10T12:00:00Z',
  ),
  report(
    'report-007',
    { type: 'lesson', sourceId: 'learn-about-stress', partId: '5' },
    'harmful',
    'The wording made me feel like it was my fault for being stressed.',
    '2026-10-13T02:15:00Z',
  ),
  {
    ...report(
      'report-008',
      { type: 'tip', sourceId: 'sleep-hygiene-essentials' },
      'wrong_info',
      'Says 6 hours of sleep is enough for adults.',
      '2026-10-05T08:00:00Z',
    ),
    status: 'fixed',
    resolvedAt: '2026-10-06T03:00:00Z',
    resolvedBy: 'Neou Sokheng',
  },
];
