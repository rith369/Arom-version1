"use client";

import { useEffect, useState } from "react";
import {
  MAX_RESCHEDULE_REASON,
  type AppointmentsResponse,
  type MoveTimesResponse,
  type UserAppointment,
} from "@/lib/appointments";
import { groupOpenTimes } from "@/lib/booking";
import { TimeStep } from "../therapist-booking";

type LoadState = "loading" | "ready" | "error";

/**
 * The client moves their own upcoming session to another open time with the
 * same professional. The server checks the time is still open, the session
 * type and the minimum notice (client_reschedule_appointment).
 */
export function ChangeTimePanel({
  appointment,
  km,
  onMoved,
  onClose,
}: {
  appointment: UserAppointment;
  km: boolean;
  onMoved: (next: UserAppointment[]) => void;
  onClose: () => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [state, setState] = useState<LoadState>("loading");
  const [times, setTimes] = useState<MoveTimesResponse["times"]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [date, setDate] = useState("");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/appointments/${appointment.id}/open-times`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        const data = (await response.json()) as MoveTimesResponse;
        if (!active) return;
        setTimes(data.times);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [appointment.id, reloadKey]);

  const { days, byDay } = groupOpenTimes(times);
  const activeDate = days.some((day) => day.value === date) ? date : (days[0]?.value ?? "");
  const dayTimes = byDay[activeDate] ?? [];
  const selected = dayTimes.find((slot) => slot.id === slotId) ?? null;
  const selectedDay = days.find((day) => day.value === activeDate);

  async function move() {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", slotId: selected.id, reason: reason.trim() }),
      });
      const data = (await response.json().catch(() => null)) as
        | (AppointmentsResponse & { error?: { message?: string } })
        | null;
      if (!response.ok || !data?.appointments) {
        setError(data?.error?.message ?? t("មិនអាចប្តូរម៉ោងបានទេ។ សូមព្យាយាមម្តងទៀត។", "We could not move your session. Please try again."));
        // The time may have just been taken: load fresh open times.
        setSlotId(null);
        setReloadKey((key) => key + 1);
        return;
      }
      onMoved(data.appointments);
    } catch {
      setError(t("មិនអាចប្តូរម៉ោងបានទេ។ សូមព្យាយាមម្តងទៀត។", "We could not move your session. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 min-w-0 rounded-2xl border border-arom-border p-3.5 sm:p-4">
      <p className="text-sm font-semibold text-ink">{t("ប្តូរម៉ោង", "Change time")}</p>
      <p className="mt-1 text-xs leading-5 text-ink-muted">
        {t(
          "វគ្គដដែល អ្នកជំនាញដដែល។ ម៉ោងបច្ចុប្បន្នរបស់អ្នកនឹងទំនេរវិញសម្រាប់អ្នកផ្សេង។",
          "Same session, same professional. Your current time opens up for someone else.",
        )}
      </p>

      <div className="mt-4">
        {state === "loading" && (
          <p role="status" className="text-sm text-ink-muted">
            {t("កំពុងផ្ទុកម៉ោងទំនេរ...", "Loading open times...")}
          </p>
        )}
        {state === "error" && (
          <p role="alert" className="text-sm text-arom-danger">
            {t("មិនអាចផ្ទុកម៉ោងទំនេរបានទេ។ សូមព្យាយាមម្តងទៀត។", "We could not load open times. Please try again.")}
          </p>
        )}
        {state === "ready" && (
          <TimeStep
            days={days}
            times={dayTimes}
            date={activeDate}
            time={slotId}
            onDateChange={(value) => {
              setDate(value);
              setSlotId(null);
            }}
            onTimeChange={setSlotId}
            km={km}
            idPrefix={`move-${appointment.id}`}
            emptyText={t(
              "មិនមានម៉ោងទំនេរផ្សេងទៀតនៅពេលនេះទេ។ អ្នកអាចរក្សាម៉ោងនេះ ឬផ្ញើសារទៅអ្នកជំនាញរបស់អ្នក។",
              "There are no other open times right now. You can keep this time, or message your professional.",
            )}
          />
        )}
      </div>

      {selected && (
        <label className="mt-4 block text-sm font-medium text-ink">
          {t("មូលហេតុ (ស្រេចចិត្ត អ្នកជំនាញនឹងឃើញ)", "Reason (optional, your professional will see it)")}
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            maxLength={MAX_RESCHEDULE_REASON}
            className="mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
          />
        </label>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-arom-danger">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!selected || busy}
          onClick={() => void move()}
          className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-50"
        >
          {busy
            ? t("កំពុងប្តូរ...", "Moving...")
            : selected && selectedDay
              ? `${t("ប្តូរទៅ", "Move to")} ${km ? selectedDay.kmLabel || selectedDay.label : selectedDay.label}, ${selected.label}`
              : t("ជ្រើសរើសម៉ោងថ្មី", "Choose a new time")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-arom-border px-4 py-2 text-sm text-ink hover:bg-arom-wash"
        >
          {t("រក្សាម៉ោងនេះ", "Keep this time")}
        </button>
      </div>
    </div>
  );
}
