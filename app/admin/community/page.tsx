import type { Metadata } from 'next';
import { CommunityView } from '../_components/community-view';

export const metadata: Metadata = {
  title: 'Community management',
};

export default function CommunityPage() {
  return <CommunityView />;
}
