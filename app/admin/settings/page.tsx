import type { Metadata } from 'next';
import { SettingsView } from '../_components/settings-view';

export const metadata: Metadata = {
  title: 'Admin settings',
};

export default function SettingsPage() {
  return <SettingsView />;
}
