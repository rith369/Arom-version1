import type { ReactNode } from "react";
import { PlayersProvider } from "./_components/players-provider";

// Every game under /play-cards shares one list of players.
export default function PlayCardsLayout({ children }: { children: ReactNode }) {
  return <PlayersProvider>{children}</PlayersProvider>;
}
