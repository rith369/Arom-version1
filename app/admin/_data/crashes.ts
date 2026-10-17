import type { CrashReport } from '../../_components/crash-reporting';

// One row per distinct crash, grouped by the backend from many CrashReports
// (GET /api/admin/crashes?days=7).
// `people` counts different accounts, never who they were.
export type CrashGroup = {
  id: string;
  kind: CrashReport['kind'];
  message: string;
  count: number;
  people: number;
  lastSeenAt: string;
  route: string;
  release: string;
};
