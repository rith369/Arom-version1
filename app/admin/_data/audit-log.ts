export type AuditModule =
  | 'users'
  | 'professionals'
  | 'content'
  | 'podcasts'
  | 'bookings'
  | 'community'
  | 'journal'
  | 'settings';

export type AdminAuditEntry = {
  id: string;
  actorName: string;
  module: AuditModule;
  action: string;
  kmAction: string;
  targetLabel: string;
  createdAt: string;
};

export const initialAuditEntries: AdminAuditEntry[] = [
  {
    id: 'demo-audit-001',
    actorName: 'Demo admin',
    module: 'content',
    action: 'Updated content information',
    kmAction: 'បានកែសម្រួលព័ត៌មានមាតិកា',
    targetLabel: 'Learn About Stress',
    createdAt: '2026-10-08T10:30:00Z',
  },
  {
    id: 'demo-audit-002',
    actorName: 'Demo admin',
    module: 'users',
    action: 'Suspended account',
    kmAction: 'បានផ្អាកគណនី',
    targetLabel: 'Demo user account',
    createdAt: '2026-10-08T09:00:00Z',
  },
  {
    id: 'demo-audit-003',
    actorName: 'Demo admin',
    module: 'community',
    action: 'Dismissed report',
    kmAction: 'បានបដិសេធរបាយការណ៍',
    targetLabel: 'Demo community report',
    createdAt: '2026-10-07T08:15:00Z',
  },
  {
    id: 'demo-audit-004',
    actorName: 'Demo admin',
    module: 'professionals',
    action: 'Updated professional profile',
    kmAction: 'បានកែសម្រួលប្រវត្តិរូបអ្នកជំនាញ',
    targetLabel: 'Demo professional profile',
    createdAt: '2026-10-07T07:00:00Z',
  },
];
