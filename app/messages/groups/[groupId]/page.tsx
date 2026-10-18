import type { Metadata } from "next";
import { UserMessages } from "../../../_components/messages/user-messages";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function GroupConversationPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return <UserMessages groupId={groupId} />;
}
