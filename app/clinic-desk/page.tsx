import type { Metadata } from "next";
import { ClinicDeskView } from "../_components/clinic-desk/clinic-desk-view";

export const metadata: Metadata = {
  title: "Clinic desk | AROM",
  description: "Answer clinic booking requests and keep the clinic's time table.",
};

export default function ClinicDeskPage() {
  return <ClinicDeskView />;
}
