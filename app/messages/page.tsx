import type { Metadata } from "next";
import { UserMessages } from "../_components/messages/user-messages";

export const metadata: Metadata = {
  title: "Messages",
};

export default function MessagesPage() {
  return <UserMessages />;
}
