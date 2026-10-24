"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Building2, LifeBuoy, Lock } from "lucide-react";
import type { Sender } from "@/lib/messages";
import { ChatThreadView } from "../messages/chat-thread";
import { useClinicThread } from "./clinic-chat-store";

/**
 * One clinic chat (section 35): a header, a short note on what the chat is
 * for, and the same chat view as therapist chats (text, voice, photos, PDF).
 */
export function ClinicChatPanel({
  url,
  viewer,
  km,
  title,
  subtitle,
  backHref,
  onBack,
  onChange,
  headerAction,
}: {
  url: string;
  // "client" for the student, "professional" for the clinic desk.
  viewer: Sender;
  km: boolean;
  title: string;
  subtitle: string;
  // Phones: back to the list (a link, or a button when onBack is set).
  backHref?: string;
  onBack?: () => void;
  onChange?: () => void;
  headerAction?: ReactNode;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const chat = useClinicThread(url, viewer, onChange);
  const student = viewer === "client";

  const lockedNote =
    chat.loaded && !chat.canWrite
      ? student
        ? t(
            "ការជជែកនេះបានបិទ ៣០ ថ្ងៃបន្ទាប់ពីសំណើ ឬវគ្គចុងក្រោយរបស់អ្នក។ សារត្រូវបានរក្សាទុក។ ផ្ញើសំណើថ្មីដើម្បីបើកវាវិញ។",
            "This chat closed 30 days after your last request or session. Messages are kept. Send a new request to open it again.",
          )
        : t(
            "ការជជែកនេះបានបិទ ៣០ ថ្ងៃបន្ទាប់ពីសំណើ ឬវគ្គចុងក្រោយរបស់សិស្ស។ សារត្រូវបានរក្សាទុក។",
            "This chat closed 30 days after the student's last request or session. Messages are kept.",
          )
      : undefined;

  const back = onBack ? (
    <button type="button" onClick={onBack} aria-label={t("ត្រឡប់ក្រោយ", "Back")} className="rounded-full p-1.5 text-arom hover:bg-arom-wash lg:hidden">
      <ArrowLeft size={18} />
    </button>
  ) : backHref ? (
    <Link href={backHref} aria-label={t("ត្រឡប់ក្រោយ", "Back")} className="rounded-full p-1.5 text-arom hover:bg-arom-wash lg:hidden">
      <ArrowLeft size={18} />
    </Link>
  ) : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-arom-border px-4 py-3 sm:px-6">
        {back}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-arom-soft text-arom">
          <Building2 size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{title}</p>
          <p className="flex items-center gap-1 text-xs text-ink-muted">
            <Lock size={11} aria-hidden="true" />
            {subtitle}
          </p>
        </div>
        {headerAction}
      </header>

      <div className="flex items-start gap-2 border-b border-arom-warning/20 bg-arom-warning-soft px-4 py-2.5 text-xs leading-5 text-arom-warning sm:px-6">
        <LifeBuoy size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
        <p className="min-w-0 flex-1">
          {student ? (
            <>
              {t(
                "តុបម្រើគ្លីនិកជួយលើការកក់ ម៉ោង និងទីកន្លែង។ ប្រសិនបើអ្នកកំពុងមានគ្រោះថ្នាក់ឥឡូវនេះ ",
                "The clinic desk helps with bookings, times and places. If you are in danger right now, ",
              )}
              <Link href="/profile#get-help-title" className="font-semibold underline">
                {t("ទៅកាន់ជំនួយបន្ទាន់", "go to Get help now")}
              </Link>
              .
            </>
          ) : (
            t(
              "សិស្សឃើញសាររបស់អ្នកជាឈ្មោះគ្លីនិក មិនមែនឈ្មោះរបស់អ្នកទេ។ កុំសួររឿងព្យាបាល។ ទុកឱ្យអ្នកព្យាបាល។",
              "The student sees your messages as the clinic, not your name. Keep to bookings and practical things. Therapy belongs with the therapist.",
            )
          )}
        </p>
      </div>

      <div className="min-h-0 flex-1">
        <ChatThreadView
          threadKey={url}
          viewer={viewer}
          km={km}
          loaded={chat.loaded}
          messages={chat.messages}
          lockedNote={lockedNote}
          onSend={chat.send}
          onSeen={chat.markSeen}
        />
      </div>
    </div>
  );
}
