import type { Metadata } from 'next';
import { ContentPreviewFrame } from '../admin/_components/content-preview-frame';

// Shown only inside the admin MindGuide editor. It draws whatever draft the
// editor on the same site sends it, and has no content of its own.
export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
};

export default function MindGuidePreviewPage() {
  return <ContentPreviewFrame />;
}
