import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MINDGUIDE_PODCASTS,
  getMindGuidePodcast,
} from "../../_components/podcasts/podcast-data";
import { PodcastEpisodeView } from "../../_components/podcasts/podcasts-views";

export function generateStaticParams() {
  return MINDGUIDE_PODCASTS.map((podcast) => ({ id: podcast.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const podcast = getMindGuidePodcast((await params).id);
  return podcast
    ? { title: `${podcast.title} | AROM Podcasts`, description: podcast.description }
    : {};
}

export default async function PodcastEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const podcast = getMindGuidePodcast((await params).id);
  if (!podcast) notFound();

  return <PodcastEpisodeView podcast={podcast} />;
}
