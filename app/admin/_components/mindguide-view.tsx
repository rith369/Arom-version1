'use client';

import { useState } from 'react';
import { BookOpen, HeartHandshake, Headphones, Lightbulb } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { ContentView } from './content-view';
import { PodcastsView } from './podcasts-view';
import { useLanguage } from '../../_components/language-provider';

import type { MindGuideTab } from '../_data/mindguide';

export function MindGuideView({ initialTab }: { initialTab: MindGuideTab }) {
  const { contentRecords, podcasts } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [tab, setTab] = useState<MindGuideTab>(initialTab);

  const tabs = [
    { value: 'lesson', label: t('មេរៀន', 'Lessons'), icon: BookOpen },
    { value: 'tip', label: t('គន្លឹះ', 'Tips'), icon: Lightbulb },
    { value: 'practice', label: t('ការអនុវត្ត', 'Practices'), icon: HeartHandshake },
    { value: 'podcast', label: t('ផតខាស', 'Podcasts'), icon: Headphones },
  ] as const;

  function changeTab(next: MindGuideTab) {
    setTab(next);
    // Keep the tab in the address so a refresh or shared link opens the same tab.
    window.history.replaceState(null, '', `?tab=${next}`);
  }

  return (
    <>
      <div>
        <p className="text-sm font-medium text-arom">
          {t('បណ្ណាល័យមគ្គុទ្ទេសក៍ចិត្ត', 'MindGuide library')}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {t('មគ្គុទ្ទេសក៍ចិត្ត (MindGuide)', 'MindGuide')}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          {t(
            'គ្រប់គ្រងមេរៀន គន្លឹះ ការអនុវត្ត និងផតខាស នៅកន្លែងតែមួយ។',
            'Manage lessons, tips, practices and podcasts in one place.',
          )}
        </p>
      </div>

      <div
        role="tablist"
        aria-label={t('ប្រភេទមាតិកា', 'Content type')}
        className="mt-8 flex flex-wrap gap-2">
        {tabs.map(({ value, label, icon: Icon }) => {
          const selected = tab === value;
          const count =
            value === 'podcast'
              ? podcasts.length
              : contentRecords.filter((item) => item.type === value).length;

          return (
            <button
              key={value}
              type="button"
              role="tab"
              id={`mindguide-tab-${value}`}
              aria-selected={selected}
              aria-controls="mindguide-panel"
              onClick={() => changeTab(value)}
              className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium ${
                selected
                  ? 'border-arom bg-arom text-white'
                  : 'border-arom-border bg-white text-ink-muted hover:bg-arom-wash'
              }`}>
              <Icon size={18} aria-hidden="true" />
              {label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  selected ? 'bg-white/15' : 'bg-arom-wash text-arom'
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="mindguide-panel"
        role="tabpanel"
        aria-labelledby={`mindguide-tab-${tab}`}
        className="mt-6">
        {tab === 'podcast' ? (
          <PodcastsView />
        ) : (
          // A new key resets search and filters when switching tabs.
          <ContentView key={tab} activeType={tab} />
        )}
      </div>
    </>
  );
}
