"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardList, History, MessageCircle } from "lucide-react";
import {
  formatClinicDay,
  formatClinicTime,
  type ClinicDesk,
  type DeskData,
  type DeskTime,
} from "@/lib/clinic-booking";
import { TopHeader } from "../../components/top-header";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { useLanguage } from "../language-provider";
import { useDeskChats } from "../clinic-chat/clinic-chat-store";
import { DeskChats } from "./desk-chats";
import { DeskRequestCard } from "./desk-request-card";
import { DeskSchedule } from "./desk-schedule";

type Tab = "requests" | "messages" | "schedule" | "answered";
type Load = "loading" | "ready" | "none" | "error";

/*
 * The clinic desk (BACKEND-HANDOFF.md section 34). A desk account (for
 * example the UP receptionist) answers booking requests, keeps the time table
 * (marks times full for Google Form bookings) and moves or cancels sessions.
 * Students show by the name they chose to share, usually "Anonymous".
 */
export function ClinicDeskView({ initialTab = "requests" }: { initialTab?: "requests" | "messages" }) {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [desks, setDesks] = useState<ClinicDesk[]>([]);
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<DeskData | null>(null);
  const [load, setLoad] = useState<Load>("loading");
  const [tab, setTab] = useState<Tab>(initialTab);
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [chatId, setChatId] = useState<string | null>(null);
  const deskChats = useDeskChats(slug);
  const unreadChats = deskChats.chats.reduce((sum, chat) => sum + chat.unread, 0);

  // Opens the chat with the student who sent this request (section 35).
  function messageAbout(requestId: string) {
    const chat = deskChats.chats.find((item) => item.requestIds.includes(requestId));
    setNotice("");
    setChatId(chat?.id ?? null);
    setTab("messages");
    if (!chat) void deskChats.reload();
  }

  useEffect(() => {
    let active = true;
    fetch("/api/clinic-desk", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        const body = (await response.json()) as { desks: ClinicDesk[] };
        if (!active) return;
        setDesks(body.desks);
        if (body.desks.length === 0) setLoad("none");
        else setSlug(body.desks[0].slug);
      })
      .catch(() => {
        if (active) setLoad("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const reload = useCallback(async (target: string) => {
    try {
      const response = await fetch(`/api/clinic-desk/${target}`, { cache: "no-store" });
      if (!response.ok) throw new Error("load failed");
      setData((await response.json()) as DeskData);
      setNow(Date.now());
      setLoad("ready");
    } catch {
      setLoad("error");
    }
  }, []);

  useEffect(() => {
    // Loading the desk from the API when the clinic changes is what this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (slug) void reload(slug);
  }, [slug, reload]);

  const schedule = useMemo(() => new Map<string, DeskTime>((data?.schedule ?? []).map((time) => [time.startsAt, time])), [data]);
  const waiting = (data?.requests ?? []).filter((item) => item.status === "waiting");
  const answered = (data?.requests ?? []).filter((item) => item.status !== "waiting");

  function done(message: string) {
    setNotice(message);
    if (slug) void reload(slug);
  }

  const tabs: { value: Tab; label: string; icon: typeof ClipboardList; count?: number }[] = [
    { value: "requests", label: t("សំណើថ្មី", "New requests"), icon: ClipboardList, count: waiting.length },
    { value: "messages", label: t("សារ", "Messages"), icon: MessageCircle, count: unreadChats },
    { value: "schedule", label: t("តារាងម៉ោង", "Time table"), icon: CalendarDays },
    { value: "answered", label: t("បានឆ្លើយ", "Answered"), icon: History },
  ];

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active={tab === "messages" ? "ClinicDeskMessages" : "ClinicDesk"} />

      <main className="min-w-0 px-4 pb-28 pt-3 sm:px-8 lg:px-10 lg:py-8 xl:px-14">
        <div className="mx-auto w-full max-w-[48rem]">
          {/* Phones: AROM logo, menu and profile, like Home and Messages. */}
          <TopHeader />

          <header className="mt-5 lg:mt-0">
            <h1 className="text-[28px] font-semibold leading-tight text-arom sm:text-4xl">
              {t("តុបម្រើគ្លីនិក (Clinic desk)", "Clinic desk")}
            </h1>
            {data && <p className="mt-1 text-[15px] text-ink">{(km && data.desk.kmName) || data.desk.name}</p>}
          </header>

          {desks.length > 1 && (
            <label className="mt-4 block text-sm font-semibold text-ink">
              {t("គ្លីនិក", "Clinic")}
              <select
                value={slug}
                onChange={(event) => {
                  setLoad("loading");
                  setSlug(event.target.value);
                }}
                className="mt-1.5 block w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm font-normal text-ink"
              >
                {desks.map((desk) => (
                  <option key={desk.slug} value={desk.slug}>
                    {(km && desk.kmName) || desk.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {load === "loading" && (
            <p role="status" className="mt-8 text-sm text-ink-muted">
              {t("កំពុងផ្ទុក...", "Loading...")}
            </p>
          )}
          {load === "none" && (
            <p className="mt-8 rounded-3xl border border-arom-border bg-white p-5 text-sm text-ink">
              {t(
                "ទំព័រនេះសម្រាប់គណនីតុបម្រើគ្លីនិកប៉ុណ្ណោះ។ ប្រសិនបើអ្នកធ្វើការនៅគ្លីនិក សូមសុំក្រុម AROM ឱ្យបើកវា។",
                "This page is for clinic desk accounts only. If you work at a clinic, ask the AROM team to set it up.",
              )}
            </p>
          )}
          {load === "error" && (
            <p role="alert" className="mt-8 text-sm text-arom-danger">
              {t("មិនអាចផ្ទុកតុបម្រើបានទេ។ សូមផ្ទុកទំព័រម្តងទៀត។", "We could not load the clinic desk. Please reload the page.")}
            </p>
          )}

          {load === "ready" && data && (
            <>
              <div
                role="tablist"
                aria-label={t("ផ្នែកតុបម្រើ", "Desk sections")}
                className="mt-6 grid grid-cols-4 gap-1 rounded-2xl border border-arom-border bg-arom-wash p-1"
              >
                {tabs.map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setNotice("");
                        setTab(item.value);
                      }}
                      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold leading-tight sm:text-sm ${
                        active ? "bg-arom text-white shadow-sm" : "text-ink-muted hover:bg-white/70 hover:text-arom"
                      }`}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>
                        {item.label}
                        {item.count ? ` (${item.count})` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-arom">
                {notice}
              </p>

              {tab === "requests" &&
                (waiting.length === 0 ? (
                  <p className="mt-2 rounded-3xl border border-dashed border-arom/30 bg-white px-6 py-10 text-center text-sm text-ink-muted">
                    {t("មិនមានសំណើថ្មីទេ។", "No new requests.")}
                  </p>
                ) : (
                  <ul className="mt-2 space-y-4">
                    {waiting.map((item) => (
                      <DeskRequestCard
                        key={item.id}
                        slug={slug}
                        request={item}
                        therapists={data.therapists}
                        schedule={schedule}
                        km={km}
                        now={now}
                        onDone={done}
                        onMessage={() => messageAbout(item.id)}
                      />
                    ))}
                  </ul>
                ))}

              {tab === "messages" && (
                <div className="mt-2">
                  <DeskChats
                    slug={slug}
                    chats={deskChats.chats}
                    status={deskChats.status}
                    selectedId={chatId}
                    onSelect={setChatId}
                    onChange={() => void deskChats.reload()}
                    km={km}
                  />
                </div>
              )}

              {tab === "schedule" && (
                <div className="mt-2">
                  <DeskSchedule slug={slug} schedule={data.schedule} km={km} now={now} onDone={done} />
                </div>
              )}

              {tab === "answered" &&
                (answered.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">{t("មិនទាន់មានទេ។", "Nothing yet.")}</p>
                ) : (
                  <ul className="mt-2 divide-y divide-arom-border rounded-3xl border border-arom-border bg-white">
                    {answered.map((item) => (
                      <li key={item.id} className="px-4 py-3 text-sm">
                        <p className="font-semibold text-ink">
                          #{item.reference} · {item.clientName}
                        </p>
                        <p className="mt-0.5 text-ink-muted">
                          {item.status === "confirmed" && item.bookedAt
                            ? `${t("បានបញ្ជាក់", "Confirmed")}: ${formatClinicDay(item.bookedAt, km)}, ${formatClinicTime(item.bookedAt, km)}${item.therapistName ? ` · ${item.therapistName}` : ""}${
                                item.appointmentStatus === "cancelled" ? ` · ${t("បានបោះបង់ក្រោយមក", "cancelled later")}` : ""
                              }`
                            : item.status === "declined"
                              ? `${t("ម៉ោងមិនបាន", "Times did not work")}${item.answerNote ? `: ${item.answerNote}` : ""}`
                              : t("សិស្សបានបោះបង់សំណើ", "The student cancelled the request")}
                        </p>
                      </li>
                    ))}
                  </ul>
                ))}
            </>
          )}
        </div>
      </main>

      <MobileNavigation active={tab === "messages" ? "ClinicDeskMessages" : "ClinicDesk"} />
    </div>
  );
}
