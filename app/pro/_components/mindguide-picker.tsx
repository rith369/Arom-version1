'use client';

import { useState } from 'react';
import { ArrowUpRight, BookOpen, CalendarDays, HeartPulse, Lightbulb, X } from 'lucide-react';

import { useLanguage } from '../../_components/language-provider';
import { LearnContainer } from '../../_components/learn/learn-container';
import { chooseLabel, MindGuidePickProvider, type PickType } from '../../_components/mindguide-pick';
import { PracticeContainer } from '../../_components/practice/practice-container';
import { TipsContainer } from '../../_components/tips/tips-container';
import { PROGRAM_LENGTH, PROGRAMS, TWO_WEEK_PROGRAMS } from '../../_components/two-week/two-week-data';

const SECTIONS: { type: PickType; en: string; km: string; icon: typeof BookOpen }[] = [
  { type: 'lesson', en: 'Lessons', km: 'មេរៀន', icon: BookOpen },
  { type: 'practice', en: 'Practices', km: 'លំហាត់', icon: HeartPulse },
  { type: 'tip', en: 'Tips', km: 'គន្លឹះ', icon: Lightbulb },
  { type: 'program', en: '2 week programs', km: 'វគ្គ ២ សប្តាហ៍', icon: CalendarDays },
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
          <div role="tablist" aria-label={t('ផ្នែក', 'Sections')} className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-arom-border p-1">
            {SECTIONS.map(({ type, en, km: kmLabel, icon: Icon }) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={section === type}
                onClick={() => setSection(type)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${section === type ? 'bg-arom text-white' : 'text-ink-muted hover:bg-arom-wash'}`}>
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
          {section === 'program' && <ProgramList clientName={clientName} km={km} onChoose={(id) => onChoose('program', id)} />}
        </MindGuidePickProvider>
      </div>
    </div>
  );
}

// The 2 week programs (section 36). When a professional gives one, the client
// does not need a recent symptom check to start it.
function ProgramList({ clientName, km, onChoose }: { clientName: string; km: boolean; onChoose: (id: string) => void }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
      <p className="text-sm leading-6 text-ink-muted">
        {t(
          `ជំហានតូចមួយក្នុងមួយថ្ងៃ រយៈពេល ${PROGRAM_LENGTH} ថ្ងៃ។ ${clientName} ចាប់ផ្តើមវាដោយខ្លួនឯង ហើយមិនចាំបាច់ធ្វើការពិនិត្យជាមុនទេ។ នៅលើទំព័រដើម វាមិនបង្ហាញប្រធានបទទេ។`,
          `One small step a day for ${PROGRAM_LENGTH} days. ${clientName} starts it themselves and does not need to take a check first. On their Home it never names the topic.`,
        )}
      </p>
      {TWO_WEEK_PROGRAMS.map((id) => {
        const program = PROGRAMS[id];
        return (
          <article key={id} className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
            <h3 className="text-base font-bold text-ink">{km ? program.name.km : program.name.en}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-muted">{km ? program.description.km : program.description.en}</p>
            <ol className="mt-3 space-y-1 text-sm text-ink">
              {program.weeks.map((week, index) => (
                <li key={week.en}>
                  <span className="font-semibold">{t(`សប្តាហ៍ទី ${index + 1}`, `Week ${index + 1}`)}:</span> {km ? week.km : week.en}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onChoose(id)}
                className="rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white hover:bg-arom-deep">
                {chooseLabel(clientName, km)}
              </button>
              <a
                href={`/mindguide/programs/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-arom hover:underline">
                {t(`មើលទាំង ${PROGRAM_LENGTH} ថ្ងៃ`, `See all ${PROGRAM_LENGTH} days`)}
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
