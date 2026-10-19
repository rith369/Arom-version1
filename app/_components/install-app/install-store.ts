'use client';

import { useSyncExternalStore } from 'react';

// Chrome, Edge and Android fire this event once, early in the page load, when
// AROM can be installed. It is not in the TypeScript DOM types yet.
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** How the install card should behave on this device. */
export type InstallMode =
  | 'unknown' // server render, before the browser is checked
  | 'installed' // already opened from the home screen
  | 'prompt' // the browser can show its own install dialog
  | 'ios' // iPhone or iPad: Share, then Add to Home Screen
  | 'manual'; // any other browser: install from the browser menu

let savedPrompt: BeforeInstallPromptEvent | null = null;
let justInstalled = false;
let listening = false;
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((callback) => callback());
}

/** Starts catching the install event. Called once from the root layout. */
export function listenForInstallPrompt() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    savedPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    savedPrompt = null;
    justInstalled = true;
    notify();
  });
}

function isStandalone() {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
}

function isAppleMobile() {
  const iPadAsMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || iPadAsMac;
}

function getMode(): InstallMode {
  if (justInstalled || isStandalone()) return 'installed';
  if (savedPrompt) return 'prompt';
  if (isAppleMobile()) return 'ios';
  return 'manual';
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function useInstallMode(): InstallMode {
  return useSyncExternalStore(subscribe, getMode, () => 'unknown');
}

/** Opens the browser's install dialog. Returns true if the user installed. */
export async function showInstallPrompt() {
  const prompt = savedPrompt;
  if (!prompt) return false;
  // The event can only be used once.
  savedPrompt = null;
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  if (outcome === 'accepted') justInstalled = true;
  notify();
  return outcome === 'accepted';
}
