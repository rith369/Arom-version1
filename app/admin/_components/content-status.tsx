'use client';

import { useLanguage } from '../../_components/language-provider';

import type { PublishState } from '../_data/content';

const styles: Record<PublishState, string> = {
  live: 'bg-arom-soft text-arom',
  liveDraft: 'bg-arom-warning-soft text-arom-warning',
  notPublished: 'bg-gray-100 text-gray-600',
  hidden: 'bg-arom-danger-soft text-arom-danger',
};

export function usePublishStateLabels(): Record<PublishState, string> {
  const { language } = useLanguage();
  const km = language === 'km';

  return {
    live: km ? 'កំពុងបង្ហាញ' : 'Live',
    liveDraft: km ? 'កំពុងបង្ហាញ មានសេចក្តីព្រាង' : 'Live, has draft',
    notPublished: km ? 'មិនទាន់ផ្សព្វផ្សាយ' : 'Not published',
    hidden: km ? 'បានលាក់ពីអ្នកប្រើ' : 'Hidden',
  };
}

export function PublishStateChip({ state }: { state: PublishState }) {
  const labels = usePublishStateLabels();

  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${styles[state]}`}>
      {labels[state]}
    </span>
  );
}
