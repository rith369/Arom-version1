// A crash is an error that broke a screen for someone (caught by app/error.tsx
// or app/global-error.tsx). Reports carry only what a developer needs to find
// the bug: never journal text, mood answers, form contents, names or ids.

export type CrashReport = {
  kind: 'render' | 'app';
  message: string;
  // Path only, with no query string or hash, so nothing a user typed is sent.
  route: string;
  // Short build id, for example "0045a08".
  release: string;
  digest: string | null;
  occurredAt: string;
};

const MAX_MESSAGE = 300;

export const APP_RELEASE =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local';

export function buildCrashReport(
  error: Error & { digest?: string },
  kind: CrashReport['kind'],
): CrashReport {
  const message = (error.message || error.name || 'Unknown error')
    // Strip query strings from any URL inside the message.
    .replace(/(https?:\/\/[^\s?#]+)[?#]\S*/g, '$1')
    .slice(0, MAX_MESSAGE);

  return {
    kind,
    message,
    route: typeof window === 'undefined' ? '' : window.location.pathname,
    release: APP_RELEASE,
    digest: error.digest ?? null,
    occurredAt: new Date().toISOString(),
  };
}

// Mock for now: the backend endpoint does not exist yet (BACKEND-HANDOFF.md
// section 14). When it does, send with `navigator.sendBeacon` so a report
// still goes out if the person leaves the page. The server adds who was
// affected (to count people) without storing it in the report itself.
export function reportCrash(
  error: Error & { digest?: string },
  kind: CrashReport['kind'],
): CrashReport {
  return buildCrashReport(error, kind);
}
