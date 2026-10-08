import type { Metadata } from 'next';
import { JournalPromptsView } from '../_components/journal-prompts-view';

export const metadata: Metadata = {
  title: 'Journal prompt management',
};

export default function JournalPromptsPage() {
  return <JournalPromptsView />;
}
