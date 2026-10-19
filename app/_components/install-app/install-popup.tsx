'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useLanguage } from '../language-provider';
import {
  showInstallPrompt,
  snoozeInstallPopup,
  useInstallMode,
  useInstallPopupSnoozed,
  useIsPhone,
} from './install-store';
import { InstallSteps } from './install-steps';

const OPEN_DELAY_MS = 1200;

// Popup in the middle of Home that invites people to put AROM on their home
// screen. Home stays visible, dimmed, behind it. It never shows once AROM is
// installed, and "Not now" hides it on this device for a week.
export function InstallPopup() {
  const mode = useInstallMode();
  const snoozed = useInstallPopupSnoozed();
  const isPhone = useIsPhone();
  const [ready, setReady] = useState(false);

  // Let Home appear first, so the popup opens over the page, not a blank screen.
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready || snoozed || mode === 'unknown' || mode === 'installed') return null;
  // Computers whose browser cannot install (Firefox, Safari) are skipped. The
  // Settings card still explains the steps there.
  if (mode === 'manual' && !isPhone) return null;

  return <InstallDialog mode={mode} />;
}

function InstallDialog({ mode }: { mode: 'prompt' | 'ios' | 'manual' }) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const installRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const stepsId = useId();
  const [showSteps, setShowSteps] = useState(false);

  // showModal() keeps focus inside the popup and makes the page behind it inert.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    // The browser focuses the close button first. Start on Install instead.
    installRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  async function handleInstall() {
    if (mode !== 'prompt') {
      setShowSteps(true);
      return;
    }
    const installed = await showInstallPrompt();
    if (!installed) snoozeInstallPopup();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        snoozeInstallPopup();
      }}
      onClick={(event) => {
        // A tap on the dimmed page around the popup closes it.
        if (event.target === event.currentTarget) snoozeInstallPopup();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm overflow-visible bg-transparent p-0 backdrop:bg-[#14221f]/45 backdrop:backdrop-blur-[2px]">
      {/* Fades in with CSS. If that is not supported it simply appears. */}
      <div
        className="relative rounded-3xl bg-white px-6 pb-6 pt-8 text-center shadow-card transition-[opacity,transform] duration-300 ease-out starting:translate-y-3 starting:scale-95 starting:opacity-0 motion-reduce:starting:translate-y-0 motion-reduce:starting:scale-100">
        <button
          type="button"
          onClick={snoozeInstallPopup}
          aria-label={t('បិទ', 'Close')}
          className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-arom-wash hover:text-arom focus-visible:outline-2 focus-visible:outline-arom">
          <X size={20} aria-hidden="true" />
        </button>

        <Image
          src="/icons/icon-192.png"
          alt=""
          width={80}
          height={80}
          className="mx-auto rounded-[22px] border border-arom-border shadow-[0_8px_24px_rgba(31,111,91,0.15)]"
        />

        <h2 id={titleId} className="mt-5 text-xl font-bold text-ink">
          {t('ដាក់ AROM នៅលើអេក្រង់ដើម', 'Add AROM to your home screen')}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          {t(
            'បើក AROM បានដោយចុចតែម្តង ដូចកម្មវិធីផ្សេងទៀត។',
            'Open AROM in one tap, like any other app.',
          )}
        </p>

        {showSteps ? (
          <>
            <InstallSteps
              id={stepsId}
              ios={mode === 'ios'}
              km={km}
              className="mt-5 rounded-2xl bg-arom-wash/60 p-4 text-left"
            />
            <button
              type="button"
              onClick={snoozeInstallPopup}
              className="mt-5 min-h-12 w-full rounded-full bg-arom text-base font-semibold text-white transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom">
              {t('យល់ហើយ', 'Got it')}
            </button>
          </>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              ref={installRef}
              onClick={handleInstall}
              aria-controls={mode === 'prompt' ? undefined : stepsId}
              className="min-h-12 w-full rounded-full bg-arom text-base font-semibold text-white transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom">
              {t('ដំឡើង AROM', 'Install AROM')}
            </button>
            <button
              type="button"
              onClick={snoozeInstallPopup}
              className="min-h-12 w-full rounded-full text-base font-semibold text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom">
              {t('ពេលក្រោយ', 'Not now')}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
