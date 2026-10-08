import type { Metadata } from 'next';
import { UsersView } from '../_components/users-view';

export const metadata: Metadata = {
  title: 'User management',
};

export default function UsersPage() {
  return <UsersView />;
}
