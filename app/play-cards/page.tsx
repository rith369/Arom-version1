import type { Metadata } from "next";
import { HubView } from "./_components/hub-view";

export const metadata: Metadata = {
  title: "Play with friends",
};

export default function PlayCardsPage() {
  return <HubView />;
}
