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
  // Set when an admin cancels in an emergency. Users and professionals
  // confirm, reschedule and cancel their own bookings outside the admin.
  cancelledBy?: 'user' | 'professional' | 'admin';
  cancelReason?: string;
};

const initialBookingsBase: AdminBooking[] = [
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

// Sample history so the bookings chart has something to show. Deterministic
// (same numbers on every load), from 30 days before to 14 days after the demo
// date. Each day uses distinct time slots, so no professional or user is ever
// double booked.
const DEMO_TODAY = '2026-10-13';
const SLOT_HOURS = ['09:00', '11:00', '14:00', '16:00'];
const DEMO_USERS = ['demo-user-001', 'demo-user-002', 'demo-user-003', 'demo-user-004', 'demo-user-005'];
const DEMO_PROFESSIONALS = ['sopheap-chan', 'ratanak-pich', 'malika-sok'];

function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function generateSampleBookings(): AdminBooking[] {
  const random = seeded(20261013);
  const result: AdminBooking[] = [];
  const takenDays = new Set(initialBookingsBase.map((item) => item.startsAt.slice(0, 10)));

  for (let offset = -30; offset <= 14; offset += 1) {
    const day = addDays(DEMO_TODAY, offset);
    if (takenDays.has(day)) continue;

    const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;
    // Busier on weekdays, slowly growing over time, fewer far ahead.
    const base = isWeekend ? 1 : 2 + (offset > -10 ? 1 : 0);
    const count = Math.min(SLOT_HOURS.length, Math.max(0, base + Math.round(random() * 2 - 0.6) - (offset > 7 ? 1 : 0)));

    for (let slot = 0; slot < count; slot += 1) {
      const isPast = offset < 0;
      const roll = random();
      const status: BookingStatus = isPast
        ? roll < 0.82 ? 'completed' : 'cancelled'
        : offset === 0
          ? roll < 0.85 ? 'confirmed' : 'cancelled'
          : roll < 0.6 ? 'confirmed' : roll < 0.9 ? 'pending' : 'cancelled';
      const leadDays = 1 + Math.floor(random() * 9);
      const created = new Date(`${day}T${SLOT_HOURS[slot]}:00+07:00`);
      created.setUTCDate(created.getUTCDate() - leadDays);

      result.push({
        id: `demo-booking-${day.replaceAll('-', '')}-${slot + 1}`,
        userId: DEMO_USERS[(slot + offset + 30) % DEMO_USERS.length],
        professionalId: DEMO_PROFESSIONALS[(slot + Math.floor(random() * 3)) % DEMO_PROFESSIONALS.length],
        startsAt: `${day}T${SLOT_HOURS[slot]}:00+07:00`,
        durationMinutes: 60,
        meetingType: random() < 0.7 ? 'Online' : 'In-person',
        status,
        createdAt: created.toISOString(),
      });
    }
  }

  return result;
}

export const initialBookings: AdminBooking[] = [
  ...initialBookingsBase,
  ...generateSampleBookings(),
];
