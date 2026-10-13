'use client';

import { useState } from 'react';
import { Copy, Info, Mail } from 'lucide-react';

import { initialCrashGroups, type CrashGroup } from '../_data/crashes';

const TOP = 5;

const lastSeenFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Phnom_Penh',
});

function times(count: number) {
  return count === 1 ? '1 time' : `${count} times`;
}

function people(count: number) {
  return count === 1 ? '1 person' : `${count} people`;
}

// Plain text a developer can paste into Telegram, GitHub or an email.
function developerReport(crashes: CrashGroup[]) {
  const lines = crashes.map((crash, index) =>
    [
      `${index + 1}. [${crash.kind}] ${crash.message}`,
      `   ${times(crash.count)}, ${people(crash.people)}, last ${lastSeenFormat.format(new Date(crash.lastSeenAt))} (Cambodia time)`,
      `   Page: ${crash.route}   Version: ${crash.release}`,
    ].join('\n'),
  );

  return `AROM crashes, last 7 days (top ${crashes.length})\n\n${lines.join('\n\n')}`;
}

// "Most frequent crashes, last 7 days" for the admin Overview.
export function CrashReportCard({
  crashes = initialCrashGroups,
}: {
  crashes?: CrashGroup[];
}) {
  const [showInfo, setShowInfo] = useState(false);
  const [notice, setNotice] = useState('');

  const top = [...crashes].sort((a, b) => b.count - a.count || b.people - a.people).slice(0, TOP);
  const report = developerReport(top);

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setNotice('Copied. Paste it to the developer.');
    } catch {
      setNotice('Could not copy. Use Email developer instead.');
    }
  }

  return (
    <section className="rounded-2xl border border-arom-line bg-white shadow-panel">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-arom-line px-5 py-4">
        <div className="relative">
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-ink">
            Most frequent crashes, last 7 days
            <button
              type="button"
              onClick={() => setShowInfo((current) => !current)}
              aria-expanded={showInfo}
              aria-controls="crash-info"
              aria-label="What is a crash?"
              className="rounded-full p-0.5 text-ink-muted hover:text-arom focus-visible:outline-2 focus-visible:outline-arom">
              <Info size={16} />
            </button>
          </h2>
          {showInfo && (
            <p id="crash-info" className="mt-2 max-w-xl rounded-xl bg-arom-wash p-3 text-xs leading-5 text-ink-muted">
              A crash is an error that broke a screen for someone. Under each one: how
              many times it happened, how many different people hit it, when it last
              happened, the page, and the app version. Reports never include what
              people wrote or chose.
            </p>
          )}
        </div>

        {top.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyReport}
              className="inline-flex items-center gap-1.5 rounded-full border border-arom-border px-3.5 py-1.5 text-xs font-medium text-arom hover:bg-arom-wash">
              <Copy size={14} aria-hidden="true" />
              Copy for developer
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent('AROM: top crashes, last 7 days')}&body=${encodeURIComponent(report)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-arom-border px-3.5 py-1.5 text-xs font-medium text-arom hover:bg-arom-wash">
              <Mail size={14} aria-hidden="true" />
              Email developer
            </a>
          </div>
        )}
      </header>

      {top.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-muted">No crashes in the last 7 days.</p>
      ) : (
        <ol className="divide-y divide-arom-line">
          {top.map((crash) => (
            <li key={crash.id} className="px-5 py-4">
              <p className="break-words font-mono text-sm font-semibold leading-6 text-ink">
                [{crash.kind}] {crash.message}
              </p>
              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-medium text-ink-muted">
                <span>{times(crash.count)}</span>
                <span aria-hidden="true">·</span>
                <span>{people(crash.people)}</span>
                <span aria-hidden="true">·</span>
                <span>{lastSeenFormat.format(new Date(crash.lastSeenAt))}</span>
                <span aria-hidden="true">·</span>
                <span className="break-all">{crash.route}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{crash.release}</span>
              </p>
            </li>
          ))}
        </ol>
      )}

      <p role="status" aria-live="polite" className="min-h-5 px-5 pb-3 text-xs text-arom">
        {notice}
      </p>
    </section>
  );
}
