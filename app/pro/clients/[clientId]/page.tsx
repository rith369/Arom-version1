import type { Metadata } from "next";
import { ClientFilePage } from "../../_components/client-file-page";

export const metadata: Metadata = {
  title: "Client file",
};

export default async function ProClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <ClientFilePage clientId={clientId} />;
}
