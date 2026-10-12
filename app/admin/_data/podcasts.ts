import {
  MINDGUIDE_PODCASTS,
  formatDuration,
  formatTimestamp,
} from '../../_components/podcasts/podcast-data';

// MindGuide podcasts made by admins. Professional podcasts on profiles are
// published by the professionals themselves and are not managed here.
export type PodcastStatus = 'draft' | 'published' | 'archived';

export type AdminPodcast = {
  id: string;
  // Optional guest from the professional directory. Empty means no guest.
  guestProfessionalId: string;
  title: string;
  kmTitle: string;
  description: string;
  kmDescription: string;
  topic: string;
  duration: string;
  audioUrl: string;
  publishedDate: string;
  status: PodcastStatus;
  chapters: {
    id: string;
    timestamp: string;
    title: string;
    kmTitle: string;
  }[];
};

export const initialPodcasts: AdminPodcast[] = MINDGUIDE_PODCASTS.map((podcast) => ({
  id: podcast.id,
  guestProfessionalId: podcast.guestProfessionalId,
  title: podcast.title,
  kmTitle: podcast.kmTitle,
  description: podcast.description,
  kmDescription: podcast.kmDescription,
  topic: podcast.topic,
  duration: formatDuration(podcast.durationSeconds, false),
  audioUrl: podcast.audioUrl,
  publishedDate: podcast.publishedDate,
  // No audio file yet, so they cannot be published.
  status: podcast.audioUrl ? 'published' : 'draft',
  chapters: podcast.chapters.map((chapter) => ({
    id: `${podcast.id}-${chapter.id}`,
    timestamp: formatTimestamp(chapter.seconds),
    title: chapter.title,
    kmTitle: chapter.kmTitle,
  })),
}));
