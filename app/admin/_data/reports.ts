import type {
  ReportReason,
  ReportTarget,
} from '../../_components/content-reports';

// Mirrors what "Report a problem" sends, loaded from GET /api/admin/content-reports.
// Reporter identity is kept by the backend only for the daily limit and is
// never shown to admins.
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
