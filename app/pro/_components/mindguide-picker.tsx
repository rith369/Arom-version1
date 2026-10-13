'use client';

import { useState } from 'react';
import { BookOpen, HeartPulse, Lightbulb, X } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';
import { LearnContainer } from '../../_components/learn/learn-container';
import { MindGuidePickProvider, type PickType } from '../../_components/mindguide-pick';
import { PracticeContainer } from '../../_components/practice/practice-container';
import { TipsContainer } from '../../_components/tips/tips-container';

const SECTIONS: { type: PickType; en: string; km: string; icon: typeof BookOpen }[] = [
  { type: 'lesson', en: 'Lessons', km: 'មេរៀន', icon: BookOpen },
  { type: 'practice', en: 'Practices', km: 'លំហាត់', icon: HeartPulse },
  { type: 'tip', en: 'Tips', km: 'គន្លឹះ', icon: Lightbulb },
];

// Full MindGuide, the same screens users see, on top of the Give a care task window.
export function MindGuidePicker({
  clientName,
  onChoose,
  onClose,
}: {
  clientName: string;
  onChoose: (type: PickType, id: string) => void;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const [section, setSection] = useState<PickType>('lesson');

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-canvas" role="dialog" aria-modal="true" aria-labelledby="mindguide-picker-title">
      <header className="shrink-0 border-b border-arom-border bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 id="mindguide-picker-title" className="text-base font-bold text-ink">
              {t(`ជ្រើសរើសពី MindGuide សម្រាប់ ${clientName}`, `Choose from MindGuide for ${clientName}`)}
            </h2>
            <p className="text-xs text-ink-muted">
              {t('បើកមាតិកាណាមួយដើម្បីអាន រួចចុច "ជ្រើសរើសសម្រាប់"។', 'Open any item to read it, then tap "Choose for".')}
            </p>
          </div>
          <div role="tablist" aria-label={t('ផ្នែក', 'Sections')} className="flex gap-1 rounded-full border border-arom-border p-1">
            {SECTIONS.map(({ type, en, km: kmLabel, icon: Icon }) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={section === type}
                onClick={() => setSection(type)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${section === type ? 'bg-arom text-white' : 'text-ink-muted hover:bg-arom-wash'}`}>
                <Icon size={15} aria-hidden="true" />
                {km ? kmLabel : en}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label={t('បិទ', 'Close')} className="rounded-full p-2 text-ink hover:bg-arom-wash">
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <MindGuidePickProvider value={{ clientName, choose: onChoose, goTo: setSection, close: onClose }}>
          {section === 'lesson' && <LearnContainer key="lesson" />}
          {section === 'practice' && <PracticeContainer key="practice" />}
          {section === 'tip' && <TipsContainer key="tip" />}
        </MindGuidePickProvider>
      </div>
    </div>
  );
}
