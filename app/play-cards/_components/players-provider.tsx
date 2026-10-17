"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useFirstName } from "../../_components/auth-provider";
import { useLanguage } from "../../_components/language-provider";

export const MAX_PLAYERS = 8;
export const MAX_NAME = 20;

type Players = {
  // The logged in host, always first.
  host: string;
  // True when the account has no first name, so the host is shown as "You".
  hostIsYou: boolean;
  friends: string[];
  setFriends: (friends: string[]) => void;
  players: string[];
};

const PlayersContext = createContext<Players | null>(null);

/**
 * Who is playing, shared by every game under /play-cards. Kept in memory
 * only: names are never saved or sent anywhere, and are gone when the
 * person leaves the game pages (BACKEND-HANDOFF.md section 28).
 */
export function PlayersProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const firstName = useFirstName();
  const [friends, setFriends] = useState<string[]>([]);
  const host = firstName || (language === "km" ? "អ្នក" : "You");
  return (
    <PlayersContext.Provider value={{ host, hostIsYou: !firstName, friends, setFriends, players: [host, ...friends] }}>
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayers() {
  const players = useContext(PlayersContext);
  if (!players) throw new Error("usePlayers must be used inside PlayersProvider");
  return players;
}
