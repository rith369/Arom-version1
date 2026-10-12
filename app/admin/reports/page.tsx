import type { Metadata } from 'next';
import { ReportsView } from '../_components/reports-view';

export const metadata: Metadata = {
  title: 'Content reports',
};

export default function ReportsPage() {
  return <ReportsView />;
}
