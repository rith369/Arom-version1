import type { Metadata } from "next";
import { PrepareView } from "../../_components/prepare-view";

export const metadata: Metadata = {
  title: "Prepare for the session",
};

export default async function ProPreparePage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <PrepareView bookingId={bookingId} />;
}
