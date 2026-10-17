"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { HeartHandshake, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { reportCrash } from "./_components/crash-reporting";
import { useLanguage } from "./_components/language-provider";

// After a new release, an open tab can ask for files that no longer exist.
// Re-rendering does not help then; a full reload does.
function isOutdatedApp(error: Error) {
  return /dynamically imported module|importing a module script failed|loading chunk|ChunkLoadError/i.test(
    `${error.name} ${error.message}`,
  );
}

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { language } = useLanguage();
  const km = language === "km";

  useEffect(() => {
    reportCrash(error, "render");
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-16">
      <div role="alert" className="w-full max-w-md rounded-3xl border border-arom-border bg-white p-7 text-center shadow-card">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-arom-soft text-arom">
          <HeartHandshake size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-ink">
          {km ? "មានបញ្ហាលើទំព័រនេះ" : "Something went wrong on this screen"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          {km
            ? "នេះមិនមែនជាកំហុសរបស់អ្នកទេ។ ក្រុម AROM បានទទួលដំណឹងហើយ។ សូមព្យាយាមម្តងទៀត ឬត្រឡប់ទៅទំព័រដើម។"
            : "This is not your fault. The AROM team has been told. Please try again, or go back to the home page."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => (isOutdatedApp(error) ? window.location.reload() : retry())}
            className="inline-flex items-center gap-2 rounded-full bg-arom px-5 py-2.5 text-sm font-semibold text-white hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
          >
            <RotateCw size={16} aria-hidden="true" />
            {km ? "ព្យាយាមម្តងទៀត" : "Try again"}
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-arom-border px-5 py-2.5 text-sm font-semibold text-arom hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
          >
            {km ? "ទៅទំព័រដើម" : "Go to home"}
          </Link>
        </div>
      </div>
    </main>
  );
}
