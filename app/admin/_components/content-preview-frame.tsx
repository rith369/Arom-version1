'use client';

import { Component, useEffect, useState, type ReactNode } from 'react';

import { LessonDetailView } from '../../_components/learn/lesson-detail-view';
import { LessonScreen } from '../../_components/learn/lesson-screen';
import { PracticeDetailView } from '../../_components/practice/practice-detail-view';
import { TipDetailView } from '../../_components/tips/tip-detail-view';
import { TipInteractiveView } from '../../_components/tips/tip-interactive-view';
import { TherapistDetail } from '../../_components/therapist-detail';
import type { Therapist } from '@/lib/therapists';
import { useLanguage, type Language } from '../../_components/language-provider';

import type { ContentBody } from '../_data/content';
import {
  toPreviewLesson,
  toPreviewPractice,
  toPreviewTip,
} from '../_data/content-preview';

// Messages between the admin editor and this frame. Same origin only.
export type PreviewMessage =
  | { kind: 'arom-preview'; body: ContentBody; language: Language; restart: boolean }
  // A professional's public profile, sent from the /pro profile editor.
  | { kind: 'arom-preview-profile'; therapist: Therapist; language: Language }
  | { kind: 'arom-preview-ready' };

type Screen = 'overview' | 'inside' | 'finished';

// A half finished draft can be missing pieces the user screen expects.
// After a failure, the next update tries again. Successful updates do not
// remount, so the screen keeps its place (for example the current section).
class PreviewBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; resetKey: number },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous: { resetKey: number }) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-8 text-center text-sm leading-6 text-ink-muted">
      <div className="max-w-sm">{children}</div>
    </div>
  );
}

// Draws a draft with the real user screens. Rendered inside an iframe so the
// screens use their real phone or desktop layout.
export function ContentPreviewFrame() {
  const { language, setLanguage } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [body, setBody] = useState<ContentBody | null>(null);
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [screen, setScreen] = useState<Screen>('overview');
  // Changes on every update so a draft that failed to draw can recover once fixed.
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    function onMessage(event: MessageEvent<PreviewMessage>) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.kind === 'arom-preview-profile') {
        setTherapist(event.data.therapist);
        setLanguage(event.data.language);
        setUpdateCount((current) => current + 1);
        return;
      }
      if (event.data?.kind !== 'arom-preview') return;

      setBody(event.data.body);
      setLanguage(event.data.language);
      setUpdateCount((current) => current + 1);
      if (event.data.restart) setScreen('overview');
    }

    window.addEventListener('message', onMessage);
    window.parent.postMessage(
      { kind: 'arom-preview-ready' } satisfies PreviewMessage,
      window.location.origin,
    );

    return () => window.removeEventListener('message', onMessage);
  }, [setLanguage]);

  if (therapist) {
    return (
      // Links inside the preview do nothing, so the frame stays on the profile.
      <div
        onClickCapture={(event) => {
          if ((event.target as Element).closest('a')) event.preventDefault();
        }}>
        <PreviewBoundary
          resetKey={updateCount}
          fallback={<Notice>{t('មិនអាចបង្ហាញប្រវត្តិរូបបានទេ។', 'The profile cannot be shown yet.')}</Notice>}>
          <TherapistDetail therapist={therapist} />
        </PreviewBoundary>
      </div>
    );
  }

  if (!body) {
    return <Notice>{t('កំពុងផ្ទុក...', 'Loading preview...')}</Notice>;
  }

  const backToOverview = () => setScreen('overview');
  let content: ReactNode;

  if (screen === 'finished') {
    content = (
      <Notice>
        <p>{t('អ្នកប្រើបានដល់ទីបញ្ចប់នៅទីនេះ។', 'This is where users reach the end.')}</p>
        <button type="button" onClick={backToOverview} className="mt-3 font-medium text-arom underline">
          {t('ត្រឡប់ទៅទិដ្ឋភាពទូទៅ', 'Back to overview')}
        </button>
      </Notice>
    );
  } else if (body.type === 'lesson') {
    const lesson = toPreviewLesson(body);

    content =
      screen === 'overview' ? (
        <LessonDetailView preview lesson={lesson} onBack={() => {}} onStartLesson={() => setScreen('inside')} />
      ) : lesson.sections.length === 0 ? (
        <Notice>{t('បន្ថែមផ្នែកមួយដើម្បីមើលមេរៀនជាមុន។', 'Add a section to preview the lesson.')}</Notice>
      ) : (
        <LessonScreen preview lesson={lesson} onExit={backToOverview} onComplete={() => setScreen('finished')} />
      );
  } else if (body.type === 'tip') {
    const tip = toPreviewTip(body);

    content =
      screen === 'overview' ? (
        <TipDetailView preview tip={tip} onBack={() => {}} onStartTips={() => setScreen('inside')} />
      ) : (
        <TipInteractiveView preview tip={tip} onBack={backToOverview} onComplete={() => setScreen('finished')} />
      );
  } else {
    content = (
      <PracticeDetailView
        preview
        practice={toPreviewPractice(body)}
        onBack={() => {}}
        onStartPractice={() => setScreen('finished')}
      />
    );
  }

  return (
    <PreviewBoundary
      resetKey={updateCount}
      fallback={
        <Notice>
          {t(
            'ការមើលជាមុនមិនអាចបង្ហាញសេចក្តីព្រាងនេះបានទេ។ សូមដោះស្រាយបញ្ហាក្នុងការត្រួតពិនិត្យ។',
            'The preview cannot show this draft yet. Fix the problems in Checks.',
          )}
        </Notice>
      }>
      {content}
    </PreviewBoundary>
  );
}
