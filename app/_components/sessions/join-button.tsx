"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import type { ProBooking } from "../../pro/_data/bookings";
import { JOIN_OPENS_MINUTES, joinState } from "../../pro/_data/schedule";

// Opens the session's meeting room. Only active from shortly before the start.
// Keeps its own clock so it turns on without a refresh.
// Only the fields the button needs, so the user's own appointments can use it too.
type JoinableSession = Pick<ProBooking, "sessionType" | "meetingUrl" | "startsAt" | "durationMinutes" | "status">;

export function JoinButton({ booking, now, km, size = "md" }: { booking: JoinableSession; now: number; km: boolean; size?: "sm" | "md" }) {
  const [current, setCurrent] = useState(now);
  useEffect(() => {
    const id = window.setInterval(() => setCurrent(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  if (booking.sessionType !== "online" || !booking.meetingUrl) return null;
  const state = joinState(booking, current);
  if (state === "ended") return null;
  // Small buttons sit in lists, where the "opens before" note is just noise.
  if (state === "early" && size === "sm") return null;
  const sizing = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";
  return state === "open" ? (
    <a
      href={booking.meetingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-full bg-arom font-semibold text-white hover:bg-arom-deep ${sizing}`}>
      <Video size={size === "sm" ? 13 : 16} aria-hidden="true" />
      {km ? "ចូលរួមវគ្គ" : "Join session"}
    </a>
  ) : (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-arom-wash font-medium text-ink-muted ${sizing}`}>
      <Video size={size === "sm" ? 13 : 16} aria-hidden="true" />
      {km ? `បើក ${JOIN_OPENS_MINUTES} នាទីមុន` : `Join opens ${JOIN_OPENS_MINUTES} min before`}
    </span>
  );
}
