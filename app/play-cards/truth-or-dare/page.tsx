import type { Metadata } from "next";
import { TruthOrDareView } from "../_components/truth-or-dare-view";

export const metadata: Metadata = {
  title: "Truth or dare",
};

export default function TruthOrDarePage() {
  return <TruthOrDareView />;
}
