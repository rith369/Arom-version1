import type { Metadata } from "next";
import { PodcastsHomeView } from "../_components/podcasts/podcasts-views";

export const metadata: Metadata = {
  title: "Podcasts | AROM MindGuide",
  description: "Short conversations from the AROM team about caring for your mind, in Khmer and English.",
};

export default function PodcastsPage() {
  return <PodcastsHomeView />;
}
