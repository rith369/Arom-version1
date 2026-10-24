"use client";

import { useCallback, useEffect, useState } from "react";

export type UserLocation =
  | { status: "idle" | "asking" | "denied" | "unavailable"; coords: null }
  | { status: "ready"; coords: { lat: number; lng: number } };

// Kept while the app is open, so the list and the detail page share it.
let last: UserLocation = { status: "idle", coords: null };

/**
 * The person's location, only after they allow it (Find Clinic & Hospital:
 * distance and Nearby). It stays in the browser and is never sent or saved.
 * If the browser already allows it, it is read straight away.
 */
export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(last);

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

  // Already allowed before: no need to ask again.
  useEffect(() => {
    if (last.status !== "idle" || typeof navigator === "undefined" || !navigator.permissions) return;
    let active = true;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (active && permission.state === "granted") request();
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [request]);

  return { location, request };
}
