import type { Metadata } from "next";
import { ProBookingsView } from "../_components/bookings-view";

export const metadata: Metadata = {
  title: "My bookings",
};

export default async function ProBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string | string[] }>;
}) {
  const { open } = await searchParams;
  return <ProBookingsView initialOpenId={typeof open === "string" ? open : undefined} />;
}
