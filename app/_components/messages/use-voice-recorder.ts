"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_VOICE_SECONDS } from "@/lib/messages";
import { openLoudMicrophone } from "./loud-microphone";

export type VoiceRecorderState =
  | { phase: "idle" }
  | { phase: "recording"; seconds: number }
  | { phase: "preview"; url: string; blob: Blob; seconds: number };

/**
 * Records a voice message, up to MAX_VOICE_SECONDS, through the same levelled,
 * louder microphone as the private chat (see loud-microphone.ts).
 */
export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>({ phase: "idle" });
  const [error, setError] = useState<"" | "unsupported" | "denied">("");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const secondsRef = useRef(0);
  const cancelledRef = useRef(false);

  function clearTimer() {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function stop(cancel = false) {
    cancelledRef.current = cancel;
    clearTimer();
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
  }

  async function start() {
    setError("");
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("unsupported");
      return;
    }
    try {
      const microphone = await openLoudMicrophone();
      const media = new MediaRecorder(microphone.stream, { audioBitsPerSecond: 96_000 });
      chunksRef.current = [];
      secondsRef.current = 0;
      cancelledRef.current = false;
      media.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      media.onstop = () => {
        microphone.close();
        if (cancelledRef.current || chunksRef.current.length === 0) {
          setState({ phase: "idle" });
          return;
        }
        const blob = new Blob(chunksRef.current, { type: media.mimeType || "audio/webm" });
        setState({ phase: "preview", url: URL.createObjectURL(blob), blob, seconds: Math.max(1, secondsRef.current) });
      };
      mediaRef.current = media;
      media.start();
      setState({ phase: "recording", seconds: 0 });
      timerRef.current = window.setInterval(() => {
        secondsRef.current += 1;
        setState({ phase: "recording", seconds: secondsRef.current });
        if (secondsRef.current >= MAX_VOICE_SECONDS) stop();
      }, 1000);
    } catch {
      setError("denied");
    }
  }

  /** Back to idle after sending or discarding the preview. */
  function reset() {
    setState((current) => {
      if (current.phase === "preview") URL.revokeObjectURL(current.url);
      return { phase: "idle" };
    });
  }

  // Stop the microphone if the chat closes while recording.
  useEffect(
    () => () => {
      clearTimer();
      cancelledRef.current = true;
      if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    },
    [],
  );

  return { state, error, start, stop, reset };
}
