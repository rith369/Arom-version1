"use client";

import { MessageCircle } from "lucide-react";
import type { DeskChat } from "@/lib/clinic-chat";
import { ClinicChatPanel } from "../clinic-chat/clinic-chat-panel";

/**
 * The desk's Messages tab (section 35): every student who sent a request,
 * newest activity first, and the open chat. Students show by the name they
 * share (usually "Anonymous") and a short code.
 */
export function DeskChats({
  slug,
  chats,
  status,
  selectedId,
  onSelect,
  onChange,
  km,
}: {
  slug: string;
  chats: DeskChat[];
  status: "loading" | "ready" | "error";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: () => void;
  km: boolean;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const selected = chats.find((chat) => chat.id === selectedId);
  const date = new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { day: "numeric", month: "short", timeZone: "Asia/Phnom_Penh" });

  return (
    <div className="grid overflow-hidden rounded-3xl border border-arom-border bg-white shadow-card lg:h-[70vh] lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className={`border-arom-border lg:flex lg:min-h-0 lg:flex-col lg:border-r ${selected ? "hidden" : "flex flex-col"}`}>
        {status === "loading" && chats.length === 0 ? (
          <p role="status" className="p-6 text-center text-sm text-ink-muted">
            {t("កំពុងផ្ទុក...", "Loading...")}
          </p>
        ) : status === "error" && chats.length === 0 ? (
          <p role="alert" className="p-6 text-center text-sm text-arom-danger">
            {t("មិនអាចផ្ទុកការជជែកបានទេ។", "We could not load the chats.")}
          </p>
        ) : chats.length === 0 ? (
          <p className="p-6 text-center text-sm leading-6 text-ink-muted">
            {t(
              "ការជជែកចាប់ផ្តើមនៅពេលសិស្សផ្ញើសំណើកក់។",
              "A chat starts when a student sends a booking request.",
            )}
          </p>
        ) : (
          <ul className="min-h-0 flex-1 divide-y divide-arom-border overflow-y-auto">
            {chats.map((chat) => {
              const { last } = chat;
              const preview = !last
                ? t("មិនទាន់មានសារ", "No messages yet")
                : `${last.mine ? t("គ្លីនិក: ", "Clinic: ") : ""}${
                    last.kind === "voice"
                      ? t("សារសំឡេង", "Voice message")
                      : last.kind === "image"
                        ? t("រូបថត", "Photo")
                        : last.kind === "file"
                          ? "PDF"
                          : last.text
                  }`;
              return (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(chat.id)}
                    aria-current={chat.id === selectedId ? "true" : undefined}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-arom-wash/60 ${chat.id === selectedId ? "bg-arom-wash" : ""}`}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-arom-soft text-xs font-bold text-arom">
                      #{chat.reference.slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={`truncate text-sm ${chat.unread ? "font-bold" : "font-medium"} text-ink`}>
                          {chat.clientName} · #{chat.reference}
                        </span>
                        {last && <span className="shrink-0 text-[0.7rem] text-ink-muted">{date.format(new Date(last.createdAt))}</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-ink-muted">
                        {!chat.canWrite && `${t("បានបិទ", "Closed")} · `}
                        {preview}
                      </span>
                    </span>
                    {chat.unread > 0 && (
                      <span className="rounded-full bg-arom px-2 py-0.5 text-[0.7rem] font-semibold text-white">{chat.unread}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <section className={`min-h-0 flex-col ${selected ? "flex h-[75vh] lg:h-auto" : "hidden lg:flex"}`}>
        {selected ? (
          <ClinicChatPanel
            key={selected.id}
            url={`/api/clinic-desk/${slug}/chats/${selected.id}`}
            viewer="professional"
            km={km}
            title={`${selected.clientName} · #${selected.reference}`}
            subtitle={t("ឯកជន រវាងសិស្ស និងតុបម្រើគ្លីនិក", "Private between the student and the clinic desk")}
            onBack={() => onSelect(null)}
            onChange={onChange}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
            <MessageCircle size={32} aria-hidden="true" className="text-ink-muted" />
            <p className="mt-3 text-sm text-ink-muted">{t("ជ្រើសរើសការជជែក ដើម្បីមើលសារ។", "Choose a chat to see its messages.")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
