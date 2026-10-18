import type { Metadata } from "next";
import { ProMessagesView } from "../../../_components/messages-view";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function ProGroupConversationPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return <ProMessagesView groupId={groupId} />;
}
