import type { Metadata } from 'next';
import { PodcastsView } from '../_components/podcasts-view';

export const metadata: Metadata = {
  title: 'Podcast management',
};

export default function PodcastsPage() {
  return <PodcastsView />;
}
