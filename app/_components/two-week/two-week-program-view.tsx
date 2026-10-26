"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Compass,
  HeartPulse,
  Lightbulb,
  Lock,
  PenLine,
  UsersRound,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../auth-provider";
import { matchGroup, useSupportGroups, type GroupSuggestion } from "../topic-help/topic-help";
import { DesktopNavigation } from "../app-navigation";
import { BottomNav } from "../../components/bottom-nav";
import { TopHeader } from "../../components/top-header";
import { LanguageQuickToggle, useLanguage } from "../language-provider";
import { addPlanTask, deletePlanTask, setPlanTaskDone, usePlan } from "../daily-plan-store";
import { ALL_LESSONS } from "../learn/learn-data";
import { ALL_PRACTICES } from "../practice/practice-data";
import { ALL_TIPS } from "../tips/tips-data";
import { cambodiaDay } from "@/lib/mood";
import { LEVEL_LABELS, QUESTIONNAIRES, textFor, type SymptomCheckDto, type SymptomChecksResponse, type SymptomCheckType } from "@/lib/symptom-checks";
import {
  PROGRAM_LENGTH,
  PROGRAMS,
  parseProgramKey,
  programDay,
  programFit,
  programKey,
  type Program,
  type ProgramDay,
  type ProgramId,
  type ProgramLink,
} from "./two-week-data";

// One 2 week program (BACKEND-HANDOFF.md section 36). A running program is a
// daily task in Your Plan For Today, so it is saved in the person's account
// and shows on Home under a neutral name that never says stress or anxiety.

type Text = { en: string; km: string };

type Checks =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "error" }
  | { status: "ready"; checks: SymptomCheckDto[] };

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom";
const primaryButton = `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-arom px-5 text-sm font-semibold text-white transition-colors hover:bg-arom-deep disabled:opacity-60 ${focusRing}`;
const secondaryButton = `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-arom-border bg-white px-5 text-sm font-semibold text-arom-deep transition-colors hover:bg-arom-wash disabled:opacity-60 ${focusRing}`;

// The plan task's words. Home can be seen by others, so they never name the topic.
const PLAN_TASK = {
  title: "Today's step (2 week program)",
  titleKm: "ជំហានថ្ងៃនេះ (2 week program)",
  subtitle: "About 10 minutes",
  subtitleKm: "ប្រហែល ១០ នាទី",
};

function formatDay(day: string, km: boolean) {
  return new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}

type ResolvedLink = { icon: LucideIcon; label: Text; title: Text; duration?: Text; href: string };

const LINK_LABELS = {
  lesson: { en: "Lesson", km: "មេរៀន (Lesson)" },
  tip: { en: "Tip", km: "គន្លឹះ (Tip)" },
  practice: { en: "Practice", km: "លំហាត់ (Practice)" },
};

/** What a day points to, or null when it is not available (yet). */
function resolveLink(link: ProgramLink, checkType: SymptomCheckType, group: GroupSuggestion | null): ResolvedLink | null {
  if (link.kind === "group") {
    if (!group) return null;
    return {
      icon: UsersRound,
      label: { en: "Support group", km: "ក្រុមគាំទ្រ (Support group)" },
      title: { en: group.name, km: group.nameKm },
      href: group.href,
    };
  }
  if (link.kind === "journal") {
    return {
      icon: PenLine,
      label: { en: "Journal", km: "កំណត់ហេតុ (Journal)" },
      title: { en: "Write in your journal", km: "សរសេរក្នុងកំណត់ហេតុរបស់អ្នក" },
      href: "/detection/journal",
    };
  }
  if (link.kind === "check") {
    return {
      icon: ClipboardCheck,
      label: { en: "Symptom check", km: "ការពិនិត្យរោគសញ្ញា (Symptom check)" },
      title: { en: "Take the check again", km: "ធ្វើការពិនិត្យម្តងទៀត" },
      duration: { en: "About 2 minutes", km: "ប្រហែល ២ នាទី" },
      href: `/detection/symptoms?check=${checkType}`,
    };
  }
  const list = link.kind === "lesson" ? ALL_LESSONS : link.kind === "tip" ? ALL_TIPS : ALL_PRACTICES;
  const item = list.find((entry) => entry.id === link.id && entry.isAvailable);
  if (!item) return null;
  const path = link.kind === "lesson" ? "learn" : link.kind === "tip" ? "tips" : "practice";
  return {
    icon: link.kind === "lesson" ? BookOpen : link.kind === "tip" ? Lightbulb : Wind,
    label: LINK_LABELS[link.kind],
    title: { en: item.title, km: item.kmTitle || item.title },
    duration: { en: item.duration, km: item.kmDuration || item.duration },
    href: `/mindguide/${path}?open=${encodeURIComponent(item.id)}`,
  };
}

export function TwoWeekProgramView({ programId }: { programId: ProgramId }) {
  const router = useRouter();
  const { language } = useLanguage();
  const km = language === "km";
  const t = (text: Text) => (km ? text.km : text.en);
  const program = PROGRAMS[programId];
  const plan = usePlan();

  const [checks, setChecks] = useState<Checks>({ status: "loading" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/symptom-checks", { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (response.status === 401) return setChecks({ status: "signed_out" });
        if (!response.ok) return setChecks({ status: "error" });
        const data = (await response.json()) as SymptomChecksResponse;
        if (active) setChecks({ status: "ready", checks: data.checks });
      })
      .catch(() => {
        if (active) setChecks({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, []);

  // Community groups, to offer the one for this topic. Nothing shows if
  // there is none or they cannot be loaded.
  const { user } = useAuth();
  const groups = useSupportGroups();
  const group = matchGroup(groups, programId, user?.role);

  const [clientDay] = useState(() => cambodiaDay(Date.now()));
  const today = plan.status === "ready" ? plan.day : clientDay;
  const running = plan.tasks.flatMap((task) => {
    const key = parseProgramKey(task.itemKey);
    return key ? [{ task, ...key }] : [];
  });
  const mine = running.find((item) => item.id === programId);
  const other = running.find((item) => item.id !== programId);
  const fit = checks.status === "ready" ? programFit(program, checks.checks, today) : null;
  // The check to take (again): the one that led here, or the program's own.
  // Checks without reviewed Khmer are hidden in Khmer, so pick one that shows.
  const usable = (type: SymptomCheckType) => !km || QUESTIONNAIRES[type].khmerReady;
  const checkType =
    fit && fit.kind !== "no_check" && usable(fit.check.type)
      ? fit.check.type
      : (program.checks.find(usable) ?? program.checks[0]);

  const start = async () => {
    setBusy(true);
    setError(null);
    // One program at a time, so Home shows a single "Today's step".
    for (const item of running) {
      const removed = await deletePlanTask(item.task.id);
      if (!removed.ok) {
        setBusy(false);
        return setError(removed.message);
      }
    }
    const added = await addPlanTask({
      itemKey: programKey(programId, today),
      source: "guide",
      ...PLAN_TASK,
      href: `/mindguide/programs/${programId}`,
      icon: "boxicons_note-filled",
      repeat: "daily",
    });
    setBusy(false);
    setConfirmStop(false);
    if (!added.ok) setError(added.message);
    else window.scrollTo({ top: 0 });
  };

  const stop = async () => {
    if (!mine) return;
    setBusy(true);
    setError(null);
    const removed = await deletePlanTask(mine.task.id);
    setBusy(false);
    setConfirmStop(false);
    if (!removed.ok) setError(removed.message);
  };

  const loading = plan.status === "loading" || checks.status === "loading";
  const signedOut = plan.status === "signed_out" || checks.status === "signed_out";
  const day = mine ? programDay(mine.startDay, today) : null;

  return (
    <div className="min-h-screen bg-[#f7faf9] text-ink lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="MindGuide" />

      <div className="min-w-0 pb-28 sm:pb-32 lg:pb-12">
        <main className="mx-auto w-full max-w-[430px] px-4 pt-4 sm:px-6 md:max-w-xl lg:max-w-2xl lg:pt-8">
          <TopHeader />

          <div className="mt-4 flex items-center gap-2 sm:mt-6">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? router.back() : router.push("/mindguide"))}
              aria-label={km ? "ត្រឡប់ក្រោយ" : "Back"}
              className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full text-arom-deep transition-colors hover:bg-arom-wash ${focusRing}`}
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="min-w-0 flex-1 text-xl font-bold tracking-tight sm:text-2xl">{t(program.name)}</h1>
            <LanguageQuickToggle />
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-2xl border border-arom-border bg-white p-4 text-sm text-arom-danger">
              {error}
            </p>
          )}

          {loading ? (
            <div className="mt-6 space-y-3" aria-busy="true">
              <div className="h-40 animate-pulse rounded-3xl bg-arom-soft/60" />
              <div className="h-24 animate-pulse rounded-3xl bg-arom-soft/40" />
            </div>
          ) : signedOut ? (
            <p className="mt-5 rounded-2xl border border-arom-border bg-white p-4 text-sm text-ink">
              {km ? "សូម " : "Please "}
              <Link
                href={`/login?next=${encodeURIComponent(`/mindguide/programs/${programId}`)}`}
                className="font-semibold text-arom underline"
              >
                {km ? "ចូលគណនី" : "log in"}
              </Link>
              {km ? " ដើម្បីចាប់ផ្តើមវគ្គនេះ។" : " to start this program."}
            </p>
          ) : mine && day !== null ? (
            <RunningView
              km={km}
              t={t}
              program={program}
              day={day}
              startDay={mine.startDay}
              doneToday={mine.task.doneToday}
              strongSigns={fit?.kind === "strong_signs"}
              checkType={checkType}
              group={group}
              busy={busy}
              confirmStop={confirmStop}
              onToggleDone={() => void setPlanTaskDone(mine.task.id, !mine.task.doneToday)}
              onRestart={() => void start()}
              onAskStop={() => setConfirmStop(true)}
              onCancelStop={() => setConfirmStop(false)}
              onStop={() => void stop()}
            />
          ) : (
            <IntroView
              km={km}
              t={t}
              program={program}
              fit={fit}
              checksFailed={checks.status === "error"}
              otherName={other ? t(PROGRAMS[other.id].name) : null}
              checkType={checkType}
              busy={busy}
              onStart={() => void start()}
            />
          )}

          {!loading && !signedOut && <SafetyNote km={km} />}
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav activeTab="MindGuide" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Before starting: what the program is, who it is for, the 14 days
// ---------------------------------------------------------------------------

function IntroView({
  km,
  t,
  program,
  fit,
  checksFailed,
  otherName,
  checkType,
  busy,
  onStart,
}: {
  km: boolean;
  t: (text: Text) => string;
  program: Program;
  fit: ReturnType<typeof programFit> | null;
  checksFailed: boolean;
  otherName: string | null;
  checkType: SymptomCheckType;
  busy: boolean;
  onStart: () => void;
}) {
  const checkHref = `/detection/symptoms?check=${checkType}`;
  const checkName = (check: SymptomCheckDto) => textFor(QUESTIONNAIRES[check.type].name, km);
  const switchNote = otherName && (
    <p className="mt-2 text-xs leading-5 text-ink-muted">
      {km ? `ការចាប់ផ្តើមវគ្គនេះនឹងបញ្ឈប់ ${otherName}។` : `Starting this program stops your ${otherName}.`}
    </p>
  );

  return (
    <div className="mt-3 space-y-5 animate-in fade-in duration-200">
      <section className="rounded-3xl border border-arom/30 bg-arom-wash p-5 shadow-sm sm:p-6">
        <p className="text-sm leading-6 text-ink">{t(program.description)}</p>
        <ul className="mt-3 grid gap-2 text-sm text-ink">
          <IntroRow icon={CalendarCheck} text={km ? "១៤ ថ្ងៃ ជំហានតូចមួយក្នុងមួយថ្ងៃ។" : "14 days, one small step each day."} />
          <IntroRow icon={Clock} text={km ? "ប្រហែល ១០ នាទីក្នុងមួយថ្ងៃ។" : "About 10 minutes a day."} />
          <IntroRow
            icon={ClipboardCheck}
            text={km ? "នៅថ្ងៃទី ១៤ អ្នកពិនិត្យម្តងទៀត ដើម្បីមើលអ្វីដែលបានផ្លាស់ប្តូរ។" : "On day 14, you check again to see what changed."}
          />
          <IntroRow
            icon={Lock}
            text={
              km
                ? "មានតែអ្នកទេដែលឃើញវគ្គនេះ។ នៅលើទំព័រដើម វាបង្ហាញថា \"ជំហានថ្ងៃនេះ\" ប៉ុណ្ណោះ។"
                : "Only you see this program. On Home it shows only as \"Today's step\"."
            }
          />
        </ul>
      </section>

      {/* Who it is for, from the newest matching check. */}
      <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
        {checksFailed ? (
          <p className="text-sm leading-6 text-ink">
            {km ? "មិនអាចផ្ទុកការពិនិត្យរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។" : "Your checks could not be loaded. Please try again later."}
          </p>
        ) : fit?.kind === "fits" ? (
          <>
            <p className="text-sm leading-6 text-ink">
              {km
                ? `ការពិនិត្យ${checkName(fit.check)}របស់អ្នក បង្ហាញ${textFor(LEVEL_LABELS[fit.check.level], km)}។ វគ្គនេះត្រូវបានរៀបចំសម្រាប់អ្នក។`
                : `Your ${checkName(fit.check)} check shows ${LEVEL_LABELS[fit.check.level].en.toLowerCase()}. This program is made for you.`}
            </p>
            <button type="button" disabled={busy} onClick={onStart} className={`${primaryButton} mt-4`}>
              {busy ? (km ? "កំពុងចាប់ផ្តើម..." : "Starting...") : km ? "ចាប់ផ្តើមថ្ងៃនេះ" : "Start today"}
            </button>
            {switchNote}
          </>
        ) : fit?.kind === "strong_signs" ? (
          <>
            <p className="flex items-start gap-2 text-sm leading-6 text-ink">
              <HeartPulse size={18} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
              <span>
                {km
                  ? "ការពិនិត្យចុងក្រោយរបស់អ្នកបង្ហាញសញ្ញាខ្លាំង។ ការពិភាក្សាជាមួយអ្នកជំនាញ គឺជាជំហានបន្ទាប់ដ៏ល្អបំផុត។ អ្នកអាចធ្វើវគ្គនេះជាមួយគ្នាបាន ប៉ុន្តែវាមិនជំនួសអ្នកជំនាញទេ។"
                  : "Your last check shows strong signs. Talking to a professional is the best next step. You can do this program alongside, but it does not replace a professional."}
              </span>
            </p>
            <Link href="/professional" className={`${primaryButton} mt-4`}>
              {km ? "កក់ពេលជាមួយអ្នកជំនាញ" : "Book a professional"}
            </Link>
            <button type="button" disabled={busy} onClick={onStart} className={`${secondaryButton} mt-2.5`}>
              {km ? "ចាប់ផ្តើមវគ្គនេះផងដែរ" : "Start this program too"}
            </button>
            {switchNote}
          </>
        ) : fit?.kind === "few_signs" ? (
          <>
            <p className="text-sm leading-6 text-ink">
              {km
                ? "ការពិនិត្យចុងក្រោយរបស់អ្នកបង្ហាញសញ្ញាតិចតួច ដូច្នេះអ្នកប្រហែលជាមិនត្រូវការវគ្គនេះឥឡូវនេះទេ។ មេរៀន គន្លឹះ និងលំហាត់នៅក្នុង MindGuide មានសម្រាប់អ្នកគ្រប់ពេល។"
                : "Your last check shows few signs, so you may not need this program now. The lessons, tips and practices in MindGuide are there for you any time."}
            </p>
            <Link href="/mindguide" className={`${primaryButton} mt-4`}>
              {km ? "ទៅកាន់ MindGuide" : "Go to MindGuide"}
            </Link>
            <Link href={checkHref} className={`${secondaryButton} mt-2.5`}>
              {km ? "ពិនិត្យម្តងទៀត" : "Check again"}
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm leading-6 text-ink">
              {fit?.kind === "old_check"
                ? km
                  ? "ការពិនិត្យចុងក្រោយរបស់អ្នកគឺលើសពី ២ សប្តាហ៍មុន។ សូមពិនិត្យម្តងទៀតជាមុនសិន ដើម្បីមើលថាតើវគ្គនេះសមនឹងអ្នកឬទេ។"
                  : "Your last check was more than 2 weeks ago. Please check again first, to see if this program fits you now."
                : km
                  ? "វគ្គនេះសម្រាប់អ្នកដែលការពិនិត្យបង្ហាញសញ្ញាខ្លះៗ ឬសញ្ញាច្បាស់។ សូមធ្វើការពិនិត្យ ២ នាទីជាមុនសិន។"
                  : "This program is for people whose check shows some signs or clear signs. Please take the 2 minute check first."}
            </p>
            <Link href={checkHref} className={`${primaryButton} mt-4`}>
              {km ? "ធ្វើការពិនិត្យ" : "Take the check"}
            </Link>
          </>
        )}
      </section>

      <section aria-labelledby="program-outline" className="space-y-3">
        <h2 id="program-outline" className="text-base font-semibold">
          {km ? "អ្វីដែលអ្នកនឹងធ្វើ" : "What you will do"}
        </h2>
        {program.weeks.map((week, index) => (
          <div key={week.en} className="rounded-2xl border border-arom-border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-arom-deep">
              {km ? `សប្តាហ៍ទី ${index + 1}` : `Week ${index + 1}`}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{t(week)}</p>
            <ol className="mt-3 grid gap-1.5 text-sm text-ink">
              {program.days.slice(index * 7, index * 7 + 7).map((item, offset) => (
                <li key={offset} className="flex gap-2.5">
                  <span className="w-12 shrink-0 text-xs font-medium leading-5 text-ink-muted">
                    {km ? `ថ្ងៃទី ${index * 7 + offset + 1}` : `Day ${index * 7 + offset + 1}`}
                  </span>
                  <span className="leading-5">{t(item.title)}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>
    </div>
  );
}

function IntroRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
      <span className="leading-5">{text}</span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Running: today's step, the 14 days, finishing
// ---------------------------------------------------------------------------

function RunningView({
  km,
  t,
  program,
  day,
  startDay,
  doneToday,
  strongSigns,
  checkType,
  group,
  busy,
  confirmStop,
  onToggleDone,
  onRestart,
  onAskStop,
  onCancelStop,
  onStop,
}: {
  km: boolean;
  t: (text: Text) => string;
  program: Program;
  day: number;
  startDay: string;
  doneToday: boolean;
  strongSigns: boolean;
  checkType: SymptomCheckType;
  group: GroupSuggestion | null;
  busy: boolean;
  confirmStop: boolean;
  onToggleDone: () => void;
  onRestart: () => void;
  onAskStop: () => void;
  onCancelStop: () => void;
  onStop: () => void;
}) {
  const finished = day > PROGRAM_LENGTH;
  const current = Math.min(day, PROGRAM_LENGTH);
  const week = current <= 7 ? 0 : 1;
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-3 space-y-5 animate-in fade-in duration-200">
      <section className="rounded-3xl border border-arom/30 bg-arom-wash p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-arom-deep">
            {finished
              ? km
                ? "អ្នកបានបញ្ចប់ ២ សប្តាហ៍"
                : "You finished the 2 weeks"
              : km
                ? `ថ្ងៃទី ${current} នៃ ${PROGRAM_LENGTH}`
                : `Day ${current} of ${PROGRAM_LENGTH}`}
          </p>
          <p className="text-xs text-ink-muted">
            {km ? `បានចាប់ផ្តើម ${formatDay(startDay, km)}` : `Started ${formatDay(startDay, km)}`}
          </p>
        </div>
        {!finished && <p className="mt-0.5 text-sm text-ink">{t(program.weeks[week])}</p>}
        <ol className="mt-4 grid grid-cols-7 gap-1.5" aria-label={km ? "១៤ ថ្ងៃ" : "The 14 days"}>
          {program.days.map((_, index) => {
            const number = index + 1;
            const state = finished || number < current ? "past" : number === current ? "today" : "later";
            return (
              <li
                key={number}
                aria-current={state === "today" ? "step" : undefined}
                className={`flex h-8 items-center justify-center rounded-lg text-xs font-semibold ${
                  state === "today"
                    ? "bg-arom text-white"
                    : state === "past"
                      ? "bg-arom-soft text-arom-deep"
                      : "border border-arom-border bg-white text-ink-muted"
                }`}
              >
                {number}
              </li>
            );
          })}
        </ol>
      </section>

      {strongSigns && (
        <section className="rounded-3xl border border-arom-border bg-white p-5 sm:p-6">
          <p className="flex items-start gap-2 text-sm leading-6 text-ink">
            <HeartPulse size={18} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
            <span>
              {km
                ? "ការពិនិត្យចុងក្រោយរបស់អ្នកបង្ហាញសញ្ញាខ្លាំង។ សូមពិភាក្សាជាមួយអ្នកជំនាញផងដែរ។ វគ្គនេះមិនជំនួសអ្នកជំនាញទេ។"
                : "Your last check shows strong signs. Please talk to a professional too. This program does not replace one."}
            </span>
          </p>
          <Link href="/professional" className={`${primaryButton} mt-4`}>
            {km ? "កក់ពេលជាមួយអ្នកជំនាញ" : "Book a professional"}
          </Link>
        </section>
      )}

      {finished ? (
        <section className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
          <p className="flex items-start gap-2 text-sm leading-6 text-ink">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
            <span>
              {km
                ? "អ្នកបានធ្វើវាជាប់លាប់រយៈពេល ២ សប្តាហ៍។ ធ្វើការពិនិត្យម្តងទៀត ដើម្បីមើលអ្វីដែលបានផ្លាស់ប្តូរ។ ប្រសិនបើសញ្ញាមិនធូរស្រាលទេ យើងសូមណែនាំឱ្យពិភាក្សាជាមួយអ្នកជំនាញ។"
                : "You kept going for 2 weeks. Take the check again to see what changed. If the signs have not gone down, we suggest talking to a professional."}
            </span>
          </p>
          <Link href={`/detection/symptoms?check=${checkType}`} className={`${primaryButton} mt-4`}>
            {km ? "ពិនិត្យម្តងទៀត" : "Check again"}
          </Link>
          <button type="button" disabled={busy} onClick={onRestart} className={`${secondaryButton} mt-2.5`}>
            {km ? "ចាប់ផ្តើម ២ សប្តាហ៍ទៀត" : "Start another 2 weeks"}
          </button>
          <button type="button" disabled={busy} onClick={onStop} className={`${secondaryButton} mt-2.5`}>
            {km ? "ដកចេញពីផែនការរបស់ខ្ញុំ" : "Remove from my plan"}
          </button>
        </section>
      ) : (
        <TodayCard
          km={km}
          t={t}
          day={current}
          item={program.days[current - 1]}
          checkType={checkType}
          group={group}
          done={doneToday}
          onToggleDone={onToggleDone}
        />
      )}

      {group && <GroupCard km={km} group={group} />}

      <section aria-labelledby="all-days" className="space-y-3">
        <h2 id="all-days" className="text-base font-semibold">
          {km ? "ថ្ងៃទាំងអស់" : "All days"}
        </h2>
        <p className="-mt-1.5 text-xs text-ink-muted">
          {km ? "ថ្ងៃនីមួយៗបើកនៅថ្ងៃរបស់វា។ អ្នកអាចត្រឡប់ទៅមើលថ្ងៃមុនៗបាន។" : "Each day opens on its day. You can go back to earlier days."}
        </p>
        <ul className="divide-y divide-arom-border/60 overflow-hidden rounded-[22px] border border-arom-border bg-white">
          {program.days.map((item, index) => {
            const number = index + 1;
            const locked = !finished && number > current;
            const isOpen = open === number;
            return (
              <li key={number}>
                <button
                  type="button"
                  disabled={locked}
                  aria-expanded={locked ? undefined : isOpen}
                  onClick={() => setOpen(isOpen ? null : number)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors enabled:hover:bg-arom-wash ${focusRing} focus-visible:-outline-offset-2`}
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      number === current && !finished ? "bg-arom text-white" : locked ? "bg-arom-soft/50 text-ink-muted" : "bg-arom-soft text-arom-deep"
                    }`}
                  >
                    {number}
                  </span>
                  <span className={`min-w-0 flex-1 text-sm ${locked ? "text-ink-muted" : "font-medium text-ink"}`}>{t(item.title)}</span>
                  {locked ? (
                    <Lock size={15} className="shrink-0 text-ink-muted" aria-label={km ? "មិនទាន់បើក" : "Not open yet"} />
                  ) : (
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  )}
                </button>
                {isOpen && !locked && (
                  <div className="px-4 pb-4">
                    <DayBody km={km} t={t} item={item} checkType={checkType} group={group} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {!finished && (
        <div className="rounded-2xl border border-arom-border bg-white p-4">
          {confirmStop ? (
            <>
              <p className="text-sm text-ink">
                {km
                  ? "បញ្ឈប់វគ្គនេះ? ជំហានថ្ងៃនេះនឹងត្រូវដកចេញពីទំព័រដើម។ អ្នកអាចចាប់ផ្តើមម្តងទៀតនៅពេលក្រោយ។"
                  : "Stop this program? Today's step is removed from Home. You can start again later."}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={onCancelStop} className={secondaryButton}>
                  {km ? "បន្ត" : "Keep going"}
                </button>
                <button type="button" disabled={busy} onClick={onStop} className={secondaryButton}>
                  {km ? "បញ្ឈប់" : "Stop"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <button type="button" onClick={onRestart} disabled={busy} className={`text-sm font-semibold text-arom-deep hover:underline ${focusRing}`}>
                {km ? "ចាប់ផ្តើមឡើងវិញពីថ្ងៃទី ១" : "Start again from day 1"}
              </button>
              <button type="button" onClick={onAskStop} className={`text-sm font-semibold text-ink-muted hover:underline ${focusRing}`}>
                {km ? "បញ្ឈប់វគ្គនេះ" : "Stop this program"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TodayCard({
  km,
  t,
  day,
  item,
  checkType,
  group,
  done,
  onToggleDone,
}: {
  km: boolean;
  t: (text: Text) => string;
  day: number;
  item: ProgramDay;
  checkType: SymptomCheckType;
  group: GroupSuggestion | null;
  done: boolean;
  onToggleDone: () => void;
}) {
  return (
    <section aria-labelledby="today-step" className="rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-arom-deep">
        {km ? `ថ្ងៃនេះ · ថ្ងៃទី ${day}` : `Today · Day ${day}`}
      </p>
      <h2 id="today-step" className="mt-1 text-lg font-semibold text-ink">
        {t(item.title)}
      </h2>
      <div className="mt-3">
        <DayBody km={km} t={t} item={item} checkType={checkType} group={group} />
      </div>
      <button
        type="button"
        aria-pressed={done}
        onClick={onToggleDone}
        className={`mt-4 ${done ? secondaryButton : primaryButton}`}
      >
        {done ? <Check size={18} aria-hidden="true" /> : null}
        {done
          ? km
            ? "បានធ្វើរួចហើយថ្ងៃនេះ"
            : "Done for today"
          : km
            ? "ខ្ញុំបានធ្វើជំហានថ្ងៃនេះហើយ"
            : "I did today's step"}
      </button>
    </section>
  );
}

function DayBody({
  km,
  t,
  item,
  checkType,
  group,
}: {
  km: boolean;
  t: (text: Text) => string;
  item: ProgramDay;
  checkType: SymptomCheckType;
  group: GroupSuggestion | null;
}) {
  const links = (item.links ?? []).flatMap((link) => resolveLink(link, checkType, group) ?? []);
  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 text-sm leading-6 text-ink-muted">
        <Compass size={16} className="mt-1 shrink-0 text-arom" aria-hidden="true" />
        <span>{t(item.why)}</span>
      </p>
      <div className="rounded-2xl bg-arom-wash p-4">
        <p className="text-xs font-semibold text-arom-deep">{km ? "ជំហានរបស់អ្នក" : "Your step"}</p>
        <p className="mt-1 text-sm leading-6 text-ink">
          {t(item.step)}
          {group && item.withGroup && ` ${t(item.withGroup)}`}
        </p>
      </div>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`group flex items-center gap-3 rounded-2xl border border-arom-border p-3 transition-colors hover:bg-arom-wash ${focusRing}`}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-arom-soft text-arom">
            <link.icon size={19} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-ink-muted">
              {t(link.label)}
              {link.duration ? ` · ${t(link.duration)}` : ""}
            </span>
            <span className="block truncate text-sm font-semibold text-ink">{t(link.title)}</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-ink-muted group-hover:text-arom" aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

// Shown from day 1, so support is there for all 14 days, never as a task.
function GroupCard({ km, group }: { km: boolean; group: GroupSuggestion }) {
  const name = km ? group.nameKm : group.name;
  return (
    <section aria-labelledby="group-card" className="rounded-3xl border border-arom-border bg-white p-5 sm:p-6">
      <h2 id="group-card" className="flex items-center gap-2 text-base font-semibold text-ink">
        <UsersRound size={18} className="text-arom" aria-hidden="true" />
        {km ? "អ្នកមិននៅម្នាក់ឯងទេ" : "You are not alone"}
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-ink">
        {group.joined
          ? km
            ? `អ្នកនៅក្នុង ${name}។ អ្នកដទៃនៅទីនោះក៏មានអារម្មណ៍ដូចគ្នា ហើយអ្នកអាចចែករំលែកបានគ្រប់ពេល។`
            : `You are in ${name}. Others there feel the same, and you can share any time.`
          : km
            ? `${name} គឺជាក្រុមគាំទ្រជាមួយអ្នកដទៃដែលមានអារម្មណ៍ដូចគ្នា ដឹកនាំដោយអ្នកជំនាញ។ ចូលរួមនៅពេលអ្នករួចរាល់។ ការអានដោយមិនសរសេរក៏បានដែរ ហើយអ្នកអាចប្រើឈ្មោះហៅក្រៅ។`
            : `${name} is a support group with others who feel the same, led by a professional. Join when you are ready. Reading without writing is fine, and you can use a nickname.`}
      </p>
      <Link href={group.href} className={`${secondaryButton} mt-3`}>
        {group.joined ? (km ? "បើកការជជែកក្នុងក្រុម" : "Open the group chat") : km ? "មើលក្រុម" : "See the group"}
      </Link>
    </section>
  );
}

function SafetyNote({ km }: { km: boolean }) {
  return (
    <div className="mt-5 space-y-2 rounded-2xl border border-arom-border bg-white/70 px-4 py-3 text-xs leading-5 text-ink-muted">
      <p className="flex items-start gap-2">
        <HeartPulse size={15} className="mt-0.5 shrink-0 text-arom" aria-hidden="true" />
        <span>
          {km ? (
            <>
              នេះជាការជួយខ្លួនឯង មិនមែនជាការព្យាបាលទេ។ ប្រសិនបើអ្នកមានអារម្មណ៍កាន់តែអាក្រក់ សូម{" "}
              <Link href="/professional" className="font-semibold text-arom underline">
                ពិភាក្សាជាមួយអ្នកជំនាញ
              </Link>
              ។ ប្រសិនបើអ្នកមានគំនិតចង់ធ្វើបាបខ្លួនឯង សូមចុច{" "}
              <Link href="/profile#get-help-title" className="font-semibold text-arom underline">
                ជំនួយបន្ទាន់ (Get help now)
              </Link>
              ។
            </>
          ) : (
            <>
              This is self help, not treatment. If you feel worse,{" "}
              <Link href="/professional" className="font-semibold text-arom underline">
                talk to a professional
              </Link>
              . If you have thoughts of hurting yourself, tap{" "}
              <Link href="/profile#get-help-title" className="font-semibold text-arom underline">
                Get help now
              </Link>
              .
            </>
          )}
        </span>
      </p>
      <p>
        {km
          ? "គំនិតមកពីការណែនាំរបស់អង្គការសុខភាពពិភពលោក (WHO) \"Doing What Matters in Times of Stress\" និងការព្យាបាលដោយការយល់ដឹង និងអាកប្បកិរិយា (CBT)។"
          : "Ideas from the WHO guide \"Doing What Matters in Times of Stress\" and from cognitive behavioural therapy (CBT)."}
      </p>
    </div>
  );
}
