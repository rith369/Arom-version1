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
  // Short extra detail, for example "user to professional" or the reason.
  detail?: string;
  createdAt: string;
};
