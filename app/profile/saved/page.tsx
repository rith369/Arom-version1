import type { Metadata } from "next";
import { SavedView } from "../../_components/saved/saved-view";

export const metadata: Metadata = {
  title: "Saved | AROM",
  description: "Your saved lessons, tips, practice and podcasts in one place.",
};

export default function SavedPage() {
  return <SavedView />;
}
