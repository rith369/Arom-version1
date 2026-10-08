"use client";

import { Check, PencilLine, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { UserRole } from "@/lib/auth";
import { useAuth } from "./auth-provider";
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

/** Name, email, role and join year for the signed in user, with inline name editing. */
export function ProfileSummary({ km }: { km: boolean }) {
  const { user, status, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setDraft(user?.fullName ?? "");
    setError(null);
    setEditing(true);
  };

  const saveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullName = draft.trim();
    if (fullName.length < 2 || fullName.length > 60) {
      setError(km ? "ឈ្មោះត្រូវមាន ២ ដល់ ៦០ តួអក្សរ" : "Use 2 to 60 characters.");
      return;
    }

    setSaving(true);
    const result = await updateProfile({ fullName });
    setSaving(false);

    if (result.ok) setEditing(false);
    else setError(result.message);
  };

  const joinedYear = user ? String(new Date(user.createdAt).getFullYear()) : "";
  const role = roleLabels[user?.role ?? "user"];

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
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
            {editing ? (
              <form onSubmit={saveName} className="flex items-center gap-2">
                <label htmlFor="profile-full-name" className="sr-only">
                  {km ? "ឈ្មោះពេញ (Full name)" : "Full name"}
                </label>
                <input
                  id="profile-full-name"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  autoComplete="name"
                  maxLength={60}
                  autoFocus
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "profile-name-error" : undefined}
                  className="h-9 w-full min-w-0 max-w-[14rem] rounded-xl border border-arom-border bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-arom focus:ring-2 focus:ring-arom/15"
                />
                <button
                  type="submit"
                  disabled={saving}
                  aria-label={km ? "រក្សាទុក (Save)" : "Save name"}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-arom text-white transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:opacity-60"
                >
                  <Check aria-hidden="true" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  aria-label={km ? "បោះបង់ (Cancel)" : "Cancel editing"}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-arom-border bg-white text-ink-muted transition-colors duration-150 hover:text-arom focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                >
                  <X aria-hidden="true" size={16} />
                </button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-ink sm:text-xl">
                  {user.fullName || (km ? "គ្មានឈ្មោះ" : "Add your name")}
                </h2>
                <span className="rounded-full bg-arom-soft px-2.5 py-0.5 text-[0.68rem] font-semibold text-arom-deep">
                  {km ? role.km : role.en}
                </span>
                <button
                  type="button"
                  onClick={startEditing}
                  aria-label={km ? "កែឈ្មោះ (Edit name)" : "Edit name"}
                  className="flex size-7 items-center justify-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-arom-wash hover:text-arom focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                >
                  <PencilLine aria-hidden="true" size={14} />
                </button>
              </div>
            )}
            {error && (
              <p id="profile-name-error" role="alert" className="mt-1 text-xs font-medium text-arom-danger">
                {error}
              </p>
            )}
            <p className="mt-0.5 truncate text-xs text-ink-muted sm:text-sm">{user.email}</p>
            <p className="mt-1 text-xs font-medium text-arom">
              {km
                ? `ដំណើរស្ងប់ចិត្ត (Mindful Journey) · ចាប់តាំងពីឆ្នាំ ${toKhmerDigits(joinedYear)}`
                : `Mindful Journey · Since ${joinedYear}`}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-ink sm:text-xl">{km ? "ភ្ញៀវ (Guest)" : "Guest"}</h2>
            <p className="text-xs text-ink-muted sm:text-sm">
              {km ? "ចូលគណនីដើម្បីរក្សាទុកដំណើររបស់អ្នក" : "Log in to keep your journey private and saved."}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:self-start">
        {user ? (
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-arom-border bg-white px-4 py-2 text-xs font-semibold text-ink shadow-sm transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
            >
              {km ? "ប្តូរគណនី (Switch Account)" : "Switch Account"}
            </button>
          </form>
        ) : status === "guest" ? (
          <a
            href="/login?next=%2Fprofile"
            className="rounded-full bg-arom px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
          >
            {km ? "ចូលគណនី (Log in)" : "Log in"}
          </a>
        ) : null}
      </div>
    </div>
  );
}
