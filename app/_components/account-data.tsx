"use client";

import { LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { AuthErrorBody, AuthErrorCode } from "@/lib/auth";
import { AuthInput } from "./auth/auth-input";
import { useAuth } from "./auth-provider";

/** Download my data and Delete my account in Profile. */
export function AccountData({ km }: { km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!user) return null;

  const kmErrors: Partial<Record<AuthErrorCode, string>> = {
    invalid_credentials: "ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។",
    upcoming_sessions: "អ្នកមានវគ្គនាពេលខាងមុខ។ សូមលុបចោលវាជាមុនសិន ដើម្បីកុំឱ្យអ្នកព្យាបាលរបស់អ្នករង់ចាំ។",
    staff_account: "គណនីនេះជួយអ្នកដទៃ ដូច្នេះត្រូវឱ្យក្រុម AROM ជាអ្នកលុប។ សូមទាក់ទងផ្នែកជំនួយ AROM។",
    reauth_required: "ដើម្បីសុវត្ថិភាព សូមចាកចេញ ចូលម្តងទៀត ហើយសាកល្បងក្នុងរយៈពេល ១៥ នាទី។",
    rate_limited: "ព្យាយាមច្រើនពេក។ សូមរង់ចាំបន្តិច។",
  };

  async function download() {
    setDownloading(true);
    setDownloadError("");
    try {
      const response = await fetch("/api/account/export");
      if (!response.ok) throw new Error("export failed");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `arom-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(t("មិនអាចរៀបចំទិន្នន័យបានទេ។ សូមព្យាយាមម្តងទៀត។", "Your data could not be prepared. Please try again."));
    } finally {
      setDownloading(false);
    }
  }

  async function remove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (deleting || confirm !== "DELETE") return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm, password: password || undefined }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as AuthErrorBody | null;
        const code = body?.error.code;
        setDeleteError(
          km
            ? (code && kmErrors[code]) ?? "មិនអាចលុបគណនីបានទេ។ សូមព្យាយាមម្តងទៀត។"
            : body?.error.message ?? "Your account could not be deleted. Please try again.",
        );
        setDeleting(false);
        return;
      }
      // Nothing of this person stays in this browser.
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch {
        // Private mode can block storage.
      }
      window.location.replace("/login?deleted=1");
    } catch {
      setDeleteError(t("មិនមានការតភ្ជាប់អ៊ីនធឺណិតទេ។ សូមព្យាយាមម្តងទៀត។", "You seem to be offline. Please try again."));
      setDeleting(false);
    }
  }

  return (
    <div className="mt-2 space-y-5">
      <div>
        <p className="text-sm font-semibold text-ink">{t("ទាញយកទិន្នន័យរបស់ខ្ញុំ", "Download my data")}</p>
        <p className="mt-0.5 text-xs leading-5 text-ink-muted">
          {t(
            "ឯកសារមួយដែលមានកំណត់ហេតុ អារម្មណ៍ លទ្ធផលតេស្ត ការកក់ និងសាររបស់អ្នក។ វាមានព័ត៌មានឯកជន ដូច្នេះសូមរក្សាវាឱ្យមានសុវត្ថិភាព។",
            "A file with your journal, moods, screening results, bookings and messages. It holds private information, so keep it safe.",
          )}
        </p>
        <button
          type="button"
          onClick={() => void download()}
          disabled={downloading}
          className="mt-2 rounded-full border border-arom-border px-4 py-2 text-sm font-semibold text-ink hover:bg-arom-wash disabled:opacity-50"
        >
          {downloading ? t("កំពុងរៀបចំ…", "Preparing…") : t("ទាញយកទិន្នន័យរបស់ខ្ញុំ", "Download my data")}
        </button>
        {downloadError && (
          <p role="alert" className="mt-2 text-xs text-arom-danger">
            {downloadError}
          </p>
        )}
      </div>

      <div className="border-t border-arom-border/60 pt-5">
        <p className="text-sm font-semibold text-arom-danger">{t("លុបគណនីរបស់ខ្ញុំ", "Delete my account")}</p>
        {user.role !== "user" ? (
          <p className="mt-0.5 text-xs leading-5 text-ink-muted">
            {t(
              "គណនីនេះជួយអ្នកដទៃ ដូច្នេះត្រូវឱ្យក្រុម AROM ជាអ្នកលុប។ សូមទាក់ទងផ្នែកជំនួយ AROM។",
              "This account helps other people, so its removal must be done by the AROM team. Please contact AROM support.",
            )}
          </p>
        ) : !open ? (
          <>
            <p className="mt-0.5 text-xs leading-5 text-ink-muted">
              {t("ការនេះមិនអាចត្រឡប់វិញបានទេ។", "This cannot be undone.")}
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-2 rounded-full border border-arom-danger/40 px-4 py-2 text-sm font-semibold text-arom-danger hover:bg-arom-danger-soft"
            >
              {t("លុបគណនីរបស់ខ្ញុំ", "Delete my account")}
            </button>
          </>
        ) : (
          <form onSubmit={(event) => void remove(event)} noValidate className="mt-2 max-w-md">
            <div className="rounded-2xl bg-arom-danger-soft p-4 text-xs leading-5 text-ink">
              <p className="font-semibold">
                {t("នេះនឹងលុបជាអចិន្ត្រៃយ៍ ហើយមិនអាចយកមកវិញបានទេ៖", "This permanently deletes, and we cannot bring back:")}
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                <li>{t("កំណត់ហេតុ អារម្មណ៍ លទ្ធផលតេស្ត និងផែនការរបស់អ្នក", "Your journal, moods, screening results and plan")}</li>
                <li>{t("ការកក់ និងសាររបស់អ្នក រួមទាំងសារជាសំឡេង និងរូបថត", "Your bookings and messages, including voice messages and photos")}</li>
                <li>{t("កំណត់ត្រារបស់អ្នកព្យាបាលអំពីវគ្គរបស់អ្នក", "Your therapist's notes about your sessions")}</li>
                <li>{t("សារដែលអ្នកបានផ្ញើក្នុងក្រុម និងការវាយតម្លៃរបស់អ្នក", "Messages you sent in groups, and your reviews")}</li>
              </ul>
              <p className="mt-2 font-semibold">{t("អ្វីដែលនៅសល់៖", "What stays:")}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                <li>
                  {t(
                    "ប្រសិនបើអ្នកបានបើកសេចក្តីសង្ខេបកំណត់ហេតុ Google អាចនៅរក្សាច្បាប់ចម្លងនៃអ្វីដែលបានផ្ញើទៅវា",
                    "If you turned on journal summaries, Google may still hold copies of what was sent to it",
                  )}
                </li>
                <li>
                  {t(
                    "របាយការណ៍ដែលអ្នកបានផ្ញើ ដោយគ្មានឈ្មោះរបស់អ្នក ប៉ុន្តែអ្វីដែលអ្នកបានសរសេរនៅតែមាន",
                    "Reports you sent, without your name, though anything you wrote in them stays",
                  )}
                </li>
                <li>{t("កំណត់ត្រាថាគណនីមួយត្រូវបានលុប ដោយគ្មានឈ្មោះ", "A record that an account was deleted, with no name")}</li>
              </ul>
              <p className="mt-2">
                {t("សូមទាញយកទិន្នន័យរបស់អ្នកជាមុនសិន ប្រសិនបើអ្នកចង់រក្សាវាទុក។", "Download your data first if you want to keep it.")}
              </p>
            </div>

            <div className="mt-4 space-y-0.5">
              <AuthInput
                id="delete-confirm"
                label={t("វាយ DELETE ដើម្បីបញ្ជាក់", "Type DELETE to confirm")}
                icon={LockKeyhole}
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
              {user.hasPassword && (
                <AuthInput
                  id="delete-password"
                  label={t("ពាក្យសម្ងាត់របស់អ្នក", "Your password")}
                  icon={LockKeyhole}
                  type="password"
                  autoComplete="current-password"
                  revealable
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              )}
            </div>

            {deleteError && (
              <p role="alert" className="mt-2 text-xs text-arom-danger">
                {deleteError}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={deleting || confirm !== "DELETE"}
                className="rounded-full bg-arom-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleting ? t("កំពុងលុប…", "Deleting…") : t("លុបគណនីរបស់ខ្ញុំជាអចិន្ត្រៃយ៍", "Permanently delete my account")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirm("");
                  setPassword("");
                  setDeleteError("");
                }}
                className="rounded-full border border-arom-border px-4 py-2 text-sm font-semibold text-ink hover:bg-arom-wash"
              >
                {t("បោះបង់", "Cancel")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
