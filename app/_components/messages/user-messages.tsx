"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarCheck, LifeBuoy, Lock, MessageCircle, Monitor, Repeat, UserRound, UsersRound, X } from "lucide-react";
import type { AppointmentsResponse, UserAppointment } from "@/lib/appointments";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { TopHeader } from "../../components/top-header";
import { useLanguage } from "../language-provider";
import { JoinButton } from "../sessions/join-button";
import { GroupChat } from "../../community/components/group-chat";
import { useMyGroups } from "../../community/group-api";
import { ChatListRow, mergeChatRows, type ChatRow } from "./chat-list";
import { ChatThread } from "./chat-thread";
import {
  REPLY_TIME_LABELS,
  useConversations,
  type Conversation,
  type ConversationSummary,
} from "./message-store";

// The "not for emergencies" bar is shown until the person closes it once.
// The choice is kept in this browser only (not their account). The server
// render counts it as closed, so someone who closed it never sees it flash.
const NOTICE_KEY = "arom_messages_emergency_notice_closed";
const NOTICE_EVENT = "arom_messages_emergency_notice_updated";

function subscribeToNotice(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(NOTICE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(NOTICE_EVENT, onChange);
  };
}

// Used when the browser blocks storage: the bar then hides until the page reloads.
let noticeClosedInMemory = false;

function readNoticeClosed(): boolean {
  try {
    return noticeClosedInMemory || window.localStorage.getItem(NOTICE_KEY) === "1";
  } catch {
    return noticeClosedInMemory;
  }
}

function useEmergencyNoticeClosed() {
  const closed = useSyncExternalStore(subscribeToNotice, readNoticeClosed, () => true);
  const close = () => {
    noticeClosedInMemory = true;
    try {
      window.localStorage.setItem(NOTICE_KEY, "1");
    } catch {
      // Blocked storage: the in memory flag above still hides it for now.
    }
    window.dispatchEvent(new Event(NOTICE_EVENT));
  };
  return [closed, close] as const;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Messages" />
      <main className="min-w-0 px-4 pb-28 pt-3 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-5xl">
          {/* AROM brand, menu and profile on phones, the same as Home and Community. */}
          <TopHeader />
          <div className="mt-5 lg:mt-0">{children}</div>
        </div>
      </main>
      <MobileNavigation active="Messages" />
    </div>
  );
}

// Messages holds every chat, like Telegram: private chats with professionals
// and the support groups this person joined, newest first (18 Oct 2026).
export function UserMessages({ professionalId, groupId }: { professionalId?: string; groupId?: string }) {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const router = useRouter();
  const list = useConversations("client");
  const myGroups = useMyGroups();
  const [noticeDismissed, dismissNotice] = useEmergencyNoticeClosed();
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
  const directRows: ChatRow[] = list.conversations.map((conversation) => {
    const { last } = conversation;
    return {
      kind: "direct",
      key: conversation.key,
      href: `/messages/${conversation.professionalId}`,
      name: nameOf(conversation),
      photoUrl: conversation.photoUrl,
      lastAt: last?.createdAt ?? null,
      preview: !last
        ? t("មិនទាន់មានសារ", "No messages yet")
        : last.kind === "suggestion"
          ? t("ម៉ោងសម្រាប់វគ្គបន្ទាប់របស់អ្នក", "Times for your next session")
          : last.kind === "voice"
            ? t("សារសំឡេង", "Voice message")
            : last.kind === "image"
              ? `${last.mine ? t("អ្នក: ", "You: ") : ""}${t("រូបថត", "Photo")}`
              : last.kind === "file"
                ? `${last.mine ? t("អ្នក: ", "You: ") : ""}PDF`
                : `${last.mine ? t("អ្នក: ", "You: ") : ""}${last.text}`,
      voice: last?.kind === "voice",
      unread: conversation.unread,
      selected: conversation.professionalId === professionalId,
    };
  });
  const rows = mergeChatRows(directRows, myGroups.groups, {
    href: (id) => `/messages/groups/${id}`,
    selectedGroupId: groupId,
    km,
  });
  const selectedGroup = myGroups.groups.find((group) => group.id === groupId);
  const loading = list.status === "loading" || myGroups.status === "loading";
  const hasSelection = Boolean(professionalId || groupId);
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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-arom sm:text-3xl">{t("សារ (Messages)", "Messages")}</h1>
        {/* Community left the phone menu for Messages, so finding a group starts here too. */}
        <Link
          href="/community"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-arom-border bg-white px-3 py-1.5 text-sm font-semibold text-arom hover:bg-arom-wash"
        >
          <UsersRound size={16} aria-hidden="true" />
          {t("ស្វែងរកក្រុម", "Find a group")}
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        {t(
          "ការជជែកឯកជនជាមួយអ្នកជំនាញរបស់អ្នក និងក្រុមគាំទ្រដែលអ្នកបានចូលរួម។",
          "Private chats with your professional, and the support groups you joined.",
        )}
      </p>

      {/* On phones an open chat fills the whole screen, like Telegram; laptops keep two columns. */}
      <div
        className={
          hasSelection
            ? "fixed inset-0 z-50 grid h-[100dvh] overflow-hidden bg-white pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] lg:static lg:z-auto lg:mt-5 lg:rounded-3xl lg:border lg:border-arom-border lg:pb-0 lg:pt-0 lg:shadow-card lg:h-[72vh] lg:grid-cols-[18rem_minmax(0,1fr)]"
            : "mt-5 grid overflow-hidden rounded-3xl border border-arom-border bg-white shadow-card lg:h-[72vh] lg:grid-cols-[18rem_minmax(0,1fr)]"
        }
      >
        <aside className={`border-arom-border lg:flex lg:min-h-0 lg:flex-col lg:border-r ${hasSelection ? "hidden" : "flex flex-col"}`}>
          {loading && rows.length === 0 ? (
            <p role="status" className="p-6 text-center text-sm text-ink-muted">
              {t("កំពុងផ្ទុក...", "Loading...")}
            </p>
          ) : list.status === "error" && rows.length === 0 ? (
            <p role="alert" className="p-6 text-center text-sm text-arom-danger">
              {t("មិនអាចផ្ទុកសាររបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។", "We could not load your messages. Please try again.")}
            </p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-center text-sm leading-6 text-ink-muted">
              {t(
                "អ្នកអាចផ្ញើសារទៅអ្នកជំនាញ បន្ទាប់ពីអ្នកកក់ការពិគ្រោះជាមួយពួកគេ ឬចូលរួមក្រុមគាំទ្រ។",
                "You can message a professional after you book a session with them, or join a support group.",
              )}{" "}
              <Link href="/professional" className="font-semibold text-arom underline">
                {t("ស្វែងរកអ្នកជំនាញ", "Find a professional")}
              </Link>
              {" · "}
              <Link href="/community" className="font-semibold text-arom underline">
                {t("ស្វែងរកក្រុម", "Find a group")}
              </Link>
            </p>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-arom-border overflow-y-auto">
              {rows.map((row) => (
                <ChatListRow key={row.key} row={row} km={km} formatDate={(value) => date.format(new Date(value))} />
              ))}
            </ul>
          )}
        </aside>

        <section className={`min-h-0 flex-col ${hasSelection ? "flex h-full lg:h-auto" : "hidden lg:flex"}`}>
          {selectedGroup ? (
            <GroupChat key={selectedGroup.id} group={selectedGroup} onRead={myGroups.markRead} onBack={() => router.push("/messages")} />
          ) : selected && selectedSummary ? (
            <>
              <header className="flex items-center gap-3 border-b border-arom-border px-4 py-3 sm:px-6">
                <Link href="/messages" aria-label={t("ត្រឡប់ក្រោយ", "Back")} className="rounded-full p-1.5 text-arom hover:bg-arom-wash lg:hidden">
                  <ArrowLeft size={18} />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">
                    {nameOf(selectedSummary)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-ink-muted">
                    <Lock size={11} aria-hidden="true" />
                    {t("ឯកជន", "Private")} ·{" "}
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
              {!noticeDismissed && (
                <div className="flex items-start gap-2 border-b border-arom-warning/20 bg-arom-warning-soft px-4 py-2.5 text-xs leading-5 text-arom-warning sm:px-6">
                  <LifeBuoy size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <p className="min-w-0 flex-1">
                    {t("សារមិនមែនសម្រាប់ករណីបន្ទាន់ទេ។ ប្រសិនបើអ្នកកំពុងមានគ្រោះថ្នាក់ឥឡូវនេះ ", "Messages are not for emergencies. If you are in danger right now, ")}
                    <Link href="/profile#get-help-title" className="font-semibold underline">
                      {t("ទៅកាន់ជំនួយបន្ទាន់", "go to Get help now")}
                    </Link>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={dismissNotice}
                    aria-label={t("បិទការជូនដំណឹងនេះ", "Close this notice")}
                    className="-my-1 -mr-1.5 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-arom-warning/10 focus-visible:outline-2 focus-visible:outline-arom-warning cursor-pointer"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                </div>
              )}
              <div className="min-h-0 flex-1">
                <ChatThread conversation={selected} viewer="client" km={km} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <MessageCircle size={32} aria-hidden="true" className="text-ink-muted" />
              <p className="mt-3 text-sm text-ink-muted">{t("ជ្រើសរើសការជជែក ដើម្បីមើលសារ។", "Choose a chat to see its messages.")}</p>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
