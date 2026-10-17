import type { Metadata } from "next";
import { GuessAnimalView } from "../_components/guess-animal-view";

export const metadata: Metadata = {
  title: "Guess the animal",
};

export default function GuessAnimalPage() {
  return <GuessAnimalView />;
}
