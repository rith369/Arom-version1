import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TherapistBooking } from "../../../_components/therapist-booking";
import { getOpenTimes, getPublicTherapist } from "@/lib/professionals";
import { getTherapist } from "@/lib/therapists";

type BookingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const therapist = (await getPublicTherapist(slug)) ?? getTherapist(slug);

  if (!therapist) return {};

  return {
    title: `Book with ${therapist.name}`,
    description: `Book an online or in-person session with ${therapist.name}.`,
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug } = await params;
  const listed = await getPublicTherapist(slug);
  // Sample profiles open, but have no open times, so they cannot be booked.
  const therapist = listed ?? getTherapist(slug);

  if (!therapist) notFound();

  const openTimes = listed ? await getOpenTimes(slug) : [];

  return <TherapistBooking therapist={therapist} openTimes={openTimes} />;
}
