"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX2,
  CheckCircle2,
  Clock3,
  LifeBuoy,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRound,
  Video,
} from "lucide-react";
import {
  MAX_CANCEL_REASON,
  type AppointmentsResponse,
  type UserAppointment,
} from "@/lib/appointments";
import { timeRangeLabel } from "@/lib/booking";
import type { MyReview, MyReviewsResponse } from "@/lib/reviews";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { useLanguage } from "../language-provider";
import { JoinButton } from "../sessions/join-button";
import { downloadCalendarFile, howSoon } from "./appointment-helpers";
import { ChangeTimePanel } from "./change-time-panel";
import { OfficeCard } from "../office-card";
import { ReviewPanel } from "./review-panel";

const TIME_ZONE = "Asia/Phnom_Penh";

type LoadState = "loading" | "ready" | "error";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Appointments" />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
      <MobileNavigation active="Appointments" />
    </div>
  );
}

function useFormats(km: boolean) {
  const locale = km ? "km-KH" : "en-GB";
  return {
    day: new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE }),
    short: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE }),
  };
}

async function send(id: string, body: Record<string, unknown>) {
  try {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => null)) as
      | (AppointmentsResponse & { error?: { message?: string } })
      | null;
    if (!response.ok || !data?.appointments) {
      return { ok: false as const, message: data?.error?.message ?? null };
    }
    return { ok: true as const, appointments: data.appointments };
  } catch {
    return { ok: false as const, message: null };
  }
}

function AppointmentCard({
  appointment,
  now,
  onChange,
  review,
  onReviewsChange,
}: {
  appointment: UserAppointment;
  now: number;
  onChange: (next: UserAppointment[]) => void;
  // Set on the latest completed session with each professional: their one review, or null for none yet.
  review?: MyReview | null;
  onReviewsChange?: (next: MyReview[]) => void;
}) {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const formats = useFormats(km);

  const [cancelling, setCancelling] = useState(false);
  const [moving, setMoving] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sharingOpen, setSharingOpen] = useState(false);
  const [sharingSaving, setSharingSaving] = useState(false);
  const [sharingSaved, setSharingSaved] = useState(false);

  // The "Saved" note fades after a moment.
  useEffect(() => {
    if (!sharingSaved) return;
    const id = window.setTimeout(() => setSharingSaved(false), 2500);
    return () => window.clearTimeout(id);
  }, [sharingSaved]);

  const professional = appointment.professional;
  const name = professional ? (km && professional.kmName) || professional.name : t("អ្នកជំនាញ", "Professional");
  const title = professional ? (km && professional.kmTitle) || professional.title : "";
  const start = new Date(appointment.startsAt);
  const upcoming = appointment.status === "booked" && Date.parse(appointment.endsAt) > now;
  const canCancel = appointment.status === "booked" && Date.parse(appointment.startsAt) > now;
  // Moving closes at the professional's minimum notice; cancelling stays open until the start.
  const canChangeTime =
    canCancel && professional !== null && appointment.changeTimeUntil !== null && Date.parse(appointment.changeTimeUntil) > now;
  const tooLateToChange = canCancel && professional !== null && !canChangeTime;
  const canShare = appointment.status === "booked" || appointment.status === "completed";
  const soon = upcoming ? howSoon(appointment.startsAt, now, km) : null;
  const sharedItems = [
    appointment.shareSurvey && t("ការស្ទង់មតិដំបូង", "first survey"),
    appointment.shareSymptomChecks && t("លទ្ធផលពិនិត្យរោគសញ្ញា", "symptom check results"),
    appointment.shareMoodTrend && t("ការកត់ត្រាអារម្មណ៍", "mood check ins"),
  ].filter(Boolean);
  const fallback = t("មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។", "That could not be saved. Please try again.");

  const statusLabel: Record<UserAppointment["status"], { text: string; tone: string }> = {
    booked: upcoming
      ? { text: t("បានកក់", "Booked"), tone: "bg-arom-soft text-arom-deep" }
      : { text: t("រង់ចាំលទ្ធផល", "Waiting for outcome"), tone: "bg-arom-wash text-ink-muted" },
    completed: { text: t("បានបញ្ចប់", "Completed"), tone: "bg-arom-wash text-ink-muted" },
    cancelled: { text: t("បានបោះបង់", "Cancelled"), tone: "bg-arom-danger-soft text-arom-danger" },
    no_show: { text: t("មិនបានចូលរួម", "Missed"), tone: "bg-arom-warning-soft text-arom-warning" },
  };
  const status = statusLabel[appointment.status];

  async function cancel() {
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await send(appointment.id, { action: "cancel", reason: reason.trim() });
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? fallback);
      return;
    }
    setCancelling(false);
    onChange(result.appointments);
  }

  async function share(change: { shareSurvey?: boolean; shareSymptomChecks?: boolean; shareMoodTrend?: boolean }) {
    if (sharingSaving) return;
    setError("");
    setSharingSaved(false);
    setSharingSaving(true);
    const result = await send(appointment.id, {
      action: "sharing",
      shareSurvey: change.shareSurvey ?? appointment.shareSurvey,
      shareSymptomChecks: change.shareSymptomChecks ?? appointment.shareSymptomChecks,
      shareMoodTrend: change.shareMoodTrend ?? appointment.shareMoodTrend,
    });
    setSharingSaving(false);
    if (!result.ok) {
      setError(result.message ?? fallback);
      return;
    }
    setSharingSaved(true);
    onChange(result.appointments);
  }

  return (
    <li className="rounded-3xl border border-arom-border bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-arom-soft sm:size-16">
          {professional?.photoUrl ? (
            <Image src={professional.photoUrl} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <UserRound aria-hidden="true" size={26} className="absolute inset-0 m-auto text-arom" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-bold text-ink">{name}</p>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.tone}`}>{status.text}</span>
          </div>
          {title && <p className="text-sm text-ink-muted">{title}</p>}

          <dl className="mt-3 grid gap-1.5 text-sm text-ink sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarCheck aria-hidden="true" size={16} className="shrink-0 text-arom" />
              <dt className="sr-only">{t("ថ្ងៃ", "Date")}</dt>
              <dd className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {formats.day.format(start)}
                {soon && (
                  <span className="rounded-full bg-arom-wash px-2 py-0.5 text-xs font-semibold text-arom-deep">{soon}</span>
                )}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock3 aria-hidden="true" size={16} className="shrink-0 text-arom" />
              <dt className="sr-only">{t("ម៉ោង", "Time")}</dt>
              <dd>
                {timeRangeLabel(appointment.startsAt, appointment.endsAt, km)} {t("ម៉ោងកម្ពុជា", "Cambodia time")}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              {appointment.sessionType === "online" ? (
                <Video aria-hidden="true" size={16} className="shrink-0 text-arom" />
              ) : (
                <MapPin aria-hidden="true" size={16} className="shrink-0 text-arom" />
              )}
              <dt className="sr-only">{t("ប្រភេទ", "Session type")}</dt>
              <dd>{appointment.sessionType === "online" ? t("អនឡាញ", "Online") : t("ជួបផ្ទាល់", "In person")}</dd>
            </div>
          </dl>
        </div>
      </div>

      {appointment.sessionType === "in_person" && appointment.status === "booked" && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-arom-wash/70 px-3.5 py-3">
          <MapPin aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-arom" />
          {professional?.office ? (
            <OfficeCard office={professional.office} km={km} />
          ) : (
            <p className="text-sm text-ink-muted">
              {t(
                "អ្នកជំនាញមិនទាន់បន្ថែមអាសយដ្ឋានទេ។ សូមផ្ញើសារសួរពួកគេ។",
                "Your professional has not added an address yet. Please message them to ask.",
              )}
            </p>
          )}
        </div>
      )}

      {appointment.rescheduledFrom && appointment.status === "booked" && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-arom-warning-soft px-3.5 py-3 text-sm text-ink">
          <CalendarClock aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-arom-warning" />
          <span>
            {appointment.rescheduledBy === "you"
              ? t("អ្នកបានប្តូរវគ្គនេះពី", "You moved this session from")
              : t("អ្នកជំនាញបានប្តូរពេលពី", "Your professional moved this session from")}{" "}
            {formats.short.format(new Date(appointment.rescheduledFrom))}.
            {appointment.rescheduleReason && ` ${t("មូលហេតុ", "Reason")}: ${appointment.rescheduleReason}`}
          </span>
        </p>
      )}

      {appointment.status === "cancelled" && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-arom-danger-soft/60 px-3.5 py-3 text-sm text-ink">
          <CalendarX2 aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-arom-danger" />
          <span>
            {appointment.cancelledBy === "you"
              ? t("អ្នកបានបោះបង់វគ្គនេះ។", "You cancelled this session.")
              : appointment.cancelledBy === "professional"
                ? t("អ្នកជំនាញបានបោះបង់វគ្គនេះ។", "Your professional cancelled this session.")
                : t("ក្រុម AROM បានបោះបង់វគ្គនេះ។", "The AROM team cancelled this session.")}
            {appointment.cancelReason && ` ${t("មូលហេតុ", "Reason")}: ${appointment.cancelReason}`}
          </span>
        </p>
      )}

      {upcoming && appointment.sessionType === "online" && !appointment.meetingUrl && (
        <p className="mt-4 text-sm text-ink-muted">
          {t(
            "អ្នកជំនាញនឹងបន្ថែមតំណប្រជុំមុនពេលវគ្គចាប់ផ្តើម។",
            "Your professional will add the meeting link before the session.",
          )}
        </p>
      )}

      {professional && review !== undefined && onReviewsChange && (
        <ReviewPanel
          slug={professional.slug}
          professionalName={name}
          review={review}
          km={km}
          onChange={onReviewsChange}
        />
      )}

      {canShare && (
        <div className="mt-4 min-w-0 rounded-2xl bg-arom-wash/70 px-3.5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="flex min-w-0 items-start gap-2 text-sm text-ink">
              <ShieldCheck aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-arom" />
              <span>
                {sharedItems.length > 0
                  ? `${t("បានចែករំលែក", "Shared")}: ${sharedItems.join(", ")}`
                  : t("មិនបានចែករំលែកអ្វីទេ", "Nothing shared")}
              </span>
            </p>
            <div className="flex items-center gap-2">
              {sharingSaved && (
                <span role="status" className="flex items-center gap-1 text-xs font-semibold text-arom-deep">
                  <CheckCircle2 aria-hidden="true" size={14} />
                  {t("បានរក្សាទុក", "Saved")}
                </span>
              )}
              <button
                type="button"
                aria-expanded={sharingOpen}
                aria-controls={`sharing-${appointment.id}`}
                onClick={() => setSharingOpen((open) => !open)}
                className="rounded-full px-2.5 py-1 text-sm font-semibold text-arom hover:bg-white"
              >
                {sharingOpen ? t("រួចរាល់", "Done") : t("ប្តូរ", "Change")}
              </button>
            </div>
          </div>

          {sharingOpen && (
            <fieldset id={`sharing-${appointment.id}`} className="mt-2 min-w-0">
              <legend className="sr-only">{t("ចែករំលែកជាមួយអ្នកជំនាញនេះ", "Share with this professional")}</legend>
              <p className="text-xs leading-5 text-ink-muted">
                {t(
                  "ជម្រើសរបស់អ្នក។ អ្នកអាចបិទវាបានគ្រប់ពេល។ កំណត់ហេតុរបស់អ្នក មិនត្រូវបានចែករំលែកឡើយ។",
                  "Your choice, and you can turn it off at any time. Your journal is never shared.",
                )}
              </p>
              <div className="mt-2.5 space-y-2 text-sm text-ink">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={appointment.shareSurvey}
                    disabled={sharingSaving}
                    onChange={(event) => void share({ shareSurvey: event.target.checked })}
                    className="size-4 accent-arom"
                  />
                  {t("ការស្ទង់មតិដំបូងរបស់ខ្ញុំ", "My first survey")}
                </label>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={appointment.shareSymptomChecks}
                    disabled={sharingSaving}
                    onChange={(event) => void share({ shareSymptomChecks: event.target.checked })}
                    className="size-4 accent-arom"
                  />
                  {t("លទ្ធផលពិនិត្យរោគសញ្ញារបស់ខ្ញុំ", "My symptom check results")}
                </label>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={appointment.shareMoodTrend}
                    disabled={sharingSaving}
                    onChange={(event) => void share({ shareMoodTrend: event.target.checked })}
                    aria-describedby={`mood-share-${appointment.id}`}
                    className="mt-0.5 size-4 accent-arom"
                  />
                  <span>
                    {t("ការកត់ត្រាអារម្មណ៍របស់ខ្ញុំ", "My mood check ins")}
                    <span id={`mood-share-${appointment.id}`} className="block text-xs text-ink-muted">
                      {t(
                        "អារម្មណ៍ ៣០ ថ្ងៃចុងក្រោយ។ មានតែអារម្មណ៍ មិនមែនកំណត់ហេតុឡើយ។",
                        "Your last 30 days of moods. Moods only, never your journal.",
                      )}
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>
          )}
        </div>
      )}

      {tooLateToChange && (
        <p className="mt-4 text-sm text-ink-muted">
          {t(
            "ជិតដល់ពេលវគ្គពេកហើយ មិនអាចប្តូរម៉ោងបានទេ។ អ្នកនៅតែអាចបោះបង់ ឬផ្ញើសារទៅអ្នកជំនាញរបស់អ្នក។",
            "It is too close to your session to change the time. You can still cancel it, or message your professional.",
          )}
        </p>
      )}

      {moving && canChangeTime && (
        <ChangeTimePanel
          appointment={appointment}
          km={km}
          onClose={() => setMoving(false)}
          onMoved={(next) => {
            setMoving(false);
            onChange(next);
          }}
        />
      )}

      {cancelling && (
        <div className="mt-4 rounded-2xl border border-arom-danger/20 p-3.5">
          <label className="block text-sm font-medium text-ink">
            {t("មូលហេតុ (ស្រេចចិត្ត អ្នកជំនាញនឹងឃើញ)", "Reason (optional, your professional will see it)")}
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
              maxLength={MAX_CANCEL_REASON}
              className="mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void cancel()}
              className="rounded-full bg-arom-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy ? t("កំពុងបោះបង់...", "Cancelling...") : t("បោះបង់វគ្គនេះ", "Cancel this session")}
            </button>
            <button
              type="button"
              onClick={() => setCancelling(false)}
              className="rounded-full border border-arom-border px-4 py-2 text-sm text-ink hover:bg-arom-wash"
            >
              {t("រក្សាវគ្គទុក", "Keep it")}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-arom-danger">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <JoinButton booking={appointment} now={now} km={km} />
        {professional && canShare && (
          <Link
            href={`/messages/${professional.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash"
          >
            <MessageCircle aria-hidden="true" size={16} className="text-arom" />
            {t("ផ្ញើសារ", "Message")}
          </Link>
        )}
        {upcoming && (
          <button
            type="button"
            onClick={() => downloadCalendarFile(appointment, name, km)}
            className="inline-flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash"
          >
            <CalendarPlus aria-hidden="true" size={16} className="text-arom" />
            {t("បញ្ចូលក្នុងប្រតិទិន", "Add to calendar")}
          </button>
        )}
        {professional && (
          <Link
            href={`/professional/${professional.slug}`}
            className="rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash"
          >
            {t("មើលប្រវត្តិរូប", "View profile")}
          </Link>
        )}
        {canChangeTime && !moving && (
          <button
            type="button"
            onClick={() => {
              setCancelling(false);
              setMoving(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash"
          >
            <CalendarClock aria-hidden="true" size={16} className="text-arom" />
            {t("ប្តូរម៉ោង", "Change time")}
          </button>
        )}
        {canCancel && !cancelling && (
          <button
            type="button"
            onClick={() => {
              setMoving(false);
              setCancelling(true);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-arom-danger hover:bg-arom-danger-soft/60"
          >
            {t("បោះបង់", "Cancel")}
          </button>
        )}
      </div>
    </li>
  );
}

export function UserAppointments() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [now] = useState(() => Date.now());
  // Null until loaded, and if they fail to load the review boxes stay hidden.
  const [reviews, setReviews] = useState<MyReview[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/appointments", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        const data = (await response.json()) as AppointmentsResponse;
        if (!active) return;
        setAppointments(data.appointments);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });
    fetch("/api/reviews", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as MyReviewsResponse;
        if (active) setReviews(data.reviews);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // One review per professional, offered on the latest completed session with them
  // (appointments come newest first).
  const reviewOn = new Map<string, string>();
  for (const item of appointments) {
    if (item.status === "completed" && item.professional && !reviewOn.has(item.professional.slug)) {
      reviewOn.set(item.professional.slug, item.id);
    }
  }
  function reviewFor(item: UserAppointment) {
    const slug = item.professional?.slug;
    if (!reviews || !slug || reviewOn.get(slug) !== item.id) return undefined;
    return reviews.find((review) => review.professionalSlug === slug) ?? null;
  }

  const upcoming = appointments
    .filter((item) => item.status === "booked" && Date.parse(item.endsAt) > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = appointments.filter((item) => !upcoming.includes(item));

  return (
    <Shell>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t("ការណាត់ជួបរបស់ខ្ញុំ", "My appointments")}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t("វគ្គដែលអ្នកបានកក់ជាមួយអ្នកជំនាញ។", "The sessions you booked with a professional.")}
      </p>

      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-arom-danger-soft/60 px-4 py-3 text-sm text-ink">
        <LifeBuoy aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-arom-danger" />
        <span>
          {t(
            "ប្រសិនបើអ្នកមានគ្រោះថ្នាក់ឥឡូវនេះ កុំរង់ចាំវគ្គ។ ",
            "If you are in danger right now, do not wait for your session. ",
          )}
          <Link href="/profile#get-help-title" className="font-semibold text-arom-danger underline">
            {t("ជំនួយបន្ទាន់", "Get help now")}
          </Link>
        </span>
      </p>

      {state === "loading" && (
        <p role="status" className="mt-8 text-sm text-ink-muted">
          {t("កំពុងផ្ទុក...", "Loading...")}
        </p>
      )}

      {state === "error" && (
        <p role="alert" className="mt-8 text-sm text-arom-danger">
          {t("មិនអាចផ្ទុកការណាត់ជួបបានទេ។ សូមផ្ទុកទំព័រម្តងទៀត។", "We could not load your appointments. Please reload the page.")}
        </p>
      )}

      {state === "ready" && (
        <>
          <section aria-labelledby="upcoming-title" className="mt-8">
            <h2 id="upcoming-title" className="text-lg font-bold text-ink">
              {t("នាពេលខាងមុខ", "Upcoming")}
            </h2>
            {upcoming.length === 0 ? (
              <div className="mt-3 rounded-3xl border border-dashed border-arom/30 bg-white px-6 py-10 text-center">
                <p className="font-semibold text-ink">{t("មិនមានវគ្គខាងមុខទេ", "No upcoming sessions")}</p>
                <Link
                  href="/professional"
                  className="mt-4 inline-block rounded-full bg-arom px-5 py-2.5 text-sm font-semibold text-white hover:bg-arom-deep"
                >
                  {t("ស្វែងរកអ្នកជំនាញ", "Find a professional")}
                </Link>
              </div>
            ) : (
              <ul className="mt-3 space-y-4">
                {upcoming.map((item) => (
                  <AppointmentCard key={item.id} appointment={item} now={now} onChange={setAppointments} />
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section aria-labelledby="past-title" className="mt-10">
              <h2 id="past-title" className="text-lg font-bold text-ink">
                {t("ពីមុន", "Past and cancelled")}
              </h2>
              <ul className="mt-3 space-y-4">
                {past.map((item) => (
                  <AppointmentCard
                    key={item.id}
                    appointment={item}
                    now={now}
                    onChange={setAppointments}
                    review={reviewFor(item)}
                    onReviewsChange={setReviews}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </Shell>
  );
}
