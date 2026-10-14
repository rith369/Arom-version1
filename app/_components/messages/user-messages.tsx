"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarCheck, LifeBuoy, Lock, MessageCircle, Mic, Monitor, Repeat, UserRound } from "lucide-react";
import type { AppointmentsResponse, UserAppointment } from "@/lib/appointments";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { useLanguage } from "../language-provider";
import { JoinButton } from "../sessions/join-button";
import { ChatThread } from "./chat-thread";
import {
  REPLY_TIME_LABELS,
  useConversations,
  type Conversation,
  type ConversationSummary,
} from "./message-store";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Messages" />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
      <MobileNavigation active="Messages" />
    </div>
  );
}

export function UserMessages({ professionalId }: { professionalId?: string }) {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const list = useConversations("client");
  const [now] = useState(() => Date.now());
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);

  // For the "Next session" strip. Only this person's own appointments.
  useEffect(() => {
    let active = true;
    fetch("/api/appointments", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<AppointmentsResponse>) : null))
      .then((data) => {
        if (active && data) setAppointments(data.appointments);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Only professionals this person has booked with can be messaged (checked by the server).
  const nameOf = (item: ConversationSummary) => (km && item.kmProfessionalName ? item.kmProfessionalName : item.professionalName);
  const sorted = [...list.conversations].sort(
    (a, b) => (b.last?.createdAt ?? "").localeCompare(a.last?.createdAt ?? "") || a.professionalName.localeCompare(b.professionalName),
  );
  const selectedSummary = list.conversations.find((item) => item.professionalId === professionalId);
  const selected: Conversation | undefined = selectedSummary && {
    id: selectedSummary.key,
    professionalId: selectedSummary.professionalId,
    professionalName: selectedSummary.professionalName,
    kmProfessionalName: selectedSummary.kmProfessionalName,
    clientId: selectedSummary.clientId,
    clientName: "",
  };
  const nextSession = selectedSummary
    ? appointments
        .filter((item) => item.professional?.slug === selectedSummary.professionalId && item.status === "booked" && Date.parse(item.endsAt) > now)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0]
    : undefined;
  const sessionTime = new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Phnom_Penh" });
  const date = new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { day: "numeric", month: "short", timeZone: "Asia/Phnom_Penh" });

  return (
    <Shell>
      <h1 className="text-2xl font-bold tracking-tight text-arom sm:text-3xl">{t("សារ (Messages)", "Messages")}</h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
        <Lock size={14} aria-hidden="true" />
        {t("មានតែអ្នក និងអ្នកជំនាញរបស់អ្នកទេដែលអាចអានសារទាំងនេះ។", "Only you and your professional can read these messages.")}
      </p>

      <div className="mt-5 grid overflow-hidden rounded-3xl border border-arom-border bg-white shadow-card lg:h-[72vh] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className={`border-arom-border lg:flex lg:min-h-0 lg:flex-col lg:border-r ${selected ? "hidden" : "flex flex-col"}`}>
          {list.status === "loading" ? (
            <p role="status" className="p-6 text-center text-sm text-ink-muted">
              {t("កំពុងផ្ទុក...", "Loading...")}
            </p>
          ) : list.status === "error" ? (
            <p role="alert" className="p-6 text-center text-sm text-arom-danger">
              {t("មិនអាចផ្ទុកសាររបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។", "We could not load your messages. Please try again.")}
            </p>
          ) : sorted.length === 0 ? (
            <p className="p-6 text-center text-sm leading-6 text-ink-muted">
              {t("អ្នកអាចផ្ញើសារទៅអ្នកជំនាញ បន្ទាប់ពីអ្នកកក់ការពិគ្រោះជាមួយពួកគេ។", "You can message a professional after you book a session with them.")}{" "}
              <Link href="/professional" className="font-semibold text-arom underline">
                {t("ស្វែងរកអ្នកជំនាញ", "Find a professional")}
              </Link>
            </p>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-arom-border overflow-y-auto">
              {sorted.map((conversation) => {
                const { last, unread } = conversation;
                return (
                  <li key={conversation.key}>
                    <Link
                      href={`/messages/${conversation.professionalId}`}
                      aria-current={conversation.professionalId === professionalId ? "page" : undefined}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-arom-wash/60 ${conversation.professionalId === professionalId ? "bg-arom-wash" : ""}`}
                    >
                      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-arom-soft text-sm font-semibold text-arom">
                        {conversation.photoUrl ? (
                          <Image src={conversation.photoUrl} alt="" fill sizes="44px" className="object-cover" />
                        ) : (
                          <span aria-hidden="true">{conversation.professionalName.charAt(0)}</span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${unread ? "font-bold" : "font-medium"} text-ink`}>
                            {nameOf(conversation)}
                          </span>
                          {last && <span className="shrink-0 text-[0.7rem] text-ink-muted">{date.format(new Date(last.createdAt))}</span>}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                          {last?.kind === "voice" && <Mic size={12} aria-hidden="true" />}
                          <span className="truncate">
                            {!last
                              ? t("មិនទាន់មានសារ", "No messages yet")
                              : last.kind === "suggestion"
                                ? t("ម៉ោងសម្រាប់វគ្គបន្ទាប់របស់អ្នក", "Times for your next session")
                                : last.kind === "voice"
                                ? t("សារសំឡេង", "Voice message")
                                : `${last.mine ? t("អ្នក: ", "You: ") : ""}${last.text}`}
                          </span>
                        </span>
                      </span>
                      {unread > 0 && <span className="rounded-full bg-arom px-2 py-0.5 text-[0.7rem] font-semibold text-white">{unread}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className={`min-h-0 flex-col ${selected ? "flex h-[75vh] lg:h-auto" : "hidden lg:flex"}`}>
          {selected && selectedSummary ? (
            <>
              <header className="flex items-center gap-3 border-b border-arom-border px-4 py-3 sm:px-6">
                <Link href="/messages" aria-label={t("ត្រឡប់ក្រោយ", "Back")} className="rounded-full p-1.5 text-arom hover:bg-arom-wash lg:hidden">
                  <ArrowLeft size={18} />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">
                    {nameOf(selectedSummary)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {km ? REPLY_TIME_LABELS[selectedSummary.replyTime].km : REPLY_TIME_LABELS[selectedSummary.replyTime].en}
                  </p>
                </div>
                <Link href={`/professional/${selected.professionalId}`} className="text-sm font-semibold text-arom hover:underline">
                  {t("ប្រវត្តិរូប", "Profile")}
                </Link>
              </header>
              {nextSession && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-arom-border bg-arom-wash/60 px-4 py-2.5 text-sm sm:px-6">
                  <CalendarCheck size={16} aria-hidden="true" className="text-arom" />
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold text-ink">{t("វគ្គបន្ទាប់: ", "Next session: ")}</span>
                    <span className="text-ink">{sessionTime.format(new Date(nextSession.startsAt))}</span>
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-ink-muted">
                      {nextSession.sessionType === "online" ? <Monitor size={12} aria-hidden="true" /> : <UserRound size={12} aria-hidden="true" />}
                      {nextSession.sessionType === "online" ? t("អនឡាញ", "Online") : t("ជួបផ្ទាល់", "In person")}
                    </span>
                    {nextSession.seriesId && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-ink-muted">
                        <Repeat size={12} aria-hidden="true" />
                        {t("ធ្វើម្តងទៀត", "Repeating")}
                      </span>
                    )}
                  </span>
                  {nextSession.sessionType === "online" && !nextSession.meetingUrl ? (
                    <span className="text-xs text-ink-muted">{t("តំណប្រជុំនឹងមកដល់ពីអ្នកជំនាញ", "Your professional will add the meeting link")}</span>
                  ) : (
                    <JoinButton booking={nextSession} now={now} km={km} />
                  )}
                </div>
              )}
              <p className="flex items-start gap-2 border-b border-arom-warning/20 bg-arom-warning-soft px-4 py-2.5 text-xs leading-5 text-arom-warning sm:px-6">
                <LifeBuoy size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>
                  {t("សារមិនមែនសម្រាប់ករណីបន្ទាន់ទេ។ ប្រសិនបើអ្នកកំពុងមានគ្រោះថ្នាក់ឥឡូវនេះ ", "Messages are not for emergencies. If you are in danger right now, ")}
                  <Link href="/profile#get-help-title" className="font-semibold underline">
                    {t("ទៅកាន់ជំនួយបន្ទាន់", "go to Get help now")}
                  </Link>
                  .
                </span>
              </p>
              <div className="min-h-0 flex-1">
                <ChatThread conversation={selected} viewer="client" km={km} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <MessageCircle size={32} aria-hidden="true" className="text-ink-muted" />
              <p className="mt-3 text-sm text-ink-muted">{t("ជ្រើសរើសអ្នកជំនាញ ដើម្បីមើលសារ។", "Choose a professional to see your messages.")}</p>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
