"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../auth-provider";

const NONE: ReadonlySet<string> = new Set();

/**
 * Slugs of UP only clinics this account may see without a UP email: the
 * clinic's desk accounts and its therapists (GET /api/clinics/access).
 */
export function useClinicAccess(): ReadonlySet<string> {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState<{ userId: string; slugs: ReadonlySet<string> } | null>(null);
  const userId = user?.id ?? "";

  useEffect(() => {
    if (!userId) return;
    let active = true;
    fetch("/api/clinics/access", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { slugs: string[] };
        if (active) setAllowed({ userId, slugs: new Set(data.slugs) });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId]);

  // A result for an earlier account never applies to the next one.
  return allowed && allowed.userId === userId ? allowed.slugs : NONE;
}
