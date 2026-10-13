"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CalendarCheck, LifeBuoy, Lock, MessageCircle, Mic, Monitor, Repeat, UserRound } from "lucide-react";
import { getTherapist, getTherapistName } from "@/lib/therapists";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { useLanguage } from "../language-provider";
import { DEMO_CLIENT } from "../demo-client";
import { JoinButton } from "../sessions/join-button";
import { useSessionStore } from "../sessions/session-store";
import { ChatThread } from "./chat-thread";
import {
  REPLY_TIME_LABELS,
  conversationId,
  unreadCount,
  useMessageStore,
  type Conversation,
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
  const { messages, replyTimes } = useMessageStore();
  const { bookings } = useSessionStore();
  const [now] = useState(() => Date.now());

  // Only professionals this person has booked with can be messaged.
  const mine = bookings.filter((booking) => booking.clientId === DEMO_CLIENT.id && booking.status !== "cancelled");
  const professionalIds = [...new Set(mine.map((booking) => booking.professionalId))];
  const conversations: Conversation[] = professionalIds
    .map((id) => getTherapist(id))
    .filter((therapist) => therapist !== undefined)
    .map((therapist) => ({
      id: conversationId(therapist.slug, DEMO_CLIENT.id),
      professionalId: therapist.slug,
      professionalName: therapist.name,
      kmProfessionalName: therapist.kmName ?? therapist.name,
      clientId: DEMO_CLIENT.id,
      clientName: DEMO_CLIENT.name,
    }));
  const lastFor = (id: string) =>
    messages.filter((item) => item.conversationId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const sorted = [...conversations].sort((a, b) => (lastFor(b.id)?.createdAt ?? "").localeCompare(lastFor(a.id)?.createdAt ?? ""));
  const selected = conversations.find((item) => item.professionalId === professionalId);
  const selectedTherapist = selected ? getTherapist(selected.professionalId) : undefined;
  const nextSession = selected
    ? mine
        .filter((booking) => booking.professionalId === selected.professionalId && booking.status === "booked" && Date.parse(booking.startsAt) + booking.durationMinutes * 60_000 > now)
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
      <p className="mt-1 text-xs text-ink-muted">
        {t(`ទិន្នន័យសាកល្បង: កំពុងមើលជា ${DEMO_CLIENT.name}`, `Demo: viewing as ${DEMO_CLIENT.name}`)}
      </p>

      <div className="mt-5 grid overflow-hidden rounded-3xl border border-arom-border bg-white shadow-card lg:h-[72vh] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className={`border-arom-border lg:flex lg:min-h-0 lg:flex-col lg:border-r ${selected ? "hidden" : "flex flex-col"}`}>
          {sorted.length === 0 ? (
            <p className="p-6 text-center text-sm leading-6 text-ink-muted">
              {t("អ្នកអាចផ្ញើសារទៅអ្នកជំនាញ បន្ទាប់ពីអ្នកកក់ការពិគ្រោះជាមួយពួកគេ។", "You can message a professional after you book a session with them.")}{" "}
              <Link href="/professional" className="font-semibold text-arom underline">
                {t("ស្វែងរកអ្នកជំនាញ", "Find a professional")}
              </Link>
            </p>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-arom-border overflow-y-auto">
              {sorted.map((conversation) => {
                const therapist = getTherapist(conversation.professionalId);
                const last = lastFor(conversation.id);
                const unread = unreadCount(messages, conversation.id, "client");
                return (
                  <li key={conversation.id}>
                    <Link
                      href={`/messages/${conversation.professionalId}`}
                      aria-current={conversation.professionalId === professionalId ? "page" : undefined}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-arom-wash/60 ${conversation.professionalId === professionalId ? "bg-arom-wash" : ""}`}
                    >
                      {therapist && (
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-arom-soft">
                          <Image src={therapist.image} alt="" fill sizes="44px" className="object-cover" style={{ objectPosition: therapist.imagePosition }} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${unread ? "font-bold" : "font-medium"} text-ink`}>
                            {therapist ? getTherapistName(therapist, km) : conversation.professionalName}
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
                                : `${last.sender === "client" ? t("អ្នក: ", "You: ") : ""}${last.text}`}
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
          {selected ? (
            <>
              <header className="flex items-center gap-3 border-b border-arom-border px-4 py-3 sm:px-6">
                <Link href="/messages" aria-label={t("ត្រឡប់ក្រោយ", "Back")} className="rounded-full p-1.5 text-arom hover:bg-arom-wash lg:hidden">
                  <ArrowLeft size={18} />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">
                    {selectedTherapist ? getTherapistName(selectedTherapist, km) : selected.professionalName}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {km ? REPLY_TIME_LABELS[replyTimes[selected.professionalId] ?? "one_day"].km : REPLY_TIME_LABELS[replyTimes[selected.professionalId] ?? "one_day"].en}
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
