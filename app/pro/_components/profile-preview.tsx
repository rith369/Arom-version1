'use client';

import { useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';
import type { PreviewMessage } from '../../admin/_components/content-preview-frame';
import type { Therapist } from '@/lib/therapists';

type Width = 'phone' | 'desktop';

// Shows the real public profile page in an iframe, so it uses its true phone
// or desktop layout. Updates while the professional types.
export function ProfilePreview({ therapist }: { therapist: Therapist }) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const frameRef = useRef<HTMLIFrameElement>(null);
  const [width, setWidth] = useState<Width>('phone');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function onMessage(event: MessageEvent<PreviewMessage>) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.kind === 'arom-preview-ready') setIsReady(true);
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    frameRef.current?.contentWindow?.postMessage(
      { kind: 'arom-preview-profile', therapist, language } satisfies PreviewMessage,
      window.location.origin,
    );
  }, [therapist, language, isReady]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={t('ទំហំអេក្រង់', 'Screen size')} className="flex gap-1 rounded-full border border-arom-border bg-white p-1">
          {(['phone', 'desktop'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={width === value}
              onClick={() => {
                setIsReady(false);
                setWidth(value);
              }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                width === value ? 'bg-arom text-white' : 'text-ink-muted hover:bg-arom-wash'
              }`}>
              {value === 'phone' ? <Smartphone size={14} aria-hidden="true" /> : <Monitor size={14} aria-hidden="true" />}
              {value === 'phone' ? t('ទូរស័ព្ទ', 'Phone') : t('កុំព្យូទ័រ', 'Desktop')}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-muted">
          {t('នេះជាទំព័រដែលអ្នកប្រើឃើញ ដោយប្រើការកែរបស់អ្នកឥឡូវនេះ។', 'This is the page users see, using your edits right now.')}
        </p>
      </div>

      <div className="mt-3 rounded-3xl border border-arom-border bg-arom-wash/60 p-3 sm:p-4">
        <iframe
          key={width}
          ref={frameRef}
          src="/content-preview"
          title={t('មើលប្រវត្តិរូបជាមុន', 'Profile preview')}
          className={`mx-auto block h-[75vh] rounded-2xl border border-arom-border bg-canvas shadow-sm ${
            width === 'phone' ? 'w-full max-w-[390px]' : 'w-full'
          }`}
        />
      </div>
    </div>
  );
}
