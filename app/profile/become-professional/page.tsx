import type { Metadata } from "next";
import { BecomeProfessional } from "./_components/become-professional";

export const metadata: Metadata = {
  title: "Become a Professional",
  description: "Apply to offer counseling and therapy sessions on AROM.",
};

export default function BecomeProfessionalPage() {
  return <BecomeProfessional />;
}
