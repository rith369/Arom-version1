"use client";

import { useState } from "react";
import { CalendarCheck, Monitor, Repeat, UserRound } from "lucide-react";
import {
  acceptSuggestion,
  repeatLabel,
  seriesTimes,
  useSessionStore,
  withdrawSuggestion,
} from "./session-store";

const TIME_ZONE = "Asia/Phnom_Penh";

// Shown in the chat where the professional sent it. The client books from here.
export function SuggestionCard({
  suggestionId,
  viewer,
  km,
  readOnly = false,
}: {
  suggestionId: string;
  viewer: "client" | "professional";
  km: boolean;
  readOnly?: boolean;
}) {
  const { suggestions } = useSessionStore();
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [now] = useState(() => Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const suggestion = suggestions[suggestionId];
  const locale = km ? "km-KH" : "en-GB";
  const when = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE });

  if (!suggestion) {
    return <p className="text-sm text-ink-muted">{t("ការណែនាំនេះលែងមានទៀតហើយ។", "This suggestion is no longer available.")}</p>;
  }

  const open = suggestion.status === "open";
  const future = suggestion.times.filter((time) => Date.parse(time) > now);
  const typeLabel = suggestion.sessionType === "online" ? t("អនឡាញ", "Online") : t("ជួបផ្ទាល់", "In person");

  async function book() {
    if (!picked || busy) return;
    setBusy(true);
    const result = await acceptSuggestion(suggestion!.id, picked);
    setBusy(false);
    if (result === "taken") setError(t("ម៉ោងនេះទើបតែមានគេកក់។ សូមជ្រើសម៉ោងផ្សេង ឬផ្ញើសារ។", "That time was just taken. Choose another time or send a message."));
    else if (result === "closed") setError(t("ការណែនាំនេះលែងបើកទៀតហើយ។", "This suggestion is no longer open."));
    else if (result === "failed") setError(t("មិនអាចកក់បានទេ។ សូមព្យាយាមម្តងទៀត។", "This could not be booked. Please try again."));
  }

  async function withdraw() {
    if (busy) return;
    setBusy(true);
    const ok = await withdrawSuggestion(suggestion!.id);
    setBusy(false);
    if (!ok) setError(t("មិនអាចដកការណែនាំវិញបានទេ។ សូមព្យាយាមម្តងទៀត។", "This could not be withdrawn. Please try again."));
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-arom/30 bg-arom-wash/60 p-4 text-ink">
      <p className="flex items-center gap-2 text-sm font-bold">
        <CalendarCheck size={16} aria-hidden="true" className="text-arom" />
        {viewer === "client" ? t("ម៉ោងសម្រាប់វគ្គបន្ទាប់របស់អ្នក", "Times for your next session") : t("អ្នកបានណែនាំម៉ោងវគ្គបន្ទាប់", "You suggested times for the next session")}
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          {suggestion.sessionType === "online" ? <Monitor size={12} aria-hidden="true" /> : <UserRound size={12} aria-hidden="true" />}
          {typeLabel} · {suggestion.durationMinutes} {t("នាទី", "min")}
        </span>
        {suggestion.repeat.count > 1 && (
          <span className="flex items-center gap-1">
            <Repeat size={12} aria-hidden="true" />
            {repeatLabel(suggestion.repeat, km)}
          </span>
        )}
      </p>
      {suggestion.note && <p className="mt-2 text-sm leading-6">&ldquo;{suggestion.note}&rdquo;</p>}

      {suggestion.status === "booked" && suggestion.chosenTime && (
        <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm">
          <span className="font-semibold text-arom">{t("បានកក់: ", "Booked: ")}</span>
          {when.format(new Date(suggestion.chosenTime))}
          {suggestion.repeat.count > 1 &&
            t(` និង ${suggestion.repeat.count - 1} វគ្គទៀត`, `, then ${suggestion.repeat.count - 1} more`)}
        </p>
      )}

      {suggestion.status === "withdrawn" && (
        <p className="mt-3 text-sm text-ink-muted">{t("អ្នកជំនាញបានដកការណែនាំនេះវិញ។", "The professional withdrew this suggestion.")}</p>
      )}

      {open && viewer === "professional" && (
        <div className="mt-3">
          <ul className="space-y-1 text-sm">
            {suggestion.times.map((time) => (
              <li key={time}>{when.format(new Date(time))}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-muted">
            {suggestion.clientName
              ? t(`រង់ចាំ ${suggestion.clientName} ជ្រើសរើស។`, `Waiting for ${suggestion.clientName} to choose.`)
              : t("រង់ចាំអតិថិជនជ្រើសរើស។", "Waiting for the client to choose.")}
          </p>
          {error && (
            <p role="alert" className="mt-2 text-xs font-medium text-arom-danger">
              {error}
            </p>
          )}
          {!readOnly && (
            <button type="button" disabled={busy} onClick={() => void withdraw()} className="mt-2 text-xs font-semibold text-arom-danger hover:underline disabled:opacity-50">
              {t("ដកការណែនាំវិញ", "Withdraw")}
            </button>
          )}
        </div>
      )}

      {open && viewer === "client" && (
        <div className="mt-3">
          {future.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("ម៉ោងទាំងនេះបានកន្លងផុតហើយ។ សូមផ្ញើសារដើម្បីសុំម៉ោងថ្មី។", "These times have passed. Send a message to ask for new ones.")}</p>
          ) : (
            <>
              <div className="flex flex-col gap-1.5" role="radiogroup" aria-label={t("ជ្រើសរើសម៉ោង", "Choose a time")}>
                {future.map((time) => (
                  <button
                    key={time}
                    type="button"
                    role="radio"
                    aria-checked={picked === time}
                    disabled={readOnly}
                    onClick={() => {
                      setPicked(time);
                      setError("");
                    }}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-medium ${picked === time ? "border-arom bg-arom text-white" : "border-arom-border bg-white text-ink hover:border-arom/50"}`}
                  >
                    {when.format(new Date(time))}
                  </button>
                ))}
              </div>
              {picked && suggestion.repeat.count > 1 && (
                <p className="mt-2 text-xs leading-5 text-ink-muted">
                  {t("វគ្គរបស់អ្នក: ", "Your sessions: ")}
                  {seriesTimes(picked, suggestion.repeat)
                    .map((time) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: TIME_ZONE }).format(new Date(time)))
                    .join(", ")}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-2 text-xs font-medium text-arom-danger">
                  {error}
                </p>
              )}
              <button
                type="button"
                disabled={!picked || readOnly || busy}
                onClick={() => void book()}
                className="mt-3 w-full rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-40"
              >
                {suggestion.repeat.count > 1 ? t(`កក់ ${suggestion.repeat.count} វគ្គ`, `Book ${suggestion.repeat.count} sessions`) : t("កក់ម៉ោងនេះ", "Book this time")}
              </button>
              <p className="mt-2 text-center text-[0.7rem] text-ink-muted">{t("គ្មានការបង់ប្រាក់ពេលសាកល្បង", "No payment during testing")}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
