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

// Sends the report to POST /api/crash-reports (BACKEND-HANDOFF.md section 14)
// with navigator.sendBeacon, so it still goes out if the person leaves the
// page. The server counts how many people were affected without returning
// who they were. Sending can never break the error screen.
export function reportCrash(
  error: Error & { digest?: string },
  kind: CrashReport['kind'],
): CrashReport {
  const report = buildCrashReport(error, kind);
  try {
    const body = JSON.stringify(report);
    const sent =
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon === 'function' &&
      navigator.sendBeacon('/api/crash-reports', new Blob([body], { type: 'application/json' }));
    if (!sent) {
      void fetch('/api/crash-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => undefined);
    }
  } catch {
    // Nothing to do: the person still sees the error screen.
  }
  return report;
}
