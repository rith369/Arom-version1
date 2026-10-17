"use client";

import Link from "next/link";
import { CheckCircle2, Flag, Heart, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLanguage } from "./language-provider";
import {
  REPORT_NOTE_MAX,
  submitContentReport,
  type ReportReason,
  type ReportTarget,
} from "./content-reports";

type Step = "form" | "sent" | "daily_limit" | "signed_out" | "error";

function ReportDialog({
  target,
  itemTitle,
  partLabel,
  onClose,
}: {
  target: ReportTarget;
  itemTitle: string;
  partLabel?: string;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [isSending, setIsSending] = useState(false);
  const [showReasonError, setShowReasonError] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const reasons: { value: ReportReason; label: string; hint: string }[] = [
    {
      value: "wrong_info",
      label: t("ព័ត៌មានមិនត្រឹមត្រូវ", "Wrong information"),
      hint: t("ការពិត ឬការបកប្រែមិនត្រឹមត្រូវ", "A fact or translation looks wrong"),
    },
    {
      value: "harmful",
      label: t("ធ្វើឱ្យមិនស្រួលចិត្ត ឬអាចបង្កគ្រោះថ្នាក់", "Upsetting or harmful"),
      hint: t("ខ្លឹមសារដែលមិនសមរម្យ ឬមិនមានសុវត្ថិភាព", "Content that feels unsafe or hurtful"),
    },
    {
      value: "broken",
      label: t("មានអ្វីមួយខូច", "Something is broken"),
      hint: t("ប៊ូតុង អត្ថបទ ឬរូបភាពមិនដំណើរការ", "A button, text or image does not work"),
    },
    {
      value: "other",
      label: t("ផ្សេងទៀត", "Other"),
      hint: t("អ្វីផ្សេងដែលយើងគួរដឹង", "Something else we should know"),
    },
  ];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reason) {
      setShowReasonError(true);
      return;
    }

    setIsSending(true);

    try {
      setStep(await submitContentReport({ target, reason, note: note.trim() }));
    } catch {
      setStep("error");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="report-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border border-arom-border bg-white p-0 text-ink shadow-card backdrop:bg-ink/35"
    >
      <div className="flex items-start justify-between gap-4 border-b border-arom-border p-5">
        <div className="min-w-0">
          <h2 id="report-title" className="text-lg font-bold">
            {t("រាយការណ៍បញ្ហា (Report a problem)", "Report a problem")}
          </h2>
          <p className="mt-1 truncate text-xs text-ink-muted">
            {itemTitle}
            {partLabel ? ` · ${partLabel}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("បិទ", "Close")}
          className="rounded-full p-2 text-ink-muted hover:bg-arom-wash"
        >
          <X size={20} />
        </button>
      </div>

      {step === "form" ? (
        <form onSubmit={submit} noValidate className="p-5">
          <fieldset aria-describedby={showReasonError ? "report-reason-error" : undefined}>
            <legend className="text-sm font-semibold">
              {t("តើមានបញ្ហាអ្វី?", "What is wrong?")}
            </legend>
            <div className="mt-3 space-y-2">
              {reasons.map((item) => (
                <label
                  key={item.value}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-arom-border p-3 transition-colors hover:bg-arom-wash has-[:checked]:border-arom has-[:checked]:bg-arom-wash"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={() => {
                      setReason(item.value);
                      setShowReasonError(false);
                    }}
                    className="mt-1 accent-arom"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="block text-xs text-ink-muted">{item.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {showReasonError && (
              <p id="report-reason-error" role="alert" className="mt-2 text-xs font-medium text-arom-danger">
                {t("សូមជ្រើសរើសមួយ", "Please choose one")}
              </p>
            )}
          </fieldset>

          {reason === "harmful" && (
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-arom-soft p-3 text-xs leading-5 text-arom-deep">
              <Heart size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {t(
                  "ប្រសិនបើខ្លឹមសារនេះធ្វើឱ្យអ្នកមានអារម្មណ៍ពិបាក អ្នកមិនចាំបាច់ដោះស្រាយតែម្នាក់ឯងទេ។ ",
                  "If this brought up difficult feelings, you do not have to handle them alone. ",
                )}
                <Link href="/professional" className="font-semibold underline">
                  {t("និយាយជាមួយអ្នកជំនាញ", "Talk to a professional")}
                </Link>
              </span>
            </p>
          )}

          <label className="mt-5 block text-sm font-semibold">
            {t("ព័ត៌មានបន្ថែម (ស្រេចចិត្ត)", "Anything to add? (optional)")}
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={REPORT_NOTE_MAX}
              aria-describedby="report-note-hint"
              placeholder={t("ឧ. ផ្នែកទី ២ និយាយថា...", "For example, section 2 says...")}
              className="mt-2 w-full rounded-xl border border-arom/35 bg-arom-wash/75 px-3 py-2.5 text-sm font-normal outline-none focus:border-arom focus:bg-white focus:ring-4 focus:ring-arom/10"
            />
          </label>
          <p id="report-note-hint" className="mt-1.5 text-xs leading-5 text-ink-muted">
            {t(
              "សូមកុំសរសេរព័ត៌មានផ្ទាល់ខ្លួន ឬសុខភាពរបស់អ្នក។ របាយការណ៍នេះទៅកាន់ក្រុមមាតិកា AROM មិនមែនអ្នកប្រឹក្សាទេ។",
              "Please do not write personal or health details. This goes to the AROM content team, not to a counselor.",
            )}
          </p>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-arom-border px-5 py-2.5 text-sm font-medium"
            >
              {t("បោះបង់", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="rounded-full bg-arom px-5 py-2.5 text-sm font-bold text-white hover:bg-arom-deep disabled:opacity-60"
            >
              {t("ផ្ញើរបាយការណ៍", "Send report")}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 text-center">
          {step === "sent" && (
            <CheckCircle2 size={36} className="mx-auto text-arom" aria-hidden="true" />
          )}
          <p role="status" className="mt-3 text-sm leading-6 text-ink">
            {step === "sent"
              ? t("សូមអរគុណ។ ក្រុម AROM នឹងពិនិត្យមើលវា។", "Thank you. The AROM team will look at this.")
              : step === "daily_limit"
                ? t(
                    "អ្នកបានផ្ញើរបាយការណ៍ច្រើនហើយថ្ងៃនេះ។ សូមសាកល្បងម្តងទៀតនៅថ្ងៃស្អែក។",
                    "You have sent several reports today. Please try again tomorrow.",
                  )
                : step === "signed_out"
                  ? t("សូមចូលគណនីដើម្បីផ្ញើរបាយការណ៍។", "Please log in to send a report.")
                  : t("មិនអាចផ្ញើបានទេ។ សូមសាកល្បងម្តងទៀត។", "This could not be sent. Please try again.")}
          </p>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="mt-5 rounded-full bg-arom px-6 py-2.5 text-sm font-bold text-white hover:bg-arom-deep"
          >
            {t("បិទ", "Close")}
          </button>
        </div>
      )}
    </dialog>
  );
}

// Quiet link at the end of a MindGuide screen. Hidden in the admin preview.
export function ReportProblemButton({
  target,
  itemTitle,
  partLabel,
  className = "",
}: {
  target: ReportTarget;
  itemTitle: string;
  partLabel?: string;
  className?: string;
}) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-arom hover:underline ${className}`}
      >
        <Flag size={13} aria-hidden="true" />
        {language === "km" ? "រាយការណ៍បញ្ហា" : "Report a problem"}
      </button>
      {isOpen && (
        <ReportDialog
          target={target}
          itemTitle={itemTitle}
          partLabel={partLabel}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
