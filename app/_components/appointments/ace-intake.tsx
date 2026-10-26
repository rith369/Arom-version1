"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, Lock, X } from "lucide-react";

import { SheetDialog } from "../sheet-dialog";
import { useConfirm } from "../confirm-dialog";
import {
  ACE_CREDIT,
  ACE_LEAD,
  ACE_LENGTH,
  ACE_QUESTIONS,
  ACE_TITLE,
  type AceAnswer,
  type MyAceIntake,
  type MyAceResponse,
} from "@/lib/ace";

// ACE in the therapist intake (BACKEND-HANDOFF.md section 37). Shown on My
// appointments when the professional asks it. Always optional: any question
// can be skipped, and the answers can be deleted at any time.

async function request(init: RequestInit, query = "") {
  try {
    const response = await fetch(`/api/ace${query}`, { cache: "no-store", ...init });
    const data = (await response.json().catch(() => null)) as (MyAceResponse & { error?: { message?: string } }) | null;
    if (!response.ok || !data?.intakes) return { ok: false as const, message: data?.error?.message ?? null };
    return { ok: true as const, intakes: data.intakes };
  } catch {
    return { ok: false as const, message: null };
  }
}

export function AceIntakeCard({
  intake,
  professionalName,
  km,
  onChange,
}: {
  intake: MyAceIntake;
  professionalName: string;
  km: boolean;
  onChange: (next: MyAceIntake[]) => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const answered = intake.answers !== null;
  const date = intake.updatedAt
    ? new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Phnom_Penh" }).format(
        new Date(intake.updatedAt),
      )
    : "";

  if (!answered && !intake.canAnswer) return null;

  async function remove() {
    const ok = await confirm({
      title: t("លុបចម្លើយរបស់អ្នក?", "Delete your answers?"),
      message: t(`${professionalName} នឹងលែងឃើញវាទៀតហើយ។`, `${professionalName} will no longer see them.`),
      confirmLabel: t("លុប", "Delete"),
      cancelLabel: t("រក្សាទុក", "Keep"),
      tone: "danger",
    });
    if (!ok) return;
    setError("");
    const result = await request({ method: "DELETE" }, `?professional=${encodeURIComponent(intake.professionalSlug)}`);
    if (!result.ok) return setError(result.message ?? t("មិនអាចលុបបានទេ។ សូមព្យាយាមម្តងទៀត។", "That could not be deleted. Please try again."));
    onChange(result.intakes);
  }

  return (
    <div className="mt-4 rounded-2xl border border-arom-border bg-arom-wash/50 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <ClipboardList size={17} aria-hidden="true" className="shrink-0 text-arom" />
        {km ? ACE_TITLE.km : ACE_TITLE.en}
        {!answered && <span className="font-normal text-ink-muted">{t("(ស្រេចចិត្ត)", "(optional)")}</span>}
      </p>

      {answered ? (
        <p className="mt-1.5 text-sm leading-6 text-ink-muted">{t(`អ្នកបានឆ្លើយនៅថ្ងៃ ${date}។`, `You answered on ${date}.`)}</p>
      ) : (
        <p className="mt-1.5 text-sm leading-6 text-ink-muted">
          {t(
            `${professionalName} សួរសំណួរ ១០ (បាទ/ចាស ឬទេ) អំពីកុមារភាពរបស់អ្នក មុនវគ្គ។ សំណួរខ្លះនិយាយអំពីការរំលោភបំពាន ហើយអាចធ្វើឱ្យអ្នកមានអារម្មណ៍ខ្លាំង។ អ្នកអាចរំលងសំណួរណាមួយ ឬរំលងទាំងអស់ ហើយនិយាយអំពីវានៅក្នុងវគ្គ។`,
            `${professionalName} asks 10 yes or no questions about your childhood before your session. Some are about abuse and may bring up strong feelings. You can skip any question, or skip them all and talk about it in the session.`,
          )}
        </p>
      )}

      <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-ink-muted">
        <Lock size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
        {t(
          `មានតែ ${professionalName} ទេដែលអាចអានចម្លើយរបស់អ្នក។ ក្រុម AROM មិនអាចអានបានទេ។ អ្នកអាចលុបវាបានគ្រប់ពេល។`,
          `Only ${professionalName} can read your answers. The AROM team cannot. You can delete them at any time.`,
        )}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {intake.canAnswer && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={
              answered
                ? "rounded-full border border-arom-border bg-white px-3.5 py-1.5 text-sm font-semibold text-arom hover:bg-arom-wash"
                : "rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep"
            }
          >
            {answered ? t("មើល ឬកែប្រែ", "See or change") : t("ឆ្លើយសំណួរ", "Answer the questions")}
          </button>
        )}
        {answered && (
          <button type="button" onClick={() => void remove()} className="rounded-full px-3 py-1.5 text-sm font-semibold text-arom-danger hover:bg-arom-danger-soft">
            {t("លុបចម្លើយរបស់ខ្ញុំ", "Delete my answers")}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-arom-danger">
          {error}
        </p>
      )}

      {open && <AceDialog intake={intake} professionalName={professionalName} km={km} onSaved={onChange} onClose={() => setOpen(false)} />}
      {confirmDialog}
    </div>
  );
}

function AceDialog({
  intake,
  professionalName,
  km,
  onSaved,
  onClose,
}: {
  intake: MyAceIntake;
  professionalName: string;
  km: boolean;
  onSaved: (next: MyAceIntake[]) => void;
  onClose: () => void;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  // undefined: not chosen yet, saved as skipped.
  const [answers, setAnswers] = useState<(AceAnswer | undefined)[]>(() => intake.answers ?? Array<undefined>(ACE_LENGTH).fill(undefined));
  const [closing, setClosing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const options: { value: AceAnswer; label: string }[] = [
    { value: true, label: t("បាទ/ចាស", "Yes") },
    { value: false, label: t("ទេ", "No") },
    { value: null, label: t("មិនចង់ឆ្លើយ", "Rather not say") },
  ];

  async function save() {
    if (saving) return;
    if (!answers.some((answer) => answer === true || answer === false)) {
      return setError(t("សូមឆ្លើយយ៉ាងហោចណាស់មួយសំណួរ ឬបិទផ្ទាំងនេះដើម្បីរំលង។", "Answer at least one question, or close this window to skip."));
    }
    setSaving(true);
    setError("");
    const result = await request({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professionalSlug: intake.professionalSlug, answers: answers.map((answer) => answer ?? null) }),
    });
    setSaving(false);
    if (!result.ok) return setError(result.message ?? t("មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។", "That could not be saved. Please try again."));
    onSaved(result.intakes);
    setClosing(true);
  }

  return (
    <SheetDialog
      closing={closing}
      onClosed={onClose}
      labelledBy="ace-title"
      panelClassName="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="ace-title" className="text-lg font-bold text-ink">
            {km ? ACE_TITLE.km : ACE_TITLE.en}
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">{t(`សម្រាប់ ${professionalName} តែប៉ុណ្ណោះ`, `For ${professionalName} only`)}</p>
        </div>
        <button type="button" onClick={() => setClosing(true)} aria-label={t("បិទ", "Close")} className="rounded-full p-2 hover:bg-arom-wash">
          <X size={20} />
        </button>
      </div>

      <p className="mt-4 rounded-2xl bg-arom-wash px-4 py-3 text-sm leading-6 text-ink">
        {t(
          "ប្រសិនបើសំណួរទាំងនេះធ្វើឱ្យអ្នកមានអារម្មណ៍ពិបាក អ្នកអាចឈប់បានគ្រប់ពេល។ ",
          "If these questions bring up difficult feelings, you can stop at any time. ",
        )}
        <Link href="/profile#get-help-title" className="font-semibold text-arom-danger underline">
          {t("ជំនួយបន្ទាន់", "Get help now")}
        </Link>
      </p>

      <p className="mt-5 text-sm font-semibold text-ink">{km ? ACE_LEAD.km : ACE_LEAD.en}</p>
      <ol className="mt-3 space-y-4">
        {ACE_QUESTIONS.map((question, index) => {
          const lines = km ? question.km : question.en;
          return (
            <li key={index} className="rounded-2xl border border-arom-border p-3.5">
              <fieldset>
                <legend className="text-sm leading-6 text-ink">
                  <span className="font-semibold">{index + 1}. </span>
                  {lines[0]}
                </legend>
                {lines.slice(1).map((line) => (
                  <p key={line} className="mt-1 text-sm leading-6 text-ink">
                    {line}
                  </p>
                ))}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {options.map((option) => {
                    const selected = answers[index] === option.value;
                    return (
                      <label
                        key={String(option.value)}
                        className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-arom ${
                          selected ? "border-arom bg-arom text-white" : "border-arom-border bg-white text-ink hover:bg-arom-wash"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`ace-${index}`}
                          checked={selected}
                          onChange={() => {
                            setAnswers((current) => current.map((answer, position) => (position === index ? option.value : answer)));
                            setError("");
                          }}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-xs leading-5 text-ink-muted">
        {t(
          `មានតែ ${professionalName} ទេដែលអាចអានចម្លើយរបស់អ្នក។ សំណួរដែលអ្នកមិនបានឆ្លើយ ត្រូវបានរំលង។`,
          `Only ${professionalName} can read your answers. Questions you leave empty are skipped.`,
        )}{" "}
        {km ? ACE_CREDIT.km : ACE_CREDIT.en}
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-arom-danger-soft px-3.5 py-2.5 text-sm text-arom-danger">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => setClosing(true)} className="rounded-full border border-arom-border px-4 py-2 text-sm font-medium text-ink hover:bg-arom-wash">
          {t("បោះបង់", "Cancel")}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-full bg-arom px-5 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-50"
        >
          {saving ? t("កំពុងរក្សាទុក...", "Saving...") : t("រក្សាទុកចម្លើយ", "Save answers")}
        </button>
      </div>
    </SheetDialog>
  );
}
