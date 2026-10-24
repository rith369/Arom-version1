"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, CalendarX2, Clock3, MapPin, MessageCircle, Video } from "lucide-react";
import {
  formatClinicDay,
  formatClinicTime,
  type MyClinicRequest,
  type MyClinicRequestsResponse,
} from "@/lib/clinic-booking";

// How long a "times did not work" answer stays on My appointments.
const DECLINED_DAYS = 14;

/**
 * Clinic requests on My appointments (section 34): waiting ones, and recent
 * ones the clinic could not do. A confirmed request shows as a normal
 * appointment instead, so it is not repeated here.
 */
export function ClinicRequests({ km, now }: { km: boolean; now: number }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [requests, setRequests] = useState<MyClinicRequest[]>([]);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/clinic-requests", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as MyClinicRequestsResponse;
        if (active) setRequests(data.requests);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const shown = requests.filter(
    (item) =>
      item.status === "waiting" ||
      (item.status === "declined" && Date.parse(item.createdAt) > now - DECLINED_DAYS * 86_400_000),
  );
  if (shown.length === 0) return null;

  async function cancel(id: string) {
    if (busyId) return;
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/clinic-requests/${id}/cancel`, { method: "POST" });
      const data = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      if (!response.ok) {
        setError(data?.error?.message ?? t("មិនអាចបោះបង់បានទេ។ សូមព្យាយាមម្តងទៀត។", "That could not be cancelled. Please try again."));
        return;
      }
      setRequests((list) => list.map((item) => (item.id === id ? { ...item, status: "cancelled" } : item)));
    } catch {
      setError(t("មិនអាចភ្ជាប់បានទេ។ សូមព្យាយាមម្តងទៀត។", "Could not connect. Please try again."));
    } finally {
      setBusyId("");
    }
  }

  return (
    <section aria-labelledby="clinic-requests-title" className="mt-8">
      <h2 id="clinic-requests-title" className="text-lg font-bold text-ink">
        {t("សំណើទៅគ្លីនិក", "Clinic requests")}
      </h2>
      <ul className="mt-3 space-y-4">
        {shown.map((item) => {
          const clinicName = (km && item.clinicKmName) || item.clinicName;
          const waiting = item.status === "waiting";
          return (
            <li key={item.id} className="rounded-3xl border border-arom-border bg-white p-4 shadow-card sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="flex items-center gap-2 text-base font-bold text-ink">
                  <Building2 aria-hidden="true" size={18} className="shrink-0 text-arom" />
                  {clinicName}
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    waiting ? "bg-arom-warning-soft text-arom-warning" : "bg-arom-danger-soft text-arom-danger"
                  }`}
                >
                  {waiting ? t("រង់ចាំគ្លីនិក", "Waiting for the clinic") : t("ម៉ោងទាំងនេះមិនបាន", "These times did not work")}
                </span>
              </div>

              <dl className="mt-3 space-y-1.5 text-sm text-ink">
                <div className="flex items-start gap-2">
                  <Clock3 aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-arom" />
                  <dt className="sr-only">{t("ម៉ោងដែលអ្នកអាចមក", "Times you can come")}</dt>
                  <dd>
                    {formatClinicDay(item.times[0], km)}: {item.times.map((time) => formatClinicTime(time, km)).join(", ")}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  {item.sessionType === "online" ? (
                    <Video aria-hidden="true" size={16} className="shrink-0 text-arom" />
                  ) : (
                    <MapPin aria-hidden="true" size={16} className="shrink-0 text-arom" />
                  )}
                  <dt className="sr-only">{t("ប្រភេទ", "Session type")}</dt>
                  <dd>
                    {item.sessionType === "online" ? t("អនឡាញ", "Online") : t("ជួបផ្ទាល់", "In person")}
                    {item.therapistGender !== "any" &&
                      ` · ${
                        item.therapistGender === "female"
                          ? t("ចង់បានអ្នកព្យាបាលស្រី", "Prefers a female therapist")
                          : t("ចង់បានអ្នកព្យាបាលប្រុស", "Prefers a male therapist")
                      }`}
                  </dd>
                </div>
              </dl>

              {waiting ? (
                <p className="mt-3 text-sm text-ink-muted">
                  {t(
                    "គ្លីនិកនឹងជ្រើសរើសម៉ោងមួយ និងអ្នកព្យាបាល។ អ្នកនឹងឃើញវានៅទីនេះនៅពេលបានបញ្ជាក់។",
                    "The clinic will pick one time and your therapist. You will see it here once it is confirmed.",
                  )}
                </p>
              ) : (
                <div className="mt-3 flex items-start gap-2 rounded-2xl bg-arom-danger-soft/60 px-3.5 py-3 text-sm text-ink">
                  <CalendarX2 aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-arom-danger" />
                  <span>
                    {t("សូមជ្រើសរើសម៉ោងផ្សេង។", "Please choose other times.")}
                    {item.answerNote && ` ${t("សារពីគ្លីនិក", "Message from the clinic")}: ${item.answerNote}`}
                  </span>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {waiting ? (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void cancel(item.id)}
                    className="rounded-full px-4 py-2 text-sm font-medium text-arom-danger hover:bg-arom-danger-soft/60 disabled:opacity-60"
                  >
                    {busyId === item.id ? t("កំពុងបោះបង់...", "Cancelling...") : t("បោះបង់សំណើ", "Cancel request")}
                  </button>
                ) : (
                  <Link
                    href={`/clinic-hospital?clinic=${item.clinicSlug}&book=1`}
                    className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep"
                  >
                    {t("ជ្រើសរើសម៉ោងផ្សេង", "Choose other times")}
                  </Link>
                )}
                <Link
                  href={`/messages/clinic/${item.clinicSlug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash"
                >
                  <MessageCircle aria-hidden="true" size={16} className="text-arom" />
                  {t("ផ្ញើសារទៅគ្លីនិក", "Message the clinic")}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      {error && (
        <p role="alert" className="mt-3 text-sm text-arom-danger">
          {error}
        </p>
      )}
    </section>
  );
}
