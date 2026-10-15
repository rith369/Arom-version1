import type { Metadata } from "next";
import { MoodDetailsView } from "../_components/mood-details-view";

export const metadata: Metadata = {
  title: "Mood & Activity Details",
};

export default function MoodDetailsPage() {
  return <MoodDetailsView />;
}
