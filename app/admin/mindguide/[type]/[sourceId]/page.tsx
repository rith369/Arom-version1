import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentEditorPage } from '../../../_components/content-editor';
import type { ContentType } from '../../../_data/content';

export const metadata: Metadata = {
  title: 'Edit MindGuide content',
};

const CONTENT_TYPES: readonly ContentType[] = ['lesson', 'tip', 'practice'];

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ type: string; sourceId: string }>;
}) {
  const { type, sourceId } = await params;
  const contentType = CONTENT_TYPES.find((item) => item === type);

  if (!contentType) notFound();

  return <ContentEditorPage type={contentType} sourceId={sourceId} />;
}
