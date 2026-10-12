export type UserStatus = 'active' | 'suspended';

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  status: UserStatus;
  preferredLanguage: 'en' | 'km';
  createdAt: string;
};

export const initialUsers: AdminUser[] = [
  {
    id: 'demo-user-001',
    fullName: 'Sok Dara',
    email: 'dara@example.com',
    avatarUrl: null,
    status: 'active',
    preferredLanguage: 'km',
    createdAt: '2026-09-18T03:00:00Z',
  },
  {
    id: 'demo-user-002',
    fullName: 'Chan Sreyneang',
    email: 'sreyneang@example.com',
    avatarUrl: null,
    status: 'active',
    preferredLanguage: 'km',
    createdAt: '2026-09-20T08:30:00Z',
  },
  {
    id: 'demo-user-003',
    fullName: 'Alex Morgan',
    email: 'alex@example.com',
    avatarUrl: null,
    status: 'active',
    preferredLanguage: 'en',
    createdAt: '2026-09-25T05:15:00Z',
  },
  {
    id: 'demo-user-004',
    fullName: 'Kim Vanna',
    email: 'vanna@example.com',
    avatarUrl: null,
    status: 'suspended',
    preferredLanguage: 'km',
    createdAt: '2026-10-01T02:45:00Z',
  },
  {
    id: 'demo-user-005',
    fullName: 'Heng Rachana',
    email: 'rachana@example.com',
    avatarUrl: null,
    status: 'active',
    preferredLanguage: 'en',
    createdAt: '2026-10-05T09:00:00Z',
  },
];
