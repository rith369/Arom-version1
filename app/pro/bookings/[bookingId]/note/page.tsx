import type { Metadata } from "next";
import { SessionNotePage } from "../../../_components/session-note";

export const metadata: Metadata = {
  title: "Session note",
};

export default async function ProSessionNotePage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <SessionNotePage bookingId={bookingId} />;
}
