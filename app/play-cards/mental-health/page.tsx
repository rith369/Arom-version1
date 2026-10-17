import type { Metadata } from "next";
import { PlayCardsView } from "../_components/play-cards-view";

export const metadata: Metadata = {
  title: "Mental health cards",
};

export default function MentalHealthCardsPage() {
  return <PlayCardsView />;
}
