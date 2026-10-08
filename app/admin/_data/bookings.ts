export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type AdminBooking = {
  id: string;
  userId: string;
  professionalId: string;
  startsAt: string;
  durationMinutes: number;
  meetingType: 'Online' | 'In-person';
  status: BookingStatus;
  createdAt: string;
};

export const initialBookings: AdminBooking[] = [
  {
    id: 'demo-booking-001',
    userId: 'demo-user-001',
    professionalId: 'sopheap-chan',
    startsAt: '2026-10-10T09:00:00+07:00',
    durationMinutes: 60,
    meetingType: 'Online',
    status: 'pending',
    createdAt: '2026-10-07T08:00:00Z',
  },
  {
    id: 'demo-booking-002',
    userId: 'demo-user-002',
    professionalId: 'ratanak-pich',
    startsAt: '2026-10-11T14:00:00+07:00',
    durationMinutes: 60,
    meetingType: 'In-person',
    status: 'confirmed',
    createdAt: '2026-10-07T09:30:00Z',
  },
  {
    id: 'demo-booking-003',
    userId: 'demo-user-003',
    professionalId: 'malika-sok',
    startsAt: '2026-10-05T10:00:00+07:00',
    durationMinutes: 60,
    meetingType: 'Online',
    status: 'completed',
    createdAt: '2026-10-01T04:00:00Z',
  },
  {
    id: 'demo-booking-004',
    userId: 'demo-user-005',
    professionalId: 'sopheap-chan',
    startsAt: '2026-10-06T15:00:00+07:00',
    durationMinutes: 60,
    meetingType: 'Online',
    status: 'cancelled',
    createdAt: '2026-10-02T07:00:00Z',
  },
];
