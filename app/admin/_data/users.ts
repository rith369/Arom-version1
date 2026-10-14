// Mirrors profiles.role and profiles.account_status so the backend can
// replace this mock list without changing the UI.
export type UserStatus = 'active' | 'suspended';
export type UserRole = 'user' | 'professional' | 'admin';

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  preferredLanguage: 'en' | 'km';
  createdAt: string;
  // Last sign in. Null for accounts that never signed in.
  lastSeenAt: string | null;
  // Activity is counts only. Admins never see journal, mood or session content.
  daysActive30: number;
  checkInCount: number;
  bookingCount: number;
};

// The admin who is signed in. The backend will read this from the session.
export const currentAdminId = 'demo-admin-001';

export const initialUsers: AdminUser[] = [
  {
    id: 'demo-admin-001',
    fullName: 'Rith Panha',
    email: 'rith@arom.example',
    avatarUrl: null,
    role: 'admin',
    status: 'active',
    preferredLanguage: 'km',
    createdAt: '2026-08-01T02:00:00Z',
    lastSeenAt: '2026-10-12T12:39:00Z',
    daysActive30: 24,
    checkInCount: 0,
    bookingCount: 0,
  },
  {
    id: 'demo-admin-002',
    fullName: 'Neou Sokheng',
    email: 'sokheng@arom.example',
    avatarUrl: null,
    role: 'admin',
    status: 'active',
    preferredLanguage: 'km',
    createdAt: '2026-08-02T03:00:00Z',
    lastSeenAt: '2026-10-08T13:19:00Z',
    daysActive30: 18,
    checkInCount: 0,
    bookingCount: 0,
  },
  {
    id: 'sopheap-chan',
    fullName: 'Dr. Sopheap Chan',
    email: 'sopheap@arom.example',
    avatarUrl: null,
    role: 'professional',
    status: 'active',
    preferredLanguage: 'en',
    createdAt: '2026-03-15T04:00:00Z',
    lastSeenAt: '2026-10-11T08:10:00Z',
    daysActive30: 21,
    checkInCount: 0,
    bookingCount: 0,
  },
  {
    id: 'demo-user-001',
    fullName: 'Sok Dara',
    email: 'dara@example.com',
    avatarUrl: null,
    role: 'user',
    status: 'active',
    preferredLanguage: 'km',
    createdAt: '2026-09-18T03:00:00Z',
    lastSeenAt: '2026-10-12T01:45:00Z',
    daysActive30: 16,
    checkInCount: 22,
    bookingCount: 2,
  },
  {
    id: 'demo-user-002',
    fullName: 'Chan Sreyneang',
    email: 'sreyneang@example.com',
    avatarUrl: null,
    role: 'user',
    status: 'active',
    preferredLanguage: 'km',
    createdAt: '2026-09-20T08:30:00Z',
    lastSeenAt: '2026-10-10T14:20:00Z',
    daysActive30: 9,
    checkInCount: 11,
    bookingCount: 1,
  },
  {
    id: 'demo-user-003',
    fullName: 'Alex Morgan',
    email: 'alex@example.com',
    avatarUrl: null,
    role: 'user',
    status: 'active',
    preferredLanguage: 'en',
    createdAt: '2026-09-25T05:15:00Z',
    lastSeenAt: '2026-10-07T06:34:00Z',
    daysActive30: 3,
    checkInCount: 4,
    bookingCount: 1,
  },
  {
    id: 'demo-user-004',
    fullName: 'Kim Vanna',
    email: 'vanna@example.com',
    avatarUrl: null,
    role: 'user',
    status: 'suspended',
    preferredLanguage: 'km',
    createdAt: '2026-10-01T02:45:00Z',
    lastSeenAt: '2026-10-03T10:05:00Z',
    daysActive30: 2,
    checkInCount: 1,
    bookingCount: 0,
  },
  {
    id: 'demo-user-005',
    fullName: 'Heng Rachana',
    email: 'rachana@example.com',
    avatarUrl: null,
    role: 'user',
    status: 'active',
    preferredLanguage: 'en',
    createdAt: '2026-10-05T09:00:00Z',
    lastSeenAt: '2026-10-11T23:50:00Z',
    daysActive30: 6,
    checkInCount: 7,
    bookingCount: 1,
  },
];
