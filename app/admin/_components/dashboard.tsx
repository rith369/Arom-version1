'use client';

import Link from 'next/link';

import {
  UsersRound,
  UserCheck,
  BookOpen,
  Headphones,
  Calendar,
  MessagesSquare,
  NotebookPen,
  ArrowRight,
} from 'lucide-react';

import { useAdmin } from './admin-provider';
import { useLanguage } from '../../_components/language-provider';

export function Dashboard() {
  const {
    users,
    professionals,
    content,
    podcasts,
    bookings,
    groups,
    communityReports,
    journalPrompts,
  } = useAdmin();

  const { language } = useLanguage();
  const km = language === 'km';

  const pendingBookings = bookings.filter(
    (booking) => booking.status === 'pending',
  );

  const pendingReports = communityReports.filter(
    (report) => report.status === 'pending',
  );

  const draftContent = content.filter((item) => item.status === 'draft');

  const statistics = [
    {
      label: km ? 'អ្នកប្រើប្រាស់' : 'Users',
      value: users.length,
      detail: km
        ? `${users.filter((user) => user.status === 'active').length} គណនីសកម្ម`
        : `${users.filter((user) => user.status === 'active').length} active accounts`,
      href: '/admin/users',
      icon: UsersRound,
    },
    {
      label: km ? 'អ្នកជំនាញ' : 'Professionals',
      value: professionals.length,
      detail: km
        ? `${professionals.filter((item) => item.status === 'published').length} បានផ្សព្វផ្សាយ`
        : `${professionals.filter((item) => item.status === 'published').length} published profiles`,
      href: '/admin/professionals',
      icon: UserCheck,
    },
    {
      label: km ? 'មាតិកា MindGuide' : 'MindGuide content',
      value: content.length,
      detail: km
        ? `${draftContent.length} សេចក្តីព្រាង`
        : `${draftContent.length} drafts`,
      href: '/admin/content',
      icon: BookOpen,
    },
    {
      label: km ? 'ផតខាស' : 'Podcasts',
      value: podcasts.length,
      detail: km
        ? `${podcasts.filter((item) => item.status === 'published').length} បានផ្សព្វផ្សាយ`
        : `${podcasts.filter((item) => item.status === 'published').length} published episodes`,
      href: '/admin/podcasts',
      icon: Headphones,
    },
    {
      label: km ? 'ការកក់' : 'Bookings',
      value: bookings.length,
      detail: km
        ? `${pendingBookings.length} រង់ចាំបញ្ជាក់`
        : `${pendingBookings.length} pending confirmation`,
      href: '/admin/bookings',
      icon: Calendar,
    },
    {
      label: km ? 'ក្រុមសហគមន៍' : 'Community groups',
      value: groups.length,
      detail: km
        ? `${groups.filter((group) => group.status === 'active').length} ក្រុមសកម្ម`
        : `${groups.filter((group) => group.status === 'active').length} active groups`,
      href: '/admin/community',
      icon: MessagesSquare,
    },
    {
      label: km ? 'សំណួរកំណត់ហេតុ' : 'Journal prompts',
      value: journalPrompts.length,
      detail: km
        ? `${journalPrompts.filter((prompt) => prompt.isActive).length} សំណួរសកម្ម`
        : `${journalPrompts.filter((prompt) => prompt.isActive).length} active prompts`,
      href: '/admin/journal-prompts',
      icon: NotebookPen,
    },
  ];

  const reviewItems = [
    {
      label: km ? 'ការកក់រង់ចាំបញ្ជាក់' : 'Booking requests',
      description: km
        ? 'ពិនិត្យការកក់ដែលរង់ចាំការបញ្ជាក់។'
        : 'Review appointments awaiting confirmation.',
      count: pendingBookings.length,
      href: '/admin/bookings',
    },
    {
      label: km ? 'របាយការណ៍សហគមន៍' : 'Community reports',
      description: km
        ? 'ពិនិត្យមាតិកាដែលបានរាយការណ៍។'
        : 'Review reported community content.',
      count: pendingReports.length,
      href: '/admin/community',
    },
    {
      label: km ? 'មាតិកាសេចក្តីព្រាង' : 'Content drafts',
      description: km
        ? 'បន្តរៀបចំមាតិកាដែលមិនទាន់ផ្សព្វផ្សាយ។'
        : 'Continue preparing unpublished content.',
      count: draftContent.length,
      href: '/admin/content',
    },
  ];

  const upcomingBookings = bookings
    .filter(
      (booking) =>
        (booking.status === 'pending' || booking.status === 'confirmed') &&
        Date.parse(booking.startsAt) > Date.now(),
    )
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, 5);

  const dateFormatter = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Phnom_Penh',
  });

  function userName(id: string) {
    return (
      users.find((user) => user.id === id)?.fullName ??
      (km ? 'មិនមានអ្នកប្រើប្រាស់' : 'Missing user')
    );
  }

  function professionalName(id: string) {
    const professional = professionals.find((item) => item.id === id);

    if (!professional) {
      return km ? 'មិនមានអ្នកជំនាញ' : 'Missing professional';
    }

    return km && professional.kmName ? professional.kmName : professional.name;
  }

  return (
    <>
      <p className="text-sm font-medium text-arom">
        {km ? 'កន្លែងគ្រប់គ្រង ARom' : 'ARom workspace'}
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {km ? 'ទិដ្ឋភាពទូទៅ' : 'Overview'}
      </h1>

      <p className="mt-3 text-sm text-ink-muted">
        {km
          ? 'មើលព័ត៌មានសង្ខេប និងការងារដែលត្រូវពិនិត្យ។'
          : 'See your workspace totals and items that need review.'}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map(({ label, value, detail, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-3xl border border-arom-border bg-white p-6 shadow-sm transition-colors hover:border-arom">
            <Icon
              size={40}
              aria-hidden="true"
              className="rounded-xl bg-arom-soft p-2 text-arom"
            />

            <p className="mt-5 text-3xl font-semibold">{value}</p>

            <h2 className="mt-2 text-sm font-medium">{label}</h2>

            <p className="mt-1 text-xs text-ink-muted">{detail}</p>
          </Link>
        ))}
      </div>

      <section className="mt-7 rounded-3xl border border-arom-border bg-white p-6">
        <h2 className="text-xl font-semibold">
          {km ? 'ការងារត្រូវពិនិត្យ' : 'Needs review'}
        </h2>

        <div className="mt-4 divide-y divide-arom-border">
          {reviewItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between gap-4 py-4">
              <div>
                <h3 className="text-sm font-medium">{item.label}</h3>
                <p className="mt-1 text-xs text-ink-muted">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-3 text-arom">
                <span className="rounded-full bg-arom-wash px-3 py-1 text-sm">
                  {item.count}
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7 rounded-3xl border border-arom-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            {km ? 'ការកក់នាពេលខាងមុខ' : 'Upcoming appointments'}
          </h2>

          <Link
            href="/admin/bookings"
            className="flex items-center gap-2 text-sm text-arom">
            {km ? 'មើលការកក់ទាំងអស់' : 'View all bookings'}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-arom-border">
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-medium">
                  {userName(booking.userId)}
                </p>

                <p className="mt-1 text-xs text-ink-muted">
                  {professionalName(booking.professionalId)}
                </p>
              </div>

              <div className="text-sm">
                <time dateTime={booking.startsAt}>
                  {dateFormatter.format(new Date(booking.startsAt))}
                </time>

                <p className="mt-1 text-xs text-ink-muted">
                  {booking.status === 'confirmed'
                    ? km
                      ? 'បានបញ្ជាក់'
                      : 'Confirmed'
                    : km
                      ? 'រង់ចាំបញ្ជាក់'
                      : 'Pending confirmation'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!upcomingBookings.length && (
          <p className="py-8 text-center text-sm text-ink-muted">
            {km ? 'មិនមានការកក់នាពេលខាងមុខ។' : 'No upcoming appointments.'}
          </p>
        )}
      </section>
    </>
  );
}
