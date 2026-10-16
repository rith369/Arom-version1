"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
export function UserAvatar({
  className = "size-10 text-sm",
  src,
}: {
  className?: string;
  src?: string | null;
}) {
  const { user, status } = useAuth();
  const initials = user ? initialsOf(user.fullName || user.email) : "";
  const imageSource = src === undefined ? user?.avatarUrl : src;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const sourceKey = `${user?.id ?? "guest"}:${imageSource ?? ""}`;
  const avatarUrl = imageSource && failedSource !== sourceKey ? imageSource : null;

  return (
    <span
      role="img"
      aria-label={user?.fullName || (status === "loading" ? "Loading profile" : "Guest")}
      className={`relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-arom-soft font-bold text-arom-deep ${
        status === "loading" ? "animate-pulse" : ""
      } ${className}`}
    >
      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt=""
          aria-hidden="true"
          fill
          unoptimized
          sizes="80px"
          onError={() => setFailedSource(sourceKey)}
          className="object-cover"
        />
      )}
      {!avatarUrl && initials ? (
        <span className="leading-none tracking-wide">{initials}</span>
      ) : !avatarUrl ? (
        <UserRound aria-hidden="true" className="size-1/2" />
      ) : null}
    </span>
  );
}
