'use client';

import { useEffect, useRef, useState } from 'react';
import { Monitor, RotateCcw, Smartphone } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';

import type { ContentBody } from '../_data/content';
import type { PreviewMessage } from './content-preview-frame';

type Width = 'phone' | 'desktop';

// Shows the draft in an iframe so the real user screens get a real phone or
// desktop window and pick their own layout, exactly as users see them.
export function ContentPreview({ body }: { body: ContentBody }) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const frameRef = useRef<HTMLIFrameElement>(null);
  const [width, setWidth] = useState<Width>('phone');
  const [isReady, setIsReady] = useState(false);

  function send(restart: boolean) {
    frameRef.current?.contentWindow?.postMessage(
      { kind: 'arom-preview', body, language, restart } satisfies PreviewMessage,
      window.location.origin,
    );
  }

  // The frame says when it is ready. Changing the width reloads it.
  useEffect(() => {
    function onMessage(event: MessageEvent<PreviewMessage>) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.kind === 'arom-preview-ready') setIsReady(true);
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Live update while typing. The screen keeps its place.
  useEffect(() => {
    if (!isReady) return;
    frameRef.current?.contentWindow?.postMessage(
      { kind: 'arom-preview', body, language, restart: false } satisfies PreviewMessage,
      window.location.origin,
    );
  }, [body, language, isReady]);

  const segment = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
      active ? 'bg-arom text-white' : 'text-ink-muted hover:bg-arom-wash'
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label={t('ទំហំអេក្រង់', 'Screen size')}
          className="flex gap-1 rounded-full border border-arom-border bg-white p-1">
          {(['phone', 'desktop'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={width === value}
              onClick={() => {
                setIsReady(false);
                setWidth(value);
              }}
              className={segment(width === value)}>
              {value === 'phone' ? (
                <Smartphone size={14} aria-hidden="true" />
              ) : (
                <Monitor size={14} aria-hidden="true" />
              )}
              {value === 'phone' ? t('ទូរស័ព្ទ', 'Phone') : t('កុំព្យូទ័រ', 'Desktop')}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => send(true)}
          className="flex items-center gap-1.5 rounded-full border border-arom-border px-3 py-1.5 text-xs font-medium text-arom hover:bg-arom-soft">
          <RotateCcw size={14} aria-hidden="true" />
          {t('ចាប់ផ្តើមម្តងទៀត', 'Start over')}
        </button>
      </div>

      <p className="mt-3 text-xs leading-5 text-ink-muted">
        {t(
          'នេះជាអេក្រង់ពិតដែលអ្នកប្រើឃើញ ដោយប្រើការកែរបស់អ្នកឥឡូវនេះ ទោះមិនទាន់រក្សាទុកក៏ដោយ។ ប្តូរភាសានៅខាងលើដើម្បីពិនិត្យខ្មែរ ឬអង់គ្លេស។ ចំណាំ និងផែនការមិនត្រូវបានរក្សាទុកទេ។',
          'This is the real screen users see, using your edits right now, even unsaved ones. Switch the language at the top to check Khmer or English. Bookmarks and plans are not saved here.',
        )}
        {body.type === 'practice' &&
          t(
            ' ជំហាន និងការដកដង្ហើមមិនទាន់បង្ហាញក្នុងកម្មវិធីអ្នកប្រើនៅឡើយទេ។',
            ' Instructions and breathing settings are not shown in the user app yet.',
          )}
      </p>

      <div className="mt-3 rounded-3xl border border-arom-border bg-arom-wash/60 p-3 sm:p-4">
        <iframe
          key={width}
          ref={frameRef}
          src="/content-preview"
          title={t('មើលជាមុនសម្រាប់អ្នកប្រើ', 'User preview')}
          className={`mx-auto block h-[75vh] rounded-2xl border border-arom-border bg-canvas shadow-sm ${
            width === 'phone' ? 'w-full max-w-[390px]' : 'w-full'
          }`}
        />
      </div>
    </div>
  );
}
