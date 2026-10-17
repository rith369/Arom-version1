// Admin Bookings page (BACKEND-HANDOFF.md section 12). Loaded from
// GET /api/admin/bookings. 'pending' is reserved for a later "review new
// clients first" setting; booked sessions show as 'confirmed'.
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
  // Only a reason an admin wrote. A client's or professional's reason stays private.
  cancelReason?: string;
  // From the database. userId is empty there: admins never see who booked.
  professionalName?: string;
  professionalKmName?: string;
};
