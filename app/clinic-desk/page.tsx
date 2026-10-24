import type { Metadata } from "next";
import { ClinicDeskView } from "../_components/clinic-desk/clinic-desk-view";

export const metadata: Metadata = {
  title: "Clinic desk | AROM",
  description: "Answer clinic booking requests and keep the clinic's time table.",
};

export default async function ClinicDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { tab } = await searchParams;
  // The sidebar's "Messages" item opens the Messages tab.
  const start = tab === "messages" ? "messages" : "requests";
  return <ClinicDeskView key={start} initialTab={start} />;
}
