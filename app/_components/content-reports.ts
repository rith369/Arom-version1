// "Report a problem" on MindGuide content. A report stores a reference to the
// item (and the section or step inside it), never a copy of the content, and
// no personal details. The server limits reports per person per day.

export type ReportReason = 'wrong_info' | 'harmful' | 'broken' | 'other';

export type ReportTarget = {
  type: 'lesson' | 'tip' | 'practice';
  sourceId: string;
  // Section or step id inside the item, when the report is about one part.
  partId?: string;
};

export type ReportResult = 'sent' | 'daily_limit' | 'signed_out';

export const REPORT_NOTE_MAX = 500;

// For example "lesson:what-is-stress#3".
export function reportTargetKey(target: ReportTarget) {
  return `${target.type}:${target.sourceId}${target.partId ? `#${target.partId}` : ''}`;
}

// Sends the report (POST /api/content-reports). The server checks the item
// exists and allows 5 reports a day per person. Signed out visitors are asked
// to log in, because the limit needs to know who sent it.
export async function submitContentReport(report: {
  target: ReportTarget;
  reason: ReportReason;
  note: string;
}): Promise<ReportResult> {
  if (report.note.length > REPORT_NOTE_MAX) {
    throw new Error('Report note is too long.');
  }

  const response = await fetch('/api/content-reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  if (response.status === 401) return 'signed_out';
  const data = (await response.json().catch(() => null)) as { result?: ReportResult } | null;
  if (!response.ok || !data?.result) throw new Error('Report could not be sent.');
  return data.result;
}
