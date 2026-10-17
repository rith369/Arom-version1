"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, CircleHelp, Dice5, Hand, Heart, Lock, MessageCircle, Repeat, RotateCw, Shield, Zap } from "lucide-react";
import { TopHeader } from "../../components/top-header";
import { DesktopNavigation, MobileNavigation } from "../../_components/app-navigation";
import { useLanguage } from "../../_components/language-provider";
import { useConfirm } from "../../_components/confirm-dialog";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import {
  TOD_LEVELS,
  TOD_ROUNDS,
  drawTod,
  todPiles,
  type TodCard,
  type TodKind,
  type TodLevel,
  type TodPiles,
  type TodRounds,
} from "../_data/truth-or-dare";
import { BOLD, BOLD_COLORS, DOTS } from "./bold";
import { BackToGames, BoldGameBar, HeadingWithInfo, NeedPlayers, PlayerAvatar } from "./bold-parts";
import { BoldEndScreen } from "./bold-end-screen";
import { GuideSheet, type GuideSection } from "./guide-sheet";
import { LanguageToggle } from "./language-toggle";
import { usePlayers } from "./players-provider";
import { RulesSheet, type HouseRule } from "./rules-sheet";
import { SpinWheel, fairPick, spinTarget } from "./spin-wheel";

const KIND_LOOK: Record<TodKind, { color: string; icon: typeof MessageCircle; en: string; km: string; note: string; kmNote: string }> = {
  truth: { color: BOLD_COLORS.lilac, icon: MessageCircle, en: "Truth", km: "ការពិត", note: "Answer honestly", kmNote: "ឆ្លើយដោយស្មោះត្រង់" },
  dare: { color: BOLD_COLORS.coral, icon: Zap, en: "Dare", km: "ហ៊ានធ្វើ", note: "Do a fun challenge", kmNote: "ធ្វើការប្រកួតសប្បាយមួយ" },
};

const RULES: HouseRule[] = [
  {
    icon: Heart,
    en: "Keep it kind",
    km: "រក្សាភាពល្អចិត្ត",
    enNote: "Laugh with each other, never at each other.",
    kmNote: "សើចជាមួយគ្នា កុំសើចចំអកគ្នា។",
  },
  {
    icon: Hand,
    en: "Pass any time",
    km: "អាចរំលងបានគ្រប់ពេល",
    enNote: "Nobody has to answer or do anything. No reason needed.",
    kmNote: "គ្មាននរណាត្រូវបង្ខំឱ្យឆ្លើយ ឬធ្វើអ្វីទេ។ មិនបាច់ប្រាប់ហេតុផល។",
  },
  {
    icon: Shield,
    en: "Safe dares only",
    km: "តែការប្រកួតដែលមានសុវត្ថិភាព",
    enNote: "Nothing dangerous, no touching anyone, and no photos or videos of friends posted online.",
    kmNote: "គ្មានអ្វីគ្រោះថ្នាក់ មិនប៉ះពាល់នរណា និងមិនបង្ហោះរូបថត ឬវីដេអូមិត្តភក្តិតាមអនឡាញ។",
  },
];

const GUIDE: GuideSection[] = [
  {
    en: "Steps",
    km: "ជំហាន",
    numbered: true,
    items: [
      {
        en: "Press Spin. The leaf picks who goes next.",
        km: "ចុច បង្វិល។ ស្លឹកឈើនឹងជ្រើសរើសអ្នកបន្ទាប់។",
        enNote: "It is fair: everyone is picked once before anyone goes twice.",
        kmNote: "វាយុត្តិធម៌៖ គ្រប់គ្នាត្រូវបានជ្រើសម្តង មុនពេលនរណាម្នាក់បានពីរដង។",
      },
      { en: "Give the phone to that person. They choose Truth or Dare.", km: "ហុចទូរស័ព្ទទៅអ្នកនោះ។ ពួកគេជ្រើសរើស ការពិត ឬ ហ៊ានធ្វើ។" },
      { en: "Answer the truth or do the dare, then press Done to spin again.", km: "ឆ្លើយការពិត ឬធ្វើការប្រកួត រួចចុច រួចរាល់ ដើម្បីបង្វិលម្តងទៀត។" },
    ],
  },
  {
    en: "Buttons",
    km: "ប៊ូតុង",
    items: [
      { icon: Hand, en: "Pass", km: "រំលង", enNote: "Get a different one of the same kind.", kmNote: "យកមួយផ្សេងទៀតដែលជាប្រភេទដូចគ្នា។" },
      { icon: Repeat, en: "Switch", km: "ប្តូរ", enNote: "Change a truth to a dare, or a dare to a truth.", kmNote: "ប្តូរពីការពិតទៅហ៊ានធ្វើ ឬពីហ៊ានធ្វើទៅការពិត។" },
    ],
  },
];

// Each turn: spin, the leaf lands on someone, they choose, then the card.
type Phase = "spin" | "spinning" | "landed" | "choose";

type Game = {
  players: string[];
  level: TodLevel;
  piles: TodPiles;
  total: number;
  step: number;
  playerIndex: number;
  card: TodCard | null;
  done: number;
  phase: Phase;
  // The leaf's angle, and the fair spin: who is left this round, who went last.
  rotation: number;
  picked: number | null;
  queue: number[];
  last: number | null;
};

export function TruthOrDareView() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const reduce = useReducedMotion();
  const { players, hostIsYou } = usePlayers();
  const { confirm, dialog } = useConfirm();

  const [level, setLevel] = useState<TodLevel>("chill");
  const [rounds, setRounds] = useState<TodRounds>(20);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [ended, setEnded] = useState<number | null>(null);

  const help = helpOpen && <GuideSheet km={km} title={{ en: "How to play", km: "របៀបលេង" }} sections={GUIDE} onClose={() => setHelpOpen(false)} />;
  const nameOf = (index: number) => (hostIsYou && index === 0 ? t("អ្នក", "You") : players[index]);

  function start() {
    setEnded(null);
    setGame({
      players,
      level,
      piles: todPiles(level),
      total: rounds,
      step: 1,
      playerIndex: 0,
      card: null,
      done: 0,
      phase: "spin",
      rotation: 0,
      picked: null,
      queue: [],
      last: null,
    });
    window.scrollTo({ top: 0 });
  }

  function spin() {
    if (!game || game.phase !== "spin") return;
    const { pick, queue } = fairPick(game.queue, game.last, game.players.length);
    setGame({
      ...game,
      phase: "spinning",
      picked: pick,
      queue,
      last: pick,
      rotation: spinTarget(game.rotation, pick, game.players.length, Boolean(reduce)),
    });
    // Little taps that slow down with the leaf.
    navigator.vibrate?.([12, 90, 12, 140, 12, 220, 12, 320]);
  }

  // The leaf stopped: show who it picked for a moment, then let them choose.
  function landed() {
    setGame((current) => (current && current.phase === "spinning" ? { ...current, phase: "landed", playerIndex: current.picked ?? 0 } : current));
    navigator.vibrate?.(30);
    window.setTimeout(
      () => setGame((current) => (current && current.phase === "landed" ? { ...current, phase: "choose" } : current)),
      reduce ? 500 : 1200,
    );
  }

  function choose(kind: TodKind, avoid?: string) {
    if (!game) return;
    const drawn = drawTod(game.piles, game.level, kind, avoid);
    setGame({ ...game, piles: drawn.piles, card: drawn.card });
    navigator.vibrate?.(8);
  }

  function next() {
    if (!game) return;
    const done = game.done + 1;
    if (game.step >= game.total) {
      setEnded(done);
      setGame(null);
      window.scrollTo({ top: 0 });
      return;
    }
    setGame({ ...game, step: game.step + 1, card: null, done, phase: "spin" });
  }

  async function leave() {
    const ok = await confirm({
      title: t("បញ្ចប់ការលេង?", "End the game?"),
      message: t("អ្នកអាចចាប់ផ្តើមម្តងទៀតបានគ្រប់ពេល។", "You can start again any time."),
      confirmLabel: t("បញ្ចប់", "End game"),
      cancelLabel: t("បន្តលេង", "Keep playing"),
    });
    if (ok) setGame(null);
  }

  if (players.length < 2) return <NeedPlayers km={km} />;

  // ---------- End ----------
  if (ended !== null) {
    return (
      <BoldEndScreen
        km={km}
        color={BOLD_COLORS.coral}
        title={{ en: "That was fun!", km: "សប្បាយណាស់!" }}
        stat={{ en: `${ended} truths and dares together`, km: `ការពិត និងការប្រកួតចំនួន ${ended} ជាមួយគ្នា` }}
        note={{ en: "No winners, just good memories.", km: "គ្មានអ្នកឈ្នះ មានតែអនុស្សាវរីយ៍ល្អៗ។" }}
        onPlayAgain={start}
        onSettings={() => setEnded(null)}
      />
    );
  }

  // ---------- Playing ----------
  if (game) {
    const player = nameOf(game.playerIndex);
    const look = game.card ? KIND_LOOK[game.card.kind] : null;
    const wheel = game.phase === "spin" || game.phase === "spinning" || game.phase === "landed";
    const someoneChosen = game.phase === "landed" || game.phase === "choose" || Boolean(game.card);
    return (
      <div className={`min-h-[100dvh] ${BOLD.page}`}>
        <div className="mx-auto flex w-full max-w-md flex-col px-5 pb-8 pt-4">
          <BoldGameBar km={km} onExit={() => void leave()} onHelp={() => setHelpOpen(true)}>
            <p className="text-center text-xs font-black text-[#14221f]">{t(`វេនទី ${game.step} នៃ ${game.total}`, `Turn ${game.step} of ${game.total}`)}</p>
            <div className="mt-1.5 h-3 overflow-hidden rounded-full border-2 border-[#14221f] bg-white">
              <motion.div className="h-full bg-[#FF7A59]" initial={false} animate={{ width: `${(game.step / game.total) * 100}%` }} transition={{ duration: 0.35 }} />
            </div>
          </BoldGameBar>

          <AnimatePresence mode="wait" initial={false}>
            {someoneChosen ? (
              <motion.div
                key={`turn-${game.step}`}
                className="mt-6 flex items-center justify-center gap-3"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
              >
                <PlayerAvatar name={player} index={game.playerIndex} size="lg" />
                <div>
                  <p className="text-xl font-black leading-tight text-[#14221f]">
                    {hostIsYou && game.playerIndex === 0 ? t("វេនរបស់អ្នក!", "Your turn!") : t(`វេនរបស់ ${player}!`, `${player}'s turn!`)}
                  </p>
                  <p className="text-xs font-semibold text-[#14221f]/65">
                    {game.card ? t("ធ្វើតាមកាត ហើយចុច រួចរាល់", "Do what the card says, then press Done") : t("ជ្រើសរើស ការពិត ឬ ហ៊ានធ្វើ", "Choose truth or dare")}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`spin-${game.step}`}
                className="mt-6 text-center"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
              >
                <p className="text-xl font-black leading-tight text-[#14221f]">{t("តើវេននរណាបន្ទាប់?", "Who's next?")}</p>
                <p className="text-xs font-semibold text-[#14221f]/65">
                  {game.phase === "spinning" ? t("កំពុងបង្វិល...", "Spinning...") : t("ចុច បង្វិល ដើម្បីដឹង", "Press Spin to find out")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6">
            <AnimatePresence mode="wait" initial={false}>
              {wheel ? (
                <motion.div
                  key={`wheel-${game.step}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                >
                  <SpinWheel
                    names={game.players.map((_, index) => nameOf(index))}
                    rotation={game.rotation}
                    picked={game.picked}
                    landed={game.phase === "landed"}
                    onLanded={landed}
                  />
                  <button
                    type="button"
                    onClick={spin}
                    disabled={game.phase !== "spin"}
                    className={`mx-auto mt-8 flex min-h-16 w-full max-w-[16rem] items-center justify-center gap-2 bg-[#FFD23F] text-xl text-[#14221f] ${BOLD.button}`}
                  >
                    <RotateCw size={22} strokeWidth={2.75} aria-hidden="true" />
                    {game.phase === "spin" ? t("បង្វិល", "Spin") : game.phase === "spinning" ? t("កំពុងបង្វិល...", "Spinning...") : `${player}!`}
                  </button>
                </motion.div>
              ) : !game.card ? (
                <motion.div
                  key={`choose-${game.step}`}
                  className="grid grid-cols-2 gap-4"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                >
                  {(["truth", "dare"] as const).map((kind) => {
                    const item = KIND_LOOK[kind];
                    return (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => choose(kind)}
                        className={`flex aspect-[3/4] flex-col items-center justify-center gap-3 p-4 text-[#14221f] transition-[transform,box-shadow] duration-100 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${BOLD.card}`}
                        style={{ backgroundColor: item.color, ...DOTS }}
                      >
                        <span className="flex size-16 items-center justify-center rounded-full border-2 border-[#14221f] bg-white">
                          <item.icon size={30} strokeWidth={2.5} aria-hidden="true" />
                        </span>
                        <span className="text-2xl font-black">{km ? item.km : item.en}</span>
                        <span className="text-xs font-bold opacity-80">{km ? item.kmNote : item.note}</span>
                      </button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key={game.card.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative flex min-h-[22rem] flex-col p-6 text-[#14221f] ${BOLD.card}`}
                  style={{ backgroundColor: look!.color, ...DOTS }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 bg-white px-3 py-1 text-xs font-black ${BOLD.pill}`}>
                      {look && <look.icon size={14} aria-hidden="true" />}
                      {km ? look!.km : look!.en}
                    </span>
                    <span className={`bg-white px-3 py-1 text-xs font-bold ${BOLD.pill}`}>{km ? TOD_LEVELS[game.level].km : TOD_LEVELS[game.level].en}</span>
                  </div>
                  <p className={`flex flex-1 items-center justify-center py-6 text-center font-black tracking-tight ${km ? "text-[1.3rem] leading-[1.7]" : "text-[1.6rem] leading-snug"}`}>
                    {km ? game.card.km : game.card.en}
                  </p>
                  <div className="flex items-end justify-between">
                    <span className="text-[11px] font-black tracking-[0.2em]">AROM</span>
                    <MoodSprout mood={game.card.kind === "dare" ? "great" : "good"} className="h-12 w-auto" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {game.card && (
            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => choose(game.card!.kind, game.card!.id)}
                  title={t("យកមួយផ្សេងទៀតដែលជាប្រភេទដូចគ្នា", "Get a different one of the same kind")}
                  className={`flex min-h-14 flex-col items-center justify-center bg-white px-2 text-sm text-[#14221f] ${BOLD.button}`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Hand size={16} aria-hidden="true" />
                    {t("រំលង", "Pass")}
                  </span>
                  <span className="text-[11px] font-semibold text-[#14221f]/60">{t("យកមួយផ្សេង", "Get a different one")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => choose(game.card!.kind === "truth" ? "dare" : "truth")}
                  className={`flex min-h-14 flex-col items-center justify-center bg-white px-2 text-sm text-[#14221f] ${BOLD.button}`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Repeat size={16} aria-hidden="true" />
                    {game.card.kind === "truth" ? t("ប្តូរទៅហ៊ានធ្វើ", "Switch to dare") : t("ប្តូរទៅការពិត", "Switch to truth")}
                  </span>
                  <span className="text-[11px] font-semibold text-[#14221f]/60">{t("ប្តូរប្រភេទ", "Change the kind")}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={next}
                className={`flex min-h-14 w-full items-center justify-center gap-2 bg-[#FFD23F] px-6 text-base text-[#14221f] ${BOLD.button}`}
              >
                {game.step === game.total ? t("បញ្ចប់", "Finish") : t("រួចរាល់ បង្វិលម្តងទៀត", "Done, spin again")}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        {dialog}
        {help}
      </div>
    );
  }

  // ---------- Setup ----------
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="PlayCards" />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-2xl">
          <TopHeader />
          <div className="mt-6 lg:mt-2">
            <BackToGames km={km} />
            <section className={`relative overflow-hidden p-6 text-white ${BOLD.card}`} style={{ backgroundColor: BOLD_COLORS.coral, ...DOTS }}>
              <Dice5 size={150} strokeWidth={1.5} aria-hidden="true" className="pointer-events-none absolute -bottom-8 -right-6 rotate-12 text-white/20" />
              <span className={`flex size-16 items-center justify-center bg-white text-[#14221f] ${BOLD.box}`}>
                <Dice5 size={30} strokeWidth={2.25} aria-hidden="true" />
              </span>
              <h1 className="relative mt-4 text-[1.9rem] font-black leading-tight tracking-tight">{t("និយាយការពិត ឬហ៊ានធ្វើ", "Truth or dare")}</h1>
              <p className="relative mt-1.5 max-w-sm text-sm font-semibold text-white/90">
                {t("ការពិតរួសរាយ និងការប្រកួតកំប្លែងដែលមានសុវត្ថិភាព។ អាចរំលងបានគ្រប់ពេល។", "Friendly truths and silly, safe dares. Pass any time.")}
              </p>
              <div className="relative mt-4 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setHelpOpen(true)} className={`inline-flex min-h-11 items-center gap-1.5 bg-white px-4 text-sm text-[#14221f] ${BOLD.button}`}>
                  <CircleHelp size={16} aria-hidden="true" />
                  {t("របៀបលេង", "How to play")}
                </button>
                <LanguageToggle />
              </div>
            </section>

            <section aria-labelledby="tod-level" className={`mt-5 bg-white p-5 ${BOLD.card}`}>
              <h2 id="tod-level" className="text-base font-black text-[#14221f]">{t("ជ្រើសកម្រិត", "Choose a level")}</h2>
              <div role="radiogroup" aria-labelledby="tod-level" className="mt-3 grid grid-cols-2 gap-3">
                {(Object.keys(TOD_LEVELS) as TodLevel[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={level === option}
                    onClick={() => setLevel(option)}
                    className={`p-4 text-left text-[#14221f] ${BOLD.box} transition-colors ${level === option ? "bg-[#FFD23F]" : "bg-[#FFF6E5] hover:bg-[#FFF0CC]"}`}
                  >
                    <span className="block text-base font-black">{km ? TOD_LEVELS[option].km : TOD_LEVELS[option].en}</span>
                    <span className="mt-1 block text-xs font-semibold text-[#14221f]/70">{km ? TOD_LEVELS[option].kmBlurb : TOD_LEVELS[option].blurb}</span>
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="tod-length" className={`mt-5 bg-white p-5 ${BOLD.card}`}>
              <HeadingWithInfo
                id="tod-length"
                km={km}
                title={t("ចំនួនវេន", "How many turns?")}
                info={{
                  en: "One turn is one truth or dare for one person. The phone goes around the table until all the turns are used.",
                  km: "មួយវេន គឺការពិត ឬការប្រកួតមួយសម្រាប់មនុស្សម្នាក់។ ទូរស័ព្ទត្រូវហុចជុំតុ រហូតដល់អស់វេន។",
                }}
              />
              <div role="radiogroup" aria-labelledby="tod-length" className="mt-3 grid grid-cols-3 gap-3">
                {TOD_ROUNDS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={rounds === option}
                    onClick={() => setRounds(option)}
                    className={`min-h-14 text-lg font-black text-[#14221f] ${BOLD.box} transition-colors ${rounds === option ? "bg-[#FFD23F]" : "bg-[#FFF6E5] hover:bg-[#FFF0CC]"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </section>

            <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#14221f]/65">
              <Lock size={13} aria-hidden="true" />
              {t("គ្មានអ្វីត្រូវបានរក្សាទុកទេ។", "Nothing is saved.")}
            </p>
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className={`mt-3 flex min-h-14 w-full items-center justify-center gap-2 bg-[#FFD23F] px-6 text-base text-[#14221f] ${BOLD.button}`}
            >
              {t("ចាប់ផ្តើមលេង", "Start playing")}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </main>
      <MobileNavigation active="Community" />
      {rulesOpen && (
        <RulesSheet
          km={km}
          rules={RULES}
          onClose={() => setRulesOpen(false)}
          onAgree={() => {
            setRulesOpen(false);
            start();
          }}
        />
      )}
      {help}
    </div>
  );
}
