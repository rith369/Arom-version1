"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, Dice5, Gamepad2, Heart, PawPrint, Users } from "lucide-react";
import { TopHeader } from "../../components/top-header";
import { DesktopNavigation, MobileNavigation } from "../../_components/app-navigation";
import { useLanguage } from "../../_components/language-provider";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import { PLAY_CARDS } from "../_data/cards";
import { TOD_CARDS } from "../_data/truth-or-dare";
import { ANIMALS } from "../_data/animals";
import { BOLD, BOLD_COLORS, DOTS } from "./bold";
import { PlayerAvatar, PlayersEditor } from "./bold-parts";
import { LanguageToggle } from "./language-toggle";
import { usePlayers } from "./players-provider";

type GameTile = {
  href: string;
  en: string;
  km: string;
  blurb: string;
  kmBlurb: string;
  badge: string;
  kmBadge: string;
  chips: { en: string; km: string }[];
  color: string;
  // Dark words on a light tile (yellow), white words otherwise.
  light: boolean;
  icon: ReactNode;
  watermark: ReactNode;
};

/** The game hub: who is playing, then one bold tile per game. */
export function HubView() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const { players } = usePlayers();
  const ready = players.length >= 2;

  const games: GameTile[] = [
    {
      href: "/play-cards/mental-health",
      en: "Mental health cards",
      km: "កាតនិយាយពីចិត្ត (Mental health cards)",
      blurb: "Questions that help friends open up, from light to deep.",
      kmBlurb: "សំណួរដែលជួយឱ្យមិត្តភក្តិបើកចិត្តនិយាយ ពីស្រាលទៅជ្រៅ។",
      badge: `${PLAY_CARDS.length} cards`,
      kmBadge: `កាត ${PLAY_CARDS.length}`,
      chips: [
        { en: "Warm up", km: "កម្តៅចិត្ត" },
        { en: "Getting real", km: "និយាយពីចិត្ត" },
        { en: "Care", km: "យកចិត្តទុកដាក់" },
      ],
      color: BOLD_COLORS.green,
      light: false,
      icon: <MoodSprout mood="good" className="h-11 w-auto" />,
      watermark: <Heart size={150} strokeWidth={1.5} />,
    },
    {
      href: "/play-cards/truth-or-dare",
      en: "Truth or dare",
      km: "និយាយការពិត ឬហ៊ានធ្វើ (Truth or dare)",
      blurb: "Friendly truths and silly, safe dares. Pass any time.",
      kmBlurb: "ការពិតរួសរាយ និងការប្រកួតកំប្លែងដែលមានសុវត្ថិភាព។ អាចរំលងបានគ្រប់ពេល។",
      badge: `${TOD_CARDS.length} cards`,
      kmBadge: `កាត ${TOD_CARDS.length}`,
      chips: [
        { en: "Chill", km: "ស្រាលៗ" },
        { en: "Silly", km: "កំប្លែង" },
      ],
      color: BOLD_COLORS.coral,
      light: false,
      icon: <Dice5 size={28} strokeWidth={2.25} className="text-[#14221f]" />,
      watermark: <Dice5 size={150} strokeWidth={1.5} />,
    },
    {
      href: "/play-cards/guess-animal",
      en: "Guess the animal",
      km: "ទាយសត្វ (Guess the animal)",
      blurb: "Act it out, make the sound or give clues. Everyone guesses.",
      kmBlurb: "សម្តែង ធ្វើសំឡេង ឬផ្តល់តម្រុយ។ គ្រប់គ្នាជួយគ្នាទាយ។",
      badge: `${ANIMALS.length} animals`,
      kmBadge: `សត្វ ${ANIMALS.length}`,
      chips: [
        { en: "Act", km: "សម្តែង" },
        { en: "Sounds", km: "សំឡេង" },
        { en: "Clues", km: "តម្រុយ" },
      ],
      color: BOLD_COLORS.sun,
      light: true,
      icon: <span className="text-[28px] leading-none">🐘</span>,
      watermark: <PawPrint size={150} strokeWidth={1.5} />,
    },
  ];

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="PlayCards" />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-5xl">
          <TopHeader />

          <header className="mt-6 flex flex-wrap items-end justify-between gap-3 lg:mt-2">
            <div>
              <h1 className="text-[1.9rem] font-extrabold leading-tight tracking-tight text-[#1F6F5B] sm:text-[2.25rem]">
                {t("លេងជាមួយមិត្តភក្តិ", "Play with friends")}
              </h1>
              <p className="mt-1 text-sm font-medium text-[#14221f]/70">
                {t("ជ្រើសហ្គេមមួយ ហុចទូរស័ព្ទជុំគ្នា សើច និងនិយាយជាមួយគ្នា។", "Pick a game, pass one phone, laugh and talk together.")}
              </p>
            </div>
            <LanguageToggle />
          </header>

          {/* Who is playing */}
          <section aria-labelledby="players-title" className={`mt-6 bg-white p-5 sm:p-7 ${BOLD.card}`}>
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className={`inline-flex items-center gap-1.5 bg-[#FFD23F] px-3 py-1 text-xs font-bold text-[#14221f] ${BOLD.pill}`}>
                  <Users size={14} aria-hidden="true" />
                  {t("ទូរស័ព្ទមួយ • មិត្ត ២ ដល់ ៨ នាក់", "One phone • 2 to 8 friends")}
                </p>
                <h2 id="players-title" className="mt-3 flex items-end gap-2">
                  <span className="text-[4.25rem] font-black leading-none tracking-tight text-[#1F6F5B] sm:text-[5rem]">{players.length}</span>
                  <span className="pb-2 text-base font-bold text-[#14221f]">{t("នាក់កំពុងលេង", players.length === 1 ? "player" : "players")}</span>
                </h2>
              </div>
              <div className="flex gap-3">
                <div className={`min-w-[7.5rem] bg-[#FFF6E5] px-4 py-3 ${BOLD.box}`}>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#14221f]/70">
                    <Gamepad2 size={15} aria-hidden="true" className="text-[#1F6F5B]" />
                    {t("ហ្គេម", "Games")}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#14221f]">{games.length}</p>
                </div>
                <div className={`min-w-[7.5rem] bg-[#FFF6E5] px-4 py-3 ${BOLD.box}`}>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#14221f]/70">
                    <Heart size={15} aria-hidden="true" className="text-[#FF7A59]" />
                    {t("អ្នកឈ្នះ", "Winners")}
                  </p>
                  <p className="mt-1 text-sm font-black leading-8 text-[#14221f]">{t("គ្មាន, គ្រប់គ្នា", "None, all of us")}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 border-t-2 border-dashed border-[#14221f]/15 pt-5">
              <PlayersEditor km={km} />
            </div>
          </section>

          {!ready && (
            <p className={`mt-5 inline-flex items-center gap-2 bg-[#FFE9A6] px-4 py-2 text-sm font-bold text-[#14221f] ${BOLD.pill}`}>
              {t("បន្ថែមមិត្តយ៉ាងហោចណាស់ម្នាក់ ដើម្បីចាប់ផ្តើមលេង។", "Add at least one friend to start a game.")}
            </p>
          )}

          {/* Games */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
              const text = game.light ? "text-[#14221f]" : "text-white";
              const sub = game.light ? "text-[#14221f]/75" : "text-white/85";
              const style: CSSProperties = { backgroundColor: game.color, ...DOTS };
              return (
                <article key={game.href} className={`relative flex flex-col overflow-hidden p-5 ${BOLD.card} ${text}`} style={style}>
                  <span aria-hidden="true" className={`pointer-events-none absolute -bottom-8 -right-8 rotate-12 ${game.light ? "text-[#14221f]/10" : "text-white/15"}`}>
                    {game.watermark}
                  </span>
                  <div className="relative flex items-start justify-between gap-3">
                    <span className={`flex size-16 items-center justify-center bg-white ${BOLD.box}`}>{game.icon}</span>
                    <span className={`bg-white px-3 py-1 text-xs font-bold text-[#14221f] ${BOLD.pill}`}>{km ? game.kmBadge : game.badge}</span>
                  </div>
                  <h2 className="relative mt-5 text-[1.45rem] font-extrabold leading-tight tracking-tight">{km ? game.km : game.en}</h2>
                  <p className={`relative mt-1.5 text-sm font-medium leading-relaxed ${sub}`}>{km ? game.kmBlurb : game.blurb}</p>
                  <div className="relative mt-4 flex flex-wrap gap-2">
                    {game.chips.map((chip) => (
                      <span
                        key={chip.en}
                        className={`rounded-xl border-2 border-dashed px-2.5 py-1 text-xs font-bold ${
                          game.light ? "border-[#14221f]/40 text-[#14221f]" : "border-white/55 text-white"
                        }`}
                      >
                        {km ? chip.km : chip.en}
                      </span>
                    ))}
                  </div>
                  <div className="relative mt-auto flex items-center justify-between gap-3 pt-6">
                    <span className="flex -space-x-2.5">
                      {players.slice(0, 5).map((player, index) => (
                        <PlayerAvatar key={`${player}-${index}`} name={player} index={index} size="sm" />
                      ))}
                    </span>
                    <Link
                      href={game.href}
                      className={`inline-flex min-h-12 items-center gap-2 px-5 text-sm text-[#14221f] ${BOLD.button} ${game.light ? "bg-white" : "bg-[#FFD23F]"}`}
                    >
                      {t("ចាប់ផ្តើម", "Play")}
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
      <MobileNavigation active="Community" />
    </div>
  );
}
