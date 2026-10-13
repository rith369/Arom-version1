"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useLanguage } from "../../_components/language-provider";
import type { CommunityReportReason, CommunityReportTarget } from "../community-data";
import { COMMUNITY_REPORT_NOTE_MAX, submitCommunityReport } from "../community-store";

type ReportDialogProps = {
  target: CommunityReportTarget;
  onClose: () => void;
};

const REASONS: { value: CommunityReportReason; en: string; km: string; kinds: CommunityReportTarget["kind"][] }[] = [
  { value: "harassment", en: "Bullying or insults", km: "ការសម្លុត ឬជេរប្រមាថ (Bullying)", kinds: ["member", "message", "group"] },
  { value: "spam", en: "Spam or selling", km: "សារឥតបានការ ឬការលក់ (Spam)", kinds: ["member", "message", "image", "group"] },
  { value: "harmful", en: "Harmful advice", km: "ដំបូន្មានដែលបង្កគ្រោះថ្នាក់ (Harmful advice)", kinds: ["member", "message", "group"] },
  { value: "inappropriate_image", en: "Inappropriate or upsetting image", km: "រូបភាពមិនសមរម្យ (Inappropriate image)", kinds: ["image", "member"] },
  { value: "safety_concern", en: "Someone may be in danger", km: "មាននរណាម្នាក់អាចមានគ្រោះថ្នាក់ (Safety concern)", kinds: ["member", "message", "image", "group"] },
  { value: "other", en: "Something else", km: "ផ្សេងទៀត (Other)", kinds: ["member", "message", "image", "group"] },
];

export function ReportDialog({ target, onClose }: ReportDialogProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const ref = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<CommunityReportReason | "">("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<"sent" | "daily_limit" | "error" | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const title =
    target.kind === "member"
      ? km ? "រាយការណ៍អំពីបុគ្គលនេះ (Report this person)" : "Report this person"
      : target.kind === "image"
        ? km ? "រាយការណ៍អំពីរូបភាព (Report image)" : "Report image"
        : target.kind === "group"
          ? km ? "រាយការណ៍អំពីក្រុម (Report group)" : "Report this group"
          : km ? "រាយការណ៍អំពីសារ (Report message)" : "Report message";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason || sending) return;
    setSending(true);
    try {
      setResult(await submitCommunityReport({ target, reason, note }));
    } catch {
      setResult("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      aria-labelledby="community-report-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[24px] bg-white p-5 text-[#111827] shadow-xl backdrop:bg-black/35"
    >
      <header className="flex items-center justify-between gap-3">
        <h2 id="community-report-title" className="text-lg font-bold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={km ? "បិទ" : "Close"}
          className="flex size-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </header>

      {result === "sent" ? (
        <div className="mt-4 text-center">
          <CheckCircle2 size={36} className="mx-auto text-[#1b5e4c]" />
          <p className="mt-3 text-sm font-semibold">
            {km ? "សូមអរគុណ។ ក្រុមការងារ AROM នឹងពិនិត្យរឿងនេះ។" : "Thank you. The AROM team will review this."}
          </p>
          <p className="mt-1 text-xs text-[#6b7280]">
            {km ? "អ្នកដែលត្រូវបានរាយការណ៍នឹងមិនដឹងថាអ្នកជាអ្នករាយការណ៍ទេ។" : "The person you reported will not know it was you."}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-[16px] bg-[#1a5d4d] py-3 text-sm font-bold text-white hover:bg-[#144b3e]"
          >
            {km ? "រួចរាល់ (Done)" : "Done"}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <fieldset>
            <legend className="text-sm font-semibold">
              {km ? "តើមានបញ្ហាអ្វី? (What is wrong?)" : "What is wrong?"}
            </legend>
            <div className="mt-2 space-y-2">
              {REASONS.filter((item) => item.kinds.includes(target.kind)).map((item) => (
                <label
                  key={item.value}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[14px] border border-gray-200 px-3 py-2.5 text-sm has-[:checked]:border-[#1a5d4d] has-[:checked]:bg-[#f2f9f6]"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={() => setReason(item.value)}
                    className="accent-[#1a5d4d]"
                  />
                  {km ? item.km : item.en}
                </label>
              ))}
            </div>
          </fieldset>

          {reason === "safety_concern" && (
            <p className="rounded-[14px] bg-[#fff7ed] p-3 text-xs text-[#9a3412] leading-relaxed">
              {km
                ? "ប្រសិនបើនរណាម្នាក់កំពុងមានគ្រោះថ្នាក់ឥឡូវនេះ សូមទាក់ទងសេវាសង្គ្រោះបន្ទាន់។ លេខជំនួយមាននៅក្នុងការកំណត់ (Settings)។"
                : "If someone is in danger right now, contact emergency services. Helpline numbers are in Settings."}
            </p>
          )}

          <label className="block text-sm font-semibold">
            {km ? "ព័ត៌មានបន្ថែម (មិនចាំបាច់)" : "More details (optional)"}
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={COMMUNITY_REPORT_NOTE_MAX}
              className="mt-1.5 w-full rounded-[14px] border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#1f6f5b]/20"
            />
            <span className="mt-1 block text-xs font-normal text-[#6b7280]">
              {km
                ? "សូមកុំសរសេរព័ត៌មានផ្ទាល់ខ្លួន ឬព័ត៌មានសុខភាព។"
                : "Do not include personal or health details."}
            </span>
          </label>

          {result === "daily_limit" && (
            <p role="alert" className="text-sm text-red-600">
              {km
                ? "អ្នកបានរាយការណ៍ច្រើនពេកសម្រាប់ថ្ងៃនេះ។ សូមព្យាយាមម្តងទៀតនៅថ្ងៃស្អែក។"
                : "You have sent many reports today. Please try again tomorrow."}
            </p>
          )}
          {result === "error" && (
            <p role="alert" className="text-sm text-red-600">
              {km ? "មិនអាចផ្ញើបានទេ។ សូមព្យាយាមម្តងទៀត។" : "Could not send. Please try again."}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[16px] border border-gray-200 py-3 text-sm font-semibold text-[#374151] hover:bg-gray-50"
            >
              {km ? "បោះបង់ (Cancel)" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={!reason || sending}
              className="flex-1 rounded-[16px] bg-[#1a5d4d] py-3 text-sm font-bold text-white hover:bg-[#144b3e] disabled:opacity-40"
            >
              {km ? "ផ្ញើ (Send)" : "Send report"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
