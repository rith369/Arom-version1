import type { Metadata } from "next";
import { PlayCardsView } from "./_components/play-cards-view";

export const metadata: Metadata = {
  title: "Play Cards with Friends",
};

export default function PlayCardsPage() {
  return <PlayCardsView />;
}
