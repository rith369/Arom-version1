"use client";

import Link from "next/link";
import { ClipboardList, MessageCircle, type LucideIcon } from "lucide-react";
import { useLanguage } from "../language-provider";
import { useDeskChats } from "../clinic-chat/clinic-chat-store";
import { useClinicDesks } from "./use-clinic-desks";

function DeskNavLink({
  href,
  icon: Icon,
  title,
  subtitle,
  badge,
  active,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: number;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex min-h-[46px] items-center gap-3 rounded-xl px-3 py-2 transition-all duration-150 ${
        active ? "bg-white text-arom shadow-xs ring-1 ring-arom/20" : "text-ink hover:bg-white hover:text-arom hover:shadow-2xs"
      }`}
    >
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
          active
            ? "bg-arom text-white shadow-[0_2px_8px_rgba(31,111,91,0.28)]"
            : "border border-arom-border/70 bg-white text-arom group-hover:border-arom/40 group-hover:bg-arom-soft"
        }`}
      >
        <Icon size={19} strokeWidth={active ? 2.3 : 2} />
      </div>
      <span className="min-w-0 flex-1">
        <span className={`block text-[14px] font-semibold leading-snug ${active ? "font-bold text-arom" : "text-ink group-hover:text-arom"}`}>
          {title}
        </span>
        {subtitle && <span className="block truncate text-[11px] text-ink-muted">{subtitle}</span>}
      </span>
      {badge ? (
        <span className="shrink-0 rounded-full bg-arom px-2 py-0.5 text-[0.7rem] font-semibold text-white">{badge}</span>
      ) : null}
    </Link>
  );
}

/**
 * The first section of the sidebar and the phone menu for clinic desk
 * accounts (sections 34 and 35): booking requests and messages with
 * students. Hidden for everyone else.
 */
export function ClinicDeskNavSection({
  active,
  onNavigate,
}: {
  active: "requests" | "messages" | null;
  onNavigate?: () => void;
}) {
  const { language } = useLanguage();
  const km = language === "km";
  const desks = useClinicDesks();
  // Unread student messages of the (first) desk, checked every 30 seconds.
  // No request is made for accounts without a desk.
  const chats = useDeskChats(desks[0]?.slug ?? "");
  if (desks.length === 0) return null;

  const names = desks.map((desk) => (km && desk.kmName) || desk.name).join(", ");
  const unread = chats.chats.reduce((sum, chat) => sum + chat.unread, 0);

  return (
    <div className="space-y-1.5 rounded-2xl border border-arom/30 bg-arom-soft/60 p-2.5 shadow-[0_1px_3px_rgba(20,54,47,0.03)]">
      <div className="flex items-center gap-2 px-2.5 pb-1 pt-1">
        <span className="size-1.5 rounded-full bg-arom" />
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-arom-deep">
          {km ? "តុបម្រើគ្លីនិក" : "Clinic desk"}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <DeskNavLink
          href="/clinic-desk"
          icon={ClipboardList}
          title={km ? "សំណើកក់" : "Booking requests"}
          subtitle={names}
          active={active === "requests"}
          onNavigate={onNavigate}
        />
        <DeskNavLink
          href="/clinic-desk?tab=messages"
          icon={MessageCircle}
          title={km ? "សារ" : "Messages"}
          subtitle={km ? "ជជែកជាមួយសិស្ស" : "Chats with students"}
          badge={unread}
          active={active === "messages"}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
