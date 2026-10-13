'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Calendar, Search, X } from 'lucide-react';

import { useAdmin } from './admin-provider';
import { BookingsChart } from './bookings-chart';
import { useLanguage } from '../../_components/language-provider';

import type { AdminBooking, BookingStatus } from '../_data/bookings';

const fieldClass =
  'mt-2 w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15';

function clinicDate(value: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${get('year')}-${get('month')}-${get('day')}`;
}

function isActive(booking: AdminBooking) {
  return booking.status === 'pending' || booking.status === 'confirmed';
}

function BookingDialog({
  booking,
  onClose,
}: {
  booking: AdminBooking;
  onClose: () => void;
}) {
  const { users, professionals, saveBooking } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const user = users.find((item) => item.id === booking.userId);
  const professional = professionals.find(
    (item) => item.id === booking.professionalId,
  );

  // Read the clock once when the popup opens, not on every render.
  const [openedAt] = useState(() => Date.now());

  // Admins only step in for upcoming sessions that are still going ahead.
  const canEmergencyCancel =
    isActive(booking) && Date.parse(booking.startsAt) > openedAt;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function emergencyCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reason.trim()) {
      setError('Write the reason. The user and the professional will see it.');
      return;
    }

    saveBooking({
      ...booking,
      status: 'cancelled',
      cancelledBy: 'admin',
      cancelReason: reason.trim(),
    });
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="booking-dialog-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-arom-border bg-white p-6 text-ink shadow-card backdrop:bg-ink/35">
      <header className="flex items-center justify-between gap-4">
        <h2 id="booking-dialog-title" className="text-xl font-semibold">
          {km ? 'ព័ត៌មានការកក់' : 'Booking details'}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label={km ? 'បិទ' : 'Close'}
          className="rounded-full p-2 hover:bg-arom-wash">
          <X size={20} />
        </button>
      </header>

      <dl className="mt-5 space-y-4 rounded-2xl bg-arom-wash p-4 text-sm">
        <div>
          <dt className="text-xs text-ink-muted">
            {km ? 'អ្នកប្រើប្រាស់' : 'User'}
          </dt>
          <dd className="mt-1 font-medium">
            {user?.fullName ?? (km ? 'មិនមាន' : 'Missing user')}
          </dd>
          {user && (
            <dd className="mt-1 text-xs text-ink-muted">{user.email}</dd>
          )}
        </div>

        <div>
          <dt className="text-xs text-ink-muted">
            {km ? 'អ្នកជំនាញ' : 'Professional'}
          </dt>
          <dd className="mt-1 font-medium">
            {professional
              ? km && professional.kmName
                ? professional.kmName
                : professional.name
              : km
                ? 'មិនមាន'
                : 'Missing professional'}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-ink-muted">
            {km ? 'ប្រភេទជំនួប' : 'Session'}
          </dt>
          <dd className="mt-1">
            {booking.meetingType === 'Online'
              ? km
                ? 'អនឡាញ'
                : 'Online'
              : km
                ? 'ជួបផ្ទាល់'
                : 'In person'}
            {' · '}
            {booking.durationMinutes} {km ? 'នាទី' : 'minutes'}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-ink-muted">
            {km ? 'ពេលវេលា' : 'Appointment'}
          </dt>
          <dd className="mt-1">
            {new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'Asia/Phnom_Penh',
            }).format(new Date(booking.startsAt))}
          </dd>
        </div>
      </dl>

      {booking.status === 'cancelled' && booking.cancelledBy === 'admin' && (
        <div className="mt-4 rounded-2xl bg-arom-danger-soft p-4 text-sm">
          <p className="text-xs font-medium text-arom-danger">Cancelled by an admin</p>
          <p className="mt-1 text-ink">{booking.cancelReason}</p>
        </div>
      )}

      <p className="mt-5 rounded-2xl border border-arom-border p-4 text-sm leading-6 text-ink-muted">
        Only the user and the professional confirm, reschedule or cancel
        their own booking. Admins can only cancel in an emergency, for
        example when a professional is suspended.
      </p>

      {canEmergencyCancel && !isCancelling && (
        <button
          type="button"
          onClick={() => setIsCancelling(true)}
          className="mt-4 rounded-full border border-arom-danger/20 px-4 py-2.5 text-sm text-arom-danger hover:bg-arom-danger-soft">
          Emergency cancel
        </button>
      )}

      {canEmergencyCancel && isCancelling && (
        <form
          onSubmit={emergencyCancel}
          className="mt-4 rounded-2xl bg-arom-danger-soft p-4">
          <h3 className="text-sm font-semibold text-arom-danger">
            Cancel this booking?
          </h3>
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            The user and the professional will both be told, and the
            cancellation is recorded in the audit log with your name.
          </p>
          <label className="mt-3 block text-sm font-medium text-ink">
            Reason *
            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError('');
              }}
              rows={3}
              maxLength={500}
              placeholder="For example, the professional's account is suspended."
              className={`${fieldClass} bg-white`}
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-arom-danger px-4 py-2 text-xs font-medium text-white hover:opacity-90">
              Cancel booking and tell both
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCancelling(false);
                setReason('');
                setError('');
              }}
              className="rounded-full border border-arom-border bg-white px-4 py-2 text-xs">
              Keep booking
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-arom-danger">
          {error}
        </p>
      )}

      <p className="mt-5 text-xs text-ink-muted">
        {km
          ? 'ការផ្លាស់ប្តូរនេះអនុវត្តតែលើទិន្នន័យសាកល្បង។'
          : 'Changes affect demo records only.'}
      </p>
    </dialog>
  );
}

export function BookingsView() {
  const { bookings, users, professionals } = useAdmin();
  const { language } = useLanguage();
  const km = language === 'km';

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<BookingStatus | 'all'>('all');
  const [date, setDate] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const labels: Record<BookingStatus, string> = {
    pending: km ? 'រង់ចាំ' : 'Pending',
    confirmed: km ? 'បានបញ្ជាក់' : 'Confirmed',
    completed: km ? 'បានបញ្ចប់' : 'Completed',
    cancelled: km ? 'បានបោះបង់' : 'Cancelled',
  };

  function userName(id: string) {
    return (
      users.find((item) => item.id === id)?.fullName ??
      (km ? 'មិនមានអ្នកប្រើប្រាស់' : 'Missing user')
    );
  }

  function professionalName(id: string) {
    const item = professionals.find((professional) => professional.id === id);

    return item
      ? km && item.kmName
        ? item.kmName
        : item.name
      : km
        ? 'មិនមានអ្នកជំនាញ'
        : 'Missing professional';
  }

  const formatter = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Phnom_Penh',
  });

  const search = query.trim().toLocaleLowerCase();

  const visible = bookings
    .filter(
      (item) =>
        (status === 'all' || item.status === status) &&
        (!date || clinicDate(item.startsAt) === date) &&
        `${item.id} ${userName(item.userId)} ${professionalName(item.professionalId)}`
          .toLocaleLowerCase()
          .includes(search),
    )
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  const selected = bookings.find((item) => item.id === selectedId);

  function clearFilters() {
    setQuery('');
    setStatus('all');
    setDate('');
  }

  return (
    <>
      <p className="text-sm font-medium text-arom">
        {km ? 'ជំនួបជាមួយអ្នកជំនាញ' : 'Professional appointments'}
      </p>

      <h1 className="mt-2 text-3xl font-semibold">
        {km ? 'ការកក់' : 'Bookings'}
      </h1>

      <p className="mt-3 text-sm text-ink-muted">
        See every appointment. Users and professionals manage their own
        bookings.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(['pending', 'confirmed', 'completed'] as const).map((value) => (
          <section
            key={value}
            className="rounded-2xl border border-arom-border bg-white p-5">
            <p className="text-2xl font-semibold">
              {bookings.filter((item) => item.status === value).length}
            </p>
            <h2 className="mt-1 text-sm text-ink-muted">{labels[value]}</h2>
          </section>
        ))}
      </div>

      <div className="mt-6">
        <BookingsChart
          bookings={bookings}
          onSelectDay={(day) => {
            setQuery('');
            setStatus('all');
            setDate(day);
            document
              .getElementById('bookings-table')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      </div>

      <section
        id="bookings-table"
        className="mt-6 scroll-mt-6 overflow-hidden rounded-3xl border border-arom-border bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 border-b border-arom-border p-5">
          <div className="relative min-w-48 flex-1">
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-3 top-3 text-ink-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={km ? 'ស្វែងរកការកក់' : 'Search bookings'}
              placeholder={
                km
                  ? 'ស្វែងរកតាមឈ្មោះ...'
                  : 'Search user, professional, or booking ID...'
              }
              className={`${fieldClass} mt-0 bg-arom-wash pl-10`}
            />
          </div>

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-label={km ? 'តម្រងកាលបរិច្ឆេទ' : 'Filter by appointment date'}
            className="rounded-xl border border-arom-border px-3 py-2.5 text-sm"
          />

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as BookingStatus | 'all')
            }
            aria-label={km ? 'តម្រងស្ថានភាព' : 'Filter by status'}
            className="rounded-xl border border-arom-border px-3 py-2.5 text-sm">
            <option value="all">{km ? 'គ្រប់ស្ថានភាព' : 'All statuses'}</option>
            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-arom underline">
            {km ? 'សម្អាតតម្រង' : 'Clear filters'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <caption className="sr-only">
              {km ? 'បញ្ជីការកក់' : 'Appointments'}
            </caption>
            <thead className="bg-arom-wash text-xs text-ink-muted">
              <tr>
                {(km
                  ? [
                      'អ្នកប្រើប្រាស់',
                      'អ្នកជំនាញ',
                      'ពេលវេលា',
                      'ជំនួប',
                      'ស្ថានភាព',
                      'សកម្មភាព',
                    ]
                  : [
                      'User',
                      'Professional',
                      'Appointment',
                      'Session',
                      'Status',
                      'Actions',
                    ]
                ).map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-5 py-4 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-arom-border">
              {visible.map((item) => (
                <tr key={item.id} className="hover:bg-arom-wash/50">
                  <td className="px-5 py-5 font-medium">
                    {userName(item.userId)}
                  </td>
                  <td className="px-5 py-5">
                    {professionalName(item.professionalId)}
                  </td>
                  <td className="px-5 py-5 text-ink-muted">
                    <time dateTime={item.startsAt}>
                      {formatter.format(new Date(item.startsAt))}
                    </time>
                  </td>
                  <td className="px-5 py-5 text-ink-muted">
                    {item.meetingType === 'Online'
                      ? km
                        ? 'អនឡាញ'
                        : 'Online'
                      : km
                        ? 'ជួបផ្ទាល់'
                        : 'In person'}
                  </td>
                  <td className="px-5 py-5">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                        item.status === 'confirmed' ||
                        item.status === 'completed'
                          ? 'bg-arom-soft text-arom'
                          : item.status === 'pending'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-arom-danger-soft text-arom-danger'
                      }`}>
                      {labels[item.status]}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <button
                      type="button"
                      aria-label={`${km ? 'មើលការកក់' : 'View booking'}: ${item.id}`}
                      onClick={() => setSelectedId(item.id)}
                      className="rounded-full border border-arom-border px-4 py-2 text-xs text-arom hover:bg-arom-soft">
                      {km ? 'ព័ត៌មាន' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!visible.length && (
          <div className="p-12 text-center">
            <Calendar size={32} className="mx-auto text-ink-muted" />
            <p className="mt-4 font-medium">
              {km ? 'មិនមានលទ្ធផល' : 'No matching bookings'}
            </p>
          </div>
        )}

        <p className="border-t border-arom-border px-5 py-4 text-xs text-ink-muted">
          {km ? 'លទ្ធផល' : 'Showing'} {visible.length} / {bookings.length}
          {' · '}
          {km ? 'ពេលវេលាភ្នំពេញ' : 'Phnom Penh time'}
        </p>
      </section>

      {selected && (
        <BookingDialog
          key={selected.id}
          booking={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
