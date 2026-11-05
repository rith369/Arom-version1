import type { Metadata } from "next";
import { LegalPage } from "../_components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | AROM",
  description: "How AROM can be used.",
};

export default function TermsPage() {
  return <LegalPage page="terms" />;
}
