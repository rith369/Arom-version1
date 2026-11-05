"use client";

import { LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { changePasswordSchema, type AuthErrorBody } from "@/lib/auth";
import { AuthInput } from "./auth/auth-input";
import { PasswordStrengthMeter } from "./auth/password-strength";
import { useAuth } from "./auth-provider";

const EMPTY = { currentPassword: "", password: "", confirmPassword: "" };

/** Change password in Profile. It also signs the person out on their other devices. */
export function ChangePassword({ km }: { km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  if (!user) return null;

  if (!user.hasPassword) {
    return (
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        {t(
          "អ្នកចូលគណនីដោយប្រើ Google ដូច្នេះមិនមានពាក្យសម្ងាត់ AROM សម្រាប់ប្តូរទេ។",
          "You log in with Google, so there is no AROM password to change.",
        )}
      </p>
    );
  }

  const set = (field: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      setMessage({
        tone: "error",
        text: t(
          "សូមពិនិត្យពាក្យសម្ងាត់។ វាត្រូវមានយ៉ាងតិច ៨ តួ អក្សរធំ អក្សរតូច លេខ និងសញ្ញាពិសេស ហើយពាក្យទាំងពីរត្រូវដូចគ្នា។",
          parsed.error.issues[0]?.message ?? "Please check your password.",
        ),
      });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as AuthErrorBody | null;
        if (body?.error.code === "mfa_required") {
          window.location.replace("/mfa?next=/profile");
          return;
        }
        setMessage({
          tone: "error",
          text:
            body?.error.code === "invalid_credentials"
              ? t("ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវទេ។", "Your current password is not right.")
              : t(
                  "មិនអាចប្តូរពាក្យសម្ងាត់បានទេ។ សូមសាកល្បងពាក្យសម្ងាត់ផ្សេង ឬព្យាយាមម្តងទៀត។",
                  body?.error.message ?? "Your password could not be changed. Please try again.",
                ),
        });
        return;
      }
      setValues(EMPTY);
      setOpen(false);
      setMessage({
        tone: "ok",
        text: t(
          "បានប្តូរពាក្យសម្ងាត់ហើយ។ ឧបករណ៍ផ្សេងទៀតរបស់អ្នកត្រូវបានចាកចេញ។",
          "Your password is changed. Your other devices are now logged out.",
        ),
      });
    } catch {
      setMessage({
        tone: "error",
        text: t("មិនមានការតភ្ជាប់អ៊ីនធឺណិតទេ។ សូមព្យាយាមម្តងទៀត។", "You seem to be offline. Please try again."),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2">
      {open ? (
        <form onSubmit={(event) => void submit(event)} noValidate className="mt-2 max-w-md space-y-0.5">
          <AuthInput
            id="current-password"
            label={t("ពាក្យសម្ងាត់បច្ចុប្បន្ន", "Current password")}
            icon={LockKeyhole}
            type="password"
            autoComplete="current-password"
            revealable
            value={values.currentPassword}
            onChange={set("currentPassword")}
          />
          <AuthInput
            id="new-password"
            label={t("ពាក្យសម្ងាត់ថ្មី", "New password")}
            icon={LockKeyhole}
            type="password"
            autoComplete="new-password"
            revealable
            hint={<PasswordStrengthMeter value={values.password} />}
            value={values.password}
            onChange={set("password")}
          />
          <AuthInput
            id="confirm-new-password"
            label={t("បញ្ជាក់ពាក្យសម្ងាត់ថ្មី", "Confirm new password")}
            icon={LockKeyhole}
            type="password"
            autoComplete="new-password"
            revealable
            value={values.confirmPassword}
            onChange={set("confirmPassword")}
          />
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-50"
            >
              {busy ? t("កំពុងរក្សាទុក…", "Saving…") : t("រក្សាទុកពាក្យសម្ងាត់ថ្មី", "Save new password")}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setValues(EMPTY);
                setMessage(null);
              }}
              className="rounded-full border border-arom-border px-4 py-2 text-sm font-semibold text-ink hover:bg-arom-wash"
            >
              {t("បោះបង់", "Cancel")}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setMessage(null);
          }}
          className="rounded-full border border-arom-border px-4 py-2 text-sm font-semibold text-ink hover:bg-arom-wash"
        >
          {t("ប្តូរពាក្យសម្ងាត់", "Change password")}
        </button>
      )}
      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`mt-2 text-xs ${message.tone === "error" ? "text-arom-danger" : "text-arom"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
