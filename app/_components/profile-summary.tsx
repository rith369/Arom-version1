"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useState } from "react";
import type { UserRole } from "@/lib/auth";
import { useAuth } from "./auth-provider";
import { ProfileEditorDialog } from "./profile-editor-dialog";
import { UserAvatar } from "./user-avatar";

const roleLabels: Record<UserRole, { en: string; km: string }> = {
  user: { en: "Member", km: "សមាជិក (Member)" },
  professional: { en: "Professional", km: "អ្នកជំនាញ (Professional)" },
  admin: { en: "Admin", km: "អ្នកគ្រប់គ្រង (Admin)" },
};

const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

function toKhmerDigits(value: string) {
  return value.replace(/[0-9]/g, (digit) => khmerDigits[Number(digit)] ?? digit);
}

/** Name, email, role and join year for the signed in user. */
export function ProfileSummary({ km }: { km: boolean }) {
  const { user, status } = useAuth();
  const [editorOpen, setEditorOpen] = useState(false);
  const joinedYear = user ? String(new Date(user.createdAt).getFullYear()) : "";
  const role = roleLabels[user?.role ?? "user"];

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative shrink-0">
            <UserAvatar className="size-16 rounded-full text-xl ring-4 ring-white shadow-md sm:size-20" />
            {user && (
              <span
                aria-label="Online"
                className="absolute bottom-0 right-0 size-4 rounded-full border-2 border-white bg-arom-accent"
              />
            )}
          </div>

          {status === "loading" ? (
            <div aria-busy="true" aria-label="Loading profile" className="space-y-2">
              <div className="h-5 w-40 animate-pulse rounded-full bg-arom-soft" />
              <div className="h-3.5 w-52 animate-pulse rounded-full bg-arom-wash" />
              <div className="h-3 w-32 animate-pulse rounded-full bg-arom-wash" />
            </div>
          ) : user ? (
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-ink sm:text-xl">
                  {user.fullName || (km ? "គ្មានឈ្មោះ" : "Add your name")}
                </h2>
                <span className="rounded-full bg-arom-soft px-2.5 py-0.5 text-[0.68rem] font-semibold text-arom-deep">
                  {km ? role.km : role.en}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-ink-muted sm:text-sm">
                {user.email}
              </p>
              <p className="mt-1 text-xs font-medium text-arom">
                {km
                  ? `ដំណើរស្ងប់ចិត្ត (Mindful Journey) · ចាប់តាំងពីឆ្នាំ ${toKhmerDigits(joinedYear)}`
                  : `Mindful Journey · Since ${joinedYear}`}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-ink sm:text-xl">
                {km ? "ភ្ញៀវ (Guest)" : "Guest"}
              </h2>
              <p className="text-xs text-ink-muted sm:text-sm">
                {km
                  ? "ចូលគណនីដើម្បីរក្សាទុកដំណើររបស់អ្នក"
                  : "Log in to keep your journey private and saved."}
              </p>
            </div>
          )}
        </div>

        {user ? (
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            aria-haspopup="dialog"
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-arom-border bg-white px-4 py-2 text-xs font-semibold text-ink shadow-sm transition-colors duration-150 hover:bg-arom-wash hover:text-arom focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom sm:text-sm"
          >
            <UserRound aria-hidden="true" size={16} />
            {km ? "កែប្រែប្រវត្តិរូប (Edit Profile)" : "Edit Profile"}
          </button>
        ) : status === "guest" ? (
          <Link
            href="/login?next=%2Fprofile"
            className="inline-flex min-h-10 items-center justify-center self-start rounded-full bg-arom px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
          >
            {km ? "ចូលគណនី (Log in)" : "Log in"}
          </Link>
        ) : null}
      </div>

      {user && editorOpen && (
        <ProfileEditorDialog
          open
          onOpenChange={setEditorOpen}
          km={km}
        />
      )}
    </>
  );
}
