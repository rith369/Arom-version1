'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, NotebookPen, Search, UsersRound } from 'lucide-react';

import { usePro } from './pro-provider';
import { useLanguage } from '../../_components/language-provider';
import { clientsFrom, type ClientSummary } from '../_data/clients';

type Filter = 'all' | 'active' | 'new' | 'quiet' | 'archived';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function ClientsView() {
  const { bookings, sessionNotes, summaryNotes, archivedClients } = usePro();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [now] = useState(() => Date.now());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const clients = clientsFrom(bookings, now);
  const isArchived = (client: ClientSummary) => archivedClients.includes(client.id);
  const matches = (client: ClientSummary, value: Filter) => {
    if (value === 'archived') return isArchived(client);
    if (isArchived(client)) return false;
    if (value === 'active') return client.nextSessionAt !== null;
    if (value === 'new') return client.lastSessionAt === null;
    if (value === 'quiet') return client.nextSessionAt === null && (!client.lastSessionAt || now - Date.parse(client.lastSessionAt) > THIRTY_DAYS);
    return true;
  };

  const hasNotes = (client: ClientSummary) =>
    Boolean(summaryNotes[client.id]?.text) ||
    bookings.some((booking) => booking.clientId === client.id && sessionNotes[booking.id]?.text);

  const search = query.trim().toLocaleLowerCase();
  const visible = clients
    .filter((client) => matches(client, filter) && client.name.toLocaleLowerCase().includes(search))
    .sort((a, b) => {
      // Next session first, then the most recently seen.
      if (a.nextSessionAt && b.nextSessionAt) return a.nextSessionAt.localeCompare(b.nextSessionAt);
      if (a.nextSessionAt) return -1;
      if (b.nextSessionAt) return 1;
      return (b.lastSessionAt ?? '').localeCompare(a.lastSessionAt ?? '');
    });

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: t('ទាំងអស់', 'All') },
    { value: 'active', label: t('មានវគ្គខាងមុខ', 'Upcoming session') },
    { value: 'new', label: t('ថ្មី', 'New') },
    { value: 'quiet', label: t('មិនបានជួប ៣០ ថ្ងៃ', 'Not seen in 30 days') },
    { value: 'archived', label: t('អតិថិជនចាស់', 'Past clients') },
  ];

  const date = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Phnom_Penh' });
  const dateTime = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Phnom_Penh' });

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t('អតិថិជនរបស់ខ្ញុំ', 'My clients')}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t('មនុស្សដែលបានកក់ការពិគ្រោះជាមួយអ្នក។ មានតែអ្នកទេដែលឃើញទំព័រនេះ។', 'People who booked a session with you. Only you can see this page.')}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search size={18} aria-hidden="true" className="absolute left-3.5 top-3 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t('ស្វែងរកអតិថិជន', 'Search clients')}
            placeholder={t('ស្វែងរកតាមឈ្មោះ...', 'Search by name...')}
            className="w-full rounded-2xl border border-arom-border bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-arom focus:ring-4 focus:ring-arom/10"
          />
        </div>
      </div>

      <div role="group" aria-label={t('តម្រង', 'Filter')} className="mt-3 flex flex-wrap gap-2">
        {filters.map((item) => {
          const count = clients.filter((client) => matches(client, item.value)).length;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium ${filter === item.value ? 'border-arom bg-arom text-white' : 'border-arom-border bg-white text-ink-muted hover:bg-arom-wash'}`}>
              {item.label}
              <span className={filter === item.value ? 'text-white/80' : 'text-arom'}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-arom-border bg-white p-10 text-center">
          <UsersRound size={30} aria-hidden="true" className="mx-auto text-ink-muted" />
          <p className="mt-3 font-medium text-ink">
            {clients.length === 0 ? t('មិនទាន់មានអតិថិជនទេ', 'No clients yet') : t('រកមិនឃើញ', 'No matching clients')}
          </p>
          {clients.length === 0 && (
            <p className="mt-1 text-sm text-ink-muted">{t('អតិថិជននឹងបង្ហាញនៅទីនេះ បន្ទាប់ពីពួកគេកក់ជាមួយអ្នក។', 'People appear here after they book with you.')}</p>
          )}
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {visible.map((client) => (
            <li key={client.id}>
              <Link
                href={`/pro/clients/${client.id}`}
                className="flex items-center gap-4 rounded-2xl border border-arom-border bg-white px-4 py-3.5 shadow-sm hover:border-arom/40 hover:bg-arom-wash/40">
                <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-arom-soft text-sm font-semibold text-arom">
                  {initials(client.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold text-ink">{client.name}</span>
                    {hasNotes(client) && <NotebookPen size={14} aria-label={t('មានកំណត់ចំណាំ', 'Has notes')} className="shrink-0 text-arom" />}
                  </span>
                  <span className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                    <span>
                      {client.nextSessionAt
                        ? `${t('បន្ទាប់', 'Next')}: ${dateTime.format(new Date(client.nextSessionAt))}`
                        : t('គ្មានវគ្គខាងមុខ', 'No upcoming session')}
                    </span>
                    <span>
                      {client.lastSessionAt ? `${t('ចុងក្រោយ', 'Last')}: ${date.format(new Date(client.lastSessionAt))}` : t('មិនទាន់ជួប', 'Not met yet')}
                    </span>
                    <span>{t(`${client.completedSessions} វគ្គបានបញ្ចប់`, `${client.completedSessions} session${client.completedSessions === 1 ? '' : 's'} completed`)}</span>
                  </span>
                </span>
                <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
