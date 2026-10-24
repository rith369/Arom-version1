"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CalendarCheck,
  ChevronRight,
  Clock,
  Compass,
  HeartPulse,
  Info,
  Lock,
  X,
  type LucideIcon,
} from "lucide-react";
import { DesktopNavigation } from "../../_components/app-navigation";
import { BottomNav } from "../../components/bottom-nav";
import { TopHeader } from "../../components/top-header";
import { useLanguage } from "../../_components/language-provider";
import { GetHelpSection } from "../../_components/get-help-section";
import { cambodiaDay } from "@/lib/mood";
import {
  ANSWER_OPTIONS,
  LEVEL_LABELS,
  QUESTION_PROMPT,
  QUESTIONNAIRES,
  SAFETY_QUESTION_ID,
  SYMPTOM_CHECK_TYPES,
  isHarderThanBefore,
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

type Text = { en: string; km: string };

type Load =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "error" }
  | { status: "ready"; data: SymptomChecksResponse; today: string };

type View =
  | { kind: "home" }
  | { kind: "questions"; type: SymptomCheckType; index: number; answers: Record<string, number> }
  | { kind: "safety"; saved: SymptomCheckSavedResponse }
  | { kind: "result"; saved: SymptomCheckSavedResponse };

const TOPIC: Record<SymptomCheckType, Text> = {
  depression: { en: "low mood", km: "អារម្មណ៍ធ្លាក់ចុះ" },
  anxiety: { en: "anxiety", km: "ការថប់បារម្ភ" },
};

const LEVEL_MESSAGES: Record<SymptomLevel, (topic: Text) => Text> = {
  none: (topic) => ({
    en: `Your answers show few signs of ${topic.en} right now. Keep doing what helps you.`,
    km: `ចម្លើយរបស់អ្នកបង្ហាញសញ្ញាតិចតួចនៃ${topic.km}នៅពេលនេះ។ សូមបន្តធ្វើអ្វីដែលជួយអ្នក។`,
  }),
  low: (topic) => ({
    en: `Your answers show some signs of ${topic.en}. Many people feel this way at times, and small steps can help.`,
    km: `ចម្លើយរបស់អ្នកបង្ហាញសញ្ញាខ្លះៗនៃ${topic.km}។ មនុស្សជាច្រើនក៏មានអារម្មណ៍បែបនេះម្តងម្កាលដែរ ហើយជំហានតូចៗអាចជួយបាន។`,
  }),
  medium: (topic) => ({
    en: `Your answers show clear signs of ${topic.en} over the last 2 weeks. You do not have to handle this alone.`,
    km: `ចម្លើយរបស់អ្នកបង្ហាញសញ្ញាច្បាស់នៃ${topic.km}ក្នុងរយៈពេល២សប្តាហ៍ចុងក្រោយនេះ។ អ្នកមិនចាំបាច់ដោះស្រាយតែម្នាក់ឯងទេ។`,
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
  const tx = (text: Text) => (km ? text.km : text.en);

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
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {km ? "ការពិនិត្យរោគសញ្ញា (Symptom check)" : "Symptom check"}
            </h1>
          </div>

          {view.kind === "home" && (
            <HomeView
              km={km}
              tx={tx}
              load={load}
              onStart={start}
              onRetry={refresh}
              onExplain={() => setExplainOpen(true)}
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
              onDone={() => setView({ kind: "home" })}
              onExplain={() => setExplainOpen(true)}
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
}: {
  km: boolean;
  tx: (text: Text) => string;
  load: Load;
  onStart: (type: SymptomCheckType) => void;
  onRetry: () => void;
  onExplain: () => void;
}) {
  const data = load.status === "ready" ? load.data : null;
  const today = load.status === "ready" ? load.today : "";
  const due = data?.journeys.filter((journey) => journey.reviewDueOn <= today) ?? [];
  const upcoming = data?.journeys.filter((journey) => journey.reviewDueOn > today) ?? [];
  const harder = data ? SYMPTOM_CHECK_TYPES.filter((type) => isHarderThanBefore(data.checks, type)) : [];

  return (
    <div className="mt-3 space-y-5 animate-in fade-in duration-200">
      <p className="text-sm leading-6 text-ink-muted">
        {km
          ? "ការពិនិត្យរហ័សអំពីរបៀបដែលអ្នកមានអារម្មណ៍ក្នុងរយៈពេល២សប្តាហ៍ចុងក្រោយនេះ។ វាជួយអ្នកឱ្យកត់សម្គាល់សញ្ញាឆាប់ៗ។"
          : "A quick check on how you have felt over the last 2 weeks. It helps you notice early signs."}
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

      <section aria-labelledby="choose-check" className="space-y-3">
        <h2 id="choose-check" className="text-base font-semibold">
          {km ? "ជ្រើសរើសការពិនិត្យ" : "Choose a check"}
        </h2>
        {SYMPTOM_CHECK_TYPES.map((type) => {
          const questionnaire = QUESTIONNAIRES[type];
          const next = upcoming.find((journey) => journey.concern === type);
          return (
            <button
              key={type}
              type="button"
              disabled={load.status !== "ready"}
              onClick={() => onStart(type)}
              className={`group flex w-full items-center gap-4 rounded-[22px] border border-arom-border bg-white p-4 text-left shadow-sm transition-colors hover:border-arom hover:bg-arom-wash disabled:opacity-60 ${focusRing}`}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-arom-soft text-arom">
                {type === "depression" ? <Activity size={22} aria-hidden="true" /> : <HeartPulse size={22} aria-hidden="true" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-ink">{tx(questionnaire.name)}</span>
                <span className="mt-0.5 block text-xs text-ink-muted sm:text-sm">{tx(questionnaire.description)}</span>
                {next && (
                  <span className="mt-1 block text-xs font-medium text-arom-deep">
                    {km ? `ពិនិត្យបន្ទាប់៖ ${formatDay(next.reviewDueOn, km)}` : `Next check: ${formatDay(next.reviewDueOn, km)}`}
                  </span>
                )}
              </span>
              <ChevronRight size={18} className="shrink-0 text-ink-muted group-hover:text-arom" aria-hidden="true" />
            </button>
          );
        })}
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
          <ul className="divide-y divide-arom-border/60 rounded-2xl border border-arom-border bg-white">
            {data.checks.slice(0, 10).map((check) => (
              <li key={check.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{tx(QUESTIONNAIRES[check.type].name)}</span>
                  <span className="block text-xs text-ink-muted">{formatDay(cambodiaDay(Date.parse(check.createdAt)), km)}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${LEVEL_STYLES[check.level]}`}>
                  {tx(LEVEL_LABELS[check.level])}
                </span>
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
  const safetyInAnxiety = view.type === "anxiety" && question.id === SAFETY_QUESTION_ID;

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

      <div className="mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
        {safetyInAnxiety && (
          <p className="mb-2 text-sm font-medium text-arom-deep">
            {km ? "សំណួរមួយទៀត អំពីសុវត្ថិភាពរបស់អ្នក។" : "One more question, about your safety."}
          </p>
        )}
        <p className="text-sm text-ink-muted">{tx(QUESTION_PROMPT)}</p>
        <h2 className="mt-2 text-lg font-semibold leading-7 text-ink sm:text-xl">{tx(question.text)}</h2>

        <div role="radiogroup" aria-label={tx(question.text)} className="mt-5 grid gap-2.5">
          {ANSWER_OPTIONS.map((option) => {
            const active = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onAnswer(question.id, option.value)}
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
  onDone,
  onExplain,
}: {
  km: boolean;
  tx: (text: Text) => string;
  saved: SymptomCheckSavedResponse;
  onDone: () => void;
  onExplain: () => void;
}) {
  const { check, journey } = saved;
  const topic = TOPIC[check.type];
  const professional = check.recommendedPath === "self_help_and_professional" || check.recommendedPath === "professional";

  return (
    <div className="mt-3 space-y-5 animate-in fade-in duration-200">
      <div className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-ink-muted">{tx(QUESTIONNAIRES[check.type].name)}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_STYLES[check.level]}`}>
            {tx(LEVEL_LABELS[check.level])}
          </span>
        </div>
        <p className="mt-3 text-base leading-7 text-ink">{tx(LEVEL_MESSAGES[check.level](topic))}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink-muted">
            {km ? `ពិន្ទុ ${check.score} នៃ ${check.maxScore}` : `Score ${check.score} of ${check.maxScore}`}
          </p>
          <ExplainButton km={km} onClick={onExplain} label={km ? "តើនេះមានន័យអ្វី?" : "What does this mean?"} />
        </div>
      </div>

      <NextSteps km={km} check={check} journey={journey} professional={professional} />

      {check.level === "high" && !check.safetyConcern && <GetHelpSection />}

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
      ? "សាកល្បងជំហានតូចៗរៀងរាល់ថ្ងៃ។ យើងនឹងសួរអ្នកឱ្យពិនិត្យម្តងទៀតនៅថ្ងៃទី " + formatDay(journey.reviewDueOn, km) + "។"
      : `Try small steps each day. We will ask you to check again on ${formatDay(journey.reviewDueOn, km)}.`;
  }

  const links: { href: string; label: string; primary?: boolean }[] = [
    ...(professional ? [{ href: "/professional", label: km ? "កក់ពេលជាមួយអ្នកជំនាញ" : "Book a professional", primary: true }] : []),
    { href: "/practice", label: km ? "សាកល្បងការអនុវត្ត" : "Try a practice" },
    { href: "/mindguide", label: km ? "បើក MindGuide" : "Open MindGuide" },
    { href: "/detection/journal", label: km ? "សរសេរអំពីថ្ងៃនេះ" : "Write about today" },
  ];

  return (
    <section aria-labelledby="next-steps" className="rounded-3xl border border-arom-border bg-white p-5 sm:p-6">
      <h2 id="next-steps" className="text-base font-semibold text-ink">
        {km ? "ជំហានបន្ទាប់" : "What can help now"}
      </h2>
      {note && <p className="mt-2 text-sm leading-6 text-ink">{note}</p>}
      <div className="mt-4 grid gap-2.5">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={link.primary ? primaryButton : secondaryButton}>
            {link.label}
          </Link>
        ))}
      </div>
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
                ? "ចម្លើយនីមួយៗផ្តល់ពិន្ទុ។ បើបញ្ហាណាមួយរំខានអ្នកញឹកញាប់ជាង វាផ្តល់ពិន្ទុច្រើនជាង។"
                : "Each answer gives points. The more often something bothers you, the more points it gives."}
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

        <button type="button" onClick={onClose} className={`${primaryButton} mt-6`}>
          {km ? "យល់ហើយ" : "Got it"}
        </button>
      </div>
    </div>
  );
}
