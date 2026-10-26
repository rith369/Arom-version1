"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BatteryLow,
  CalendarCheck,
  ChevronRight,
  Clock,
  Compass,
  Gauge,
  HeartPulse,
  Info,
  Lock,
  Sun,
  Shield,
  ShieldCheck,
  Users,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";
import { DesktopNavigation } from "../../_components/app-navigation";
import { BottomNav } from "../../components/bottom-nav";
import { TopHeader } from "../../components/top-header";
import { LanguageQuickToggle, useLanguage } from "../../_components/language-provider";
import { GetHelpSection } from "../../_components/get-help-section";
import { useAuth } from "../../_components/auth-provider";
import {
  GroupRow,
  ProfessionalBlock,
  SuggestionRow,
  matchGroup,
  matchProfessionals,
  suggestionsFor,
  useProfessionals,
  useSupportGroups,
} from "../../_components/topic-help/topic-help";
import { cambodiaDay } from "@/lib/mood";
import { CHECK_PROGRAMS, PROGRAMS, PROGRAM_LEVELS } from "../../_components/two-week/two-week-data";
import { HELP_CONTENT, type HelpTopic } from "@/lib/wellbeing-topics";
import {
  LEVEL_LABELS,
  QUESTIONNAIRES,
  SAFETY_QUESTION_ID,
  SYMPTOM_CHECK_TYPES,
  dueJourneys,
  isHarderThanBefore,
  textFor,
  type SupportJourneyDto,
  type SymptomCheckDto,
  type SymptomCheckSavedResponse,
  type SymptomChecksResponse,
  type SymptomCheckType,
  type SymptomLevel,
} from "@/lib/symptom-checks";

// Symptom check (BACKEND-HANDOFF.md section 35): a private early warning,
// never a diagnosis. Answers stay in memory only until they are sent, and are
// never kept in browser storage or logged.

// Khmer is optional only for checks not yet reviewed in Khmer (English shows).
type Text = { en: string; km?: string };
type Pair = { en: string; km: string };

type Load =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "error" }
  | { status: "ready"; data: SymptomChecksResponse; today: string };

type View =
  | { kind: "home" }
  | { kind: "questions"; type: SymptomCheckType; index: number; answers: Record<string, number> }
  | { kind: "safety"; saved: SymptomCheckSavedResponse }
  | { kind: "result"; saved: SymptomCheckSavedResponse; reopened?: boolean };

/**
 * A saved result opened again from Past checks, with its recommendations.
 * The active journey belongs only to the newest check of that type.
 */
function reopenResult(data: SymptomChecksResponse, check: SymptomCheckDto): View {
  const newest = data.checks.find((item) => item.type === check.type)?.id === check.id;
  const journey = newest ? (data.journeys.find((item) => item.concern === check.type) ?? null) : null;
  return { kind: "result", saved: { check, journey }, reopened: true };
}

const TOPIC: Record<SymptomCheckType, Pair> = {
  depression: { en: "low mood", km: "អារម្មណ៍ធ្លាក់ចុះ" },
  anxiety: { en: "anxiety", km: "ការថប់បារម្ភ" },
  distress: { en: "distress", km: "បញ្ហាផ្លូវចិត្ត" },
  stress: { en: "stress", km: "ភាពតានតឹង" },
  burnout: { en: "burnout", km: "ភាពអស់កម្លាំង" },
  wellbeing: { en: "low wellbeing", km: "សុខុមាលភាពទាប" },
  loneliness: { en: "loneliness", km: "ភាពឯកោ" },
  trauma: { en: "stress after a hard experience", km: "ភាពតានតឹងក្រោយបទពិសោធន៍ដ៏លំបាក" },
  trauma_screen: { en: "stress after a hard experience", km: "ភាពតានតឹងក្រោយបទពិសោធន៍ដ៏លំបាក" },
};

// The overall check shown first on the list (K-10, in English and Khmer).
const FEATURED_CHECK: SymptomCheckType = "distress";

const CHECK_ICONS: Record<SymptomCheckType, LucideIcon> = {
  depression: Activity,
  anxiety: HeartPulse,
  distress: Gauge,
  stress: Waves,
  burnout: BatteryLow,
  wellbeing: Sun,
  loneliness: Users,
  trauma: Shield,
  trauma_screen: ShieldCheck,
};

const LEVEL_MESSAGES: Record<SymptomLevel, (topic: Pair) => Pair> = {
  none: (topic) => ({
    en: `Your answers show few signs of ${topic.en} right now. Keep doing what helps you.`,
    km: `ចម្លើយរបស់អ្នកបង្ហាញសញ្ញាតិចតួចនៃ${topic.km}នៅពេលនេះ។ សូមបន្តធ្វើអ្វីដែលជួយអ្នក។`,
  }),
  low: (topic) => ({
    en: `Your answers show some signs of ${topic.en}. Many people feel this way at times, and small steps can help.`,
    km: `ចម្លើយរបស់អ្នកបង្ហាញសញ្ញាខ្លះៗនៃ${topic.km}។ មនុស្សជាច្រើនក៏មានអារម្មណ៍បែបនេះម្តងម្កាលដែរ ហើយជំហានតូចៗអាចជួយបាន។`,
  }),
  medium: (topic) => ({
    en: `Your answers show clear signs of ${topic.en}. You do not have to handle this alone.`,
    km: `ចម្លើយរបស់អ្នកបង្ហាញសញ្ញាច្បាស់នៃ${topic.km}។ អ្នកមិនចាំបាច់ដោះស្រាយតែម្នាក់ឯងទេ។`,
  }),
  high: (topic) => ({
    en: `Your answers show strong signs of ${topic.en}. Talking to a professional can really help, and you can book one on AROM.`,
    km: `ចម្លើយរបស់អ្នកបង្ហាញសញ្ញាខ្លាំងនៃ${topic.km}។ ការពិភាក្សាជាមួយអ្នកជំនាញអាចជួយបានច្រើន ហើយអ្នកអាចកក់ពេលជាមួយអ្នកជំនាញនៅលើ AROM។`,
  }),
};

const LEVEL_STYLES: Record<SymptomLevel, string> = {
  none: "bg-arom-soft text-arom-deep",
  low: "bg-arom-soft text-arom-deep",
  medium: "bg-arom-warning-soft text-ink",
  high: "bg-arom-warning-soft text-ink",
};

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom";
const primaryButton = `inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-arom px-5 text-sm font-semibold text-white transition-colors hover:bg-arom-deep disabled:opacity-60 ${focusRing}`;
const secondaryButton = `inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-arom-border bg-white px-5 text-sm font-semibold text-arom-deep transition-colors hover:bg-arom-wash ${focusRing}`;

function formatDay(day: string, km: boolean) {
  return new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

export default function SymptomCheckPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const km = language === "km";
  const tx = (text: Text) => textFor(text, km);

  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [view, setView] = useState<View>({ kind: "home" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const closeExplain = useCallback(() => setExplainOpen(false), []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/symptom-checks", { cache: "no-store" });
      if (response.status === 401) return setLoad({ status: "signed_out" });
      if (!response.ok) return setLoad({ status: "error" });
      const data = (await response.json()) as SymptomChecksResponse;
      setLoad({ status: "ready", data, today: cambodiaDay(Date.now()) });
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

  // Links into the page, read once the checks have loaded:
  // ?check=<type> starts that check (for example from a 2 week program), and
  // ?result=<check id> opens that saved result again (see the next effect).
  const linkRead = useRef(false);
  useEffect(() => {
    if (linkRead.current || load.status !== "ready") return;
    linkRead.current = true;
    const params = new URLSearchParams(window.location.search);
    const saved = load.data.checks.find((check) => check.id === params.get("result"));
    const type = SYMPTOM_CHECK_TYPES.find((item) => item === params.get("check"));
    window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runs once, when the checks have loaded
    if (saved) setView(reopenResult(load.data, saved));
    else if (type && (!km || QUESTIONNAIRES[type].khmerReady)) setView({ kind: "questions", type, index: 0, answers: {} });
  }, [load, km]);

  // While a result is open, its id stays in the address, so going Back from a
  // lesson, tip or professional it suggested shows the same result again.
  // Only the random check id is in the address, never the level or answers.
  useEffect(() => {
    if (!linkRead.current) return;
    const url = view.kind === "result" ? `${window.location.pathname}?result=${view.saved.check.id}` : window.location.pathname;
    if (`${window.location.pathname}${window.location.search}` !== url) window.history.replaceState(null, "", url);
  }, [view]);

  const start = (type: SymptomCheckType) => {
    setSaveError(false);
    setView({ kind: "questions", type, index: 0, answers: {} });
  };

  const submit = async (type: SymptomCheckType, answers: Record<string, number>) => {
    setSaving(true);
    setSaveError(false);
    try {
      const response = await fetch("/api/symptom-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
        }),
      });
      if (response.status === 401) {
        setLoad({ status: "signed_out" });
        setView({ kind: "home" });
        return;
      }
      if (!response.ok) throw new Error("save failed");
      const saved = (await response.json()) as SymptomCheckSavedResponse;
      setLoad((current) =>
        current.status === "ready"
          ? {
              ...current,
              data: {
                checks: [saved.check, ...current.data.checks],
                journeys: [
                  ...current.data.journeys.filter((journey) => journey.concern !== type),
                  ...(saved.journey ? [saved.journey] : []),
                ],
              },
            }
          : current,
      );
      setView(saved.check.safetyConcern ? { kind: "safety", saved } : { kind: "result", saved });
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  // The check on screen. A check without Khmer would switch only the labels,
  // so it hides the language button, unless the app is already in Khmer (the
  // way back to English). Answers stay when the language changes.
  const openType = view.kind === "questions" ? view.type : view.kind === "home" ? null : view.saved.check.type;
  const showLanguageToggle = km || openType === null || QUESTIONNAIRES[openType].khmerReady;

  const goBack = () => {
    if (view.kind === "questions" && view.index > 0) {
      setView({ ...view, index: view.index - 1 });
    } else if (view.kind === "home") {
      router.push("/");
    } else {
      setView({ kind: "home" });
    }
  };

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
              {km ? "ការពិនិត្យរោគសញ្ញា (Symptom check)" : "Symptom check"}
            </h1>
            {showLanguageToggle && <LanguageQuickToggle />}
          </div>

          {view.kind === "home" && (
            <HomeView
              km={km}
              tx={tx}
              load={load}
              onStart={start}
              onRetry={refresh}
              onExplain={() => setExplainOpen(true)}
              onOpenResult={(check) => load.status === "ready" && setView(reopenResult(load.data, check))}
            />
          )}

          {view.kind === "questions" && (
            <QuestionView
              km={km}
              tx={tx}
              view={view}
              saving={saving}
              saveError={saveError}
              onAnswer={(questionId, value) => {
                const answers = { ...view.answers, [questionId]: value };
                const last = view.index === QUESTIONNAIRES[view.type].questions.length - 1;
                setView({ ...view, answers, index: last ? view.index : view.index + 1 });
              }}
              onSubmit={() => submit(view.type, view.answers)}
            />
          )}

          {view.kind === "safety" && (
            <SafetyView km={km} onContinue={() => setView({ kind: "result", saved: view.saved })} />
          )}

          {view.kind === "result" && (
            <ResultView
              km={km}
              tx={tx}
              saved={view.saved}
              reopened={view.reopened ?? false}
              onDone={() => setView({ kind: "home" })}
              onExplain={() => setExplainOpen(true)}
              onStart={start}
            />
          )}
        </main>

        {explainOpen && <HowItWorksSheet km={km} tx={tx} onClose={closeExplain} />}
      </div>

      <div className="lg:hidden">
        <BottomNav activeTab="Detection" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home: choose a check, due rechecks, past results
// ---------------------------------------------------------------------------

function HomeView({
  km,
  tx,
  load,
  onStart,
  onRetry,
  onExplain,
  onOpenResult,
}: {
  km: boolean;
  tx: (text: Text) => string;
  load: Load;
  onStart: (type: SymptomCheckType) => void;
  onRetry: () => void;
  onExplain: () => void;
  onOpenResult: (check: SymptomCheckDto) => void;
}) {
  const data = load.status === "ready" ? load.data : null;
  const today = load.status === "ready" ? load.today : "";
  const due = data ? dueJourneys(data, today) : [];
  const upcoming = data?.journeys.filter((journey) => journey.reviewDueOn > today) ?? [];
  const harder = data ? SYMPTOM_CHECK_TYPES.filter((type) => isHarderThanBefore(data.checks, type)) : [];
  // Checks without reviewed Khmer show only while the app is in English.
  const available = SYMPTOM_CHECK_TYPES.filter((type) => !km || QUESTIONNAIRES[type].khmerReady);
  // The general check has its own card on top; the rest are one list below.
  const featured = QUESTIONNAIRES[FEATURED_CHECK];
  const FeaturedIcon = CHECK_ICONS[FEATURED_CHECK];
  const featuredNext = upcoming.find((journey) => journey.concern === FEATURED_CHECK);
  const specific = available.filter((type) => type !== FEATURED_CHECK);

  return (
    <div className="mt-3 space-y-5 animate-in fade-in duration-200">
      <p className="text-sm leading-6 text-ink-muted">
        {km
          ? "ការពិនិត្យរហ័សអំពីរបៀបដែលអ្នកមានអារម្មណ៍ថ្មីៗនេះ។ វាជួយអ្នកឱ្យកត់សម្គាល់សញ្ញាឆាប់ៗ។"
          : "A quick check on how you have felt lately. It helps you notice early signs."}
      </p>

      <div className="rounded-2xl border border-arom-border bg-white p-4 text-sm text-ink">
        <ul className="grid gap-2">
          <InfoRow
            icon={Compass}
            text={
              km
                ? "នេះជាការរកឃើញរោគសញ្ញាដំបូង មិនមែនជាការធ្វើរោគវិនិច្ឆ័យទេ។ មានតែអ្នកជំនាញទេដែលអាចធ្វើរោគវិនិច្ឆ័យបាន។"
                : "This is early symptom detection, not a diagnosis. Only a professional can diagnose."
            }
          />
          <InfoRow icon={Clock} text={km ? "ប្រហែល ២ នាទី។" : "About 2 minutes."} />
          <InfoRow
            icon={Lock}
            text={
              km
                ? "មានតែអ្នកទេដែលឃើញលទ្ធផល។ អ្នកអាចជ្រើសរើសចែករំលែកវាជាមួយអ្នកជំនាញដែលអ្នកបានកក់។"
                : "Only you see your results. You can choose to share them with a professional you book."
            }
          />
        </ul>
        <ExplainButton km={km} onClick={onExplain} label={km ? "របៀបដែលវាដំណើរការ" : "How it works"} className="mt-3" />
      </div>

      {load.status === "signed_out" && (
        <p className="rounded-2xl border border-arom-border bg-white p-4 text-sm text-ink">
          {km ? "សូម " : "Please "}
          <Link href="/login?next=%2Fdetection%2Fsymptoms" className="font-semibold text-arom underline">
            {km ? "ចូលគណនី" : "log in"}
          </Link>
          {km ? " ដើម្បីធ្វើការពិនិត្យ និងរក្សាទុកលទ្ធផលរបស់អ្នក។" : " to take a check and keep your results."}
        </p>
      )}

      {load.status === "error" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-arom-border bg-white p-4 text-sm">
          <span>{km ? "មិនអាចផ្ទុកការពិនិត្យរបស់អ្នកបានទេ។" : "Your checks could not be loaded."}</span>
          <button type="button" onClick={onRetry} className={`font-semibold text-arom underline ${focusRing}`}>
            {km ? "ព្យាយាមម្តងទៀត" : "Try again"}
          </button>
        </div>
      )}

      {due.map((journey) => (
        <div key={journey.concern} className="rounded-2xl border border-arom/30 bg-arom-wash p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-arom-deep">
            <CalendarCheck size={18} aria-hidden="true" />
            {km ? "ដល់ពេលពិនិត្យម្តងទៀតហើយ" : "Time to check again"}
          </p>
          <p className="mt-1 text-sm text-ink">
            {km
              ? `២សប្តាហ៍បានកន្លងផុតទៅហើយចាប់តាំងពីការពិនិត្យ${tx(QUESTIONNAIRES[journey.concern].name)}លើកមុនរបស់អ្នក។`
              : `It has been 2 weeks since your last ${TOPIC[journey.concern].en} check.`}
          </p>
          <button type="button" onClick={() => onStart(journey.concern)} className={`${primaryButton} mt-3`}>
            {km ? "ពិនិត្យឥឡូវនេះ" : "Check now"}
          </button>
        </div>
      ))}

      {harder.length > 0 && due.length === 0 && (
        <div className="rounded-2xl border border-arom-border bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <HeartPulse size={18} className="text-arom" aria-hidden="true" />
            {km ? "ពេលថ្មីៗនេះហាក់ពិបាកជាងមុន" : "Things look harder lately"}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {km
              ? "ការពិនិត្យចុងក្រោយរបស់អ្នកហាក់ពិបាកជាងលើកមុន។ តើអ្នកចង់សាកល្បងអ្វីមួយថ្ងៃនេះ ឬពិភាក្សាជាមួយនរណាម្នាក់ទេ?"
              : "Your last check looks harder than the one before. Want to try something today, or talk to someone?"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/practice" className={`rounded-full border border-arom-border px-3.5 py-2 text-xs font-semibold text-arom-deep hover:bg-arom-wash ${focusRing}`}>
              {km ? "សាកល្បងការអនុវត្ត" : "Try a practice"}
            </Link>
            <Link href="/professional" className={`rounded-full border border-arom-border px-3.5 py-2 text-xs font-semibold text-arom-deep hover:bg-arom-wash ${focusRing}`}>
              {km ? "ពិភាក្សាជាមួយអ្នកជំនាញ" : "Talk to a professional"}
            </Link>
          </div>
        </div>
      )}

      {/* The general check first, for people who are not sure where to start. */}
      <section aria-labelledby="general-check" className="rounded-3xl border border-arom/30 bg-arom-wash p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-arom-deep">
          {km ? "ចាប់ផ្តើមនៅទីនេះ" : "Start here"}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-white text-arom">
            <FeaturedIcon size={22} aria-hidden="true" />
          </span>
          <h2 id="general-check" className="text-lg font-bold text-ink">
            {tx(featured.name)}
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-ink">
          {km
            ? "ការពិនិត្យទូទៅរហ័ស អំពីអារម្មណ៍របស់អ្នកក្នុងរយៈពេល ៣០ថ្ងៃចុងក្រោយ។ ប្រសិនបើអ្នកមិនប្រាកដថាការពិនិត្យណាសមនឹងអ្នក សូមចាប់ផ្តើមជាមួយការពិនិត្យនេះ។"
            : "A quick overall check of how you have felt in the last 30 days. If you are not sure which check fits you, start with this one."}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
          <Clock size={14} aria-hidden="true" />
          {km ? `សំណួរ ${featured.questions.length} · ប្រហែល ២ នាទី` : `${featured.questions.length} questions · About 2 minutes`}
        </p>
        {featuredNext && (
          <p className="mt-1 text-xs font-medium text-arom-deep">
            {km ? `ពិនិត្យបន្ទាប់៖ ${formatDay(featuredNext.reviewDueOn, km)}` : `Next check: ${formatDay(featuredNext.reviewDueOn, km)}`}
          </p>
        )}
        <button
          type="button"
          disabled={load.status !== "ready"}
          onClick={() => onStart(FEATURED_CHECK)}
          className={`${primaryButton} mt-4`}
        >
          {km ? "ចាប់ផ្តើមពិនិត្យ" : "Start the check"}
        </button>
      </section>

      <section aria-labelledby="choose-check" className="space-y-3">
        <h2 id="choose-check" className="text-base font-semibold">
          {km ? "ឬជ្រើសរើសការពិនិត្យជាក់លាក់" : "Or choose a specific check"}
        </h2>
        <ul className="divide-y divide-arom-border/60 overflow-hidden rounded-[22px] border border-arom-border bg-white shadow-sm">
          {specific.map((type) => {
            const questionnaire = QUESTIONNAIRES[type];
            const next = upcoming.find((journey) => journey.concern === type);
            const Icon = CHECK_ICONS[type];
            return (
              <li key={type}>
                <button
                  type="button"
                  disabled={load.status !== "ready"}
                  onClick={() => onStart(type)}
                  className={`group flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-arom-wash disabled:opacity-60 ${focusRing} focus-visible:-outline-offset-2`}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-arom-soft text-arom">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink sm:text-base">{tx(questionnaire.name)}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted sm:text-sm">{tx(questionnaire.description)}</span>
                    {next && (
                      <span className="mt-1 block text-xs font-medium text-arom-deep">
                        {km ? `ពិនិត្យបន្ទាប់៖ ${formatDay(next.reviewDueOn, km)}` : `Next check: ${formatDay(next.reviewDueOn, km)}`}
                      </span>
                    )}
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-ink-muted group-hover:text-arom" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
        {km && available.length < SYMPTOM_CHECK_TYPES.length && (
          <p className="text-xs leading-5 text-ink-muted">
            ការពិនិត្យបន្ថែមទៀតមានជាភាសាអង់គ្លេស ខណៈពេលដែលភាសាខ្មែររបស់វាកំពុងត្រូវបានពិនិត្យដោយអ្នកជំនាញ។
          </p>
        )}
      </section>

      {data && data.checks.length > 0 && (
        <section aria-labelledby="past-checks" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="past-checks" className="text-base font-semibold">
              {km ? "ការពិនិត្យមុនៗ" : "Past checks"}
            </h2>
            <ExplainButton
              km={km}
              onClick={onExplain}
              label={km ? "តើសញ្ញាទាំងនេះមានន័យអ្វី?" : "What do the signs mean?"}
            />
          </div>
          <p className="-mt-1 text-xs text-ink-muted">
            {km ? "ចុចលើលទ្ធផល ដើម្បីមើលវា និងអ្វីដែលអាចជួយម្តងទៀត។" : "Tap a result to see it again, with what can help."}
          </p>
          <ul className="divide-y divide-arom-border/60 overflow-hidden rounded-2xl border border-arom-border bg-white">
            {data.checks.slice(0, 10).map((check) => (
              <li key={check.id}>
                <button
                  type="button"
                  onClick={() => onOpenResult(check)}
                  className={`group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-arom-wash ${focusRing} focus-visible:-outline-offset-2`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{tx(QUESTIONNAIRES[check.type].name)}</span>
                    <span className="block text-xs text-ink-muted">{formatDay(cambodiaDay(Date.parse(check.createdAt)), km)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LEVEL_STYLES[check.level]}`}>
                      {tx(LEVEL_LABELS[check.level])}
                    </span>
                    <ChevronRight size={16} className="text-ink-muted group-hover:text-arom" aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
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

// ---------------------------------------------------------------------------
// One question per screen
// ---------------------------------------------------------------------------

function QuestionView({
  km,
  tx,
  view,
  saving,
  saveError,
  onAnswer,
  onSubmit,
}: {
  km: boolean;
  tx: (text: Text) => string;
  view: Extract<View, { kind: "questions" }>;
  saving: boolean;
  saveError: boolean;
  onAnswer: (questionId: string, value: number) => void;
  onSubmit: () => void;
}) {
  const questionnaire = QUESTIONNAIRES[view.type];
  const total = questionnaire.questions.length;
  const question = questionnaire.questions[view.index];
  const selected = view.answers[question.id];
  const isLast = view.index === total - 1;
  const allAnswered = questionnaire.questions.every((item) => view.answers[item.id] !== undefined);
  // The unscored safety question added at the end of a check (anxiety, distress).
  const addedSafety = question.id === SAFETY_QUESTION_ID && !question.scored;

  return (
    <div className="mt-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
        <span>{tx(questionnaire.name)}</span>
        <span>{km ? `សំណួរ ${view.index + 1} នៃ ${total}` : `Question ${view.index + 1} of ${total}`}</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-arom-soft"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={view.index + 1}
        aria-label={km ? "វឌ្ឍនភាព" : "Progress"}
      >
        <div className="h-full rounded-full bg-arom transition-all duration-300" style={{ width: `${((view.index + 1) / total) * 100}%` }} />
      </div>

      {questionnaire.intro && view.index === 0 && (
        <p className="mt-5 rounded-2xl bg-arom-wash p-4 text-sm leading-6 text-ink">{tx(questionnaire.intro)}</p>
      )}

      <div className="mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
        {addedSafety && (
          <p className="mb-2 text-sm font-medium text-arom-deep">
            {km ? "សំណួរមួយទៀត អំពីសុវត្ថិភាពរបស់អ្នក។" : "One more question, about your safety."}
          </p>
        )}
        <p className="text-sm text-ink-muted">{tx(questionnaire.prompt)}</p>
        <h2 className="mt-2 text-lg font-semibold leading-7 text-ink sm:text-xl">{tx(question.text)}</h2>

        <div role="radiogroup" aria-label={tx(question.text)} className="mt-5 grid gap-2.5">
          {questionnaire.options.map((option, value) => {
            const active = selected === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onAnswer(question.id, value)}
                className={`flex min-h-12 w-full items-center rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${focusRing} ${
                  active ? "border-arom bg-arom text-white" : "border-arom-border bg-white text-ink hover:border-arom hover:bg-arom-wash"
                }`}
              >
                {tx(option.label)}
              </button>
            );
          })}
        </div>
      </div>

      {isLast && (
        <div className="mt-5 space-y-2">
          {saveError && (
            <p role="alert" className="text-sm text-arom-danger">
              {km ? "មិនអាចរក្សាទុកការពិនិត្យរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។" : "Your check could not be saved. Please try again."}
            </p>
          )}
          <button type="button" disabled={!allAnswered || saving} onClick={onSubmit} className={primaryButton}>
            {saving ? (km ? "កំពុងរក្សាទុក..." : "Saving...") : km ? "មើលលទ្ធផលរបស់ខ្ញុំ" : "See my result"}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Safety: shown first whenever the self harm question is above "Not at all"
// ---------------------------------------------------------------------------

function SafetyView({ km, onContinue }: { km: boolean; onContinue: () => void }) {
  return (
    <div className="mt-3 animate-in fade-in duration-200">
      <div className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold text-ink">{km ? "សូមអរគុណដែលបានប្រាប់យើង" : "Thank you for telling us"}</h2>
        <p className="mt-2 text-sm leading-6 text-ink">
          {km
            ? "អ្នកបាននិយាយថា អ្នកមានគំនិតចង់ធ្វើបាបខ្លួនឯង ឬគិតថាស្លាប់ទៅប្រសើរជាង។ អ្នកមិនចាំបាច់ទ្រាំទ្រវាតែម្នាក់ឯងទេ។ សូមទាក់ទងនរណាម្នាក់ឥឡូវនេះ។"
            : "You said you have had thoughts of hurting yourself, or that you would be better off dead. You do not have to carry this alone. Please reach out to someone now."}
        </p>
      </div>

      <GetHelpSection />

      <div className="mt-5 grid gap-2.5">
        <Link href="/professional" className={primaryButton}>
          {km ? "កក់ពេលជាមួយអ្នកជំនាញ" : "Book a professional"}
        </Link>
        <button type="button" onClick={onContinue} className={secondaryButton}>
          {km ? "មើលលទ្ធផលរបស់ខ្ញុំ" : "See my result"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result and next steps (support path rules from the database trigger)
// ---------------------------------------------------------------------------

function ResultView({
  km,
  tx,
  saved,
  reopened,
  onDone,
  onExplain,
  onStart,
}: {
  km: boolean;
  tx: (text: Text) => string;
  saved: SymptomCheckSavedResponse;
  reopened: boolean;
  onDone: () => void;
  onExplain: () => void;
  onStart: (type: SymptomCheckType) => void;
}) {
  const { check, journey } = saved;
  const topic = TOPIC[check.type];
  const professional = check.recommendedPath === "self_help_and_professional" || check.recommendedPath === "professional";
  // WHO-5 guidance: low wellbeing is a reason to check for low mood next.
  const suggestLowMood = check.type === "wellbeing" && check.level !== "none";

  return (
    <div className="mt-3 space-y-5 animate-in fade-in duration-200">
      <div className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-ink-muted">
            {tx(QUESTIONNAIRES[check.type].name)}
            {reopened && ` · ${formatDay(cambodiaDay(Date.parse(check.createdAt)), km)}`}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_STYLES[check.level]}`}>
            {tx(LEVEL_LABELS[check.level])}
          </span>
        </div>
        <p className="mt-3 text-base leading-7 text-ink">{tx(LEVEL_MESSAGES[check.level](topic))}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink-muted">
            {km ? `ពិន្ទុ ${check.score} នៃ ${check.maxScore}` : `Score ${check.score} of ${check.maxScore}`}
            {QUESTIONNAIRES[check.type].higherIsBetter && (km ? "។ ពិន្ទុកាន់តែខ្ពស់ កាន់តែល្អ។" : ". Higher is better.")}
          </p>
          <ExplainButton km={km} onClick={onExplain} label={km ? "តើនេះមានន័យអ្វី?" : "What does this mean?"} />
        </div>
      </div>

      {suggestLowMood && (
        <div className="rounded-3xl border border-arom/30 bg-arom-wash p-5 sm:p-6">
          <p className="text-sm leading-6 text-ink">
            {km
              ? "នៅពេលសុខុមាលភាពទាប ការពិនិត្យអារម្មណ៍ធ្លាក់ចុះអាចជួយអ្នកឱ្យយល់កាន់តែច្បាស់។"
              : "When wellbeing is low, the Low mood check can help you understand more."}
          </p>
          <button type="button" onClick={() => onStart("depression")} className={`${primaryButton} mt-3`}>
            {km ? "ធ្វើការពិនិត្យអារម្មណ៍ធ្លាក់ចុះ" : "Take the Low mood check"}
          </button>
        </div>
      )}

      <ProgramOffer km={km} check={check} />

      <NextSteps km={km} check={check} journey={journey} professional={professional} />

      {/* After a safety answer the helplines came first, on their own screen.
          A result opened again from Past checks skips that screen, so it shows them here. */}
      {(check.safetyConcern
        ? reopened
        : check.level === "high" || QUESTIONNAIRES[check.type].alwaysShowHelp) && <GetHelpSection />}

      <p className="flex items-start gap-2 rounded-2xl border border-arom-border bg-white/70 px-4 py-3 text-xs leading-5 text-ink-muted">
        <Lock size={15} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
        <span>
          {km
            ? "នេះជាការរកឃើញរោគសញ្ញាដំបូង មិនមែនជាការធ្វើរោគវិនិច្ឆ័យទេ។ មានតែអ្នកជំនាញទេដែលអាចធ្វើរោគវិនិច្ឆ័យបាន។ លទ្ធផលរបស់អ្នកជាឯកជន។ អ្នកអាចចែករំលែកវាជាមួយអ្នកជំនាញនៅក្នុង ការណាត់ជួបរបស់ខ្ញុំ។"
            : "This is early symptom detection, not a diagnosis. Only a professional can diagnose. Your result is private. You can share it with a professional in My appointments."}
        </span>
      </p>

      <button type="button" onClick={onDone} className={secondaryButton}>
        {km ? "រួចរាល់" : "Done"}
      </button>
    </div>
  );
}

// A 2 week program for Some and Clear signs (BACKEND-HANDOFF.md section 36).
// Not offered with a safety answer, where helplines and professionals come first.
function ProgramOffer({ km, check }: { km: boolean; check: SymptomCheckDto }) {
  const programs = CHECK_PROGRAMS[check.type] ?? [];
  if (programs.length === 0 || !PROGRAM_LEVELS.includes(check.level) || check.safetyConcern) return null;

  return (
    <section aria-labelledby="program-offer" className="rounded-3xl border border-arom/30 bg-arom-wash p-5 sm:p-6">
      <h2 id="program-offer" className="flex items-center gap-2 text-base font-semibold text-arom-deep">
        <CalendarCheck size={18} aria-hidden="true" />
        {km ? "វគ្គ ២ សប្តាហ៍អាចជួយបាន" : "A 2 week program can help"}
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-ink">
        {km
          ? "ជំហានតូចមួយរៀងរាល់ថ្ងៃ រយៈពេល ២ សប្តាហ៍ ប្រហែល ១០ នាទីក្នុងមួយថ្ងៃ។ នៅថ្ងៃទី ១៤ អ្នកពិនិត្យម្តងទៀត ដើម្បីមើលអ្វីដែលបានផ្លាស់ប្តូរ។"
          : "One small step a day for 2 weeks, about 10 minutes a day. On day 14, you check again to see what changed."}
      </p>
      <div className="mt-3 grid gap-2">
        {programs.map((id) => (
          <Link
            key={id}
            href={`/mindguide/programs/${id}`}
            className={`flex min-h-12 items-center justify-between gap-3 rounded-xl bg-arom px-4 text-sm font-semibold text-white transition-colors hover:bg-arom-deep ${focusRing}`}
          >
            <span>{km ? PROGRAMS[id].name.km : PROGRAMS[id].name.en}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

// The help topics each check points to (lib/wellbeing-topics.ts). General
// distress covers both worry and low mood, so it offers both.
const CHECK_TOPICS: Record<SymptomCheckType, HelpTopic[]> = {
  depression: ["low_mood"],
  anxiety: ["anxiety"],
  distress: ["anxiety", "low_mood"],
  stress: ["stress"],
  burnout: ["burnout"],
  wellbeing: ["low_mood"],
  loneliness: ["loneliness"],
  trauma: ["trauma"],
  trauma_screen: ["trauma"],
};

function NextSteps({
  km,
  check,
  journey,
  professional,
}: {
  km: boolean;
  check: SymptomCheckDto;
  journey: SupportJourneyDto | null;
  professional: boolean;
}) {
  let note: string | null = null;
  if (professional && check.level !== "high") {
    note = km
      ? "សញ្ញារបស់អ្នកមិនបានធូរស្រាលទេបន្ទាប់ពី២សប្តាហ៍ ដូច្នេះយើងសូមណែនាំឱ្យពិភាក្សាជាមួយអ្នកជំនាញ ហើយបន្តជួយខ្លួនឯងផងដែរ។"
      : "Your signs have not gone down after 2 weeks, so we suggest talking to a professional, and keeping up self help too.";
  } else if (professional) {
    note = km
      ? "ពិភាក្សាជាមួយអ្នកជំនាញឆាប់ៗ ហើយបន្តជួយខ្លួនឯងរៀងរាល់ថ្ងៃផងដែរ។"
      : "Talk to a professional soon, and keep up small self help steps each day too.";
  } else if (journey) {
    note = km
      ? "សាកល្បងជំហានតូចៗរៀងរាល់ថ្ងៃ។ យើងនឹងរំលឹកអ្នកនៅលើទំព័រដើម ឱ្យពិនិត្យម្តងទៀតនៅថ្ងៃទី " + formatDay(journey.reviewDueOn, km) + "។"
      : `Try small steps each day. On ${formatDay(journey.reviewDueOn, km)}, we will remind you on Home to check again.`;
  } else if (check.level === "none") {
    note = km ? "ដើម្បីបន្តមានអារម្មណ៍ល្អបែបនេះ របស់ទាំងនេះអាចជួយបាន។" : "To keep feeling this way, these can help.";
  }

  const topics = CHECK_TOPICS[check.type];
  const [chosen, setChosen] = useState<HelpTopic>(topics[0]);
  const topic = topics.includes(chosen) ? chosen : topics[0];
  const content = HELP_CONTENT[topic];
  const professionals = useProfessionals();
  const groups = useSupportGroups();
  const { user } = useAuth();
  const items = suggestionsFor(topic);
  // A group chat is not crisis help: after a safety answer, helplines and professionals only.
  const group = check.safetyConcern ? null : matchGroup(groups, topic, user?.role);
  // Strong signs, a professional suggested after 2 weeks, or trauma: professionals come first.
  const professionalsFirst = professional || check.level === "high" || topic === "trauma";

  const professionalBlock = (
    <ProfessionalBlock
      km={km}
      highlight={professionalsFirst}
      matched={matchProfessionals(professionals, topic)}
      message={
        professionalsFirst
          ? km
            ? `ការនិយាយជាមួយអ្នកជំនាញដែលជួយលើ ${content.km} អាចជួយបានច្រើន។ អ្នកអាចកក់ពេលនៅលើ AROM។`
            : `Talking to a professional who helps with ${content.en.toLowerCase()} can really help. You can book one on AROM.`
          : km
            ? `ប្រសិនបើការនិយាយជាមួយនរណាម្នាក់អាចជួយបាន អ្នកជំនាញទាំងនេះជួយលើ ${content.km}។`
            : `If it would help to talk it through, these professionals help with ${content.en.toLowerCase()}.`
      }
    />
  );

  return (
    <section aria-labelledby="next-steps" className="rounded-3xl border border-arom-border bg-white p-5 sm:p-6">
      <h2 id="next-steps" className="text-base font-semibold text-ink">
        {km ? "ជំហានបន្ទាប់" : "What can help now"}
      </h2>
      <p className="mt-0.5 text-xs text-ink-muted">{km ? `សម្រាប់ ${content.km}` : `For ${content.en.toLowerCase()}`}</p>
      {note && <p className="mt-2 text-sm leading-6 text-ink">{note}</p>}

      {topics.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={km ? "ប្រធានបទ" : "Topic"}>
          {topics.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={item === topic}
              onClick={() => setChosen(item)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${focusRing} ${
                item === topic ? "bg-arom text-white" : "border border-arom-border bg-white text-arom-deep hover:bg-arom-wash"
              }`}
            >
              {km ? HELP_CONTENT[item].km : HELP_CONTENT[item].en}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {professionalsFirst && professionalBlock}
        {professional && (
          <Link href="/professional" className={primaryButton}>
            {km ? "កក់ពេលជាមួយអ្នកជំនាញ" : "Book a professional"}
          </Link>
        )}

        {items.map((item) => (
          <SuggestionRow key={item.id} item={item} km={km} />
        ))}

        {group && <GroupRow group={group} km={km} />}

        {!professionalsFirst && professionalBlock}
      </div>

      <Link href="/detection/journal" className={`mt-4 inline-flex text-sm font-semibold text-arom-deep hover:underline ${focusRing}`}>
        {km ? "សរសេរអំពីថ្ងៃនេះ" : "Write about today"}
      </Link>
    </section>
  );
}

// ---------------------------------------------------------------------------
// How it works: what the check is, how it is scored, what each level means
// ---------------------------------------------------------------------------

function ExplainButton({
  km,
  label,
  onClick,
  className = "",
}: {
  km: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border border-arom-border bg-white px-3 text-xs font-semibold text-arom-deep transition-colors hover:bg-arom-wash ${km ? "font-khmer" : ""} ${focusRing} ${className}`}
    >
      <Info size={14} aria-hidden="true" />
      {label}
    </button>
  );
}

// Kept general on purpose: it explains every check, today and later ones.
const LEVEL_GUIDE: { level: SymptomLevel; meaning: Text }[] = [
  {
    level: "none",
    meaning: {
      en: "Your answers are in the usual range. Keep doing what helps you.",
      km: "ចម្លើយរបស់អ្នកស្ថិតក្នុងកម្រិតធម្មតា។ សូមបន្តធ្វើអ្វីដែលជួយអ្នក។",
    },
  },
  {
    level: "low",
    meaning: {
      en: "Mild signs. Small daily steps often help. We ask you to check again in 2 weeks.",
      km: "សញ្ញាស្រាល។ ជំហានតូចៗរៀងរាល់ថ្ងៃតែងតែជួយបាន។ យើងនឹងសួរអ្នកឱ្យពិនិត្យម្តងទៀតក្នុងរយៈពេល២សប្តាហ៍។",
    },
  },
  {
    level: "medium",
    meaning: {
      en: "Moderate signs. Try self help and check again in 2 weeks. If the signs do not go down, we suggest talking to a professional.",
      km: "សញ្ញាមធ្យម។ សាកល្បងជួយខ្លួនឯង ហើយពិនិត្យម្តងទៀតក្នុងរយៈពេល២សប្តាហ៍។ ប្រសិនបើសញ្ញាមិនធូរស្រាលទេ យើងសូមណែនាំឱ្យពិភាក្សាជាមួយអ្នកជំនាញ។",
    },
  },
  {
    level: "high",
    meaning: {
      en: "Signs that a professional should look at. We suggest booking one soon, and keeping up self help too.",
      km: "សញ្ញាដែលអ្នកជំនាញគួរពិនិត្យមើល។ យើងសូមណែនាំឱ្យកក់ពេលជាមួយអ្នកជំនាញឆាប់ៗ ហើយបន្តជួយខ្លួនឯងផងដែរ។",
    },
  },
];

function HowItWorksSheet({
  km,
  tx,
  onClose,
}: {
  km: boolean;
  tx: (text: Text) => string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={`max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-3.5 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:rounded-[28px] sm:p-6 ${km ? "font-khmer" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-arom-border sm:hidden" />

        <div className="mt-4 flex items-start justify-between gap-4">
          <h2 id="how-it-works-title" className="text-xl font-bold tracking-tight text-ink">
            {km ? "របៀបដែលការពិនិត្យរោគសញ្ញាដំណើរការ" : "How the symptom check works"}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={km ? "បិទ" : "Close"}
            className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-arom-wash hover:text-ink ${focusRing}`}
          >
            <X size={20} />
          </button>
        </div>

        <section className="mt-4 rounded-2xl bg-arom-wash p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-arom-deep">
            <Compass size={16} aria-hidden="true" />
            {km ? "ការរកឃើញរោគសញ្ញាដំបូង មិនមែនជាការធ្វើរោគវិនិច្ឆ័យទេ" : "Early symptom detection, not a diagnosis"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-ink">
            {km
              ? "ការពិនិត្យទាំងនេះជួយអ្នកឱ្យកត់សម្គាល់សញ្ញាដំបូងអំពីសុខភាពផ្លូវចិត្តរបស់អ្នក ដើម្បីឱ្យអ្នកទទួលបានការគាំទ្រឆាប់ជាងមុន។ វាមិនអាចប្រាប់ថាអ្នកមានជំងឺផ្លូវចិត្តណាមួយបានទេ។ មានតែអ្នកជំនាញ ដូចជាអ្នកព្យាបាល អ្នកចិត្តវិទ្យា ឬវេជ្ជបណ្ឌិតទេ ដែលអាចធ្វើរោគវិនិច្ឆ័យបាន បន្ទាប់ពីបាននិយាយជាមួយអ្នក។"
              : "These checks help you notice early signs about your mental health, so you can get support sooner. They cannot tell you that you have a mental health condition. Only a professional, such as a therapist, psychologist or doctor, can make a diagnosis after talking with you."}
          </p>
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold text-ink">{km ? "របៀបដែលវាដំណើរការ" : "How it works"}</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-ink">
            <li>
              {km
                ? "អ្នកឆ្លើយសំណួរខ្លីៗអំពីរបៀបដែលអ្នកមានអារម្មណ៍ថ្មីៗនេះ។"
                : "You answer short questions about how you have felt lately."}
            </li>
            <li>
              {km
                ? "ចម្លើយនីមួយៗផ្តល់ពិន្ទុ ទៅតាមភាពញឹកញាប់ដែលអ្នកមានអារម្មណ៍បែបនោះ។"
                : "Each answer gives points, depending on how often you felt that way."}
            </li>
            <li>
              {km
                ? "AROM បូកពិន្ទុទាំងអស់ ហើយបង្ហាញកម្រិតសញ្ញា។ ការពិនិត្យនីមួយៗមានកម្រិតពិន្ទុរៀងៗខ្លួន។"
                : "AROM adds up the points and shows a sign level. Each check has its own score ranges."}
            </li>
            <li>
              {km
                ? "សំណួរមកពីបញ្ជីសំណួរដែលអ្នកជំនាញទូទាំងពិភពលោកប្រើប្រាស់។ យើងប្រើកំណែដែលបានសាកល្បងជាភាសាខ្មែរនៅកម្ពុជា នៅពេលដែលមាន។"
                : "The questions come from well known questionnaires that professionals around the world use. Where we can, we use versions tested in Khmer in Cambodia."}
            </li>
          </ol>
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold text-ink">{km ? "តើសញ្ញាទាំងនេះមានន័យអ្វី?" : "What the signs mean"}</h3>
          <ul className="mt-2 divide-y divide-arom-border/60 rounded-2xl border border-arom-border">
            {LEVEL_GUIDE.map((item) => (
              <li key={item.level} className="p-3.5">
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${LEVEL_STYLES[item.level]}`}>
                  {tx(LEVEL_LABELS[item.level])}
                </span>
                <p className="mt-1.5 text-sm leading-6 text-ink">{tx(item.meaning)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 space-y-2 text-sm leading-6 text-ink">
          <p className="flex items-start gap-2">
            <HeartPulse size={16} className="mt-1 shrink-0 text-arom" aria-hidden="true" />
            <span>
              {km
                ? "ការពិនិត្យខ្លះសួរអំពីគំនិតចង់ធ្វើបាបខ្លួនឯង។ ប្រសិនបើអ្នកឆ្លើយថាមាន AROM នឹងបង្ហាញលេខទូរស័ព្ទជំនួយបន្ទាន់ជាមុនសិន។"
                : "Some checks ask about thoughts of hurting yourself. If you answer yes, AROM shows crisis helplines first."}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Lock size={16} className="mt-1 shrink-0 text-arom" aria-hidden="true" />
            <span>
              {km
                ? "មានតែអ្នកទេដែលឃើញលទ្ធផល។ អ្នកជំនាញឃើញវាបាន លុះត្រាតែអ្នកចែករំលែកសម្រាប់ការណាត់ជួប ហើយមិនដែលឃើញចម្លើយរបស់អ្នកទេ។"
                : "Only you see your results. A professional sees them only if you share them for a booking, and never sees your answers."}
            </span>
          </p>
        </section>

        <p className="mt-5 text-xs leading-5 text-ink-muted">
          {km
            ? "ភាសាខ្មែរសម្រាប់ការពិនិត្យបញ្ហាផ្លូវចិត្តទូទៅ និងការពិនិត្យខ្លីអំពីរបួសផ្លូវចិត្ត មកពីសមាគម អ៊ី.អឹម.ឌី.អា កម្ពុជា (EMDR Association Cambodia)។"
            : "The Khmer questions in the General distress and Trauma (short check) checks are from EMDR Association Cambodia."}
        </p>

        <button type="button" onClick={onClose} className={`${primaryButton} mt-6`}>
          {km ? "យល់ហើយ" : "Got it"}
        </button>
      </div>
    </div>
  );
}
