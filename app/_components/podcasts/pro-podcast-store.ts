'use client';

import { useSyncExternalStore } from 'react';

import { therapists, type TherapistPodcast } from '@/lib/therapists';

// Episodes professionals publish on their own public profile (not MindGuide
// podcasts, which admins make). Mock store: kept in memory only, so it resets
// on refresh, and uploaded audio is a temporary browser link.

export type EpisodeStatus = 'draft' | 'published' | 'hidden';

export type ProEpisode = TherapistPodcast & {
  professionalId: string;
  status: EpisodeStatus;
  // Empty for the sample episodes, which have no audio file.
  audioUrl: string;
  audioName: string;
  updatedAt: string;
  publishedAt: string | null;
};

export const MAX_EPISODES = 20;
export const MAX_AUDIO_MB = 100;
export const MAX_AUDIO_MINUTES = 60;
export const MAX_TAKEAWAYS = 4;
export const MAX_CHAPTERS = 10;
export const LIMITS = { title: 120, subtitle: 200, description: 1500, topic: 60, quote: 200, takeaway: 160, chapter: 80 };
export const AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm'];

type State = { episodes: ProEpisode[] };

const SEED_AT = '2026-03-15T03:00:00.000Z';

const initial: State = {
  episodes: therapists
    .filter((therapist) => therapist.podcast)
    .map((therapist) => ({
      ...therapist.podcast!,
      professionalId: therapist.slug,
      status: 'published' as const,
      audioUrl: '',
      audioName: '',
      updatedAt: SEED_AT,
      publishedAt: SEED_AT,
    })),
};

let state: State = initial;
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProPodcasts() {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

// Newest published first. This is what users see on the profile.
export function publishedEpisodes(episodes: ProEpisode[], professionalId: string) {
  return episodes
    .filter((item) => item.professionalId === professionalId && item.status === 'published')
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

export function emptyEpisode(professionalId: string): ProEpisode {
  return {
    id: `ep-${Date.now()}`,
    professionalId,
    status: 'draft',
    episodeNumber: '',
    kmEpisodeNumber: '',
    title: '',
    kmTitle: '',
    subtitle: '',
    kmSubtitle: '',
    description: '',
    kmDescription: '',
    duration: '0:00',
    durationSeconds: 0,
    topic: '',
    kmTopic: '',
    publishedDate: '',
    kmPublishedDate: '',
    quote: '',
    kmQuote: '',
    takeaways: [],
    kmTakeaways: [],
    chapters: [],
    audioUrl: '',
    audioName: '',
    updatedAt: new Date().toISOString(),
    publishedAt: null,
  };
}

export function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const KM_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
const toKhmerDigits = (value: number) => String(value).replace(/\d/g, (digit) => KM_DIGITS[Number(digit)]);

// The next "Episode N" for this professional, continuing their numbering.
function nextNumber(professionalId: string) {
  const used = state.episodes
    .filter((item) => item.professionalId === professionalId && item.episodeNumber)
    .map((item) => Number(item.episodeNumber.replace(/\D/g, '')) || 0);
  return (used.length ? Math.max(...used) : 0) + 1;
}

export function saveEpisode(episode: ProEpisode) {
  const updated = { ...episode, updatedAt: new Date().toISOString() };
  const exists = state.episodes.some((item) => item.id === episode.id);
  setState({
    episodes: exists ? state.episodes.map((item) => (item.id === episode.id ? updated : item)) : [...state.episodes, updated],
  });
}

// Goes live on the profile right away (professionals publish their own episodes).
export function publishEpisode(episode: ProEpisode) {
  const now = new Date();
  const number = episode.episodeNumber ? null : nextNumber(episode.professionalId);
  saveEpisode({
    ...episode,
    status: 'published',
    episodeNumber: number ? `Episode ${number}` : episode.episodeNumber,
    kmEpisodeNumber: number ? `ភាគ ${toKhmerDigits(number)}` : episode.kmEpisodeNumber,
    publishedAt: episode.publishedAt ?? now.toISOString(),
    publishedDate: episode.publishedDate || new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'Asia/Phnom_Penh' }).format(now),
    kmPublishedDate: episode.kmPublishedDate || new Intl.DateTimeFormat('km-KH', { month: 'long', year: 'numeric', timeZone: 'Asia/Phnom_Penh' }).format(now),
  });
}

export function setEpisodeStatus(id: string, status: EpisodeStatus) {
  setState({ episodes: state.episodes.map((item) => (item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item)) });
}

export function deleteEpisode(id: string) {
  setState({ episodes: state.episodes.filter((item) => item.id !== id) });
}
