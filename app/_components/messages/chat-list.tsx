"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, Mic, UsersRound } from "lucide-react";
import type { MyGroup } from "../../community/group-api";

/**
 * One row of the Messages list. "direct" is a private chat between a client
 * and a professional (admins cannot read it). "group" is a support group chat
 * (the AROM safety team can read it). The label on each row says which.
 */
export type ChatRow = {
  kind: "direct" | "group";
  key: string;
  href: string;
  name: string;
  photoUrl?: string | null;
  lastAt: string | null;
  preview: string;
  voice?: boolean;
  unread: number;
  selected: boolean;
};

/** Direct chats and groups in one list, newest first, like Telegram. */
export function mergeChatRows(
  direct: ChatRow[],
  groups: MyGroup[],
  options: { href: (groupId: string) => string; selectedGroupId?: string; km: boolean },
): ChatRow[] {
  const { km } = options;
  const groupRows: ChatRow[] = groups.map((group) => {
    const { last } = group;
    const sender = last?.mine ? (km ? "អ្នក" : "You") : last?.senderName;
    return {
      kind: "group",
      key: `group-${group.id}`,
      href: options.href(group.id),
      name: km ? group.nameKm || group.name : group.name,
      lastAt: last?.createdAt ?? null,
      preview: !last
        ? km
          ? "មិនទាន់មានសារ"
          : "No messages yet"
        : last.removed
          ? km
            ? "សារត្រូវបានដកចេញ"
            : "Message removed"
          : `${sender}: ${last.text}`,
      // Group unread counts need a backend table (step 2 of the redesign).
      unread: 0,
      selected: group.id === options.selectedGroupId,
    };
  });

  return [...direct, ...groupRows].sort(
    (a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? "") || a.name.localeCompare(b.name),
  );
}

export function ChatListRow({ row, km, formatDate }: { row: ChatRow; km: boolean; formatDate: (value: string) => string }) {
  const group = row.kind === "group";
  return (
    <li>
      <Link
        href={row.href}
        aria-current={row.selected ? "page" : undefined}
        className={`flex items-center gap-3 px-4 py-3 hover:bg-arom-wash/60 ${row.selected ? "bg-arom-wash" : ""}`}
      >
        <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-arom-soft text-sm font-semibold text-arom">
          {group ? (
            <UsersRound size={20} aria-hidden="true" />
          ) : row.photoUrl ? (
            <Image src={row.photoUrl} alt="" fill sizes="44px" className="object-cover" />
          ) : (
            <span aria-hidden="true">{row.name.charAt(0)}</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className={`truncate text-sm ${row.unread ? "font-bold" : "font-medium"} text-ink`}>{row.name}</span>
            {row.lastAt && <span className="shrink-0 text-[0.7rem] text-ink-muted">{formatDate(row.lastAt)}</span>}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
            <span
              className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-px text-[0.65rem] font-semibold ${
                group ? "bg-arom-wash text-arom" : "bg-gray-100 text-ink-muted"
              }`}
            >
              {group ? <UsersRound size={10} aria-hidden="true" /> : <Lock size={10} aria-hidden="true" />}
              {group ? (km ? "ក្រុម" : "Group") : km ? "ឯកជន" : "Private"}
            </span>
            {row.voice && <Mic size={12} aria-hidden="true" />}
            <span className="truncate">{row.preview}</span>
          </span>
        </span>
        {row.unread > 0 && (
          <span
            aria-label={km ? `${row.unread} មិនទាន់អាន` : `${row.unread} unread`}
            className="rounded-full bg-arom px-2 py-0.5 text-[0.7rem] font-semibold text-white"
          >
            {row.unread}
          </span>
        )}
      </Link>
    </li>
  );
}
