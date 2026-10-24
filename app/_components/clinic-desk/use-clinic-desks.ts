"use client";

import { useEffect, useState } from "react";
import type { ClinicDesk } from "@/lib/clinic-booking";
import { useAuth } from "../auth-provider";

// Remembered for the session, so the sidebar does not ask again on every page.
let cache: { userId: string; desks: ClinicDesk[] } | null = null;

/** The clinics this account answers bookings for (GET /api/clinic-desk). Usually none. */
export function useClinicDesks(): ClinicDesk[] {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [desks, setDesks] = useState<{ userId: string; desks: ClinicDesk[] } | null>(() =>
    cache && cache.userId === userId ? cache : null,
  );

  useEffect(() => {
    if (!userId || (cache && cache.userId === userId)) return;
    let active = true;
    fetch("/api/clinic-desk", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { desks: ClinicDesk[] };
        cache = { userId, desks: data.desks };
        if (active) setDesks(cache);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId]);

  // A result for an earlier account never applies to the next one.
  if (desks && desks.userId === userId) return desks.desks;
  return cache && cache.userId === userId ? cache.desks : [];
}
