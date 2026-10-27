"use client";

import { useEffect, useState } from "react";
import { LISTED_CLINICS, type Clinic } from "./clinic-data";

// Remembered while the app is open, so going back to the list is instant.
let cache: Clinic[] | null = null;

/**
 * AROM clinics from the database (GET /api/clinics) first, then the listed
 * real places in clinic-data.ts. If the database ones fail to load, the
 * listed places still show.
 */
export function useClinics(): { clinics: Clinic[]; loaded: boolean } {
  const [real, setReal] = useState<Clinic[] | null>(cache);

  useEffect(() => {
    if (cache) return;
    let active = true;
    fetch("/api/clinics", { cache: "no-store" })
      .then(async (response) => {
        const data = response.ok ? ((await response.json()) as { clinics: Clinic[] }) : { clinics: [] };
        cache = data.clinics;
        if (active) setReal(data.clinics);
      })
      .catch(() => {
        if (active) setReal([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return { clinics: [...(real ?? []), ...LISTED_CLINICS], loaded: real !== null };
}
