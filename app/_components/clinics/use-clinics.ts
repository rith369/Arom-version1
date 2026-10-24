"use client";

import { useEffect, useState } from "react";
import { SAMPLE_CLINICS, type Clinic } from "./clinic-data";

// Remembered while the app is open, so going back to the list is instant.
let cache: Clinic[] | null = null;

/**
 * Real clinics from the database (GET /api/clinics) first, then the sample
 * clinics. If the real ones fail to load, the samples still show.
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

  return { clinics: [...(real ?? []), ...SAMPLE_CLINICS], loaded: real !== null };
}
