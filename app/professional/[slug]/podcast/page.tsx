import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TherapistPodcastPageView } from "@/app/_components/therapist-podcast-page-view";
import { getTherapist, therapists } from "@/lib/therapists";

type PodcastPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ episode?: string | string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return therapists.map((therapist) => ({ slug: therapist.slug }));
}

export async function generateMetadata({ params }: PodcastPageProps): Promise<Metadata> {
  const { slug } = await params;
  const therapist = getTherapist(slug);

  if (!therapist) return {};

  // Episodes are managed by the professional, so the title stays general here.
  return {
    title: `Podcast · ${therapist.name}`,
    description: `Listen to ${therapist.name} before you book.`,
  };
}

export default async function ProfessionalPodcastPage({ params, searchParams }: PodcastPageProps) {
  const { slug } = await params;
  const { episode } = await searchParams;
  const therapist = getTherapist(slug);

  if (!therapist) notFound();

  return <TherapistPodcastPageView therapist={therapist} episodeId={typeof episode === "string" ? episode : undefined} />;
}
