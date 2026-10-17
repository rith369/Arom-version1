"use client";

import { useState } from "react";
import { TopHeader } from "../../components/top-header";
import { DesktopNavigation, MobileNavigation } from "../../_components/app-navigation";
import { useLanguage } from "../../_components/language-provider";
import { useFirstName } from "../../_components/auth-provider";
import { useConfirm } from "../../_components/confirm-dialog";
import {
  levelPlan,
  lighterLevel,
  shuffledPiles,
  type CardLevel,
  type DeckChoice,
  type PlayCard,
  type RoundCount,
} from "../_data/cards";
import { EndScreen } from "./end-screen";
import { GameScreen, type CardExit } from "./game-screen";
import { RulesSheet } from "./rules-sheet";
import { SetupScreen } from "./setup-screen";

type Piles = Record<CardLevel, PlayCard[]>;

type Game = {
  players: string[];
  plan: CardLevel[];
  piles: Piles;
  // 1 based: which turn of the plan is showing.
  step: number;
  playerIndex: number;
  card: PlayCard;
  flipped: boolean;
  exit: CardExit;
  shared: number;
};

/** Takes the top card of a level's pile, reshuffling it when it runs out. */
function draw(piles: Piles, level: CardLevel, avoid?: string): { card: PlayCard; piles: Piles } {
  let pile = piles[level].filter((item) => item.id !== avoid);
  if (!pile.length) pile = shuffledPiles()[level].filter((item) => item.id !== avoid);
  const [card, ...rest] = pile;
  return { card, piles: { ...piles, [level]: rest } };
}

const toTop = () => window.scrollTo({ top: 0 });

/**
 * Play Cards with Friends, version 1: one phone passed around the table.
 * Everything stays in this page's memory; names and answers are never saved
 * (BACKEND-HANDOFF.md section 28).
 */
export function PlayCardsView() {
  const { language } = useLanguage();
  const km = language === "km";
  const firstName = useFirstName();
  const host = firstName || (km ? "អ្នក" : "You");
  const { confirm, dialog } = useConfirm();

  const [friends, setFriends] = useState<string[]>([]);
  const [deck, setDeck] = useState<DeckChoice>("journey");
  const [rounds, setRounds] = useState<RoundCount>(15);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [ended, setEnded] = useState<{ shared: number; players: number } | null>(null);

  function start() {
    const players = [host, ...friends];
    const plan = levelPlan(deck, rounds);
    const first = draw(shuffledPiles(), plan[0]);
    setEnded(null);
    setGame({ players, plan, piles: first.piles, step: 1, playerIndex: 0, card: first.card, flipped: false, exit: "next", shared: 0 });
    toTop();
  }

  function flip() {
    setGame((current) => (current ? { ...current, flipped: true } : current));
    // A tiny tap on phones that support it.
    navigator.vibrate?.(8);
  }

  function next() {
    if (!game) return;
    const shared = game.shared + 1;
    if (game.step >= game.plan.length) {
      setEnded({ shared, players: game.players.length });
      setGame(null);
      toTop();
      return;
    }
    const drawn = draw(game.piles, game.plan[game.step]);
    setGame({
      ...game,
      piles: drawn.piles,
      card: drawn.card,
      step: game.step + 1,
      playerIndex: (game.playerIndex + 1) % game.players.length,
      flipped: false,
      exit: "next",
      shared,
    });
  }

  // Pass: the same person gets a new card of the same level, no questions asked.
  function pass() {
    if (!game) return;
    const drawn = draw(game.piles, game.card.level, game.card.id);
    setGame({ ...game, piles: drawn.piles, card: drawn.card, flipped: false, exit: "pass" });
  }

  function lighter() {
    if (!game) return;
    const level = lighterLevel(game.card.level);
    if (!level) return;
    const drawn = draw(game.piles, level);
    setGame({ ...game, piles: drawn.piles, card: drawn.card, flipped: false, exit: "pass" });
  }

  async function leave() {
    const ok = await confirm({
      title: km ? "បញ្ចប់ការលេង?" : "End the game?",
      message: km ? "អ្នកអាចចាប់ផ្តើមម្តងទៀតបានគ្រប់ពេល។" : "You can start again any time.",
      confirmLabel: km ? "បញ្ចប់" : "End game",
      cancelLabel: km ? "បន្តលេង" : "Keep playing",
    });
    if (!ok) return;
    setGame(null);
    toTop();
  }

  if (game) {
    return (
      <>
        <GameScreen
          km={km}
          players={game.players}
          hostIsYou={!firstName}
          playerIndex={game.playerIndex}
          card={game.card}
          flipped={game.flipped}
          onFlip={flip}
          exit={game.exit}
          step={game.step}
          total={game.plan.length}
          onNext={next}
          onPass={pass}
          onLighter={lighter}
          onExit={() => void leave()}
        />
        {dialog}
      </>
    );
  }

  if (ended) {
    return (
      <EndScreen
        km={km}
        shared={ended.shared}
        players={ended.players}
        onPlayAgain={start}
        onNewGame={() => {
          setEnded(null);
          toTop();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="PlayCards" />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-2xl">
          <TopHeader />
          <div className="mt-6 lg:mt-2">
            <SetupScreen
              km={km}
              host={host}
              friends={friends}
              onFriendsChange={setFriends}
              deck={deck}
              onDeckChange={setDeck}
              rounds={rounds}
              onRoundsChange={setRounds}
              onStart={() => setRulesOpen(true)}
            />
          </div>
        </div>
      </main>
      <MobileNavigation active="Community" />
      {rulesOpen && (
        <RulesSheet
          km={km}
          onClose={() => setRulesOpen(false)}
          onAgree={() => {
            setRulesOpen(false);
            start();
          }}
        />
      )}
    </div>
  );
}
