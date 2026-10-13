import type { Metadata } from "next";
import { ProMessagesView } from "../_components/messages-view";

export const metadata: Metadata = {
  title: "Messages",
};

export default function ProMessagesPage() {
  return <ProMessagesView />;
}
