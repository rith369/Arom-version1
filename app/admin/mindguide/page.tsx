import type { Metadata } from 'next';
import { MindGuideView } from '../_components/mindguide-view';
import { parseMindGuideTab } from '../_data/mindguide';

export const metadata: Metadata = {
  title: 'MindGuide management',
};

export default async function MindGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tab } = await searchParams;

  return <MindGuideView initialTab={parseMindGuideTab(tab)} />;
}
