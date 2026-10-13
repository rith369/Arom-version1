"use client";

import { Mic, Pause, Play, Send, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  MAX_TEXT,
  MAX_VOICE_SECONDS,
  markRead,
  sendMessage,
  useMessageStore,
  type ChatMessage,
  type Conversation,
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
  | { phase: "preview"; url: string; seconds: number };

export function ChatThread({
  conversation,
  viewer,
  km,
  closedNote,
}: {
  conversation: Conversation;
  viewer: Sender;
  km: boolean;
  // When set, the chat is read only and this explains why.
  closedNote?: string;
}) {
  const { messages } = useMessageStore();
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const thread = messages
    .filter((item) => item.conversationId === conversation.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const [text, setText] = useState("");
  const [recorder, setRecorder] = useState<RecorderState>({ phase: "idle" });
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const secondsRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    markRead(conversation.id, viewer);
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

  function sendText() {
    const value = text.trim();
    if (!value) return;
    sendMessage(conversation, viewer, { kind: "text", text: value });
    setText("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendText();
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
        setRecorder({ phase: "preview", url: URL.createObjectURL(blob), seconds: Math.max(1, secondsRef.current) });
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
        {thread.length === 0 && (
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
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {closedNote ? (
        <p className="border-t border-arom-border bg-arom-wash/70 px-5 py-4 text-center text-sm text-ink-muted">{closedNote}</p>
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
                onClick={() => {
                  sendMessage(conversation, viewer, { kind: "voice", audioUrl: recorder.url, durationSeconds: recorder.seconds });
                  setRecorder({ phase: "idle" });
                }}
                className="flex items-center gap-1.5 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep"
              >
                <Send size={15} aria-hidden="true" />
                {t("ផ្ញើ", "Send")}
              </button>
            </div>
          )}

          {recorder.phase === "idle" && (
            <div className="flex items-end gap-2">
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
                onClick={sendText}
                disabled={!text.trim()}
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
