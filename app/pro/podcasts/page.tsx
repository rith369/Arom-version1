import type { Metadata } from "next";
import { ProPodcastsView } from "../_components/podcasts-view";

export const metadata: Metadata = {
  title: "My podcasts",
};

export default function ProPodcastsPage() {
  return <ProPodcastsView />;
}
