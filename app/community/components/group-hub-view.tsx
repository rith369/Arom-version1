"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, UserCheck, Briefcase, CheckCircle2, Paperclip, FileText, X, Flag, MoreHorizontal } from "lucide-react";
import {
  MaskIcon,
  ShieldCheckIcon,
  PaperPlaneIcon,
} from "./community-icons";
import { useLanguage } from "../../_components/language-provider";
import { ReportDialog } from "./report-dialog";
import {
  CommunityReportTarget,
  SupportGroup,
  ChatMessage,
  ChatAttachment,
  GroupActivity,
  GroupMember,
} from "../community-data";

type GroupHubViewProps = {
  group: SupportGroup;
  messages: ChatMessage[];
  activities: GroupActivity[];
  members: GroupMember[];
  onBack: () => void;
  onSendMessage: (text: string, attachment?: ChatAttachment, groupId?: string) => void;
  onToggleActivityJoin: (activityId: string) => void;
};

export function GroupHubView({
  group,
  messages,
  activities,
  members,
  onBack,
  onSendMessage,
  onToggleActivityJoin,
}: GroupHubViewProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const isClosed = group.status === "closed";
  const [reportTarget, setReportTarget] = useState<CommunityReportTarget | null>(null);
  const [menuMessageId, setMenuMessageId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"chat" | "activities" | "member">("chat");
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith("image/");
    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultUrl = event.target?.result as string;
      setAttachment({
        name: file.name,
        url: resultUrl || "#",
        type: isImg ? "image" : "file",
        sizeStr,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachment) return;
    onSendMessage(inputText.trim(), attachment || undefined, group.id);
    setInputText("");
    setAttachment(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const upcoming = activities.filter((a) => a.isUpcoming);
  const past = activities.filter((a) => !a.isUpcoming);

  return (
    <div className="w-full max-w-lg mx-auto pb-6 px-4 pt-3 flex flex-col min-h-screen">
      {/* Top Header matching Figma Screen 5 */}
      <div className="flex items-center gap-2 py-2">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-[#1f6f5b] hover:bg-[#eaf5f1] transition-colors"
          aria-label={km ? "ត្រឡប់ក្រោយ" : "Back"}
        >
          <ChevronLeft size={28} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl sm:text-2xl font-extrabold text-[#111827]">
            {km ? group.nameKm : group.name}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[#6b7280]">
              {group.membersCount}/{group.maxMembers} {km ? "សមាជិក" : "members"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-[#e3f4ef] px-2 py-0.5 text-[11px] font-semibold text-[#1e6f5a]">
              <MaskIcon className="size-3 text-[#1e6f5a]" />
              {km ? "ក្រុមអនាមិក (Anonymous)" : "Anonymous group"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setReportTarget({ kind: "group", groupId: group.id })}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#eaf5f1] hover:text-[#1f6f5b] transition-colors"
          aria-label={km ? "រាយការណ៍អំពីក្រុម" : "Report this group"}
          title={km ? "រាយការណ៍អំពីក្រុម" : "Report this group"}
        >
          <Flag size={18} />
        </button>
      </div>

      {/* Closed by an admin: history stays readable, nobody can send */}
      {isClosed && (
        <div role="status" className="mt-3 rounded-[18px] border border-gray-200 bg-gray-50 p-3.5 text-sm text-[#374151]">
          <p className="font-bold text-[#111827]">
            {km ? "ក្រុមនេះត្រូវបានបិទដោយក្រុមការងារ AROM។" : "This group was closed by the AROM team."}
          </p>
          <p className="mt-1 text-xs text-[#6b7280] leading-relaxed">
            {km
              ? "អ្នកនៅតែអាចអានសារចាស់បាន ប៉ុន្តែមិនអាចផ្ញើសារថ្មីបានទេ។"
              : "You can still read past messages, but nobody can send new ones."}
          </p>
        </div>
      )}

      {/* Segmented Control Tabs matching Figma */}
      <div className="mt-4 grid grid-cols-3 border-b border-gray-200 text-center">
        {(["chat", "activities", "member"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === "chat"
              ? km ? "ការសន្ទនា (Chat)" : "Chat"
              : tab === "activities"
              ? km ? "សកម្មភាព (Activities)" : "Activities"
              : km ? "សមាជិក (Members)" : "Member";

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 text-sm font-bold transition-all relative ${
                isActive
                  ? "text-[#111827]"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              {label}
              {isActive && (
                <span className="absolute bottom-0 inset-x-4 h-0.5 bg-[#111827] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="mt-4 flex-1">
        {/* TAB 1: CHAT */}
        {activeTab === "chat" && (
          <div className="flex flex-col gap-4">
            {/* Pinned Group Guidelines Card matching Figma Screen 5 */}
            <div className="rounded-[22px] bg-[#dff3ec] p-4 text-[#1b4332] shadow-sm border border-[#cbebe1]">
              <div className="flex items-start gap-2.5">
                <ShieldCheckIcon className="size-6 text-[#1b5e4c] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold">
                    {km ? "គោលការណ៍ណែនាំក្រុម (Guidelines):" : "Group Guidelines:"}
                  </h3>
                  <ul className="mt-1.5 space-y-0.5 text-xs text-[#265d4c] leading-relaxed">
                    <li>• {km ? "មានចិត្តសប្បុរស និងការគោរពគ្នាទៅវិញទៅមក។" : "Be kind and respectful."}</li>
                    <li>• {km ? "រក្សាការសន្ទនាទាំងអស់ជាការសម្ងាត់។" : "Keep conversations private."}</li>
                    <li>• {km ? "គ្មានការរិះគន់ ឬវិនិច្ឆ័យ។" : "No judgment."}</li>
                    <li>• {km ? "មិនចែករំលែកព័ត៌មានផ្ទាល់ខ្លួន ឬលេខទូរស័ព្ទឡើយ។" : "No sharing of personal information."}</li>
                    <li>• {km ? "គ្មានការធ្វើរោគវិនិច្ឆ័យ ឬផ្តល់ដំបូន្មានវេជ្ជសាស្ត្រ។" : "No diagnosis or medical advice."}</li>
                    <li>• {km ? "ក្រុមការងារសុវត្ថិភាព AROM អាចអានការសន្ទនានេះ ដើម្បីរក្សាសុវត្ថិភាព។" : "The AROM safety team can read this chat to keep it safe."}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Chat Stream matching Figma Screen 5 */}
            <div className="space-y-3.5 pt-1">
              {messages.map((msg) => {
                const displayName = km ? (msg.senderNameKm || msg.senderName) : msg.senderName;
                const displayTime = km ? (msg.timeKm || msg.time) : msg.time;
                const displayText = km ? (msg.textKm || msg.text) : msg.text;
                const isOwn = msg.senderName === "Anonymous (You)";
                const menuOpen = menuMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_6px_rgba(0,0,0,0.03)] border border-gray-100/80"
                  >
                    {/* Avatar */}
                    {msg.isMentor ? (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1b5e4c] text-white shadow-sm">
                        <UserCheck size={20} />
                      </div>
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#dff3ec] text-[#1b5e4c] shadow-sm">
                        <MaskIcon className="size-5 text-[#1b5e4c]" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-xs font-bold text-[#111827]">
                          {displayName}
                          {msg.isMentor && (
                            <span className="ml-1.5 rounded bg-[#1b5e4c] px-1.5 py-0.2 text-[10px] font-semibold text-white">
                              {km ? "អ្នកណែនាំ" : "Mentor"}
                            </span>
                          )}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="text-[11px] text-gray-400">
                            {displayTime}
                          </span>
                          {!isOwn && !msg.removed && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setMenuMessageId(menuOpen ? null : msg.id)}
                                aria-expanded={menuOpen}
                                aria-label={km ? "ជម្រើសសារ" : "Message options"}
                                className="flex size-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                              {menuOpen && (
                                <div className="absolute right-0 top-8 z-20 w-48 overflow-hidden rounded-[14px] border border-gray-100 bg-white py-1 text-xs shadow-lg">
                                  {[
                                    {
                                      label: km ? "រាយការណ៍អំពីបុគ្គលនេះ" : "Report this person",
                                      target: { kind: "member", groupId: group.id, memberLabel: msg.senderName, messageId: msg.id } as const,
                                    },
                                    {
                                      label: km ? "រាយការណ៍អំពីសារ" : "Report message",
                                      target: { kind: "message", groupId: group.id, messageId: msg.id } as const,
                                    },
                                    ...(msg.attachment?.type === "image"
                                      ? [
                                          {
                                            label: km ? "រាយការណ៍អំពីរូបភាព" : "Report image",
                                            target: { kind: "image", groupId: group.id, messageId: msg.id } as const,
                                          },
                                        ]
                                      : []),
                                  ].map((option) => (
                                    <button
                                      key={option.target.kind}
                                      type="button"
                                      onClick={() => {
                                        setMenuMessageId(null);
                                        setReportTarget(option.target);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[#374151] hover:bg-[#f2f9f6]"
                                    >
                                      <Flag size={13} className="shrink-0 text-[#6b7280]" />
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {msg.removed && (
                        <p className="mt-1 text-xs sm:text-sm italic text-[#9ca3af] leading-relaxed">
                          {km ? "សារនេះត្រូវបានលុបដោយក្រុមការងារ AROM។" : "This message was removed by the AROM team."}
                        </p>
                      )}

                      {displayText && !msg.removed && (
                        <p className="mt-1 text-xs sm:text-sm text-[#374151] leading-relaxed">
                          {displayText}
                        </p>
                      )}

                      {/* Attached File or Image */}
                      {msg.attachment && !msg.removed && (
                        <div className="mt-2.5">
                          {msg.attachment.type === "image" ? (
                            <div className="overflow-hidden rounded-xl border border-gray-200/80 max-w-[260px] shadow-xs">
                              <img
                                src={msg.attachment.url}
                                alt={msg.attachment.name}
                                className="max-h-56 w-auto object-cover rounded-xl"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5 rounded-xl border border-[#cbebe1] bg-[#f2f9f6] p-2.5 text-xs text-[#1b4332] max-w-xs shadow-xs">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#dff3ec] text-[#1b5e4c]">
                                <FileText size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-bold text-[#111827]">{msg.attachment.name}</p>
                                {msg.attachment.sizeStr && (
                                  <p className="text-[10px] text-[#2d6a54] mt-0.5">{msg.attachment.sizeStr}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Container with Attachment Support */}
            {isClosed ? (
              <p className="mt-4 rounded-full bg-gray-100 px-4 py-3 text-center text-xs text-[#6b7280]">
                {km ? "ក្រុមបានបិទ។ មិនអាចផ្ញើសារបានទេ។" : "This group is closed. Messages are turned off."}
              </p>
            ) : (
              <div className="sticky bottom-3 z-30 mt-4">
                {/* Attachment Preview Chip (if selected) */}
                {attachment && (
                  <div className="mb-2 flex items-center justify-between rounded-2xl border border-[#bce3d6] bg-[#eef8f4] px-3.5 py-2 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-150">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {attachment.type === "image" ? (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-[#cce8df]">
                          <img src={attachment.url} alt="" className="size-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#dff3ec] text-[#1b5e4c]">
                          <FileText size={20} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#111827]">{attachment.name}</p>
                        <p className="text-[10px] text-[#2d6a54]">{attachment.sizeStr}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-xs ml-2"
                      aria-label={km ? "លុបឯកសារភ្ជាប់" : "Remove attachment"}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-2 rounded-full border border-gray-200/90 bg-white/98 backdrop-blur-md px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
                >
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* File / Image Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:text-[#1b5e4c] hover:bg-[#eaf5f1] transition-colors"
                    title={km ? "ភ្ជាប់ឯកសារ ឬរូបភាព" : "Attach file or image"}
                    aria-label={km ? "ភ្ជាប់ឯកសារ" : "Attach file"}
                  >
                    <Paperclip size={18} />
                  </button>

                  {/* Message Text Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={km ? "ចែករំលែកគំនិត ឬសំណួររបស់អ្នក..." : "Share your thought..."}
                    className="flex-1 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() && !attachment}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1b5e4c] text-white transition-all disabled:opacity-40 hover:bg-[#144b3e] active:scale-95 shadow-sm"
                    aria-label={km ? "ផ្ញើសារ" : "Send"}
                  >
                    <PaperPlaneIcon className="size-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVITIES */}
        {activeTab === "activities" && (
          <div className="flex flex-col gap-6">
            {/* Upcoming Activities matching Figma Screen 6 */}
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                {km ? "សកម្មភាពខាងមុខ (Upcoming Activities)" : "Upcoming Activities"}
              </h2>

              <div className="mt-3 flex flex-col gap-3">
                {upcoming.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between rounded-[22px] border border-gray-100 bg-white p-3.5 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#e6f4ef]">
                        {act.iconAsset ? (
                          <Image
                            src={act.iconAsset}
                            alt=""
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[#111827]">
                          {km ? act.titleKm : act.title}
                        </h3>
                        <p className="truncate text-xs text-[#6b7280]">
                          {km ? (act.topicKm || act.topic) : act.topic}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-[#1f6f5b]">
                          {km ? (act.dateStrKm || act.dateStr) : act.dateStr}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleActivityJoin(act.id)}
                      disabled={isClosed}
                      className={`ml-2 disabled:opacity-40 shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                        act.isJoined
                          ? "bg-[#eaf5f1] text-[#1b5e4c] border border-[#1b5e4c]/30"
                          : "bg-[#1b5e4c] text-white hover:bg-[#144b3e]"
                      }`}
                    >
                      {act.isJoined
                        ? km ? "បានចូលរួម ✓" : "Joined ✓"
                        : km ? "ចូលរួម (Join)" : "Join"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Activities matching Figma Screen 6 */}
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                {km ? "សកម្មភាពកន្លងមក (Past Events)" : "Past Activities"}
              </h2>

              <div className="mt-3 flex flex-col gap-3">
                {past.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center gap-3.5 rounded-[22px] border border-gray-100 bg-white p-3.5 shadow-sm"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#e6f4ef]">
                      {act.iconAsset ? (
                        <Image
                          src={act.iconAsset}
                          alt=""
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[#111827]">
                        {km ? act.titleKm : act.title}
                      </h3>
                      <p className="text-xs text-[#9ca3af]">
                        {km ? (act.dateStrKm || act.dateStr) : act.dateStr}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEMBER matching Figma Screen 7 with Mentor at the top */}
        {activeTab === "member" && (
          <div className="flex flex-col gap-5">
            {/* Mentor Section on top */}
            {group.mentor && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1b5e4c]">
                    {km ? "អ្នកណែនាំក្រុម (Group Mentor)" : "Group Mentor"}
                  </h2>
                  <span className="rounded-full bg-[#e3f4ef] px-2.5 py-0.5 text-[11px] font-bold text-[#1b5e4c]">
                    {km ? (group.mentor.badgeKm || "អ្នកណែនាំក្រុម") : (group.mentor.badge || "Group Mentor")}
                  </span>
                </div>

                <div className="rounded-[22px] border border-[#1b5e4c]/25 bg-gradient-to-br from-[#f2f9f6] via-white to-white p-4 shadow-[0_2px_12px_rgba(27,94,76,0.06)]">
                  <div className="flex items-center gap-3.5">
                    {/* Mentor Avatar */}
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-[#1b5e4c]/20 bg-[#e3f4ef]">
                      {group.mentor.avatarUrl ? (
                        <Image
                          src={group.mentor.avatarUrl}
                          alt={group.mentor.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[#1b5e4c]">
                          <UserCheck size={26} />
                        </div>
                      )}
                    </div>

                    {/* Mentor Details: Name, Role, Experience */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-base font-extrabold text-[#111827]">
                          {km ? group.mentor.nameKm : group.mentor.name}
                        </h3>
                        <span className="shrink-0 text-[#1b5e4c]" title="Verified Mentor">
                          <CheckCircle2 size={16} className="fill-[#1b5e4c] text-white" />
                        </span>
                      </div>

                      {/* Role */}
                      <p className="truncate text-xs font-bold text-[#1b5e4c] mt-0.5">
                        {km ? group.mentor.roleKm : group.mentor.role}
                      </p>

                      {/* Experience */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#4b5563]">
                        <Briefcase size={12} className="text-[#1b5e4c] shrink-0" />
                        <span className="font-semibold text-gray-700">
                          {km ? group.mentor.experienceKm : group.mentor.experience}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mentor Bio / Note */}
                  {group.mentor.bio && (
                    <p className="mt-3 border-t border-gray-100/90 pt-2.5 text-xs text-[#4b5563] leading-relaxed">
                      {km ? group.mentor.bioKm : group.mentor.bio}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Group Members List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {km ? `សមាជិកក្រុម (${members.length})` : `Group Members (${members.length})`}
                </h2>
              </div>

              <div className="flex flex-col gap-2.5">
                {members.map((mem) => {
                  const memberName = km ? (mem.nameKm || mem.name) : mem.name;
                  return (
                    <div
                      key={mem.id}
                      className="flex items-center gap-3.5 rounded-[20px] border border-gray-100 bg-white px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {mem.avatarType === "mask" ? (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#dff3ec] text-[#1b5e4c]">
                          <MaskIcon className="size-5" />
                        </div>
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e3f4ef] text-[#1b5e4c]">
                          <UserCheck size={18} />
                        </div>
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#111827]">
                        {memberName}
                      </span>
                      {mem.name !== "Anonymous (You)" && (
                        <button
                          type="button"
                          onClick={() =>
                            setReportTarget({ kind: "member", groupId: group.id, memberId: mem.id, memberLabel: mem.name })
                          }
                          aria-label={km ? `រាយការណ៍អំពី ${memberName}` : `Report ${memberName}`}
                          title={km ? "រាយការណ៍អំពីបុគ្គលនេះ" : "Report this person"}
                          className="flex size-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Flag size={15} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {reportTarget && (
        <ReportDialog target={reportTarget} onClose={() => setReportTarget(null)} />
      )}
    </div>
  );
}
