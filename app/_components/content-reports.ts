// "Report a problem" on MindGuide content. A report stores a reference to the
// item (and the section or step inside it), never a copy of the content, and
// no personal details. Mock only: the backend will insert reports through a
// server function that also limits reports per user per day.

export type ReportReason = 'wrong_info' | 'harmful' | 'broken' | 'other';

export type ReportTarget = {
  type: 'lesson' | 'tip' | 'practice';
  sourceId: string;
  // Section or step id inside the item, when the report is about one part.
  partId?: string;
};

export type ReportResult = 'sent' | 'daily_limit';

export const REPORT_NOTE_MAX = 500;
const DAILY_LIMIT = 5;
const COUNT_KEY = 'arom-content-reports-today';

// For example "lesson:what-is-stress#3".
export function reportTargetKey(target: ReportTarget) {
  return `${target.type}:${target.sourceId}${target.partId ? `#${target.partId}` : ''}`;
}

// Demo only. Counts this browser's reports per day so the limit message can be
// seen. Nothing is sent anywhere yet.
export async function submitContentReport(report: {
  target: ReportTarget;
  reason: ReportReason;
  note: string;
}): Promise<ReportResult> {
  if (report.note.length > REPORT_NOTE_MAX) {
    throw new Error('Report note is too long.');
  }

  const today = new Date().toISOString().slice(0, 10);
  let count = 0;

  try {
    const saved = JSON.parse(window.localStorage.getItem(COUNT_KEY) ?? 'null') as {
      date: string;
      count: number;
    } | null;
    count = saved?.date === today ? saved.count : 0;
  } catch {
    count = 0;
  }

  if (count >= DAILY_LIMIT) return 'daily_limit';

  try {
    window.localStorage.setItem(COUNT_KEY, JSON.stringify({ date: today, count: count + 1 }));
  } catch {
    // Private mode can block storage. The real limit lives on the server.
  }

  return 'sent';
}
