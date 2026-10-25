"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Lightbulb, RefreshCw } from "lucide-react";
import { GetHelpSection } from "../get-help-section";
import { MIN_SUMMARY_ENTRIES, type JournalSummaryResponse } from "@/lib/journal-summary";

type Load =
  | { status: "loading" }
  | { status: "hidden" }
  | { status: "error" }
  | { status: "ready"; data: JournalSummaryResponse };

async function call(method: "GET" | "POST" | "PUT", language: "en" | "km", body?: object) {
  const url = method === "GET" ? `/api/journal/summary?language=${language}` : "/api/journal/summary";
  const response = await fetch(url, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => null);
  if (!response) return { status: 0, data: null };
  const data = response.ok ? ((await response.json().catch(() => null)) as JournalSummaryResponse | null) : null;
  return { status: response.status, data };
}

/**
 * The written summary of the journal week (BACKEND-HANDOFF.md section 22).
 * Off until the person turns it on, because their entries go to Google Gemini.
 * When on, a new summary is written by itself once the entries change.
 */
export function JournalWrittenSummary({ km, weekCount }: { km: boolean; weekCount: number }) {
  const language = km ? "km" : "en";
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState<"" | "limit" | "failed">("");
  const [saving, setSaving] = useState(false);
  const tried = useRef("");

  const write = useCallback(async () => {
    setWriting(true);
    setWriteError("");
    const result = await call("POST", language, { language });
    setWriting(false);
    if (result.data) setLoad({ status: "ready", data: result.data });
    else setWriteError(result.status === 429 ? "limit" : "failed");
  }, [language]);

  useEffect(() => {
    let active = true;
    call("GET", language).then((result) => {
      if (!active) return;
      if (result.status === 401) setLoad({ status: "hidden" });
      else if (result.data) setLoad({ status: "ready", data: result.data });
      else setLoad({ status: "error" });
    });
    return () => {
      active = false;
    };
  }, [language, weekCount]);

  // Write a new summary by itself once, when it is on and the entries changed.
  useEffect(() => {
    if (load.status !== "ready") return;
    const { enabled, fresh, entryCount, runsLeft } = load.data;
    const attempt = `${language}:${entryCount}`;
    if (!enabled || fresh || entryCount < MIN_SUMMARY_ENTRIES || runsLeft === 0 || tried.current === attempt) return;
    tried.current = attempt;
    void write();
  }, [load, language, write]);

  async function setEnabled(enabled: boolean) {
    setSaving(true);
    const result = await call("PUT", language, { enabled, language });
    setSaving(false);
    if (result.data) {
      tried.current = "";
      setWriteError("");
      setLoad({ status: "ready", data: result.data });
    } else setWriteError("failed");
  }

  if (load.status === "hidden") return null;

  const box = "mt-3 rounded-2xl border border-[#1f6f5b]/10 bg-white/80 p-3.5";
  const heading = (
    <div className="flex items-center gap-2">
      <FileText size={16} className="text-[#1f6f5b]" aria-hidden="true" />
      <h3 className="text-sm font-bold text-[#111827]">{km ? "សេចក្តីសង្ខេបប្រចាំសប្តាហ៍" : "Summary of your week"}</h3>
    </div>
  );

  if (load.status === "loading") {
    return <div className={`${box} h-20 animate-pulse`} aria-hidden="true" />;
  }
  if (load.status === "error") {
    return (
      <p className={`${box} text-xs text-[#6b7280]`}>
        {km ? "មិនអាចផ្ទុកសេចក្តីសង្ខេបបានទេ។" : "The summary could not be loaded."}
      </p>
    );
  }

  const { data } = load;
  const turnOff = (
    <button
      type="button"
      disabled={saving}
      onClick={() => setEnabled(false)}
      className="text-[11px] font-semibold text-[#6b7280] underline-offset-2 hover:text-[#1f6f5b] hover:underline disabled:opacity-60"
    >
      {km ? "បិទសេចក្តីសង្ខេប" : "Turn off summary"}
    </button>
  );
  const errorText =
    writeError === "limit"
      ? km
        ? "អ្នកអាចទទួលបានសេចក្តីសង្ខេបថ្មីម្តងទៀតនៅថ្ងៃស្អែក។"
        : "You can get a new summary again tomorrow."
      : writeError === "failed"
        ? km
          ? "មិនអាចសរសេរសេចក្តីសង្ខេបបានទេនៅពេលនេះ។ សូមព្យាយាមម្តងទៀតពេលក្រោយ។"
          : "The summary could not be written right now. Please try again later."
        : "";

  // Off: explain where the entries go before anything is sent.
  if (!data.enabled) {
    return (
      <div className={box}>
        {heading}
        <p className="mt-2 text-xs leading-relaxed text-[#1f2d29]">
          {km
            ? "AROM អាចសរសេរសេចក្តីសង្ខេបខ្លីៗអំពីសប្តាហ៍របស់អ្នក ពីកំណត់ត្រារបស់អ្នក។ ដើម្បីធ្វើដូច្នេះ កំណត់ត្រា ៧ ថ្ងៃចុងក្រោយរបស់អ្នកនឹងត្រូវផ្ញើទៅ Google Gemini។ Google មិនប្រើវាដើម្បីបង្ហាត់ AI របស់ខ្លួនទេ ហើយរក្សាទុករហូតដល់ ៥៥ ថ្ងៃ សម្រាប់តែពិនិត្យការប្រើប្រាស់ខុសប៉ុណ្ណោះ។ អ្នកជំនាញ និងអ្នកគ្រប់គ្រង មិនដែលឃើញកំណត់ត្រារបស់អ្នកទេ។ អ្នកអាចបិទវាបានគ្រប់ពេល។"
            : "AROM can write a short summary of your week from your journal. To do this, your entries from the last 7 days are sent to Google Gemini. Google does not use them to train its AI, and keeps them for up to 55 days only to check for misuse. Professionals and admins never see your entries. You can turn it off at any time."}
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={() => setEnabled(true)}
          className="mt-3 rounded-full bg-[#1f6f5b] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#165344] disabled:opacity-60"
        >
          {km ? "បើកសេចក្តីសង្ខេប" : "Turn on summary"}
        </button>
        {errorText && <p className="mt-2 text-xs text-[#b91c1c]">{errorText}</p>}
      </div>
    );
  }

  if (data.entryCount < MIN_SUMMARY_ENTRIES && !data.summary) {
    return (
      <div className={box}>
        {heading}
        <p className="mt-2 text-xs leading-relaxed text-[#1f2d29]">
          {km
            ? `សរសេរយ៉ាងហោចណាស់ ${MIN_SUMMARY_ENTRIES} កំណត់ត្រាក្នុង ៧ ថ្ងៃ ដើម្បីទទួលបានសេចក្តីសង្ខេប។ ឥឡូវអ្នកមាន ${data.entryCount}។`
            : `Write at least ${MIN_SUMMARY_ENTRIES} entries in 7 days to get a summary. You have ${data.entryCount} so far.`}
        </p>
        <div className="mt-2">{turnOff}</div>
      </div>
    );
  }

  if (writing && !data.summary) {
    return (
      <div className={`${box} animate-pulse`} role="status">
        {heading}
        <p className="mt-2 text-xs text-[#1f6f5b]">{km ? "កំពុងសរសេរសេចក្តីសង្ខេបរបស់អ្នក..." : "Writing your summary..."}</p>
      </div>
    );
  }

  const summary = data.summary;

  // Something heavy came up: gentle words and the helplines, never a summary.
  if (summary?.kind === "support") {
    return (
      <div className={box}>
        {heading}
        <p className="mt-2 text-sm leading-relaxed text-[#1f2d29]">
          {km
            ? "អ្វីដែលអ្នកបានសរសេរសប្តាហ៍នេះ ហាក់ដូចជាធ្ងន់ធ្ងរណាស់។ អ្នកមិនចាំបាច់ទ្រាំតែម្នាក់ឯងទេ។ សូមនិយាយជាមួយនរណាម្នាក់ដែលអ្នកទុកចិត្ត ឬទាក់ទងខ្សែជំនួយខាងក្រោម។"
            : "What you wrote this week sounds really heavy. You do not have to carry it alone. Please talk to someone you trust, or reach out to one of the helplines below."}
        </p>
        <Link
          href="/professional"
          className="mt-3 inline-flex rounded-full bg-[#1f6f5b] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#165344]"
        >
          {km ? "និយាយជាមួយអ្នកជំនាញ" : "Talk to a professional"}
        </Link>
        <GetHelpSection />
        <div className="mt-3">{turnOff}</div>
      </div>
    );
  }

  return (
    <div className={box}>
      <div className="flex items-start justify-between gap-2">
        {heading}
        {writing && <RefreshCw size={14} className="mt-0.5 animate-spin text-[#1f6f5b]" aria-label={km ? "កំពុងធ្វើបច្ចុប្បន្នភាព" : "Updating"} />}
      </div>

      {summary ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-[#1f2d29]">{summary.paragraph}</p>

          {summary.theme && (
            <p className="mt-3 text-xs text-[#4b5563]">
              <span className="font-semibold text-[#6b7280]">{km ? "ប្រធានបទចម្បង (Main theme): " : "Main theme: "}</span>
              <span className="font-bold text-[#1f6f5b]">{summary.theme}</span>
            </p>
          )}

          {summary.highlights.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
                {km ? "អ្វីដែលយើងកត់សម្គាល់ (What we noticed)" : "What we noticed"}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {summary.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs leading-snug text-[#203a33]">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#1f6f5b]" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.tip && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#fef3c7]/70 p-2.5 text-xs text-[#78350f]">
              <Lightbulb size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                <span className="font-semibold">{km ? "អ្វីដែលអាចសាកល្បង: " : "Something to try: "}</span>
                {summary.tip}
              </p>
            </div>
          )}
        </>
      ) : (
        !errorText && (
          <p className="mt-2 text-xs text-[#6b7280]">{km ? "មិនទាន់មានសេចក្តីសង្ខេបទេ។" : "No summary yet."}</p>
        )
      )}

      {errorText && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#b91c1c]">
          <span>{errorText}</span>
          {writeError === "failed" && (
            <button type="button" onClick={() => void write()} className="font-semibold text-[#1f6f5b] hover:underline">
              {km ? "ព្យាយាមម្តងទៀត" : "Try again"}
            </button>
          )}
        </div>
      )}
      {!data.fresh && data.runsLeft === 0 && summary && !writing && (
        <p className="mt-2 text-[11px] text-[#6b7280]">
          {km ? "កំណត់ត្រាថ្មីនឹងត្រូវបញ្ចូលនៅថ្ងៃស្អែក។" : "Your newest entries will be included tomorrow."}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#1f6f5b]/10 pt-2.5">
        <p className="text-[11px] text-[#6b7280]">
          {km
            ? "សរសេរដោយ AI ពីកំណត់ត្រារបស់អ្នក។ វាអាចខុស ហើយមិនមែនជាការធ្វើរោគវិនិច្ឆ័យទេ។"
            : "Written by AI from your entries. It can be wrong, and it is not a diagnosis."}
        </p>
        {turnOff}
      </div>
    </div>
  );
}
