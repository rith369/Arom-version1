import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TherapistDetail } from "../../_components/therapist-detail";
import { getPublicTherapist } from "@/lib/professionals";
import { getTherapist, type Therapist } from "@/lib/therapists";

type ProfessionalPageProps = {
  params: Promise<{ slug: string }>;
};

// A listed professional from the database. The sample profiles in
// lib/therapists.ts still open (demo messages and care plans link to them),
// but they are not in the directory and cannot be booked.
async function findTherapist(slug: string): Promise<Therapist | null> {
  return (await getPublicTherapist(slug)) ?? getTherapist(slug) ?? null;
}

export async function generateMetadata({ params }: ProfessionalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const therapist = await findTherapist(slug);

  if (!therapist) return {};

  return {
    title: therapist.name,
    description: `${therapist.role} supporting ${therapist.specialties.join(", ")}.`,
  };
}

export default async function ProfessionalProfilePage({ params }: ProfessionalPageProps) {
  const { slug } = await params;
  const therapist = await findTherapist(slug);

  if (!therapist) notFound();

  return <TherapistDetail therapist={therapist} />;
}
