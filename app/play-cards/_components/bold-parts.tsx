"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CircleHelp, Lock, UserPlus, Users, X } from "lucide-react";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import { LanguageToggle } from "./language-toggle";
import { MAX_NAME, MAX_PLAYERS, usePlayers } from "./players-provider";
import { BOLD } from "./bold";
import { PLAYER_COLORS, initialOf } from "./theme";

/** A player's round avatar in the bold style. */
export function PlayerAvatar({ name, index, size = "md" }: { name: string; index: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg" };
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-[#14221f] font-bold text-white ${sizes[size]}`}
      style={{ backgroundColor: PLAYER_COLORS[index % PLAYER_COLORS.length] }}
    >
      {initialOf(name)}
    </span>
  );
}

/** Add and remove players. Names stay in memory only. */
export function PlayersEditor({ km }: { km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const { players, friends, setFriends, hostIsYou } = usePlayers();
  const [name, setName] = useState("");
  const full = players.length >= MAX_PLAYERS;

  function add(event: FormEvent) {
    event.preventDefault();
    const clean = name.trim().slice(0, MAX_NAME);
    if (!clean || full) return;
    setFriends([...friends, clean]);
    setName("");
  }

  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {players.map((player, index) => (
          <li key={`${player}-${index}`} className={`inline-flex min-h-11 items-center gap-2 bg-white py-1 pl-1 pr-2 text-sm font-semibold text-[#14221f] ${BOLD.pill}`}>
            <PlayerAvatar name={player} index={index} size="sm" />
            <span className="max-w-[8rem] truncate">{index === 0 && hostIsYou ? t("អ្នក", "You") : player}</span>
            {index === 0 ? (
              <span className="rounded-full bg-[#FFD23F] px-2 py-0.5 text-[10px] font-bold text-[#14221f]">{t("ម្ចាស់", "Host")}</span>
            ) : (
              <button
                type="button"
                onClick={() => setFriends(friends.filter((_, i) => i !== index - 1))}
                aria-label={t(`ដក ${player} ចេញ`, `Remove ${player}`)}
                className="flex size-7 items-center justify-center rounded-full hover:bg-[#FFE3DA] hover:text-[#C2410C]"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-3 flex gap-2">
        <label htmlFor="friend-name" className="sr-only">
          {t("ឈ្មោះមិត្តភក្តិ", "Friend's name")}
        </label>
        <input
          id="friend-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_NAME}
          disabled={full}
          placeholder={full ? t("ពេញហើយ", "The table is full") : t("បន្ថែមឈ្មោះមិត្ត", "Add a friend's name")}
          className="min-h-12 w-full rounded-2xl border-2 border-[#14221f] bg-white px-4 text-sm font-medium text-[#14221f] outline-none placeholder:text-[#14221f]/45 focus:ring-4 focus:ring-[#FFD23F]/60 disabled:bg-[#F2EBDD]"
        />
        <button type="submit" disabled={!name.trim() || full} className={`inline-flex min-h-12 shrink-0 items-center gap-1.5 bg-[#2FA584] px-4 text-sm text-white ${BOLD.button}`}>
          <UserPlus size={16} aria-hidden="true" />
          {t("បន្ថែម", "Add")}
        </button>
      </form>
      <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-[#14221f]/65">
        <Lock size={12} aria-hidden="true" className="shrink-0" />
        {t("ឈ្មោះនៅតែលើទូរស័ព្ទនេះ ហើយបាត់ទៅវិញពេលអ្នកចាកចេញ។", "Names stay on this phone and are gone when you leave.")}
      </p>
    </div>
  );
}

/** Shown on a game page when fewer than 2 people are playing. */
export function NeedPlayers({ km }: { km: boolean }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  return (
    <div className={`min-h-[100dvh] ${BOLD.page} px-5 py-10`}>
      <div className={`mx-auto max-w-md bg-white p-6 text-center ${BOLD.card}`}>
        <span className="mx-auto flex size-20 items-center justify-center rounded-full border-2 border-[#14221f] bg-[#FFD23F]">
          <MoodSprout mood="okay" className="h-14 w-auto" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-[#14221f]">{t("ត្រូវការមិត្តម្នាក់ទៀត", "You need at least one friend")}</h1>
        <p className="mt-1.5 text-sm text-[#14221f]/70">
          {t("បន្ថែមឈ្មោះអ្នកលេងនៅទំព័រហ្គេមជាមុនសិន។", "Add who is playing on the games page first.")}
        </p>
        <Link href="/play-cards" className={`mt-5 inline-flex min-h-12 items-center gap-2 bg-[#FFD23F] px-6 text-sm text-[#14221f] ${BOLD.button}`}>
          <Users size={16} aria-hidden="true" />
          {t("បន្ថែមអ្នកលេង", "Add players")}
        </Link>
      </div>
    </div>
  );
}

/** Top bar for the party games: close, a title or progress, language and help. */
export function BoldGameBar({
  km,
  onExit,
  onHelp,
  children,
}: {
  km: boolean;
  onExit: () => void;
  onHelp: () => void;
  children: ReactNode;
}) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const round = `flex size-11 shrink-0 items-center justify-center bg-white text-[#14221f] ${BOLD.button}`;
  return (
    <header className="flex items-center gap-2.5">
      <button type="button" onClick={onExit} aria-label={t("បញ្ចប់ការលេង", "End the game")} className={round}>
        <X size={18} aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
      <LanguageToggle />
      <button type="button" onClick={onHelp} aria-label={t("របៀបលេង", "How to play")} className={round}>
        <CircleHelp size={20} aria-hidden="true" />
      </button>
    </header>
  );
}

/** "All games" link above a game's setup. */
export function BackToGames({ km }: { km: boolean }) {
  return (
    <Link
      href="/play-cards"
      className="-ml-1 mb-3 inline-flex min-h-9 items-center gap-1 rounded-full pr-2 text-sm font-bold text-[#14221f] hover:underline"
    >
      <ArrowLeft size={17} aria-hidden="true" />
      {km ? "ហ្គេមទាំងអស់" : "All games"}
    </Link>
  );
}
