import type { Metadata } from "next";
import { UserMessages } from "../../_components/messages/user-messages";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ professionalId: string }>;
}) {
  const { professionalId } = await params;
  return <UserMessages professionalId={professionalId} />;
}
