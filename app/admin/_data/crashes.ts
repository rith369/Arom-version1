import type { CrashReport } from '../../_components/crash-reporting';

// One row per distinct crash, grouped by the backend from many CrashReports.
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

// Sample data for the last 7 days, newest demo date 13 Oct 2026.
export const initialCrashGroups: CrashGroup[] = [
  {
    id: 'crash-001',
    kind: 'render',
    message: "TypeError: Cannot read properties of undefined (reading 'sections')",
    count: 6,
    people: 4,
    lastSeenAt: '2026-10-13T02:40:00Z',
    route: '/learn',
    release: 'ab0a85e',
  },
  {
    id: 'crash-002',
    kind: 'render',
    message: 'TypeError: Failed to fetch dynamically imported module: https://arom.example/_next/static/chunks/app/podcasts/page.js',
    count: 3,
    people: 3,
    lastSeenAt: '2026-10-12T14:51:00Z',
    route: '/podcasts',
    release: '33fe5a2',
  },
  {
    id: 'crash-003',
    kind: 'render',
    message: 'RangeError: Invalid time value',
    count: 2,
    people: 1,
    lastSeenAt: '2026-10-11T09:05:00Z',
    route: '/professional/sopheap-chan/book',
    release: 'f3c50b9',
  },
  {
    id: 'crash-004',
    kind: 'app',
    message: 'TypeError: Importing a module script failed.',
    count: 1,
    people: 0,
    lastSeenAt: '2026-10-07T07:44:00Z',
    route: '/',
    release: '7e9e855',
  },
];
