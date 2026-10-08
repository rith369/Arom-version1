import type { Metadata } from 'next';
import { ContentView } from '../_components/content-view';

export const metadata: Metadata = {
  title: 'MindGuide content management',
};

export default function ContentPage() {
  return <ContentView />;
}
