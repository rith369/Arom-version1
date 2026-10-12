import { therapists } from '../../../lib/therapists';

export type PodcastStatus = 'draft' | 'published' | 'archived';

export type AdminPodcast = {
  id: string;
  professionalId: string;
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

export const initialPodcasts: AdminPodcast[] = therapists.flatMap(
  (professional) => {
    const podcast = professional.podcast;

    if (!podcast) return [];

    return [
      {
        id: podcast.id,
        professionalId: professional.slug,
        title: podcast.title,
        kmTitle: podcast.kmTitle,
        description: podcast.description,
        kmDescription: podcast.kmDescription,
        topic: podcast.topic,
        duration: podcast.duration,
        audioUrl: '',
        // Existing display dates are not necessarily YYYY-MM-DD.
        publishedDate: '',
        status: 'draft',
        chapters: podcast.chapters.map((chapter, index) => ({
          id: `${podcast.id}-chapter-${index}`,
          timestamp: chapter.timestamp,
          title: chapter.title,
          kmTitle: chapter.kmTitle,
        })),
      },
    ];
  },
);
