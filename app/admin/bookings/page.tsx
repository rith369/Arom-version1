import type { Metadata } from 'next';
import { BookingsView } from '../_components/bookings-view';

export const metadata: Metadata = {
  title: 'Booking management',
};

export default function BookingsPage() {
  return <BookingsView />;
}
