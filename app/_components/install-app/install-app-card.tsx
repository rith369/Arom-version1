'use client';

import { Smartphone } from 'lucide-react';
import { useId, useState } from 'react';
import { useLanguage } from '../language-provider';
import { showInstallPrompt, useInstallMode } from './install-store';
import { InstallSteps } from './install-steps';

// Settings card that puts AROM on the home screen. Chrome, Edge and Android
// open their own install dialog. iPhone and other browsers get short steps.
export function InstallAppCard() {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const mode = useInstallMode();
  const [showSteps, setShowSteps] = useState(false);
  const stepsId = useId();

  if (mode === 'unknown' || mode === 'installed') return null;

  async function handleClick() {
    if (mode === 'prompt') {
      await showInstallPrompt();
      return;
    }
    setShowSteps((value) => !value);
  }

  return (
    <div className="rounded-3xl border border-arom-border bg-white shadow-card">
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={mode === 'prompt' ? undefined : showSteps}
        aria-controls={mode === 'prompt' ? undefined : stepsId}
        className="group flex w-full items-center justify-between gap-3 rounded-3xl p-5 text-left transition-colors duration-150 hover:bg-arom-wash/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom sm:p-6">
        <span className="flex items-center gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-arom-soft text-arom">
            <Smartphone size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold text-ink">
              {t('ដំឡើង AROM (Install)', 'Install AROM')}
            </span>
            <span className="block text-xs text-ink-muted sm:text-sm">
              {t('ដាក់ AROM នៅលើអេក្រង់ដើម ដើម្បីបើកបានងាយស្រួល', 'Add AROM to your home screen so it opens in one tap')}
            </span>
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 group-hover:bg-arom-deep">
          {mode === 'prompt' ? t('ដំឡើង', 'Install') : showSteps ? t('បិទ', 'Close') : t('របៀប', 'How')}
        </span>
      </button>

      {mode !== 'prompt' && showSteps && (
        <InstallSteps
          id={stepsId}
          ios={mode === 'ios'}
          km={km}
          className="border-t border-arom-border px-5 pb-5 pt-4 sm:px-6 sm:pb-6"
        />
      )}
    </div>
  );
}
