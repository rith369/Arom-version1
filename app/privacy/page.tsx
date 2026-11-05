import type { Metadata } from "next";
import { LegalPage } from "../_components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | AROM",
  description: "What AROM keeps, who can see it, and the choices you have.",
};

export default function PrivacyPage() {
  return <LegalPage page="privacy" />;
}
