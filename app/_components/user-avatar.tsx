"use client";

import { UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

/**
 * Initials avatar for the signed in user. Guests and loading states show a
 * neutral person icon. Size and ring come from `className`.
 */
export function UserAvatar({ className = "size-10 text-sm" }: { className?: string }) {
  const { user, status } = useAuth();
  const initials = user ? initialsOf(user.fullName || user.email) : "";

  return (
    <span
      role="img"
      aria-label={user?.fullName || (status === "loading" ? "Loading profile" : "Guest")}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full bg-arom-soft font-bold text-arom-deep ${
        status === "loading" ? "animate-pulse" : ""
      } ${className}`}
    >
      {initials ? (
        <span className="leading-none tracking-wide">{initials}</span>
      ) : (
        <UserRound aria-hidden="true" className="size-1/2" />
      )}
    </span>
  );
}
