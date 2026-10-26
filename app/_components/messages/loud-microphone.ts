"use client";

export interface LoudMicrophone {
  /** The stream to record: the voice, levelled and made louder. */
  stream: MediaStream;
  /** Stops the microphone and the audio processing. */
  close: () => void;
}

/**
 * Opens the microphone for a voice message and makes the voice louder and even
 * before it is recorded. Phone and laptop microphones record speech quietly,
 * so a message played back on a phone speaker was hard to hear.
 *
 * Noise suppression and echo cancellation stay off, because they cut quiet
 * words to silence. The chain is: cut low rumble, compress (soft words come up,
 * loud words go down, with the compressor's own make up gain), then a small
 * extra lift. If the browser cannot run this, the plain microphone is used.
 *
 * Call it straight from the tap on the record button, so the audio context is
 * allowed to start on phones.
 */
export async function openLoudMicrophone(): Promise<LoudMicrophone> {
  const AudioContextClass =
    typeof window === "undefined"
      ? undefined
      : window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  // Created before the permission prompt, while the tap still counts.
  let context: AudioContext | null = null;
  try {
    context = AudioContextClass ? new AudioContextClass() : null;
  } catch {
    context = null;
  }

  let raw: MediaStream;
  try {
    raw = await navigator.mediaDevices.getUserMedia({
      audio: { noiseSuppression: false, echoCancellation: false, autoGainControl: true, channelCount: 1 },
    });
  } catch (error) {
    void context?.close();
    throw error;
  }

  const stopRaw = () => raw.getTracks().forEach((track) => track.stop());
  if (!context) return { stream: raw, close: stopRaw };

  try {
    if (context.state === "suspended") await context.resume();
    const source = context.createMediaStreamSource(raw);

    const rumble = context.createBiquadFilter();
    rumble.type = "highpass";
    rumble.frequency.value = 80;

    const leveller = context.createDynamicsCompressor();
    leveller.threshold.value = -36;
    leveller.knee.value = 12;
    leveller.ratio.value = 4;
    leveller.attack.value = 0.005;
    leveller.release.value = 0.25;

    const lift = context.createGain();
    lift.gain.value = 1.5;

    const output = context.createMediaStreamDestination();
    output.channelCount = 1;

    source.connect(rumble).connect(leveller).connect(lift).connect(output);

    const audioContext = context;
    return {
      stream: output.stream,
      close: () => {
        stopRaw();
        void audioContext.close();
      },
    };
  } catch {
    void context.close();
    return { stream: raw, close: stopRaw };
  }
}
