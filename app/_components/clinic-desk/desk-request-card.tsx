"use client";

import { useState } from "react";
import { MapPin, MessageCircle, MessageSquareText, Video } from "lucide-react";
import {
  MAX_DESK_ANSWER,
  formatClinicDay,
  formatClinicRange,
  type DeskRequest,
  type DeskTherapist,
  type DeskTime,
} from "@/lib/clinic-booking";
import { deskSend, genderText } from "./desk-shared";

/** One waiting request: choose a time and a therapist, or say the times do not work. */
export function DeskRequestCard({
  slug,
  request,
  therapists,
  schedule,
  km,
  now,
  onDone,
  onMessage,
}: {
  slug: string;
  request: DeskRequest;
  therapists: DeskTherapist[];
  schedule: Map<string, DeskTime>;
  km: boolean;
  now: number;
  onDone: (message: string) => void;
  // Opens the chat with this student (section 35).
  onMessage: () => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [time, setTime] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [declining, setDeclining] = useState(false);
  const [declineNote, setDeclineNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // The preferred gender first, so the desk sees the best match on top.
  const sorted = [...therapists].sort((a, b) => {
    const score = (item: DeskTherapist) => (request.therapistGender !== "any" && item.gender === request.therapistGender ? 0 : 1);
    return score(a) - score(b) || a.name.localeCompare(b.name);
  });

  async function confirm() {
    if (!time) return setError(t("សូមជ្រើសរើសម៉ោងមួយ។", "Please choose a time."));
    if (!therapistId) return setError(t("សូមជ្រើសរើសអ្នកព្យាបាល។", "Please choose a therapist."));
    setBusy(true);
    setError("");
    const result = await deskSend(`/api/clinic-desk/${slug}/requests/${request.id}`, {
      action: "confirm",
      startsAt: time,
      therapistId,
      meetingUrl: meetingUrl.trim(),
    });
    setBusy(false);
    if (!result.ok) return setError(result.message ?? t("មិនអាចរក្សាទុកបានទេ។", "That could not be saved."));
    onDone(t(`បានបញ្ជាក់សំណើ #${request.reference}។`, `Request #${request.reference} confirmed.`));
  }

  async function decline() {
    setBusy(true);
    setError("");
    const result = await deskSend(`/api/clinic-desk/${slug}/requests/${request.id}`, {
      action: "decline",
      note: declineNote.trim(),
    });
    setBusy(false);
    if (!result.ok) return setError(result.message ?? t("មិនអាចរក្សាទុកបានទេ។", "That could not be saved."));
    onDone(t(`បានប្រាប់សិស្សឱ្យជ្រើសរើសម៉ោងផ្សេង (#${request.reference})។`, `The student was asked to choose other times (#${request.reference}).`));
  }

  return (
    <li className="rounded-3xl border border-arom-border bg-white p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-base font-bold text-ink">
          #{request.reference} · {request.clientName}
        </p>
        <p className="text-xs text-ink-muted">
          {t("បានផ្ញើ", "Sent")} {new Date(request.createdAt).toLocaleString(km ? "km-KH" : "en-GB", { timeZone: "Asia/Phnom_Penh", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink">
        {request.sessionType === "online" ? (
          <Video aria-hidden="true" size={16} className="text-arom" />
        ) : (
          <MapPin aria-hidden="true" size={16} className="text-arom" />
        )}
        {request.sessionType === "online" ? t("អនឡាញ", "Online") : t("ជួបផ្ទាល់", "In person")}
        <span className="text-ink-muted">·</span>
        {request.therapistGender === "any"
          ? t("មិនខ្វល់ពីភេទអ្នកព្យាបាល", "No therapist preference")
          : t(`ចង់បានអ្នកព្យាបាល${genderText(request.therapistGender, true)}`, `Prefers a ${genderText(request.therapistGender, false).toLowerCase()} therapist`)}
      </p>

      {(request.age || request.sex || request.preferredLanguage) && (
        <p className="mt-1.5 text-sm text-ink">
          {[
            request.age ? t(`អាយុ ${request.age}`, `Age ${request.age}`) : "",
            request.sex === "male"
              ? t("ប្រុស", "Male")
              : request.sex === "female"
                ? t("ស្រី", "Female")
                : request.sex === "non_binary"
                  ? t("មិនកំណត់ភេទ", "Non-binary")
                  : "",
            request.preferredLanguage === "khmer"
              ? t("ចង់ប្រើភាសាខ្មែរ", "Prefers Khmer")
              : request.preferredLanguage === "english"
                ? t("ចង់ប្រើភាសាអង់គ្លេស", "Prefers English")
                : "",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      {request.note && (
        <p className="mt-2 flex items-start gap-2 rounded-2xl bg-arom-wash/70 px-3.5 py-2.5 text-sm text-ink">
          <MessageSquareText aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-arom" />
          <span className="whitespace-pre-line">{request.note}</span>
        </p>
      )}

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-ink">
          {formatClinicDay(request.times[0], km)}: {t("ម៉ោងដែលសិស្សអាចមក", "times the student can come")}
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {request.times.map((startsAt) => {
            const slot = schedule.get(startsAt);
            const past = Date.parse(startsAt) <= now;
            const taken = !slot || slot.state !== "open";
            const disabled = past || taken;
            return (
              <label
                key={startsAt}
                className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 text-sm ${
                  disabled ? "cursor-not-allowed border-arom-border/60 bg-arom-wash/50 text-ink-muted" : "cursor-pointer border-arom-border text-ink"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name={`time-${request.id}`}
                    disabled={disabled}
                    checked={time === startsAt}
                    onChange={() => {
                      setError("");
                      setTime(startsAt);
                    }}
                    className="size-4 accent-arom"
                  />
                  {formatClinicRange(startsAt, slot?.endsAt ?? startsAt, km)}
                </span>
                {disabled && (
                  <span className="text-xs font-semibold">{past ? t("កន្លងផុត", "Passed") : t("ពេញ", "Full")}</span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-4 block text-sm font-semibold text-ink">
        {t("អ្នកព្យាបាល", "Therapist")}
        <select
          value={therapistId}
          onChange={(event) => {
            setError("");
            setTherapistId(event.target.value);
          }}
          className="mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
        >
          <option value="">{t("ជ្រើសរើសអ្នកព្យាបាល", "Choose a therapist")}</option>
          {sorted.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {genderText(item.gender, km) ? ` (${genderText(item.gender, km)})` : ""}
            </option>
          ))}
        </select>
        {therapists.length === 0 && (
          <span className="mt-1 block text-xs font-normal text-arom-danger">
            {t("គ្លីនិកមិនទាន់មានអ្នកព្យាបាលនៅឡើយ។ សូមសុំឱ្យ AROM ភ្ជាប់ពួកគេ។", "This clinic has no therapists yet. Ask the AROM team to link them.")}
          </span>
        )}
      </label>

      {request.sessionType === "online" && (
        <label className="mt-4 block text-sm font-semibold text-ink">
          {t("តំណប្រជុំ (ស្រេចចិត្ត)", "Meeting link (optional)")}
          <span className="block text-xs font-normal text-ink-muted">
            {t("អ្នកព្យាបាលក៏អាចបន្ថែមវានៅពេលក្រោយបានដែរ។", "The therapist can also add it later.")}
          </span>
          <input
            type="url"
            inputMode="url"
            placeholder="https://"
            value={meetingUrl}
            onChange={(event) => setMeetingUrl(event.target.value)}
            maxLength={500}
            className="mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
          />
        </label>
      )}

      {declining && (
        <label className="mt-4 block text-sm font-semibold text-ink">
          {t("សារទៅសិស្ស (ស្រេចចិត្ត)", "Message to the student (optional)")}
          <textarea
            value={declineNote}
            onChange={(event) => setDeclineNote(event.target.value)}
            rows={2}
            maxLength={MAX_DESK_ANSWER}
            placeholder={t("ឧ. សូមសាកល្បងថ្ងៃសុក្រក្រោយ", "For example: please try next Friday")}
            className="mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3 py-2 text-sm font-normal text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
          />
        </label>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-arom-danger">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {declining ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void decline()}
              className="rounded-full bg-arom-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy ? t("កំពុងផ្ញើ...", "Sending...") : t("ផ្ញើ", "Send")}
            </button>
            <button
              type="button"
              onClick={() => setDeclining(false)}
              className="rounded-full border border-arom-border px-4 py-2 text-sm text-ink hover:bg-arom-wash"
            >
              {t("ត្រឡប់ក្រោយ", "Back")}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirm()}
              className="rounded-full bg-[#185a4d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#13463c] disabled:opacity-60"
            >
              {busy ? t("កំពុងរក្សាទុក...", "Saving...") : t("បញ្ជាក់", "Confirm")}
            </button>
            <button
              type="button"
              onClick={() => {
                setError("");
                setDeclining(true);
              }}
              className="rounded-full border border-arom-border px-4 py-2 text-sm text-ink hover:bg-arom-wash"
            >
              {t("ម៉ោងទាំងនេះមិនបាន", "These times do not work")}
            </button>
            <button
              type="button"
              onClick={onMessage}
              className="flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm text-arom hover:bg-arom-wash"
            >
              <MessageCircle size={15} aria-hidden="true" />
              {t("ផ្ញើសារ", "Message")}
            </button>
          </>
        )}
      </div>
    </li>
  );
}
