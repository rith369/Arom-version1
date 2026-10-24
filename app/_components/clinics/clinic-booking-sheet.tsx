"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import {
  MAX_CLINIC_NOTE,
  cambodiaDay,
  formatClinicDay,
  formatClinicRange,
  type ClinicBookingInfo,
  type ClinicSessionType,
  type TherapistPreference,
} from "@/lib/clinic-booking";
import { SheetDialog } from "../sheet-dialog";

const chipClass = (on: boolean) =>
  `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-arom ${
    on ? "bg-[#185a4d] text-white" : "bg-[#dcefe9] text-[#185a4d] hover:bg-[#cde7df]"
  }`;

/**
 * Book a session at a clinic (section 34). The student chooses online or in
 * person, a therapist preference, one day and every time that works; the
 * clinic desk then picks one time and the therapist.
 */
export function ClinicBookingSheet({
  slug,
  clinicName,
  info,
  km,
  onClose,
}: {
  slug: string;
  clinicName: string;
  info: ClinicBookingInfo;
  km: boolean;
  onClose: (sent: boolean) => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [closing, setClosing] = useState(false);

  // Days with at least one open time, in order.
  const days = useMemo(() => {
    const map = new Map<string, ClinicBookingInfo["times"]>();
    for (const time of info.times) {
      const key = cambodiaDay(time.startsAt);
      map.set(key, [...(map.get(key) ?? []), time]);
    }
    return [...map.entries()]
      .filter(([, times]) => times.some((time) => !time.isFull))
      .map(([key, times]) => ({ key, times }));
  }, [info.times]);

  const genders = (["female", "male"] as const).filter((gender) =>
    info.therapists.some((therapist) => therapist.gender === gender),
  );

  const [sessionType, setSessionType] = useState<ClinicSessionType | null>(
    info.sessionTypes.length === 1 ? info.sessionTypes[0] : null,
  );
  const [gender, setGender] = useState<TherapistPreference>("any");
  const [dayKey, setDayKey] = useState(days[0]?.key ?? "");
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const day = days.find((item) => item.key === dayKey);

  function toggle(startsAt: string) {
    setError("");
    setPicked((list) => (list.includes(startsAt) ? list.filter((item) => item !== startsAt) : [...list, startsAt]));
  }

  async function send() {
    if (busy) return;
    if (!sessionType) {
      setError(t("សូមជ្រើសរើសអនឡាញ ឬជួបផ្ទាល់។", "Please choose online or in person."));
      return;
    }
    if (picked.length === 0) {
      setError(t("សូមជ្រើសរើសយ៉ាងហោចណាស់ម៉ោងមួយ។", "Please choose at least one time."));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/clinics/${slug}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionType, therapistGender: gender, times: picked, note: note.trim() }),
      });
      const data = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!response.ok) {
        setError(
          response.status === 401
            ? t("សូមចូលគណនីជាមុនសិន។", "Please log in first.")
            : (data?.error?.message ?? t("មិនអាចផ្ញើបានទេ។ សូមព្យាយាមម្តងទៀត។", "Your request could not be sent. Please try again.")),
        );
        return;
      }
      setSent(true);
    } catch {
      setError(t("មិនអាចភ្ជាប់បានទេ។ សូមព្យាយាមម្តងទៀត។", "Could not connect. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SheetDialog
      closing={closing}
      onClosed={() => onClose(sent)}
      labelledBy="clinic-booking-title"
      panelClassName="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px] sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="clinic-booking-title" className="text-xl font-bold text-ink">
            {sent ? t("បានផ្ញើសំណើ", "Request sent") : t("កក់វគ្គ", "Book a session")}
          </h2>
          <p className="text-sm text-ink-muted">{clinicName}</p>
        </div>
        <button
          type="button"
          onClick={() => setClosing(true)}
          aria-label={t("បិទ", "Close")}
          className="-mr-2 -mt-1 rounded-full p-2 text-ink-muted hover:bg-arom-wash"
        >
          <X size={20} />
        </button>
      </div>

      {sent ? (
        <div className="mt-5">
          <p className="flex items-start gap-2.5 rounded-2xl bg-arom-soft px-4 py-3 text-sm text-ink">
            <CheckCircle2 aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-arom" />
            {t(
              "គ្លីនិកនឹងជ្រើសរើសម៉ោងមួយក្នុងចំណោមម៉ោងរបស់អ្នក និងអ្នកព្យាបាល។ អ្នកនឹងឃើញចម្លើយនៅក្នុង ការណាត់ជួបរបស់ខ្ញុំ។",
              "The clinic will pick one of your times and your therapist. You will see the answer in My appointments.",
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/appointments"
              className="rounded-full bg-arom px-5 py-2.5 text-sm font-semibold text-white hover:bg-arom-deep"
            >
              {t("ការណាត់ជួបរបស់ខ្ញុំ", "My appointments")}
            </Link>
            <button
              type="button"
              onClick={() => setClosing(true)}
              className="rounded-full border border-arom-border px-5 py-2.5 text-sm text-ink hover:bg-arom-wash"
            >
              {t("បិទ", "Close")}
            </button>
          </div>
        </div>
      ) : days.length === 0 ? (
        <p className="mt-5 text-sm text-ink-muted">
          {t(
            "ម៉ោងទាំងអស់ពេញហើយក្នុងពេលនេះ។ សូមពិនិត្យម្តងទៀតនៅពេលក្រោយ។",
            "Every time is full right now. Please check again later.",
          )}
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {info.sessionTypes.length > 1 && (
            <fieldset>
              <legend className="text-sm font-semibold text-ink">{t("អនឡាញ ឬជួបផ្ទាល់?", "Online or in person?")}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {info.sessionTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={sessionType === type}
                    onClick={() => {
                      setError("");
                      setSessionType(type);
                    }}
                    className={chipClass(sessionType === type)}
                  >
                    {type === "online" ? t("អនឡាញ (Online)", "Online") : t("ជួបផ្ទាល់ (In person)", "In person")}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {genders.length > 0 && (
            <fieldset>
              <legend className="text-sm font-semibold text-ink">{t("អ្នកព្យាបាលដែលអ្នកចង់បាន", "Therapist preference")}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {[...genders, "any" as const].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={gender === value}
                    onClick={() => setGender(value)}
                    className={chipClass(gender === value)}
                  >
                    {value === "female"
                      ? t("ស្រី (Female)", "Female")
                      : value === "male"
                        ? t("ប្រុស (Male)", "Male")
                        : t("មិនខ្វល់ (No preference)", "No preference")}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-ink-muted">
                {t("គ្លីនិកនឹងសម្រេចចុងក្រោយ។", "The clinic makes the final choice.")}
              </p>
            </fieldset>
          )}

          <fieldset>
            <legend className="text-sm font-semibold text-ink">{t("ថ្ងៃ", "Day")}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {days.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={dayKey === item.key}
                  onClick={() => {
                    setError("");
                    setDayKey(item.key);
                    // Times are for one day only.
                    setPicked([]);
                  }}
                  className={chipClass(dayKey === item.key)}
                >
                  {formatClinicDay(item.times[0].startsAt, km)}
                </button>
              ))}
            </div>
          </fieldset>

          {day && (
            <fieldset>
              <legend className="text-sm font-semibold text-ink">
                {t("ម៉ោងណាដែលអ្នកអាចមកបាន? (ជ្រើសរើសបានច្រើន)", "Which times work for you? (pick one or more)")}
              </legend>
              <div className="mt-2 space-y-2">
                {day.times.map((time) => (
                  <label
                    key={time.startsAt}
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-sm ${
                      time.isFull
                        ? "cursor-not-allowed border-arom-border/60 bg-arom-wash/50 text-ink-muted"
                        : "cursor-pointer border-arom-border bg-white text-ink hover:border-arom/40"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        disabled={time.isFull}
                        checked={picked.includes(time.startsAt)}
                        onChange={() => toggle(time.startsAt)}
                        className="size-4 accent-arom"
                      />
                      {formatClinicRange(time.startsAt, time.endsAt, km)}
                    </span>
                    {time.isFull && <span className="text-xs font-semibold">{t("ពេញ", "Full")}</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <label className="block text-sm font-semibold text-ink">
            {t("កំណត់ចំណាំ (ស្រេចចិត្ត)", "Note (optional)")}
            <span className="block text-xs font-normal text-ink-muted">
              {t(
                "អ្នកព្យាបាលរបស់អ្នកនឹងឃើញកំណត់ចំណាំនេះ។",
                "Your therapist will see this note.",
              )}
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={MAX_CLINIC_NOTE}
              className="mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3 py-2 text-sm font-normal text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-arom-danger">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void send()}
            disabled={busy}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#185a4d] text-sm font-bold text-white transition-colors hover:bg-[#13463c] disabled:opacity-60"
          >
            {busy ? t("កំពុងផ្ញើ...", "Sending...") : t("ផ្ញើសំណើ", "Send request")}
          </button>
        </div>
      )}
    </SheetDialog>
  );
}
