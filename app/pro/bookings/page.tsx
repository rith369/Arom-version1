import type { Metadata } from "next";
import { ProBookingsView } from "../_components/bookings-view";

export const metadata: Metadata = {
  title: "My bookings",
};

export default function ProBookingsPage() {
  return <ProBookingsView />;
}
