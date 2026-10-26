"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, LogIn, Pencil, Plus, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PlanTaskIcon } from "./plan-task-icon";
import { PlanEditorDialog, type PlanEditorTab } from "./plan-editor-dialog";
import { useLanguage } from "../_components/language-provider";
import { MOOD_LABELS, useMoodStore } from "../_components/mood/mood-store";
import { useActivities } from "../progress/_components/use-activities";
import { loadPlan, setPlanTaskDone, usePlan } from "../_components/daily-plan-store";
import {
  cambodiaToday,
  isDoneToday,
  isDueToday,
  mindguideOption,
  PROGRAM_HOME_TITLE,
  taskHref,
  taskTitle,
  toggleCheckIn,
  useCareStore,
  type CareTask,
} from "../_components/care/care-store";
import { PLAN_STARTERS, isDueOn, type PlanTask } from "@/lib/plan";

const firstUpper = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// One line of the plan: the person's own tasks, today's mood check in and
// tasks from their professional all look the same.
type Row = {
  id: string;
  title: string;
  subtitle: string;
  icon: string | null;
  href: string | null;
  done: boolean;
  badge?: string;
  // Missing for rows that tick themselves (the mood check in) or cannot be
  // ticked (the signed out preview).
  onToggle?: () => void;
  // Where the circle goes when the row ticks itself.
  checkHref?: string;
  checkLabel?: string;
};

// Icon for a task from the professional, matching the plan's other rows.
function careIcon(task: CareTask) {
  const type = mindguideOption(task)?.type;
  if (type === "practice") return "hugeicons_yoga-03";
  if (type === "lesson") return "ant-design_play-circle-filled";
  return "boxicons_note-filled";
}

// The tick settles in when a task is ticked, but not when the page loads.
// Reduced motion: fade only.
// The circle is drawn at 28px but the tap area is 44px, so a thumb never misses it.
function CheckCircle({ done, onToggle, href, label }: { done: boolean; onToggle?: () => void; href?: string; label: string }) {
  const reduce = useReducedMotion();
  const circle = `flex size-7 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-[160ms] ease-[var(--ease-out)] group-hover:border-white group-active:scale-90 motion-reduce:group-active:scale-100 ${
    done ? "border-[#23aa89] bg-[#23aa89] text-white shadow-sm" : "border-white/55"
  }`;
  const target =
    "group -my-2 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-white";
  const tick = (
    <AnimatePresence initial={false}>
      {done && (
        <motion.span
          className="flex"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        >
          <Check size={16} strokeWidth={2.75} aria-hidden="true" />
        </motion.span>
      )}
    </AnimatePresence>
  );
  if (onToggle) {
    return (
      <button type="button" onClick={onToggle} aria-pressed={done} aria-label={label} className={target}>
        <span className={circle}>{tick}</span>
      </button>
    );
  }
  // Ticks itself (the mood check in): the circle takes you to where you do it.
  if (href) {
    return (
      <Link href={href} aria-label={label} className={target}>
        <span className={circle}>{tick}</span>
      </Link>
    );
  }
  return (
    <span aria-hidden="true" className="-my-2 -mr-2 flex size-11 shrink-0 items-center justify-center">
      <span className={circle}>{tick}</span>
    </span>
  );
}

function PlanRow({ row, km }: { row: Row; km: boolean }) {
  const content: ReactNode = (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center text-white">
        <PlanTaskIcon icon={row.icon} size={22} className={row.icon === "ic_outline-mood" ? "brightness-0 invert" : ""} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex flex-wrap items-center gap-1.5">
          <span
            className={`text-xs font-medium leading-tight transition-colors duration-200 sm:text-[13px] ${
              row.done ? "text-white/55 line-through decoration-white/70 decoration-[1.5px]" : "text-white"
            }`}
          >
            {row.title}
          </span>
          {row.badge && (
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[0.62rem] font-semibold text-[#83dfca]">{row.badge}</span>
          )}
        </span>
        {row.subtitle && (
          <span className={`mt-0.5 block text-[11px] font-light leading-tight ${row.done ? "text-white/45" : "text-white/80"}`}>
            {row.subtitle}
          </span>
        )}
      </span>
      {row.href && <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-white/60" />}
    </>
  );
  const area = "flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-white";
  const toggleLabel = row.done ? (km ? `មិនទាន់រួច៖ ${row.title}` : `Mark not done: ${row.title}`) : km ? `រួចរាល់៖ ${row.title}` : `Mark done: ${row.title}`;

  return (
    <li className="flex items-center gap-3 rounded-xl px-1.5 py-2.5 transition-colors duration-150 hover:bg-white/5">
      {row.href ? (
        <Link href={row.href} className={area}>
          {content}
        </Link>
      ) : row.onToggle ? (
        // A task with no page: tapping its words ticks it too. The check
        // button next to it is the one screen readers and keyboards use.
        <button type="button" onClick={row.onToggle} className={area} tabIndex={-1} aria-hidden="true">
          {content}
        </button>
      ) : (
        <div className={area}>{content}</div>
      )}
      <CheckCircle done={row.done} onToggle={row.onToggle} href={row.checkHref} label={row.checkLabel ?? toggleLabel} />
    </li>
  );
}

/**
 * The AROM sprout peeking over the plan (Figma Homescreen). Its own piece so
 * Home can line up the right column with the plan card, not the picture.
 * The picture is wider than the card so its plants meet the card's edges.
 * tuck: its empty top left tucks under the greeting. Off when a card sits
 * above it, so the sun and leaves never cover that card.
 */
export function PlanBanner({ tuck = false }: { tuck?: boolean }) {
  return (
    <Image
      src="/home/plan-banner.webp"
      alt=""
      width={1024}
      height={325}
      preload
      sizes="(min-width: 1024px) 34rem, (min-width: 640px) 36rem, 100vw"
      className={`pointer-events-none relative -mx-[5.65%] block h-auto w-[111.3%] max-w-none select-none ${tuck ? "-mt-5" : ""}`}
    />
  );
}

export function DailyPlanCard() {
  const { language } = useLanguage();
  const km = language === "km";
  const plan = usePlan();
  const mood = useMoodStore();
  const care = useCareStore("client");
  const [now] = useState(() => Date.now());
  const today = plan.day || cambodiaToday(now);
  const [editor, setEditor] = useState<PlanEditorTab | null>(null);
  const [error, setError] = useState("");

  // Lessons and practices finished today tick their tasks by themselves.
  const { state: activities } = useActivities("7d", plan.status === "ready");
  const finishedToday = (kind: "lesson" | "practice", refId?: string) =>
    activities.status === "ready" &&
    activities.data.recent.some((item) => item.kind === kind && item.day === today && (!refId || item.refId === refId));
  const autoDone = (task: PlanTask) =>
    (task.itemKey === "starter:lesson" && finishedToday("lesson")) ||
    (task.itemKey === "starter:meditation" && finishedToday("practice")) ||
    (task.source === "learn" && finishedToday("lesson", task.itemKey)) ||
    (task.source === "practice" && finishedToday("practice", task.itemKey));

  // A lesson or practice finished today ticks its task once, as a normal
  // tick, so the person can still untick it.
  const autoTicked = useRef(new Set<string>());
  useEffect(() => {
    if (plan.status !== "ready" || activities.status !== "ready") return;
    for (const task of plan.tasks) {
      if (task.doneToday || autoTicked.current.has(task.id) || !isDueOn(task, today) || !autoDone(task)) continue;
      autoTicked.current.add(task.id);
      void setPlanTaskDone(task.id, true);
    }
  });

  const toggleTask = async (task: PlanTask) => {
    const result = await setPlanTaskDone(task.id, !task.doneToday);
    setError(result.ok ? "" : result.message);
  };

  const moodRow: Row = {
    id: "mood",
    title: km ? "ពិនិត្យអារម្មណ៍ (Mood Check-in)" : "Mood check in",
    subtitle: mood.today
      ? km
        ? `អ្នកបានកត់ត្រា៖ ${MOOD_LABELS[mood.today].km}`
        : `You checked in: ${MOOD_LABELS[mood.today].en}`
      : km
        ? "ចុចលើអារម្មណ៍របស់អ្នកខាងក្រោម"
        : "Tap how you feel below",
    icon: "ic_outline-mood",
    href: "/#mood-check-in",
    done: Boolean(mood.today),
    checkHref: "/#mood-check-in",
    checkLabel: km ? "ជ្រើសអារម្មណ៍របស់អ្នកខាងក្រោម" : "Choose your mood below",
  };

  // Tasks from the person's professionals that are due today.
  const careRows: Row[] = care.tasks
    .filter((task) => isDueToday(task, care.checkIns, today))
    .map((task) => {
      const professional = care.professionals.find((item) => item.slug === task.professionalId);
      const from = km ? professional?.kmName || professional?.name || "អ្នកជំនាញរបស់អ្នក" : professional?.name || "your professional";
      return {
        id: task.id,
        // A 2 week program never names its topic on Home.
        title:
          mindguideOption(task)?.type === "program"
            ? km
              ? PROGRAM_HOME_TITLE.km
              : PROGRAM_HOME_TITLE.en
            : taskTitle(task, km),
        subtitle: task.note || (km ? "ពីផែនការថែទាំរបស់អ្នក" : "From your care plan"),
        icon: careIcon(task),
        href: taskHref(task),
        done: isDoneToday(task, care.checkIns, today),
        badge: km ? `ពី ${from}` : `From ${from}`,
        onToggle: () => void toggleCheckIn(task, today),
      };
    });

  const taskRows: Row[] =
    plan.status === "ready"
      ? plan.tasks
          .filter((task) => isDueOn(task, today))
          .map((task) => ({
            id: task.id,
            title: firstUpper(km && task.titleKm ? task.titleKm : task.title),
            // Older saved items can start in lowercase ("drop or delay...").
            subtitle: firstUpper(km && task.subtitleKm ? task.subtitleKm : task.subtitle),
            icon: task.icon,
            href: task.href,
            done: task.doneToday,
            onToggle: () => void toggleTask(task),
          }))
      : plan.status === "signed_out"
        ? PLAN_STARTERS.map((task) => ({
            id: task.itemKey,
            title: km && task.titleKm ? task.titleKm : task.title,
            subtitle: (km && task.subtitleKm ? task.subtitleKm : task.subtitle) ?? "",
            icon: task.icon ?? null,
            href: task.href ?? null,
            done: false,
          }))
        : [];

  const rows = [moodRow, ...careRows, ...taskRows];
  const doneCount = rows.filter((row) => row.done).length;

  return (
    <div>
      <section
        aria-labelledby="daily-plan-heading"
        className="rounded-[20px] bg-[#1f6f5b] p-4 text-white shadow-[0_12px_36px_rgba(31,111,91,0.18)] sm:p-5"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="daily-plan-heading" className="text-base font-semibold tracking-normal sm:text-lg">
            {km ? "ផែនការប្រចាំថ្ងៃរបស់អ្នក (Daily Plan)" : "Your Plan For Today"}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap text-xs font-semibold text-[#83dfca]">
              {doneCount}/{rows.length} {km ? "រួចរាល់" : "done"}
            </span>
            {plan.status === "ready" && (
              <button
                type="button"
                onClick={() => setEditor("manage")}
                className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white transition-colors hover:bg-white/25 active:scale-95"
              >
                <Pencil size={12} aria-hidden="true" />
                <span>{km ? "កែ" : "Edit"}</span>
              </button>
            )}
          </div>
        </div>

        <div
          role="progressbar"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={rows.length}
          aria-label={km ? `រួចរាល់ ${doneCount} ក្នុងចំណោម ${rows.length}` : `${doneCount} of ${rows.length} done`}
          className="mt-3 flex items-center gap-1.5"
        >
          {/* Fills from the left: 2 done lights the first 2, whichever tasks they are. */}
          {rows.map((row, index) => (
            <span
              key={row.id}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                index < doneCount ? "bg-[#23aa89] shadow-[0_0_6px_rgba(35,170,137,0.6)]" : "bg-white/75"
              }`}
            />
          ))}
        </div>

        <ul className="mt-3 divide-y divide-white/10">
          {rows.map((row) => (
            <PlanRow key={row.id} row={row} km={km} />
          ))}
        </ul>

        {plan.status === "loading" && (
          <div aria-busy="true" aria-label={km ? "កំពុងផ្ទុក" : "Loading"} className="space-y-2 px-1.5 py-2">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/15" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/15" />
          </div>
        )}

        {plan.status === "error" && (
          <p className="flex flex-wrap items-center gap-2 px-1.5 py-2 text-xs text-white/85">
            {km ? "មិនអាចផ្ទុកផែនការរបស់អ្នកបានទេ។" : "Your plan could not load."}
            <button type="button" onClick={() => void loadPlan()} className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline">
              <RotateCcw size={12} aria-hidden="true" />
              {km ? "ព្យាយាមម្ដងទៀត" : "Try again"}
            </button>
          </p>
        )}

        {plan.status === "ready" && taskRows.length === 0 && (
          <p className="px-1.5 py-2 text-xs text-white/80">
            {km ? "ថ្ងៃនេះមិនទាន់មានកិច្ចការទេ។ បន្ថែមអ្វីតូចមួយ។" : "Nothing planned for today. Add something small."}
          </p>
        )}

        {care.tasks.length > 0 && (
          <Link
            href="/care-plan"
            className="mt-2 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#a3edd9] hover:text-white"
          >
            {km ? "មើលផែនការថែទាំរបស់អ្នក" : "See your care plan"}
            <ChevronRight aria-hidden="true" className="size-3.5" />
          </Link>
        )}

        <p role="status" aria-live="polite" className="px-1.5 text-xs text-[#ffd9d9]">
          {error}
        </p>

        {plan.status === "signed_out" ? (
          <Link
            href="/login?next=%2F"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/35 bg-white/[0.08] px-3 py-2.5 text-xs font-semibold text-white/95 transition-colors hover:border-white/70 hover:bg-white/15"
          >
            <LogIn size={14} aria-hidden="true" />
            {km ? "ចូលគណនីដើម្បីបង្កើតផែនការផ្ទាល់ខ្លួន" : "Log in to make your own plan"}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setEditor("add")}
            disabled={plan.status !== "ready"}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/35 bg-white/[0.08] px-3 py-2.5 text-xs font-semibold text-white/95 transition-colors hover:border-white/70 hover:bg-white/15 active:scale-[0.99] disabled:opacity-60"
          >
            <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
            {km ? "បន្ថែមកិច្ចការ" : "Add a task"}
          </button>
        )}
      </section>

      {editor && <PlanEditorDialog initialTab={editor} km={km} onClose={() => setEditor(null)} />}
    </div>
  );
}
