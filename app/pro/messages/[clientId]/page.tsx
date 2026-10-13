import type { Metadata } from "next";
import { ProMessagesView } from "../../_components/messages-view";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function ProConversationPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <ProMessagesView clientId={clientId} />;
}
