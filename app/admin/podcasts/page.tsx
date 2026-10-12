import { redirect } from 'next/navigation';

// Podcasts now live on the MindGuide page. Kept so old links still work.
export default function PodcastsPage() {
  redirect('/admin/mindguide?tab=podcast');
}
