"use client";

import { useState } from "react";
import {
  MAX_DESK_CANCEL_REASON,
  MAX_DESK_MOVE_REASON,
  cambodiaDay,
  formatClinicDay,
  formatClinicRange,
  type DeskTime,
} from "@/lib/clinic-booking";
import { deskSend } from "./desk-shared";

const fieldClass =
  "mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3 py-2 text-sm font-normal text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10";

/**
 * The clinic's times from today to the end of the booking window. The desk
 * marks a time full (for example booked on the Google Form) or opens it
 * again, and moves or cancels a booked session.
 */
export function DeskSchedule({
  slug,
  schedule,
  km,
  now,
  onDone,
}: {
  slug: string;
  schedule: DeskTime[];
  km: boolean;
  now: number;
  onDone: (message: string) => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const days: { key: string; times: DeskTime[] }[] = [];
  for (const time of schedule) {
    const key = cambodiaDay(time.startsAt);
    const last = days[days.length - 1];
    if (last?.key === key) last.times.push(time);
    else days.push({ key, times: [time] });
  }
  const openTimes = schedule.filter((time) => time.state === "open" && Date.parse(time.startsAt) > now);

  if (days.length === 0) {
    return <p className="text-sm text-ink-muted">{t("មិនមានម៉ោងទេ។", "No times yet.")}</p>;
  }

  return (
    <div className="space-y-6">
      {days.map((day) => (
        <section key={day.key} aria-label={formatClinicDay(day.times[0].startsAt, km)}>
          <h3 className="text-base font-bold text-ink">{formatClinicDay(day.times[0].startsAt, km)}</h3>
          <ul className="mt-2 divide-y divide-arom-border rounded-3xl border border-arom-border bg-white">
            {day.times.map((time) => (
              <TimeRow
                key={time.startsAt}
                slug={slug}
                time={time}
                openTimes={openTimes}
                km={km}
                past={Date.parse(time.startsAt) <= now}
                onDone={onDone}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TimeRow({
  slug,
  time,
  openTimes,
  km,
  past,
  onDone,
}: {
  slug: string;
  time: DeskTime;
  openTimes: DeskTime[];
  km: boolean;
  past: boolean;
  onDone: (message: string) => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [mode, setMode] = useState<"none" | "move" | "cancel">("none");
  const [moveTo, setMoveTo] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const range = formatClinicRange(time.startsAt, time.endsAt, km);

  async function setFull(full: boolean) {
    setBusy(true);
    setError("");
    const result = await deskSend(`/api/clinic-desk/${slug}/times`, { startsAt: time.startsAt, full });
    setBusy(false);
    if (!result.ok) return setError(result.message ?? t("មិនអាចរក្សាទុកបានទេ។", "That could not be saved."));
    onDone(full ? t(`${range} ពេញហើយ។`, `${range} is now full.`) : t(`${range} បើកវិញហើយ។`, `${range} is open again.`));
  }

  async function change() {
    if (!time.appointmentId) return;
    if (!reason.trim()) return setError(t("សូមសរសេរមូលហេតុ។ សិស្សនឹងឃើញវា។", "Please write a reason. The student will see it."));
    if (mode === "move" && !moveTo) return setError(t("សូមជ្រើសរើសម៉ោងថ្មី។", "Please choose the new time."));
    setBusy(true);
    setError("");
    const result = await deskSend(
      `/api/clinic-desk/${slug}/bookings/${time.appointmentId}`,
      mode === "move" ? { action: "move", startsAt: moveTo, reason: reason.trim() } : { action: "cancel", reason: reason.trim() },
    );
    setBusy(false);
    if (!result.ok) return setError(result.message ?? t("មិនអាចរក្សាទុកបានទេ។", "That could not be saved."));
    onDone(mode === "move" ? t("បានប្តូរម៉ោងវគ្គ។", "The session was moved.") : t("បានបោះបង់វគ្គ។", "The session was cancelled."));
  }

  const state =
    time.state === "booked"
      ? { text: t("បានកក់", "Booked"), tone: "bg-arom-soft text-arom-deep" }
      : time.state === "closed"
        ? { text: t("ពេញ", "Full"), tone: "bg-arom-warning-soft text-arom-warning" }
        : { text: t("ទំនេរ", "Open"), tone: "bg-arom-wash text-ink-muted" };

  return (
    <li className={`px-4 py-3 ${past ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink">{range}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${state.tone}`}>{state.text}</span>
        </div>
        {!past && mode === "none" && (
          <div className="flex flex-wrap gap-1.5">
            {time.state === "open" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void setFull(true)}
                className="rounded-full border border-arom-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-arom-wash disabled:opacity-60"
              >
                {t("កំណត់ថាពេញ", "Mark full")}
              </button>
            )}
            {time.state === "closed" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void setFull(false)}
                className="rounded-full border border-arom-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-arom-wash disabled:opacity-60"
              >
                {t("បើកវិញ", "Open again")}
              </button>
            )}
            {time.state === "booked" && time.appointmentId && (
              <>
                <button
                  type="button"
                  onClick={() => setMode("move")}
                  className="rounded-full border border-arom-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-arom-wash"
                >
                  {t("ប្តូរម៉ោង", "Move")}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("cancel")}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-arom-danger hover:bg-arom-danger-soft/60"
                >
                  {t("បោះបង់", "Cancel")}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {time.state === "booked" && (
        <p className="mt-1 text-xs text-ink-muted">
          {[
            time.therapistName,
            time.clientName,
            time.sessionType === "online" ? t("អនឡាញ", "Online") : time.sessionType === "in_person" ? t("ជួបផ្ទាល់", "In person") : "",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {time.state === "closed" && (
        <p className="mt-1 text-xs text-ink-muted">
          {t("បានកំណត់ថាពេញ (ឧ. កក់តាម Google Form)", "Marked full (for example booked on the Google Form)")}
        </p>
      )}

      {mode !== "none" && (
        <div className="mt-3 rounded-2xl bg-arom-wash/70 p-3">
          {mode === "move" && (
            <label className="block text-sm font-semibold text-ink">
              {t("ម៉ោងថ្មី", "New time")}
              <select value={moveTo} onChange={(event) => setMoveTo(event.target.value)} className={fieldClass}>
                <option value="">{t("ជ្រើសរើសម៉ោងទំនេរ", "Choose an open time")}</option>
                {openTimes.map((item) => (
                  <option key={item.startsAt} value={item.startsAt}>
                    {formatClinicDay(item.startsAt, km)}, {formatClinicRange(item.startsAt, item.endsAt, km)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="mt-3 block text-sm font-semibold text-ink">
            {t("មូលហេតុ (សិស្ស និងអ្នកព្យាបាលនឹងឃើញ)", "Reason (the student and therapist will see it)")}
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
              maxLength={mode === "move" ? MAX_DESK_MOVE_REASON : MAX_DESK_CANCEL_REASON}
              className={fieldClass}
            />
          </label>
          {error && (
            <p role="alert" className="mt-2 text-sm text-arom-danger">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void change()}
              className={`rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                mode === "move" ? "bg-[#185a4d] hover:bg-[#13463c]" : "bg-arom-danger hover:opacity-90"
              }`}
            >
              {busy
                ? t("កំពុងរក្សាទុក...", "Saving...")
                : mode === "move"
                  ? t("ប្តូរម៉ោង", "Move session")
                  : t("បោះបង់វគ្គ", "Cancel session")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("none");
                setError("");
              }}
              className="rounded-full border border-arom-border px-4 py-2 text-sm text-ink hover:bg-white"
            >
              {t("ត្រឡប់ក្រោយ", "Back")}
            </button>
          </div>
        </div>
      )}
      {mode === "none" && error && (
        <p role="alert" className="mt-2 text-sm text-arom-danger">
          {error}
        </p>
      )}
    </li>
  );
}
