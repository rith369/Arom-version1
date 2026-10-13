// Mock community store shared by /community and /admin/community. It lives in
// this browser's localStorage only, so the demo works end to end in one
// browser. The backend replaces every function here (see BACKEND-HANDOFF.md
// section 14).

import {
  INITIAL_MESSAGES,
  type ChatMessage,
  type CommunityReportReason,
  type CommunityReportTarget,
  type SupportGroup,
} from "./community-data";

const CREATED_KEY = "arom_community_created_groups";
const CLOSED_KEY = "arom_community_closed_groups";
const MESSAGES_KEY = "arom_community_messages";
const REPORTS_KEY = "arom_community_reports";
const REPORT_COUNT_KEY = "arom_community_reports_today";

export const COMMUNITY_REPORT_NOTE_MAX = 300;
const DAILY_REPORT_LIMIT = 5;

export type GroupClosure = {
  groupId: string;
  reason: string;
  closedAt: string;
};

export type StoredCommunityReport = {
  id: string;
  target: CommunityReportTarget;
  reason: CommunityReportReason;
  note: string;
  createdAt: string;
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const CHANGE_EVENT = "arom-community-store";

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode can block storage. The real data lives on the server.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export type CommunitySnapshot = {
  createdGroups: SupportGroup[];
  closures: GroupClosure[];
  reports: StoredCommunityReport[];
  messages: ChatMessage[];
};

const SERVER_SNAPSHOT: CommunitySnapshot = {
  createdGroups: [],
  closures: [],
  reports: [],
  messages: INITIAL_MESSAGES,
};

let cachedKey = "";
let cachedSnapshot = SERVER_SNAPSHOT;

// For useSyncExternalStore: updates on writes in this tab and in other tabs.
export function subscribeCommunityStore(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getCommunitySnapshot(): CommunitySnapshot {
  let key = "";
  try {
    key = [CREATED_KEY, CLOSED_KEY, REPORTS_KEY, MESSAGES_KEY]
      .map((item) => window.localStorage.getItem(item) ?? "")
      .join("\n");
  } catch {
    return cachedSnapshot;
  }

  if (key !== cachedKey) {
    cachedKey = key;
    cachedSnapshot = {
      createdGroups: readCreatedGroups(),
      closures: readClosedGroups(),
      reports: readCommunityReports(),
      messages: readMessages(),
    };
  }
  return cachedSnapshot;
}

export function getServerCommunitySnapshot(): CommunitySnapshot {
  return SERVER_SNAPSHOT;
}

export function readCreatedGroups(): SupportGroup[] {
  const groups = read<SupportGroup[]>(CREATED_KEY, []);
  return Array.isArray(groups) ? groups : [];
}

export function saveCreatedGroup(group: SupportGroup) {
  const others = readCreatedGroups().filter((item) => item.id !== group.id);
  write(CREATED_KEY, [...others, group]);
}

export function readClosedGroups(): GroupClosure[] {
  const closures = read<GroupClosure[]>(CLOSED_KEY, []);
  return Array.isArray(closures) ? closures : [];
}

export function closeGroup(groupId: string, reason: string) {
  const others = readClosedGroups().filter((item) => item.groupId !== groupId);
  write(CLOSED_KEY, [...others, { groupId, reason, closedAt: new Date().toISOString() }]);
}

export function reopenGroup(groupId: string) {
  write(
    CLOSED_KEY,
    readClosedGroups().filter((item) => item.groupId !== groupId),
  );
}

// Every message in every group. Only the admin chat viewer reads all of them.
export function readMessages(): ChatMessage[] {
  const messages = read<ChatMessage[]>(MESSAGES_KEY, []);
  return Array.isArray(messages) && messages.length > 0 ? messages : INITIAL_MESSAGES;
}

export function readCommunityReports(): StoredCommunityReport[] {
  const reports = read<StoredCommunityReport[]>(REPORTS_KEY, []);
  return Array.isArray(reports) ? reports : [];
}

// Demo only. The backend checks the target exists, limits each user to five
// reports a day, and keeps the reporter id for that limit only.
export async function submitCommunityReport(report: {
  target: CommunityReportTarget;
  reason: CommunityReportReason;
  note: string;
}): Promise<"sent" | "daily_limit"> {
  if (report.note.length > COMMUNITY_REPORT_NOTE_MAX) {
    throw new Error("Report note is too long.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const saved = read<{ date: string; count: number } | null>(REPORT_COUNT_KEY, null);
  const count = saved?.date === today ? saved.count : 0;

  if (count >= DAILY_REPORT_LIMIT) return "daily_limit";

  write(REPORT_COUNT_KEY, { date: today, count: count + 1 });
  write(REPORTS_KEY, [
    ...readCommunityReports(),
    {
      id: crypto.randomUUID(),
      target: report.target,
      reason: report.reason,
      note: report.note.trim(),
      createdAt: new Date().toISOString(),
    },
  ]);

  return "sent";
}
