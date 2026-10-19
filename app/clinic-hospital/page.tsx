import type { Metadata } from "next";
import { ClinicHomeView } from "../_components/clinics/clinic-home-view";

export const metadata: Metadata = {
  title: "Find Clinic & Hospital | AROM",
  description: "Find mental health clinics, counseling centers, and psychiatric hospitals near you in Cambodia.",
};

export default function ClinicHospitalPage() {
  return <ClinicHomeView />;
}
