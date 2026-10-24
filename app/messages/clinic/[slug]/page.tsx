import type { Metadata } from "next";
import { UserMessages } from "../../../_components/messages/user-messages";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function ClinicChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <UserMessages clinicSlug={slug} />;
}
