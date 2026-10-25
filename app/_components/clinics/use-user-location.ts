"use client";

import { useCallback, useEffect, useState } from "react";

export type UserLocation =
  | { status: "idle" | "asking" | "denied" | "unavailable"; coords: null }
  | { status: "ready"; coords: { lat: number; lng: number } };

// Kept while the app is open, so the list and the detail page share it.
let last: UserLocation = { status: "idle", coords: null };

// "Not now" on the location popup: not asked again until the app is opened again.
const SKIPPED_KEY = "arom:clinic-location-skipped";

function skippedThisVisit() {
  try {
    return sessionStorage.getItem(SKIPPED_KEY) === "1";
  } catch {
    return false;
  }
}

/** The person chose "Not now" on the location popup. */
export function skipLocationAsk() {
  try {
    sessionStorage.setItem(SKIPPED_KEY, "1");
  } catch {
    // Private mode: the popup may show again, which is fine.
  }
}

/**
 * The person's location, only after they allow it (Find Clinic & Hospital:
 * distance and Nearby). It stays in the browser and is never sent or saved.
 * If the browser already allows it, it is read straight away. `shouldAsk` is
 * true when the browser has not been asked yet, so the page can explain why
 * before the browser's own question shows.
 */
export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(last);
  const [shouldAsk, setShouldAsk] = useState(false);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      last = { status: "unavailable", coords: null };
      setLocation(last);
      return;
    }
    last = { status: "asking", coords: null };
    setLocation(last);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        last = { status: "ready", coords: { lat: position.coords.latitude, lng: position.coords.longitude } };
        setLocation(last);
      },
      (error) => {
        last = { status: error.code === error.PERMISSION_DENIED ? "denied" : "unavailable", coords: null };
        setLocation(last);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }, []);

  // Already allowed before: no need to ask again. Not asked yet: offer the popup.
  useEffect(() => {
    if (last.status !== "idle" || typeof navigator === "undefined" || !navigator.geolocation) return;
    let active = true;
    const offer = () => {
      if (active && !skippedThisVisit()) setShouldAsk(true);
    };
    if (!navigator.permissions) {
      offer();
      return;
    }
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (!active) return;
        if (permission.state === "granted") request();
        else if (permission.state === "prompt") offer();
      })
      .catch(offer);
    return () => {
      active = false;
    };
  }, [request]);

  return { location, request, shouldAsk };
}
