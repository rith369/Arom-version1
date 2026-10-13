import type { Metadata } from "next";
import { LearnContainer } from "../../_components/learn/learn-container";

export const metadata: Metadata = {
  title: "Learn | ARom MindGuide",
  description:
    "Understand your mind, one step at a time. Explore evidence-based mental health topics, interactive lessons, and stress recovery tools.",
};

export default async function MindGuideLearnPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string | string[] }>;
}) {
  const { open } = await searchParams;
  return <LearnContainer initialMode="home" initialItemId={typeof open === "string" ? open : undefined} />;
}
