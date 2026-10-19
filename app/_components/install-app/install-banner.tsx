'use client';

import { Smartphone, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useLanguage } from '../language-provider';
import {
  dismissInstallBanner,
  showInstallPrompt,
  useInstallBannerDismissed,
  useInstallMode,
  useIsPhone,
} from './install-store';
import { InstallSteps } from './install-steps';

// Home page banner inviting people to put AROM on their home screen. It never
// shows once AROM is installed, and "Not now" hides it on this device.
export function InstallBanner() {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const mode = useInstallMode();
  const dismissed = useInstallBannerDismissed();
  const isPhone = useIsPhone();
  const [showSteps, setShowSteps] = useState(false);
  const stepsId = useId();

  // Computers whose browser cannot install (Firefox, Safari) do not get the
  // banner. The Settings card still explains the steps there.
  if (dismissed || mode === 'unknown' || mode === 'installed') return null;
  if (mode === 'manual' && !isPhone) return null;

  async function handleInstall() {
    if (mode === 'prompt') {
      await showInstallPrompt();
      return;
    }
    setShowSteps((value) => !value);
  }

  return (
    <section
      aria-label={t('ដំឡើង AROM', 'Install AROM')}
      className="rounded-[20px] border border-arom-border bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-5">
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-arom-soft text-arom">
          <Smartphone size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-ink">
            {t('ដាក់ AROM នៅលើអេក្រង់ដើម', 'Add AROM to your home screen')}
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {t('បើកបានដោយចុចតែម្តង។', 'Open it in one tap.')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleInstall}
              aria-expanded={mode === 'prompt' ? undefined : showSteps}
              aria-controls={mode === 'prompt' ? undefined : stepsId}
              className="min-h-10 rounded-full bg-arom px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom">
              {t('ដំឡើង', 'Install')}
            </button>
            <button
              type="button"
              onClick={dismissInstallBanner}
              className="min-h-10 rounded-full px-4 text-sm font-semibold text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom">
              {t('ពេលក្រោយ', 'Not now')}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissInstallBanner}
          aria-label={t('បិទ', 'Close')}
          className="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-arom-wash hover:text-arom focus-visible:outline-2 focus-visible:outline-arom">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {mode !== 'prompt' && showSteps && (
        <InstallSteps id={stepsId} ios={mode === 'ios'} km={km} className="mt-4 border-t border-arom-border pt-4" />
      )}
    </section>
  );
}
