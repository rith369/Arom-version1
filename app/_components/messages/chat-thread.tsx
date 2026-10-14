"use client";

import { MessageSquareText, Mic, Pause, Play, Plus, Send, Square, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SuggestionCard } from "../sessions/suggestion-card";
import {
  MAX_QUICK_REPLIES,
  MAX_QUICK_REPLY,
  MAX_TEXT,
  MAX_VOICE_SECONDS,
  fillQuickReply,
  markRead,
  saveQuickReplies,
  sendMessage,
  useQuickReplies,
  useThread,
  type ChatMessage,
  type Conversation,
  type SendResult,
  type Sender,
} from "./message-store";

const TIME_ZONE = "Asia/Phnom_Penh";

const formatSeconds = (value: number) =>
  `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;

function VoiceBubble({ message, mine, km }: { message: ChatMessage; mine: boolean; km: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const hasAudio = Boolean(message.audioUrl);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }

  const progress = message.durationSeconds ? Math.min(1, position / message.durationSeconds) : 0;

  return (
    <div className="flex min-w-48 items-center gap-3">
      {hasAudio && (
        <audio
          ref={audioRef}
          src={message.audioUrl}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setPosition(0);
          }}
          onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        />
      )}
      <button
        type="button"
        onClick={toggle}
        disabled={!hasAudio}
        aria-label={playing ? (km ? "ផ្អាក" : "Pause") : km ? "ចាក់សារសំឡេង" : "Play voice message"}
        className={`flex size-9 shrink-0 items-center justify-center rounded-full disabled:opacity-50 ${mine ? "bg-white/20 text-white" : "bg-arom-soft text-arom"}`}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className={`h-1.5 overflow-hidden rounded-full ${mine ? "bg-white/25" : "bg-arom-soft"}`}>
          <div className={`h-full rounded-full ${mine ? "bg-white" : "bg-arom"}`} style={{ width: `${progress * 100}%` }} />
        </div>
        <p className={`mt-1 text-[0.7rem] tabular-nums ${mine ? "text-white/80" : "text-ink-muted"}`}>
          {hasAudio
            ? formatSeconds(playing ? position : message.durationSeconds)
            : `${formatSeconds(message.durationSeconds)} · ${km ? "គំរូ គ្មានសំឡេង" : "sample, no audio"}`}
        </p>
      </div>
    </div>
  );
}

type RecorderState =
  | { phase: "idle" }
  | { phase: "recording"; seconds: number }
  | { phase: "preview"; url: string; blob: Blob; seconds: number };

export function ChatThread({
  conversation,
  viewer,
  km,
  closedNote,
  quickReplyValues,
}: {
  conversation: Conversation;
  viewer: Sender;
  km: boolean;
  // When set, the chat is read only and this explains why.
  closedNote?: string;
  // Professionals only: turns on saved quick replies and fills {name}, {link}, {next}.
  quickReplyValues?: { name: string; link: string; next: string };
}) {
  const { loaded, messages: thread, summary } = useThread(conversation, viewer);
  const replies = useQuickReplies(Boolean(quickReplyValues));
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [managing, setManaging] = useState(false);
  const [newReply, setNewReply] = useState("");
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  // Read only when the parent says so, when the professional archived the
  // client, or when there is no booked or completed session.
  const lockedNote =
    closedNote ??
    (summary && !summary.canWrite
      ? summary.closed
        ? t("ការសន្ទនានេះត្រូវបានបិទ។ សារត្រូវបានរក្សាទុក។", "This conversation is closed. Messages are kept.")
        : viewer === "client"
          ? t("អ្នកអាចផ្ញើសារម្តងទៀត បន្ទាប់ពីអ្នកកក់វគ្គ។", "You can send messages again after you book a session.")
          : t("អ្នកអាចផ្ញើសារទៅអតិថិជននេះម្តងទៀត បន្ទាប់ពីពួកគេកក់វគ្គជាមួយអ្នក។", "You can message this client again after they book a session with you.")
      : undefined);

  const [text, setText] = useState("");
  const [recorder, setRecorder] = useState<RecorderState>({ phase: "idle" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const secondsRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    markRead(conversation, viewer);
    // The conversation object is rebuilt on every render; its id is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id, viewer, thread.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [thread.length]);

  // Stop the microphone if the person leaves while recording.
  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      mediaRef.current?.stream.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  function failureText(result: Exclude<SendResult, { ok: true }>) {
    if (result.reason === "closed") return t("ការសន្ទនានេះត្រូវបានបិទ។", "This conversation is closed.");
    if (result.reason === "not_allowed") return t("អ្នកអាចផ្ញើសារបាន បន្ទាប់ពីមានវគ្គដែលបានកក់។", "You can send messages after a booked session.");
    return t("មិនអាចផ្ញើសាររបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។", "Your message could not be sent. Please try again.");
  }

  async function sendText() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError("");
    const result = await sendMessage(conversation, viewer, { kind: "text", text: value });
    setSending(false);
    if (result.ok) setText("");
    else setError(failureText(result));
  }

  async function sendVoice(blob: Blob, seconds: number, url: string) {
    if (sending) return;
    setSending(true);
    setError("");
    const result = await sendMessage(conversation, viewer, { kind: "voice", audio: blob, durationSeconds: seconds });
    setSending(false);
    if (result.ok) {
      URL.revokeObjectURL(url);
      setRecorder({ phase: "idle" });
    } else {
      setError(failureText(result));
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendText();
    }
  }

  function stopRecording(cancel = false) {
    cancelledRef.current = cancel;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    mediaRef.current?.stop();
  }

  async function startRecording() {
    setError("");
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError(t("កម្មវិធីរុករកនេះមិនអាចថតសំឡេងបានទេ។", "This browser cannot record voice."));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      chunksRef.current = [];
      secondsRef.current = 0;
      cancelledRef.current = false;
      media.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      media.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (cancelledRef.current || chunksRef.current.length === 0) {
          setRecorder({ phase: "idle" });
          return;
        }
        const blob = new Blob(chunksRef.current, { type: media.mimeType || "audio/webm" });
        setRecorder({ phase: "preview", url: URL.createObjectURL(blob), blob, seconds: Math.max(1, secondsRef.current) });
      };
      mediaRef.current = media;
      media.start();
      setRecorder({ phase: "recording", seconds: 0 });
      timerRef.current = window.setInterval(() => {
        secondsRef.current += 1;
        setRecorder({ phase: "recording", seconds: secondsRef.current });
        if (secondsRef.current >= MAX_VOICE_SECONDS) stopRecording();
      }, 1000);
    } catch {
      setError(t("សូមអនុញ្ញាតឱ្យប្រើមីក្រូហ្វូន ដើម្បីថតសារសំឡេង។", "Allow the microphone to record a voice message."));
    }
  }

  const dayLabel = (iso: string) =>
    new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE }).format(new Date(iso));
  const timeLabel = (iso: string) =>
    new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE }).format(new Date(iso));
  const dayKey = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date(iso));
  const lastMine = [...thread].reverse().find((item) => item.sender === viewer);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4 sm:px-6">
        {!loaded && (
          <p role="status" className="py-10 text-center text-sm text-ink-muted">
            {t("កំពុងផ្ទុក...", "Loading...")}
          </p>
        )}
        {loaded && thread.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-muted">
            {t("មិនទាន់មានសារទេ។ ចាប់ផ្តើមការសន្ទនា។", "No messages yet. Start the conversation.")}
          </p>
        )}
        {thread.map((message, index) => {
          const mine = message.sender === viewer;
          const newDay = index === 0 || dayKey(thread[index - 1].createdAt) !== dayKey(message.createdAt);
          return (
            <div key={message.id}>
              {newDay && (
                <p className="py-2 text-center text-xs font-medium text-ink-muted">{dayLabel(message.createdAt)}</p>
              )}
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                {message.kind === "suggestion" ? (
                  <div className="w-full max-w-sm">
                    <SuggestionCard suggestionId={message.suggestionId} viewer={viewer} km={km} readOnly={Boolean(lockedNote)} />
                    <p className={`mt-1 text-[0.68rem] text-ink-muted ${mine ? "text-right" : ""}`}>{timeLabel(message.createdAt)}</p>
                  </div>
                ) : (
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
                    mine ? "rounded-br-md bg-arom text-white" : "rounded-bl-md border border-arom-border bg-white text-ink"
                  }`}
                >
                  {message.kind === "voice" ? (
                    <VoiceBubble message={message} mine={mine} km={km} />
                  ) : (
                    <p className="whitespace-pre-line break-words">{message.text}</p>
                  )}
                  <p className={`mt-1 text-right text-[0.68rem] ${mine ? "text-white/75" : "text-ink-muted"}`}>
                    {timeLabel(message.createdAt)}
                    {mine && message.id === lastMine?.id && message.readAt && ` · ${t("បានឃើញ", "Seen")}`}
                  </p>
                </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {lockedNote ? (
        <p className="border-t border-arom-border bg-arom-wash/70 px-5 py-4 text-center text-sm text-ink-muted">{lockedNote}</p>
      ) : (
        <div className="border-t border-arom-border bg-white px-3 py-3 sm:px-4">
          {error && (
            <p role="alert" className="mb-2 text-xs font-medium text-arom-danger">
              {error}
            </p>
          )}

          {recorder.phase === "recording" && (
            <div className="flex items-center gap-3 rounded-2xl bg-arom-danger-soft px-4 py-3">
              <span className="size-2.5 animate-pulse rounded-full bg-arom-danger" aria-hidden="true" />
              <span className="flex-1 text-sm font-medium tabular-nums text-ink" role="status">
                {t("កំពុងថត", "Recording")} {formatSeconds(recorder.seconds)} / {formatSeconds(MAX_VOICE_SECONDS)}
              </span>
              <button type="button" onClick={() => stopRecording(true)} className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-white">
                {t("បោះបង់", "Cancel")}
              </button>
              <button type="button" onClick={() => stopRecording()} className="flex items-center gap-1.5 rounded-full bg-arom-danger px-3.5 py-1.5 text-xs font-semibold text-white">
                <Square size={12} aria-hidden="true" />
                {t("ឈប់", "Stop")}
              </button>
            </div>
          )}

          {recorder.phase === "preview" && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-arom-wash px-3 py-2.5">
              <audio src={recorder.url} controls className="h-9 min-w-0 flex-1" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(recorder.url);
                  setRecorder({ phase: "idle" });
                }}
                aria-label={t("លុបសារសំឡេង", "Discard voice message")}
                className="rounded-full p-2 text-arom-danger hover:bg-white"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => void sendVoice(recorder.blob, recorder.seconds, recorder.url)}
                disabled={sending}
                className="flex items-center gap-1.5 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-50"
              >
                <Send size={15} aria-hidden="true" />
                {t("ផ្ញើ", "Send")}
              </button>
            </div>
          )}

          {recorder.phase === "idle" && quickReplyValues && repliesOpen && (
            <div className="mb-2 rounded-2xl border border-arom-border bg-white p-3 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ink">{t("ចម្លើយរហ័ស", "Quick replies")}</p>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setManaging(!managing)} className="rounded-full px-2.5 py-1 text-xs font-semibold text-arom hover:bg-arom-wash">
                    {managing ? t("រួចរាល់", "Done") : t("កែសម្រួល", "Edit")}
                  </button>
                  <button type="button" onClick={() => setRepliesOpen(false)} aria-label={t("បិទ", "Close")} className="rounded-full p-1 text-ink-muted hover:bg-arom-wash">
                    <X size={15} />
                  </button>
                </div>
              </div>
              {replies.length === 0 && <p className="mt-2 text-xs text-ink-muted">{t("មិនទាន់មានចម្លើយរហ័ស។", "No quick replies yet.")}</p>}
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {replies.map((reply) => (
                  <li key={reply.id} className="flex items-start gap-1">
                    <button
                      type="button"
                      disabled={managing}
                      onClick={() => {
                        const filled = fillQuickReply(reply.text, quickReplyValues);
                        setText((current) => (current.trim() ? `${current.trimEnd()} ${filled}` : filled).slice(0, MAX_TEXT));
                        setRepliesOpen(false);
                      }}
                      className="min-w-0 flex-1 rounded-xl px-2.5 py-1.5 text-left text-sm text-ink hover:bg-arom-wash disabled:hover:bg-transparent"
                    >
                      {reply.text}
                    </button>
                    {managing && (
                      <button
                        type="button"
                        onClick={() => void saveQuickReplies(replies.filter((item) => item.id !== reply.id))}
                        aria-label={t("លុបចម្លើយនេះ", "Delete this reply")}
                        className="rounded-full p-1.5 text-arom-danger hover:bg-arom-danger-soft"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {managing && (
                <div className="mt-2 border-t border-arom-border pt-2">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={newReply}
                      onChange={(event) => setNewReply(event.target.value)}
                      rows={2}
                      maxLength={MAX_QUICK_REPLY}
                      aria-label={t("ចម្លើយរហ័សថ្មី", "New quick reply")}
                      placeholder={t("សរសេរចម្លើយថ្មី...", "Write a new reply...")}
                      className="min-w-0 flex-1 resize-none rounded-xl border border-arom-border px-3 py-2 text-sm outline-none focus:border-arom"
                    />
                    <button
                      type="button"
                      disabled={!newReply.trim() || replies.length >= MAX_QUICK_REPLIES}
                      onClick={() => {
                        void saveQuickReplies([...replies, { id: `qr-${Date.now()}`, text: newReply.trim() }]);
                        setNewReply("");
                      }}
                      className="flex items-center gap-1 rounded-full bg-arom px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      <Plus size={14} aria-hidden="true" />
                      {t("បន្ថែម", "Add")}
                    </button>
                  </div>
                  <p className="mt-1 text-[0.7rem] text-ink-muted">
                    {t("ប្រើ {name} សម្រាប់ឈ្មោះ {link} សម្រាប់តំណប្រជុំ និង {next} សម្រាប់វគ្គបន្ទាប់។", "Use {name} for their name, {link} for the meeting link and {next} for the next session.")}
                  </p>
                </div>
              )}
            </div>
          )}

          {recorder.phase === "idle" && (
            <div className="flex items-end gap-2">
              {quickReplyValues && (
                <button
                  type="button"
                  onClick={() => setRepliesOpen(!repliesOpen)}
                  aria-expanded={repliesOpen}
                  aria-label={t("ចម្លើយរហ័ស", "Quick replies")}
                  title={t("ចម្លើយរហ័ស", "Quick replies")}
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-arom-border hover:bg-arom-wash ${repliesOpen ? "bg-arom-wash text-arom-deep" : "text-arom"}`}
                >
                  <MessageSquareText size={19} />
                </button>
              )}
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={MAX_TEXT}
                aria-label={t("សរសេរសារ", "Write a message")}
                placeholder={t("សរសេរសារ...", "Write a message...")}
                className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-arom-border bg-arom-wash/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-arom focus:bg-white focus:ring-4 focus:ring-arom/10"
              />
              <button
                type="button"
                onClick={startRecording}
                aria-label={t("ថតសារសំឡេង", "Record a voice message")}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-arom-border text-arom hover:bg-arom-wash"
              >
                <Mic size={19} />
              </button>
              <button
                type="button"
                onClick={() => void sendText()}
                disabled={!text.trim() || sending}
                aria-label={t("ផ្ញើ", "Send")}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-arom text-white hover:bg-arom-deep disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
