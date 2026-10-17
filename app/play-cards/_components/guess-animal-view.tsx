"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, CircleHelp, EyeOff, Lock, Megaphone, MessageCircle, PawPrint, PersonStanding, SkipForward, Timer } from "lucide-react";
import { TopHeader } from "../../components/top-header";
import { DesktopNavigation, MobileNavigation } from "../../_components/app-navigation";
import { useLanguage } from "../../_components/language-provider";
import { useConfirm } from "../../_components/confirm-dialog";
import { ROUNDS_AROUND, TURN_SECONDS, shuffledAnimals, type Animal, type RoundsAround, type TurnSeconds } from "../_data/animals";
import { BOLD, BOLD_COLORS, DOTS } from "./bold";
import { BackToGames, BoldGameBar, NeedPlayers, PlayerAvatar } from "./bold-parts";
import { BoldEndScreen } from "./bold-end-screen";
import { GuideSheet, type GuideSection } from "./guide-sheet";
import { LanguageToggle } from "./language-toggle";
import { usePlayers } from "./players-provider";

const GUIDE: GuideSection[] = [
  {
    en: "Steps",
    km: "ជំហាន",
    numbered: true,
    items: [
      { en: "Give the phone to the person whose name is at the top. Only they look.", km: "ហុចទូរស័ព្ទទៅអ្នកដែលមានឈ្មោះនៅខាងលើ។ មានតែពួកគេទេដែលមើល។" },
      { en: "Press I'm ready. An animal and a timer appear.", km: "ចុច ខ្ញុំរួចរាល់។ សត្វមួយ និងនាឡិការាប់ថយក្រោយនឹងបង្ហាញ។" },
      { en: "Act it out, make its sound or give clues. Everyone else guesses.", km: "សម្តែង ធ្វើសំឡេង ឬផ្តល់តម្រុយ។ អ្នកផ្សេងទៀតទាយ។" },
      { en: "Press Got it when someone guesses, or Skip to try another animal.", km: "ចុច ទាយត្រូវ ពេលមាននរណាទាយត្រូវ ឬ រំលង ដើម្បីសាកសត្វផ្សេង។" },
      { en: "When time is up, pass the phone to the next person.", km: "ពេលអស់ម៉ោង ហុចទូរស័ព្ទទៅអ្នកបន្ទាប់។" },
    ],
  },
  {
    en: "Ways to give clues",
    km: "វិធីផ្តល់តម្រុយ",
    items: [
      { icon: PersonStanding, en: "Act", km: "សម្តែង", enNote: "Move like the animal.", kmNote: "ធ្វើចលនាដូចសត្វនោះ។" },
      { icon: Megaphone, en: "Sounds", km: "សំឡេង", enNote: "Make the animal's sound.", kmNote: "ធ្វើសំឡេងសត្វនោះ។" },
      { icon: MessageCircle, en: "Clues", km: "តម្រុយ", enNote: "Describe it, but never say its name.", kmNote: "ពិពណ៌នាវា ប៉ុន្តែកុំនិយាយឈ្មោះរបស់វា។" },
    ],
  },
];

type Phase = "ready" | "acting" | "timeup";

type Game = {
  players: string[];
  seconds: TurnSeconds;
  turns: number;
  turn: number;
  playerIndex: number;
  phase: Phase;
  stack: Animal[];
  animal: Animal;
  endsAt: number;
  turnGuessed: number;
  totalGuessed: number;
};

function nextAnimal(stack: Animal[]) {
  const pile = stack.length ? stack : shuffledAnimals();
  const [animal, ...rest] = pile;
  return { animal, stack: rest };
}

/** Counts down to `endsAt`, and calls `onDone` once at zero. */
function useCountdown(endsAt: number | null, onDone: () => void) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (endsAt === null) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) {
        window.clearInterval(timer);
        onDone();
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [endsAt, onDone]);
  return endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export function GuessAnimalView() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const reduce = useReducedMotion();
  const { players, hostIsYou } = usePlayers();
  const { confirm, dialog } = useConfirm();

  const [seconds, setSeconds] = useState<TurnSeconds>(60);
  const [around, setAround] = useState<RoundsAround>(1);
  const [helpOpen, setHelpOpen] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [ended, setEnded] = useState<number | null>(null);

  const help = helpOpen && <GuideSheet km={km} title={{ en: "How to play", km: "របៀបលេង" }} sections={GUIDE} onClose={() => setHelpOpen(false)} />;
  const nameOf = (index: number) => (hostIsYou && index === 0 ? t("អ្នក", "You") : players[index]);

  // Stable, so the countdown does not restart on every tick.
  const timeUp = useCallback(() => {
    setGame((current) => (current && current.phase === "acting" ? { ...current, phase: "timeup" } : current));
    navigator.vibrate?.([60, 40, 60]);
  }, []);
  const left = useCountdown(game?.phase === "acting" ? game.endsAt : null, timeUp);

  function start() {
    const first = nextAnimal(shuffledAnimals());
    setEnded(null);
    setGame({
      players,
      seconds,
      turns: players.length * around,
      turn: 1,
      playerIndex: 0,
      phase: "ready",
      stack: first.stack,
      animal: first.animal,
      endsAt: 0,
      turnGuessed: 0,
      totalGuessed: 0,
    });
    window.scrollTo({ top: 0 });
  }

  function begin() {
    if (!game) return;
    setGame({ ...game, phase: "acting", endsAt: Date.now() + game.seconds * 1000, turnGuessed: 0 });
  }

  function answer(guessed: boolean) {
    if (!game) return;
    const drawn = nextAnimal(game.stack);
    setGame({
      ...game,
      stack: drawn.stack,
      animal: drawn.animal,
      turnGuessed: game.turnGuessed + (guessed ? 1 : 0),
      totalGuessed: game.totalGuessed + (guessed ? 1 : 0),
    });
    if (guessed) navigator.vibrate?.(10);
  }

  function nextTurn() {
    if (!game) return;
    if (game.turn >= game.turns) {
      setEnded(game.totalGuessed);
      setGame(null);
      window.scrollTo({ top: 0 });
      return;
    }
    const drawn = nextAnimal(game.stack);
    setGame({
      ...game,
      turn: game.turn + 1,
      playerIndex: (game.playerIndex + 1) % game.players.length,
      phase: "ready",
      stack: drawn.stack,
      animal: drawn.animal,
    });
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
        color={BOLD_COLORS.sun}
        title={{ en: "Great teamwork!", km: "សហការគ្នាល្អណាស់!" }}
        stat={{ en: `You guessed ${ended} animals together`, km: `អ្នកទាំងអស់គ្នាទាយត្រូវសត្វ ${ended}` }}
        note={{ en: "No winners. Every guess was a team effort.", km: "គ្មានអ្នកឈ្នះ។ ការទាយនីមួយៗគឺជាការខិតខំរួមគ្នា។" }}
        onPlayAgain={start}
        onSettings={() => setEnded(null)}
      />
    );
  }

  // ---------- Playing ----------
  if (game) {
    const player = nameOf(game.playerIndex);
    const isYou = hostIsYou && game.playerIndex === 0;
    const nextName = nameOf((game.playerIndex + 1) % game.players.length);
    const urgent = game.phase === "acting" && left <= 10;
    return (
      <div className={`min-h-[100dvh] ${BOLD.page}`}>
        <div className="mx-auto flex w-full max-w-md flex-col px-5 pb-8 pt-4">
          <BoldGameBar km={km} onExit={() => void leave()} onHelp={() => setHelpOpen(true)}>
            <p className="text-center text-xs font-black text-[#14221f]">{t(`វេនទី ${game.turn} នៃ ${game.turns}`, `Turn ${game.turn} of ${game.turns}`)}</p>
            <p className="mt-1 text-center text-[11px] font-bold text-[#14221f]/60">
              {t(`ទាយត្រូវសរុប ${game.totalGuessed}`, `${game.totalGuessed} guessed together`)}
            </p>
          </BoldGameBar>

          <div className="mt-6 flex items-center justify-center gap-3">
            <PlayerAvatar name={player} index={game.playerIndex} size="lg" />
            <div>
              <p className="text-xl font-black leading-tight text-[#14221f]">{isYou ? t("វេនរបស់អ្នក", "Your turn") : t(`វេនរបស់ ${player}`, `${player}'s turn`)}</p>
              <p className="text-xs font-semibold text-[#14221f]/65">
                {game.phase === "acting"
                  ? t("សម្តែង ធ្វើសំឡេង ឬផ្តល់តម្រុយ", "Act, make sounds or give clues")
                  : game.phase === "timeup"
                    ? t("វេននេះចប់ហើយ", "This turn is over")
                    : t("មានតែអ្នកនេះទេដែលមើលទូរស័ព្ទ", "Only this person looks at the phone")}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {game.phase === "ready" && (
              <motion.div
                key={`ready-${game.turn}`}
                className={`mt-6 flex min-h-[22rem] flex-col items-center justify-center p-6 text-center text-[#14221f] ${BOLD.card}`}
                style={{ backgroundColor: BOLD_COLORS.sky, ...DOTS }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                <span className="flex size-20 items-center justify-center rounded-full border-2 border-[#14221f] bg-white">
                  <EyeOff size={34} aria-hidden="true" />
                </span>
                <p className="mt-5 text-2xl font-black leading-tight">
                  {isYou ? t("មានតែអ្នកទេដែលមើល!", "Only you look!") : t(`មានតែ ${player} ទេដែលមើល!`, `Only ${player} looks!`)}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#14221f]/75">
                  {t(`អ្នកផ្សេងទៀត សូមកុំមើលអេក្រង់។ អ្នកមានពេល ${game.seconds} វិនាទី។`, `Everyone else, no peeking. You have ${game.seconds} seconds.`)}
                </p>
                <button type="button" onClick={begin} className={`mt-6 inline-flex min-h-14 items-center gap-2 bg-[#FFD23F] px-7 text-base ${BOLD.button}`}>
                  {t("ខ្ញុំរួចរាល់ បង្ហាញមក", "I'm ready, show me")}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </motion.div>
            )}

            {game.phase === "acting" && (
              <motion.div key="acting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                <div className="mt-5 flex items-center justify-center">
                  <motion.span
                    className={`inline-flex items-center gap-2 px-5 py-2 text-2xl font-black tabular-nums text-[#14221f] ${BOLD.pill} ${urgent ? "bg-[#FF7A59] text-white" : "bg-white"}`}
                    animate={urgent && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ duration: 1, repeat: urgent ? Infinity : 0 }}
                    role="timer"
                    aria-label={t(`នៅសល់ ${left} វិនាទី`, `${left} seconds left`)}
                  >
                    <Timer size={22} aria-hidden="true" />
                    {left}
                  </motion.span>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={game.animal.id + game.turnGuessed + game.stack.length}
                    className={`mt-4 flex min-h-[18rem] flex-col items-center justify-center p-6 text-center text-[#14221f] ${BOLD.card}`}
                    style={{ backgroundColor: BOLD_COLORS.sun, ...DOTS }}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  >
                    <span className="text-[6rem] leading-none" aria-hidden="true">
                      {game.animal.emoji}
                    </span>
                    <p className="mt-4 text-[2rem] font-black leading-tight tracking-tight">{km ? game.animal.km : game.animal.en}</p>
                    <p className="mt-1 text-sm font-bold text-[#14221f]/60">{km ? game.animal.en : game.animal.km}</p>
                  </motion.div>
                </AnimatePresence>
                <p className="mt-3 text-center text-xs font-bold text-[#14221f]/60">
                  {t(`វេននេះទាយត្រូវ ${game.turnGuessed}`, `${game.turnGuessed} guessed this turn`)}
                </p>
                <div className="mt-4 grid grid-cols-[1fr_1.6fr] gap-3">
                  <button type="button" onClick={() => answer(false)} className={`flex min-h-16 items-center justify-center gap-1.5 bg-white text-base text-[#14221f] ${BOLD.button}`}>
                    <SkipForward size={18} aria-hidden="true" />
                    {t("រំលង", "Skip")}
                  </button>
                  <button type="button" onClick={() => answer(true)} className={`flex min-h-16 items-center justify-center gap-2 bg-[#2FA584] text-lg text-white ${BOLD.button}`}>
                    <Check size={22} strokeWidth={3} aria-hidden="true" />
                    {t("ទាយត្រូវ!", "Got it!")}
                  </button>
                </div>
              </motion.div>
            )}

            {game.phase === "timeup" && (
              <motion.div
                key={`timeup-${game.turn}`}
                className={`mt-6 flex min-h-[22rem] flex-col items-center justify-center p-6 text-center text-white ${BOLD.card}`}
                style={{ backgroundColor: BOLD_COLORS.coral, ...DOTS }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, rotate: 4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <span className="flex size-20 items-center justify-center rounded-full border-2 border-[#14221f] bg-white text-[#14221f]">
                  <Timer size={34} aria-hidden="true" />
                </span>
                <p className="mt-5 text-3xl font-black">{t("អស់ម៉ោងហើយ!", "Time's up!")}</p>
                <p className={`mt-3 bg-white px-4 py-1.5 text-sm font-black text-[#14221f] ${BOLD.pill}`}>
                  {t(`វេននេះទាយត្រូវ ${game.turnGuessed}`, `${game.turnGuessed} guessed this turn`)}
                </p>
                <p className="mt-3 text-sm font-semibold text-white/90">
                  {game.turn >= game.turns ? t("នេះជាវេនចុងក្រោយ!", "That was the last turn!") : t(`ហុចទូរស័ព្ទទៅ ${nextName}`, `Pass the phone to ${nextName}`)}
                </p>
                <button type="button" onClick={nextTurn} className={`mt-6 inline-flex min-h-14 items-center gap-2 bg-[#FFD23F] px-7 text-base text-[#14221f] ${BOLD.button}`}>
                  {game.turn >= game.turns ? t("មើលលទ្ធផល", "See how we did") : t(`ទៅ ${nextName}`, `Next: ${nextName}`)}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {dialog}
        {help}
      </div>
    );
  }

  // ---------- Setup ----------
  const choice = (on: boolean) => `${BOLD.box} transition-colors ${on ? "bg-[#FFD23F]" : "bg-[#FFF6E5] hover:bg-[#FFF0CC]"}`;
  return (
    <div className={`min-h-screen ${BOLD.page} lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]`}>
      <DesktopNavigation active="PlayCards" />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-2xl">
          <TopHeader />
          <div className="mt-6 lg:mt-2">
            <BackToGames km={km} />
            <section className={`relative overflow-hidden p-6 text-[#14221f] ${BOLD.card}`} style={{ backgroundColor: BOLD_COLORS.sun, ...DOTS }}>
              <PawPrint size={150} strokeWidth={1.5} aria-hidden="true" className="pointer-events-none absolute -bottom-8 -right-6 rotate-12 text-[#14221f]/10" />
              <span className={`flex size-16 items-center justify-center bg-white text-[30px] ${BOLD.box}`} aria-hidden="true">
                🐘
              </span>
              <h1 className="relative mt-4 text-[1.9rem] font-black leading-tight tracking-tight">{t("ទាយសត្វ", "Guess the animal")}</h1>
              <p className="relative mt-1.5 max-w-sm text-sm font-semibold text-[#14221f]/75">
                {t("សម្តែង ធ្វើសំឡេង ឬផ្តល់តម្រុយ។ គ្រប់គ្នាជួយគ្នាទាយ។ គ្មានអ្នកឈ្នះ។", "Act it out, make the sound or give clues. Everyone guesses together. No winners.")}
              </p>
              <div className="relative mt-4 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setHelpOpen(true)} className={`inline-flex min-h-11 items-center gap-1.5 bg-white px-4 text-sm ${BOLD.button}`}>
                  <CircleHelp size={16} aria-hidden="true" />
                  {t("របៀបលេង", "How to play")}
                </button>
                <LanguageToggle />
              </div>
            </section>

            <section aria-labelledby="ga-time" className={`mt-5 bg-white p-5 ${BOLD.card}`}>
              <h2 id="ga-time" className="text-base font-black text-[#14221f]">{t("ពេលសម្រាប់វេននីមួយៗ", "Time for each turn")}</h2>
              <div role="radiogroup" aria-labelledby="ga-time" className="mt-3 grid grid-cols-3 gap-3">
                {TURN_SECONDS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={seconds === option}
                    onClick={() => setSeconds(option)}
                    className={`min-h-14 text-[#14221f] ${choice(seconds === option)}`}
                  >
                    <span className="block text-lg font-black">{option}</span>
                    <span className="block text-[11px] font-bold text-[#14221f]/65">{t("វិនាទី", "seconds")}</span>
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="ga-rounds" className={`mt-5 bg-white p-5 ${BOLD.card}`}>
              <h2 id="ga-rounds" className="text-base font-black text-[#14221f]">{t("ហុចជុំតុប៉ុន្មានដង?", "How many times around the table?")}</h2>
              <div role="radiogroup" aria-labelledby="ga-rounds" className="mt-3 grid grid-cols-3 gap-3">
                {ROUNDS_AROUND.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={around === option}
                    onClick={() => setAround(option)}
                    className={`min-h-14 text-[#14221f] ${choice(around === option)}`}
                  >
                    <span className="block text-lg font-black">{option}×</span>
                    <span className="block text-[11px] font-bold text-[#14221f]/65">
                      {t(`${players.length * option} វេន`, `${players.length * option} turns`)}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#14221f]/65">
              <Lock size={13} aria-hidden="true" />
              {t("គ្មានអ្វីត្រូវបានរក្សាទុកទេ។", "Nothing is saved.")}
            </p>
            <button type="button" onClick={start} className={`mt-3 flex min-h-14 w-full items-center justify-center gap-2 bg-[#FFD23F] px-6 text-base text-[#14221f] ${BOLD.button}`}>
              {t("ចាប់ផ្តើមលេង", "Start playing")}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </main>
      <MobileNavigation active="Community" />
      {help}
    </div>
  );
}
