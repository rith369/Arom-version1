import type { Metadata } from "next";
import { UnderstandView } from "./_components/understand-view";

export const metadata: Metadata = {
  title: "Understand yourself",
};

export default function UnderstandPage() {
  return <UnderstandView />;
}
