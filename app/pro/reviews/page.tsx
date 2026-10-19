import type { Metadata } from "next";
import { ProReviewsView } from "../_components/reviews-view";

export const metadata: Metadata = {
  title: "Reviews",
};

export default function ProReviewsPage() {
  return <ProReviewsView />;
}
