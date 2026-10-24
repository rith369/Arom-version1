"use client";

import { useState } from "react";
import { MAX_NICKNAME, nicknameProblem, nicknameProblemText } from "@/lib/nickname";
import { useAuth } from "./auth-provider";

/** Saves the nickname to the profile. Empty clears it (back to "Anonymous"). */
export async function saveNickname(value: string): Promise<{ ok: true } | { ok: false; message: string | null }> {
  try {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: value.trim() }),
    });
    if (response.ok) return { ok: true };
    const data = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    return { ok: false, message: data?.error?.message ?? null };
  } catch {
    return { ok: false, message: null };
  }
}

/**
 * "Name your therapist sees" in Profile, Identity privacy (section 29). Shown
 * while the person hides their identity; empty means "Anonymous".
 */
export function NicknameSetting({ km }: { km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const { user, refresh } = useAuth();
  const saved = user?.nickname ?? "";
  const [value, setValue] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const problem = nicknameProblem(value);
  const changed = value.trim() !== saved;

  async function save() {
    if (busy || !changed) return;
    if (problem) {
      setMessage({ tone: "error", text: nicknameProblemText(problem, km) });
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await saveNickname(value);
    setBusy(false);
    if (!result.ok) {
      setMessage({ tone: "error", text: t("មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។", "Could not save. Please try again.") });
      return;
    }
    setMessage({ tone: "ok", text: t("បានរក្សាទុក", "Saved") });
    void refresh();
  }

  return (
    <div className="mt-4">
      <label htmlFor="nickname" className="block text-sm font-semibold text-ink">
        {t("ឈ្មោះដែលអ្នកព្យាបាលឃើញ (ស្រេចចិត្ត)", "Name your therapist sees (optional)")}
      </label>
      <p className="mt-0.5 text-xs leading-5 text-ink-muted">
        {t(
          "ឧទាហរណ៍ ឈ្មោះហៅក្រៅ។ អ្នកព្យាបាល តុបម្រើគ្លីនិក និងក្រុមគាំទ្រនឹងឃើញវា ជំនួសឱ្យ \"អនាមិក\"។ ទុកទទេ ដើម្បីនៅតែអនាមិក។",
          'For example a nickname. Therapists, the clinic desk and support groups see it instead of "Anonymous". Leave it empty to stay Anonymous.',
        )}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          id="nickname"
          value={value}
          maxLength={MAX_NICKNAME}
          onChange={(event) => {
            setMessage(null);
            setValue(event.target.value);
          }}
          placeholder={t("ឧ. ម៉ូនី", "For example: Mony")}
          className="min-w-0 flex-1 rounded-xl border border-arom-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy || !changed}
          className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-50"
        >
          {busy ? t("កំពុងរក្សាទុក...", "Saving...") : t("រក្សាទុក", "Save")}
        </button>
      </div>
      {message && (
        <p role={message.tone === "error" ? "alert" : "status"} className={`mt-1.5 text-xs ${message.tone === "error" ? "text-arom-danger" : "text-arom-deep"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
