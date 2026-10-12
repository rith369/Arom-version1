import type { Metadata } from 'next';
import { AuditLogView } from '../_components/audit-log-view';

export const metadata: Metadata = {
  title: 'Admin audit log',
};

export default function AuditLogPage() {
  return <AuditLogView />;
}
