"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, CalendarCheck, ChevronRight, Clock, Compass, Lock, Smile, UserRound, Waves, type LucideIcon } from "lucide-react";
import { DesktopNavigation } from "../../_components/app-navigation";
import { BottomNav } from "../../components/bottom-nav";
import { TopHeader } from "../../components/top-header";
import { LanguageQuickToggle, useLanguage } from "../../_components/language-provider";
import { useMoodRange } from "../../_components/mood/mood-store";
import {
  LOOK_AGAIN_DAYS,
  SELF_MAP_PARTS,
  type SaveSelfMap,
  type SelfMapPart,
  type SelfMapPartDto,
  type SelfMapResponse,
  type SelfMapShareDto,
  type ValuesAnswers,
} from "@/lib/self-map";
import { QuestionsActivity, ValuesActivity, type QuestionPart } from "./activities";
import { CopingResult, PersonalityResult, ValuesResult } from "./results";
import { PATTERN_MIN_CHECK_INS, moodPatterns } from "./patterns";
import { focusRing, primaryButton } from "./styles";

// Understand yourself, "My self map" (BACKEND-HANDOFF.md section 38).
// Self knowledge, never a diagnosis.

type Load =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "error" }
  | { status: "ready"; data: SelfMapResponse; loadedAt: number };

type View =
  | { kind: "home" }
  | { kind: "values"; stage: "pick" | "rate" }
  | { kind: "questions"; part: QuestionPart; index: number }
  | { kind: "result"; part: SelfMapPart };

const PART_INFO: Record<SelfMapPart, { icon: LucideIcon; name: { en: string; km: string }; description: { en: string; km: string }; time: { en: string; km: string } }> = {
  values: {
    icon: Compass,
    name: { en: "My values", km: "តម្លៃរបស់ខ្ញុំ (My values)" },
    description: {
      en: "Choose what matters most to you, and see how much room it has in your life.",
      km: "ជ្រើសរើសអ្វីដែលសំខាន់បំផុតសម្រាប់អ្នក ហើយមើលថាវាមានកន្លែងប៉ុណ្ណាក្នុងជីវិតរបស់អ្នក។",
    },
    time: { en: "About 3 minutes", km: "ប្រហែល ៣ នាទី" },
  },
  coping: {
    icon: Waves,
    name: { en: "How I handle stress", km: "របៀបដែលខ្ញុំទប់ទល់នឹងភាពតានតឹង (How I handle stress)" },
    description: {
      en: "28 short questions about what you do when life is hard, and what may help more.",
      km: "សំណួរខ្លីៗ ២៨ អំពីអ្វីដែលអ្នកធ្វើពេលជីវិតលំបាក និងអ្វីដែលអាចជួយបានច្រើនជាងនេះ។",
    },
    time: { en: "About 4 minutes", km: "ប្រហែល ៤ នាទី" },
  },
  personality: {
    icon: Smile,
    name: { en: "My personality", km: "បុគ្គលិកលក្ខណៈរបស់ខ្ញុំ (My personality)" },
    description: {
      en: "20 short sentences about how you usually are, with your closest 4 letter style for fun.",
      km: "ឃ្លាខ្លីៗ ២០ អំពីរបៀបដែលអ្នកជាជាធម្មតា ព្រមទាំងរចនាប័ទ្មអក្សរ ៤ ដែលជិតបំផុតរបស់អ្នក សម្រាប់កម្សាន្ត។",
    },
    time: { en: "About 3 minutes", km: "ប្រហែល ៣ នាទី" },
  },
};

function firstView(part: SelfMapPart): View {
  return part === "values" ? { kind: "values", stage: "pick" } : { kind: "questions", part, index: -1 };
}

function formatDate(iso: string, km: boolean) {
  return new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Phnom_Penh" }).format(
    new Date(iso),
  );
}

export function UnderstandView() {
  const router = useRouter();
  const { language } = useLanguage();
  const km = language === "km";

  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [view, setView] = useState<View>({ kind: "home" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/self-map", { cache: "no-store" });
      if (response.status === 401) return setLoad({ status: "signed_out" });
      if (!response.ok) return setLoad({ status: "error" });
      setLoad({ status: "ready", data: (await response.json()) as SelfMapResponse, loadedAt: Date.now() });
    } catch {
      setLoad({ status: "error" });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads once on open
    void refresh();
  }, [refresh]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view.kind]);

  // ?start=<part> (from Home) opens that activity once loaded.
  const linkRead = useRef(false);
  useEffect(() => {
    if (linkRead.current || load.status !== "ready") return;
    linkRead.current = true;
    const part = SELF_MAP_PARTS.find((item) => item === new URLSearchParams(window.location.search).get("start"));
    window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runs once, when the self map has loaded
    if (part) setView(firstView(part));
  }, [load]);

  const start = (part: SelfMapPart) => {
    setSaveError(false);
    setView(firstView(part));
  };

  const send = async (url: string, init: RequestInit) => {
    const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
    if (response.status === 401) {
      setLoad({ status: "signed_out" });
      setView({ kind: "home" });
      return null;
    }
    if (!response.ok) return null;
    const data = (await response.json()) as SelfMapResponse;
    setLoad({ status: "ready", data, loadedAt: Date.now() });
    return data;
  };

  const submit = async (body: SaveSelfMap) => {
    setSaving(true);
    setSaveError(false);
    try {
      const data = await send("/api/self-map", { method: "PUT", body: JSON.stringify(body) });
      if (data) setView({ kind: "result", part: body.part });
      else setSaveError(true);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (part: SelfMapPart) => {
    try {
      const data = await send(`/api/self-map?part=${part}`, { method: "DELETE" });
      if (!data) return false;
      setView({ kind: "home" });
      return true;
    } catch {
      return false;
    }
  };

  const share = async (professionalSlug: string, value: boolean) => {
    try {
      return (await send("/api/self-map/sharing", { method: "PUT", body: JSON.stringify({ professionalSlug, share: value }) })) !== null;
    } catch {
      return false;
    }
  };

  const goBack = () => {
    if (view.kind === "values" && view.stage === "rate") setView({ kind: "values", stage: "pick" });
    else if (view.kind === "questions" && view.index >= 0) setView({ ...view, index: view.index - 1 });
    else if (view.kind === "home") router.push("/");
    else setView({ kind: "home" });
  };

  const parts = load.status === "ready" ? load.data.parts : [];
  const resultPart = view.kind === "result" ? parts.find((part) => part.part === view.part) : undefined;

  return (
    <div className="min-h-screen bg-[#f7faf9] text-ink lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Detection" />

      <div className="min-w-0 pb-28 sm:pb-32 lg:pb-12">
        <main className="mx-auto w-full max-w-[430px] px-4 pt-4 sm:px-6 md:max-w-xl lg:max-w-2xl lg:pt-8">
          <TopHeader />

          <div className="mt-4 flex items-center gap-2 sm:mt-6">
            <button
              type="button"
              onClick={goBack}
              aria-label={km ? "ត្រឡប់ក្រោយ" : "Back"}
              className={`inline-flex size-11 items-center justify-center rounded-full text-arom-deep transition-colors hover:bg-arom-wash ${focusRing}`}
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="min-w-0 flex-1 text-xl font-bold tracking-tight sm:text-2xl">
              {km ? "ស្គាល់ខ្លួនឯង (Understand yourself)" : "Understand yourself"}
            </h1>
            <LanguageQuickToggle />
          </div>

          {view.kind === "home" && <HomeView km={km} load={load} onStart={start} onOpen={(part) => setView({ kind: "result", part })} onRetry={refresh} onShare={share} />}

          {view.kind === "values" && (
            <ValuesActivity
              km={km}
              stage={view.stage}
              onStage={(stage) => setView({ kind: "values", stage })}
              saving={saving}
              saveError={saveError}
              onSubmit={(answers: ValuesAnswers) => void submit({ part: "values", answers })}
            />
          )}

          {view.kind === "questions" && (
            <QuestionsActivity
              key={view.part}
              km={km}
              part={view.part}
              index={view.index}
              onIndex={(index) => setView({ ...view, index })}
              saving={saving}
              saveError={saveError}
              onSubmit={(answers) =>
                void submit(view.part === "coping" ? { part: "coping", answers } : { part: "personality", answers })
              }
            />
          )}

          {resultPart?.part === "values" && (
            <ValuesResult km={km} part={resultPart} onAgain={() => start("values")} onDone={() => setView({ kind: "home" })} onDelete={() => remove("values")} />
          )}
          {resultPart?.part === "coping" && (
            <CopingResult km={km} part={resultPart} onAgain={() => start("coping")} onDone={() => setView({ kind: "home" })} onDelete={() => remove("coping")} />
          )}
          {resultPart?.part === "personality" && (
            <PersonalityResult
              km={km}
              part={resultPart}
              onAgain={() => start("personality")}
              onDone={() => setView({ kind: "home" })}
              onDelete={() => remove("personality")}
            />
          )}
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav activeTab="Detection" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home: the parts, my patterns, and sharing
// ---------------------------------------------------------------------------

function HomeView({
  km,
  load,
  onStart,
  onOpen,
  onRetry,
  onShare,
}: {
  km: boolean;
  load: Load;
  onStart: (part: SelfMapPart) => void;
  onOpen: (part: SelfMapPart) => void;
  onRetry: () => void;
  onShare: (professionalSlug: string, share: boolean) => Promise<boolean>;
}) {
  const data = load.status === "ready" ? load.data : null;
  const saved = (part: SelfMapPart): SelfMapPartDto | undefined => data?.parts.find((item) => item.part === part);

  return (
    <div className="mt-3 space-y-5 animate-in fade-in duration-200">
      <p className="text-sm leading-6 text-ink-muted">
        {km
          ? "សកម្មភាពខ្លីៗ ដើម្បីស្គាល់ខ្លួនឯងកាន់តែច្បាស់៖ អ្វីដែលសំខាន់សម្រាប់អ្នក របៀបដែលអ្នកទប់ទល់នឹងភាពតានតឹង បុគ្គលិកលក្ខណៈរបស់អ្នក និងលំនាំអារម្មណ៍របស់អ្នក។"
          : "Short activities to know yourself better: what matters to you, how you handle stress, your personality, and the patterns in your mood."}
      </p>

      <div className="rounded-2xl border border-arom-border bg-white p-4 text-sm text-ink">
        <ul className="grid gap-2">
          <InfoRow
            icon={Compass}
            text={
              km
                ? "នេះជាការស្គាល់ខ្លួនឯង មិនមែនជាការធ្វើតេស្ត ឬការធ្វើរោគវិនិច្ឆ័យទេ។ គ្មានចម្លើយត្រូវ ឬខុសទេ។"
                : "This is about knowing yourself, not a test or a diagnosis. There are no right or wrong answers."
            }
          />
          <InfoRow
            icon={Lock}
            text={
              km
                ? "មានតែអ្នកទេដែលឃើញវា។ អ្នកអាចជ្រើសរើសចែករំលែកវាជាមួយអ្នកជំនាញដែលអ្នកបានកក់។"
                : "Only you see it. You can choose to share it with a professional you book."
            }
          />
        </ul>
      </div>

      {load.status === "signed_out" && (
        <p className="rounded-2xl border border-arom-border bg-white p-4 text-sm text-ink">
          {km ? "សូម " : "Please "}
          <Link href="/login?next=%2Funderstand" className="font-semibold text-arom underline">
            {km ? "ចូលគណនី" : "log in"}
          </Link>
          {km ? " ដើម្បីចាប់ផ្តើម និងរក្សាទុកផែនទីរបស់អ្នក។" : " to start and keep your self map."}
        </p>
      )}

      {load.status === "error" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-arom-border bg-white p-4 text-sm">
          <span>{km ? "មិនអាចផ្ទុកផែនទីរបស់អ្នកបានទេ។" : "Your self map could not be loaded."}</span>
          <button type="button" onClick={onRetry} className={`font-semibold text-arom underline ${focusRing}`}>
            {km ? "ព្យាយាមម្តងទៀត" : "Try again"}
          </button>
        </div>
      )}

      <section aria-labelledby="self-map-parts" className="space-y-3">
        <h2 id="self-map-parts" className="text-base font-semibold">
          {km ? "ផែនទីខ្លួនឯងរបស់ខ្ញុំ" : "My self map"}
        </h2>
        {SELF_MAP_PARTS.map((part) => (
          <PartCard
            key={part}
            km={km}
            part={part}
            saved={saved(part)}
            now={load.status === "ready" ? load.loadedAt : 0}
            disabled={load.status !== "ready"}
            onStart={onStart}
            onOpen={onOpen}
          />
        ))}
        <PatternsCard km={km} signedIn={load.status === "ready"} />
      </section>

      {data && <SharingCard km={km} shares={data.shares} hasParts={data.parts.length > 0} onShare={onShare} />}
    </div>
  );
}

function InfoRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
      <span className="leading-5">{text}</span>
    </li>
  );
}

function PartCard({
  km,
  part,
  saved,
  now,
  disabled,
  onStart,
  onOpen,
}: {
  km: boolean;
  part: SelfMapPart;
  saved: SelfMapPartDto | undefined;
  // When the self map loaded, to suggest looking again after 3 months.
  now: number;
  disabled: boolean;
  onStart: (part: SelfMapPart) => void;
  onOpen: (part: SelfMapPart) => void;
}) {
  const info = PART_INFO[part];
  const Icon = info.icon;
  const lookAgain = saved && now - Date.parse(saved.updatedAt) > LOOK_AGAIN_DAYS * 86_400_000;

  return (
    <div className="rounded-3xl border border-arom-border bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-arom-soft text-arom">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-ink">{km ? info.name.km : info.name.en}</h3>
          <p className="mt-0.5 text-sm leading-6 text-ink-muted">{km ? info.description.km : info.description.en}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
            {saved ? <CalendarCheck size={14} aria-hidden="true" /> : <Clock size={14} aria-hidden="true" />}
            {saved
              ? km
                ? `បានធ្វើនៅថ្ងៃ ${formatDate(saved.updatedAt, km)}`
                : `Done ${formatDate(saved.updatedAt, km)}`
              : km
                ? info.time.km
                : info.time.en}
          </p>
          {lookAgain && (
            <p className="mt-1 text-xs font-medium text-arom-deep">
              {km ? "បានជាង ៣ ខែហើយ។ សាកមើលថាតើមានអ្វីផ្លាស់ប្តូរ។" : "It has been over 3 months. See what has changed."}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {saved ? (
          <>
            <button type="button" onClick={() => onOpen(part)} className={`${primaryButton} flex-1`}>
              {km ? "មើលលទ្ធផល" : "See result"}
            </button>
            <button
              type="button"
              onClick={() => onStart(part)}
              className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-arom-border bg-white px-4 text-sm font-semibold text-arom-deep hover:bg-arom-wash ${focusRing}`}
            >
              {km ? "ធ្វើម្តងទៀត" : "Do it again"}
            </button>
          </>
        ) : (
          <button type="button" disabled={disabled} onClick={() => onStart(part)} className={primaryButton}>
            {km ? "ចាប់ផ្តើម" : "Start"}
          </button>
        )}
      </div>
    </div>
  );
}

/** My patterns, from the person's own mood check ins over 3 months. Never shared. */
function PatternsCard({ km, signedIn }: { km: boolean; signedIn: boolean }) {
  const range = useMoodRange("90d");
  const patterns = moodPatterns(range.days);
  const checkIns = range.days.filter((day) => day.mood !== null).length;

  return (
    <div className="rounded-3xl border border-arom-border bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-arom-soft text-arom">
          <Activity size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-ink">{km ? "លំនាំអារម្មណ៍របស់ខ្ញុំ (My patterns)" : "My patterns"}</h3>
          <p className="mt-0.5 text-sm leading-6 text-ink-muted">
            {km
              ? "ពីការកត់ត្រាអារម្មណ៍របស់អ្នក ក្នុងរយៈពេល ៣ ខែចុងក្រោយ។ មិនដែលចែករំលែកទេ។"
              : "From your mood check ins over the last 3 months. Never shared."}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {!signedIn || range.status === "loading" || range.status === "signed_out" ? (
          <p className="text-sm text-ink-muted">{signedIn ? (km ? "កំពុងផ្ទុក..." : "Loading...") : km ? "ចូលគណនីដើម្បីមើលលំនាំរបស់អ្នក។" : "Log in to see your patterns."}</p>
        ) : range.status === "error" ? (
          <p className="text-sm text-ink-muted">{km ? "មិនអាចផ្ទុកអារម្មណ៍របស់អ្នកបានទេ។" : "Your moods could not be loaded."}</p>
        ) : patterns.length === 0 ? (
          <div>
            <p className="text-sm leading-6 text-ink">
              {km
                ? `កត់ត្រាអារម្មណ៍របស់អ្នកឱ្យបាន ${PATTERN_MIN_CHECK_INS} ថ្ងៃ ដើម្បីមើលលំនាំរបស់អ្នក។ អ្នកមាន ${checkIns} ហើយ។`
                : `Check in your mood on ${PATTERN_MIN_CHECK_INS} days to see your patterns. You have ${checkIns} so far.`}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-arom-soft" aria-hidden="true">
              <div className="h-full rounded-full bg-arom" style={{ width: `${Math.min(100, (checkIns / PATTERN_MIN_CHECK_INS) * 100)}%` }} />
            </div>
            <Link href="/" className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold text-arom-deep hover:underline ${focusRing}`}>
              {km ? "កត់ត្រាអារម្មណ៍ថ្ងៃនេះ" : "Check in today"}
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {patterns.map((pattern) => (
              <li key={pattern.kind} className="rounded-2xl bg-arom-wash/70 p-3 text-sm leading-6 text-ink">
                {km ? pattern.km : pattern.en}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Share the self map (values and stress, never patterns) with a booked professional. */
function SharingCard({
  km,
  shares,
  hasParts,
  onShare,
}: {
  km: boolean;
  shares: SelfMapShareDto[];
  hasParts: boolean;
  onShare: (professionalSlug: string, share: boolean) => Promise<boolean>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const change = async (slug: string, value: boolean) => {
    setBusy(slug);
    setFailed(false);
    const ok = await onShare(slug, value);
    setBusy(null);
    if (!ok) setFailed(true);
  };

  return (
    <section aria-labelledby="self-map-sharing" className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <h2 id="self-map-sharing" className="flex items-center gap-2 text-base font-bold text-ink">
        <UserRound size={18} aria-hidden="true" className="text-arom" />
        {km ? "ចែករំលែកជាមួយអ្នកជំនាញរបស់ខ្ញុំ" : "Share with my professional"}
      </h2>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        {km
          ? "អ្នកជំនាញរបស់អ្នកអាចស្គាល់អ្នកមុនវគ្គដំបូង។ ពួកគេឃើញតម្លៃរបស់អ្នក របៀបដែលអ្នកទប់ទល់នឹងភាពតានតឹង និងបុគ្គលិកលក្ខណៈរបស់អ្នក។ មិនដែលឃើញលំនាំអារម្មណ៍ ឬកំណត់ហេតុរបស់អ្នកទេ។ អ្នកអាចបិទវាបានគ្រប់ពេល។"
          : "Your professional can get to know you before your first session. They see your values, how you handle stress and your personality, never your mood patterns or journal. You can turn it off at any time."}
      </p>

      {shares.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-ink">
          {km ? "នៅពេលអ្នកកក់ពេលជាមួយអ្នកជំនាញ អ្នកអាចចែករំលែកនៅទីនេះ។ " : "When you book a professional, you can share it here. "}
          <Link href="/professional" className="font-semibold text-arom underline">
            {km ? "ស្វែងរកអ្នកជំនាញ" : "Find a professional"}
          </Link>
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-arom-border/60">
          {shares.map((item) => (
            <li key={item.professionalSlug} className="flex items-center gap-3 py-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-arom-soft">
                {item.photoUrl ? (
                  <Image src={item.photoUrl} alt="" fill sizes="40px" className="object-cover" />
                ) : (
                  <UserRound aria-hidden="true" size={20} className="absolute inset-0 m-auto text-arom" />
                )}
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{km && item.nameKm ? item.nameKm : item.name}</span>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink-muted">
                <span>{item.shared ? (km ? "កំពុងចែករំលែក" : "Sharing") : km ? "មិនចែករំលែក" : "Not shared"}</span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={item.shared}
                  disabled={busy !== null}
                  onChange={(event) => void change(item.professionalSlug, event.target.checked)}
                  aria-label={km ? `ចែករំលែកជាមួយ ${item.nameKm ?? item.name}` : `Share with ${item.name}`}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="relative h-6 w-11 shrink-0 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-arom peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-arom peer-disabled:opacity-50"
                />
              </label>
            </li>
          ))}
        </ul>
      )}

      {shares.some((item) => item.shared) && !hasParts && (
        <p className="mt-2 text-xs text-ink-muted">
          {km ? "អ្នកមិនទាន់បានធ្វើសកម្មភាពណាមួយនៅឡើយទេ ដូច្នេះគ្មានអ្វីត្រូវបង្ហាញទេ។" : "You have not done an activity yet, so there is nothing to show them."}
        </p>
      )}
      {failed && (
        <p role="alert" className="mt-2 text-sm text-arom-danger">
          {km ? "មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។" : "That could not be saved. Please try again."}
        </p>
      )}
    </section>
  );
}
