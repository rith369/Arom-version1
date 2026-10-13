import type { Metadata } from "next";
import { TipsContainer } from "../../_components/tips/tips-container";

export const metadata: Metadata = {
  title: "MindGuide Tips | ARom",
  description:
    "Explore practical everyday psychological tips for stress control, sleep, and emotional balance.",
};

export default async function MindGuideTipsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string | string[] }>;
}) {
  const { open } = await searchParams;
  return <TipsContainer initialMode="home" initialItemId={typeof open === "string" ? open : undefined} />;
}
