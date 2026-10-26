'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { usePro } from './pro-provider';
import { conversationId, useConversations } from '../../_components/messages/message-store';
import type { ProBooking } from '../_data/bookings';
import { clientsFrom, sharingFor, type ClientSummary, type SharedByClient, type SharedSymptomCheck } from '../_data/clients';
import type { ProReviewsResponse } from '@/lib/reviews';

// What needs the professional's attention, worked out once for the sidebar
// badges, Home ("Needs your attention") and My clients. Everything comes from
// endpoints the area already uses (BACKEND-HANDOFF.md sections 16, 17, 31).

const DAY = 24 * 60 * 60 * 1000;
// A High result counts while it is newer than the last session and this recent.
const ALERT_WINDOW = 30 * DAY;
// A client "drifts" when there is no session and no message for this long,
// up to DRIFT_LIMIT (after that they have most likely finished).
const DRIFT_AFTER = 21 * DAY;
const DRIFT_LIMIT = 90 * DAY;

const endOf = (booking: ProBooking) => Date.parse(booking.startsAt) + booking.durationMinutes * 60_000;

/** A shared symptom check with a High result since the client's last session. Level only, never answers. */
export type ClientAlert = { client: ClientSummary; check: SharedSymptomCheck };

type Attention = {
  // Client messages not read yet (support groups are not counted).
  unread: number;
  // Past sessions that still need an outcome.
  outcomes: ProBooking[];
  // Visible reviews with no reply yet. Null until loaded.
  unrepliedReviews: number | null;
  refreshReviews: () => void;
  alerts: ClientAlert[];
  drifting: ClientSummary[];
  now: number;
};

const AttentionContext = createContext<Attention | null>(null);

function latestHigh(checks: SharedSymptomCheck[], since: number) {
  return checks
    .filter((check) => check.level === 'high' && Date.parse(check.createdAt) > since)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function ProAttentionProvider({ children }: { children: ReactNode }) {
  const { bookings, profile, archivedClients, openSuggestions } = usePro();
  const conversations = useConversations('professional');
  const [now, setNow] = useState(() => Date.now());
  const [unrepliedReviews, setUnrepliedReviews] = useState<number | null>(null);
  const [shared, setShared] = useState<Record<string, SharedSymptomCheck[]>>({});

  // The shell stays mounted between pages, so keep "now" moving.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const refreshReviews = useCallback(() => {
    fetch('/api/pro/reviews', { cache: 'no-store' })
      .then((response) => (response.ok ? (response.json() as Promise<ProReviewsResponse>) : null))
      .then((data) => {
        if (data) setUnrepliedReviews(data.reviews.filter((review) => !review.hidden && !review.reply).length);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshReviews();
  }, [refreshReviews]);

  const clients = useMemo(
    () => clientsFrom(bookings, now).filter((client) => !archivedClients.includes(client.id)),
    [bookings, now, archivedClients],
  );

  // Only clients who share symptom checks with this professional. The
  // database checks this again (client_shares_with_me).
  const sharingIds = useMemo(
    () => clients.filter((client) => sharingFor(bookings, client.id).symptomChecks).map((client) => client.id).sort().join(','),
    [clients, bookings],
  );

  useEffect(() => {
    if (!sharingIds) return;
    let active = true;
    Promise.all(
      sharingIds.split(',').map((id) =>
        fetch(`/api/pro/clients/${id}`, { cache: 'no-store' })
          .then((response) => (response.ok ? (response.json() as Promise<SharedByClient>) : null))
          .then((data) => [id, data?.symptomChecks ?? []] as const)
          .catch(() => [id, []] as const),
      ),
    ).then((entries) => {
      if (active) setShared(Object.fromEntries(entries));
    });
    return () => {
      active = false;
    };
  }, [sharingIds]);

  const alerts = useMemo(
    () =>
      clients
        .map((client) => {
          const since = Math.max(client.lastSessionAt ? Date.parse(client.lastSessionAt) : 0, now - ALERT_WINDOW);
          const check = latestHigh(shared[client.id] ?? [], since);
          return check ? { client, check } : null;
        })
        .filter((item): item is ClientAlert => item !== null)
        .sort((a, b) => b.check.createdAt.localeCompare(a.check.createdAt)),
    [clients, shared, now],
  );

  const drifting = useMemo(() => {
    const lastMessageAt = (clientId: string) => {
      const summary = conversations.conversations.find((item) => item.key === conversationId(profile.slug, clientId));
      return summary?.last ? Date.parse(summary.last.createdAt) : 0;
    };
    return clients.filter((client) => {
      if (client.completedSessions === 0 || client.nextSessionAt || !client.lastSessionAt) return false;
      if (openSuggestions.some((item) => item.clientId === client.id)) return false;
      const sinceSession = now - Date.parse(client.lastSessionAt);
      return sinceSession > DRIFT_AFTER && sinceSession < DRIFT_LIMIT && now - lastMessageAt(client.id) > DRIFT_AFTER;
    });
  }, [clients, conversations.conversations, openSuggestions, profile.slug, now]);

  const unread = clients.reduce(
    (sum, client) => sum + (conversations.conversations.find((item) => item.key === conversationId(profile.slug, client.id))?.unread ?? 0),
    0,
  );
  const outcomes = bookings.filter((item) => item.status === 'booked' && endOf(item) <= now);

  return (
    <AttentionContext.Provider value={{ unread, outcomes, unrepliedReviews, refreshReviews, alerts, drifting, now }}>
      {children}
    </AttentionContext.Provider>
  );
}

export function useProAttention() {
  const context = useContext(AttentionContext);
  if (!context) throw new Error('useProAttention must be used inside ProAttentionProvider');
  return context;
}
