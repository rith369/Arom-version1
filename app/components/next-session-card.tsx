"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, ChevronRight, MapPin } from "lucide-react";
import type { AppointmentsResponse, UserAppointment } from "@/lib/appointments";
import { hasOffice, officeLine } from "@/lib/office";
import { useAuth } from "../_components/auth-provider";
import { howSoon } from "../_components/appointments/appointment-helpers";
import { JoinButton } from "../_components/sessions/join-button";

const TIME_ZONE = "Asia/Phnom_Penh";

type NextSession = { session: UserAppointment; loadedAt: number };

/**
 * The signed in user's next booked session that has not ended yet, from
 * GET /api/appointments (their own appointments only). Null when there is none.
 */
export function useNextSession(): NextSession | null {
  const { user } = useAuth();
  const [next, setNext] = useState<NextSession | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch("/api/appointments", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as AppointmentsResponse;
        const now = Date.now();
        const session = data.appointments
          .filter((item) => item.status === "booked" && Date.parse(item.endsAt) > now)
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
        if (active) setNext(session ? { session, loadedAt: now } : null);
      })
      .catch(() => {
        // Home still works without it; My appointments shows any error.
      });
    return () => {
      active = false;
    };
  }, [user]);

  return user ? next : null;
}

export function NextSessionCard({ next, km }: { next: NextSession; km: boolean }) {
  const { session, loadedAt } = next;
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const locale = km ? "km-KH" : "en-GB";
  const professional = session.professional;
  const name = professional ? (km && professional.kmName ? professional.kmName : professional.name) : t("អ្នកជំនាញរបស់អ្នក", "Your professional");
  const day =
    howSoon(session.startsAt, loadedAt, km) ??
    new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: TIME_ZONE }).format(Date.parse(session.startsAt));
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE }).format(
    Date.parse(session.startsAt),
  );
  const office = session.sessionType === "in_person" && hasOffice(professional?.office) ? professional?.office : null;

  return (
    <section
      aria-labelledby="next-session-title"
      className="rounded-[20px] border border-[#cfe5dd] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e0f3ed] text-[#1f6f5b]">
          <CalendarCheck size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="next-session-title" className="text-xs font-semibold text-[#1f6f5b]">
            {t("វគ្គបន្ទាប់របស់អ្នក", "Your next session")}
          </h2>
          <p className="mt-0.5 truncate text-base font-semibold text-[#14221f]">{name}</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {day}, {time} ({session.sessionType === "online" ? t("អនឡាញ", "Online") : t("ជួបផ្ទាល់", "In person")})
          </p>
          {office && (
            <p className="mt-1 flex items-start gap-1 text-xs text-ink-muted">
              <MapPin size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="min-w-0">{officeLine(office)}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <JoinButton booking={session} now={loadedAt} km={km} />
        <Link
          href="/appointments"
          className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-[#1f6f5b] hover:underline"
        >
          {t("មើលព័ត៌មានលម្អិត", "See details")}
          <ChevronRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
