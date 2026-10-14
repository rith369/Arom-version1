import type { Metadata } from "next";
import { TherapistDirectory } from "../_components/therapist-directory";
import { listPublicTherapists } from "@/lib/professionals";

export const metadata: Metadata = {
  title: "Find a professional",
  description: "Find professional mental health support through AROM.",
};

export default async function ProfessionalPage() {
  const therapists = await listPublicTherapists();
  return <TherapistDirectory therapists={therapists} />;
}
