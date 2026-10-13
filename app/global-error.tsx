"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { reportCrash } from "./_components/crash-reporting";
import "./index.css";

// Only shown when the root layout itself breaks. It replaces the whole page,
// so there is no language setting here: both languages are shown.
// A full reload is used instead of `retry`: when the root layout broke, a
// fresh page load is the most reliable way back.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    reportCrash(error, "app");
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-canvas font-sans text-ink antialiased">
        <title>AROM</title>
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
          <div role="alert" className="w-full max-w-md rounded-3xl border border-arom-border bg-white p-7 text-center shadow-card">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="mt-1 font-khmer text-lg font-semibold">មានបញ្ហាបន្តិច</p>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              This is not your fault. Please try again.
            </p>
            <p className="mt-1 font-khmer text-sm leading-6 text-ink-muted">
              នេះមិនមែនជាកំហុសរបស់អ្នកទេ។ សូមព្យាយាមម្តងទៀត។
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-arom px-5 py-2.5 text-sm font-semibold text-white hover:bg-arom-deep"
            >
              Try again (ព្យាយាមម្តងទៀត)
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
