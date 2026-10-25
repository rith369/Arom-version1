"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { cambodiaDay } from "@/lib/mood";
import { dueJourneys, type SymptomChecksResponse } from "@/lib/symptom-checks";
import { useAuth } from "../_components/auth-provider";

/**
 * True when a 14 day symptom recheck is due today (Cambodia day), from
 * GET /api/symptom-checks (the person's own checks only). Home never learns
 * or shows which check it is: other people can see a phone's Home screen.
 */
export function useCheckInDue(): boolean {
  const { user } = useAuth();
  const [due, setDue] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch("/api/symptom-checks", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as SymptomChecksResponse;
        if (active) setDue(dueJourneys(data, cambodiaDay(Date.now())).length > 0);
      })
      .catch(() => {
        // Home still works without it; the symptom check page shows any error.
      });
    return () => {
      active = false;
    };
  }, [user]);

  return Boolean(user) && due;
}

export function CheckInDueCard({ km }: { km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  return (
    <section
      aria-labelledby="check-in-due-title"
      className="flex items-center gap-3 rounded-[20px] border border-[#cfe5dd] bg-white px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e0f3ed] text-[#1f6f5b]">
        <CalendarCheck size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="check-in-due-title" className="text-sm font-semibold text-[#14221f]">
          {t("ដល់ពេលពិនិត្យម្តងទៀតហើយ", "Time for your 2 week check in")}
        </h2>
        <p className="text-xs text-ink-muted">
          {t(
            "២សប្តាហ៍បានកន្លងផុតទៅហើយ ចាប់តាំងពីការពិនិត្យរោគសញ្ញាលើកមុនរបស់អ្នក។ ប្រហែល ២ នាទី។",
            "It has been 2 weeks since your last symptom check. About 2 minutes.",
          )}
        </p>
      </div>
      <Link
        href="/detection/symptoms"
        className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs font-semibold text-[#1f6f5b] hover:underline sm:text-sm"
      >
        {t("ពិនិត្យឥឡូវនេះ", "Check now")}
        <ChevronRight size={15} aria-hidden="true" />
      </Link>
    </section>
  );
}
