"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { SheetDialog } from "../_components/sheet-dialog";
import { useConfirm } from "../_components/confirm-dialog";
import {
  addPlanTask,
  deletePlanTask,
  editPlanTask,
  reorderPlanTasks,
  toggleCustomPlanItem,
  usePlan,
} from "../_components/daily-plan-store";
import { PLAN_SUGGESTIONS, type PlanRepeat, type PlanTask } from "@/lib/plan";
import { CURATED_ACTIVITIES } from "./plan-mindguide-items";
import { PlanTaskIcon } from "./plan-task-icon";

export type PlanEditorTab = "add" | "manage";

const WEEKDAYS = [
  { en: "Sun", km: "អាទិត្យ" },
  { en: "Mon", km: "ច័ន្ទ" },
  { en: "Tue", km: "អង្គារ" },
  { en: "Wed", km: "ពុធ" },
  { en: "Thu", km: "ព្រហស្បតិ៍" },
  { en: "Fri", km: "សុក្រ" },
  { en: "Sat", km: "សៅរ៍" },
];

const REPEATS: { id: PlanRepeat; en: string; km: string }[] = [
  { id: "daily", en: "Every day", km: "រៀងរាល់ថ្ងៃ" },
  { id: "weekdays", en: "Some days", km: "ថ្ងៃខ្លះ" },
  { id: "once", en: "Today only", km: "តែថ្ងៃនេះ" },
];

const fieldClass =
  "w-full rounded-xl border border-arom-border bg-white px-3 py-2.5 text-sm outline-none focus:border-arom focus:ring-2 focus:ring-arom/15";

export function repeatLabel(task: Pick<PlanTask, "repeat" | "weekdays">, km: boolean) {
  if (task.repeat === "weekdays") return task.weekdays.map((day) => (km ? WEEKDAYS[day].km : WEEKDAYS[day].en)).join(", ");
  const repeat = REPEATS.find((item) => item.id === task.repeat);
  return repeat ? (km ? repeat.km : repeat.en) : "";
}

const titleOf = (task: PlanTask, km: boolean) => (km && task.titleKm ? task.titleKm : task.title);

/** Every day, some days (with the days to pick) or today only. */
function RepeatPicker({
  repeat,
  weekdays,
  onChange,
  km,
}: {
  repeat: PlanRepeat;
  weekdays: number[];
  onChange: (repeat: PlanRepeat, weekdays: number[]) => void;
  km: boolean;
}) {
  return (
    <div>
      <div role="radiogroup" aria-label={km ? "ញឹកញាប់" : "How often"} className="grid grid-cols-3 gap-1 rounded-xl bg-arom-wash p-1">
        {REPEATS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={repeat === item.id}
            onClick={() => onChange(item.id, item.id === "weekdays" && !weekdays.length ? [1, 2, 3, 4, 5] : weekdays)}
            className={`min-h-9 rounded-lg px-1 text-xs font-semibold transition-colors ${
              repeat === item.id ? "bg-white text-arom shadow-sm" : "text-ink-muted hover:text-arom"
            }`}
          >
            {km ? item.km : item.en}
          </button>
        ))}
      </div>
      {repeat === "weekdays" && (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label={km ? "ជ្រើសថ្ងៃ" : "Choose days"}>
          {WEEKDAYS.map((day, index) => {
            const on = weekdays.includes(index);
            return (
              <button
                key={day.en}
                type="button"
                aria-pressed={on}
                onClick={() => onChange("weekdays", on ? weekdays.filter((item) => item !== index) : [...weekdays, index].sort())}
                className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors ${
                  on ? "border-arom bg-arom text-white" : "border-arom-border bg-white text-ink-muted hover:border-arom"
                }`}
              >
                {km ? day.km : day.en}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddTab({ km }: { km: boolean }) {
  const plan = usePlan();
  const [title, setTitle] = useState("");
  const [repeat, setRepeat] = useState<PlanRepeat>("daily");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const inPlan = (key: string) => plan.tasks.find((task) => task.itemKey === key);

  async function addOwn(event: FormEvent) {
    event.preventDefault();
    const text = title.trim();
    if (!text || saving) return;
    if (repeat === "weekdays" && !weekdays.length) {
      setMessage({ tone: "error", text: km ? "សូមជ្រើសយ៉ាងហោចណាស់មួយថ្ងៃ។" : "Choose at least one day." });
      return;
    }
    setSaving(true);
    const result = await addPlanTask({ source: "custom", title: text, icon: "task", repeat, weekdays: repeat === "weekdays" ? weekdays : undefined });
    setSaving(false);
    if (!result.ok) return setMessage({ tone: "error", text: result.message });
    setTitle("");
    setMessage({ tone: "ok", text: km ? "បានបន្ថែមទៅផែនការ។" : "Added to your plan." });
  }

  async function toggleSuggestion(key: string) {
    const existing = inPlan(`suggest:${key}`);
    const idea = PLAN_SUGGESTIONS.find((item) => item.key === key);
    if (!idea) return;
    const result = existing
      ? await deletePlanTask(existing.id)
      : await addPlanTask({ itemKey: `suggest:${key}`, source: "suggestion", title: idea.en, titleKm: idea.km, icon: idea.icon, repeat: "daily" });
    setMessage(result.ok ? null : { tone: "error", text: result.message });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addOwn} className="space-y-2.5">
        <label htmlFor="plan-own-task" className="block text-sm font-semibold text-ink">
          {km ? "សរសេរកិច្ចការរបស់អ្នក" : "Write your own"}
        </label>
        <div className="flex gap-2">
          <input
            id="plan-own-task"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder={km ? "ឧ. ចូលគេងមុនម៉ោង ១១ យប់" : "e.g. Sleep before 11 pm"}
            className={fieldClass}
          />
          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-arom px-4 text-sm font-semibold text-white hover:bg-arom-deep disabled:opacity-50"
          >
            <Plus size={16} aria-hidden="true" />
            {km ? "បន្ថែម" : "Add"}
          </button>
        </div>
        <RepeatPicker
          repeat={repeat}
          weekdays={weekdays}
          onChange={(nextRepeat, nextDays) => {
            setRepeat(nextRepeat);
            setWeekdays(nextDays);
          }}
          km={km}
        />
      </form>

      <p role="status" aria-live="polite" className={`-mt-3 min-h-5 text-xs ${message?.tone === "error" ? "text-arom-danger" : "text-arom"}`}>
        {message?.text}
      </p>

      <section aria-labelledby="plan-ideas-title">
        <h3 id="plan-ideas-title" className="text-sm font-semibold text-ink">
          {km ? "គំនិតល្អៗ" : "Ideas"}
        </h3>
        <p className="mt-0.5 text-xs text-ink-muted">{km ? "ចុចដើម្បីបន្ថែមជារៀងរាល់ថ្ងៃ។" : "Tap to add as an every day task."}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {PLAN_SUGGESTIONS.map((idea) => {
            const added = Boolean(inPlan(`suggest:${idea.key}`));
            return (
              <button
                key={idea.key}
                type="button"
                aria-pressed={added}
                onClick={() => void toggleSuggestion(idea.key)}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-colors ${
                  added ? "border-arom bg-arom-soft text-arom" : "border-arom-border bg-white text-ink hover:border-arom"
                }`}
              >
                {added ? <Check size={15} aria-hidden="true" /> : <PlanTaskIcon icon={idea.icon} size={15} className="text-arom" />}
                {km ? idea.km : idea.en}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="plan-mindguide-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 id="plan-mindguide-title" className="text-sm font-semibold text-ink">
              {km ? "ពី MindGuide" : "From MindGuide"}
            </h3>
            <p className="mt-0.5 text-xs text-ink-muted">{km ? "មេរៀន និងលំហាត់ខ្លីៗ។" : "Short lessons and practices."}</p>
          </div>
          <Link href="/mindguide" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-arom hover:underline">
            {km ? "មើលទាំងអស់" : "See all"}
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-2.5 divide-y divide-arom-border/70 rounded-2xl border border-arom-border">
          {CURATED_ACTIVITIES.map((activity) => {
            const added = Boolean(inPlan(activity.id));
            return (
              <li key={activity.id} className="flex items-center gap-3 p-3">
                <Image src={activity.image} alt="" width={40} height={40} className="size-10 shrink-0 rounded-xl bg-arom-wash object-contain p-1" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{km ? activity.titleKm : activity.title}</p>
                  <p className="text-xs text-ink-muted">{km ? activity.durationKm : activity.duration}</p>
                </div>
                <button
                  type="button"
                  aria-pressed={added}
                  onClick={() =>
                    toggleCustomPlanItem({
                      id: activity.id,
                      source: activity.source,
                      title: activity.title,
                      titleKm: activity.titleKm,
                      subtitle: activity.subtitle,
                      subtitleKm: activity.subtitleKm,
                      icon: activity.icon,
                      href: activity.href,
                    })
                  }
                  className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border px-3 text-xs font-semibold transition-colors ${
                    added ? "border-arom bg-arom-soft text-arom" : "border-arom-border text-arom hover:bg-arom-wash"
                  }`}
                >
                  {added ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
                  {added ? (km ? "បានបន្ថែម" : "Added") : km ? "បន្ថែម" : "Add"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function EditRow({ task, km, onDone }: { task: PlanTask; km: boolean; onDone: () => void }) {
  // Edit the words in the language on screen; the other language is kept.
  const editsKm = km && Boolean(task.titleKm);
  const [title, setTitle] = useState(editsKm ? task.titleKm : task.title);
  const [repeat, setRepeat] = useState<PlanRepeat>(task.repeat);
  const [weekdays, setWeekdays] = useState<number[]>(task.weekdays);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || saving) return;
    if (repeat === "weekdays" && !weekdays.length) return setError(km ? "សូមជ្រើសយ៉ាងហោចណាស់មួយថ្ងៃ។" : "Choose at least one day.");
    setSaving(true);
    const result = await editPlanTask(task.id, {
      title: editsKm ? task.title : title.trim(),
      titleKm: editsKm ? title.trim() : task.titleKm,
      repeat,
      weekdays: repeat === "weekdays" ? weekdays : undefined,
    });
    setSaving(false);
    if (!result.ok) return setError(result.message);
    onDone();
  }

  return (
    <form onSubmit={save} className="space-y-2.5 rounded-2xl bg-arom-wash p-3">
      <label className="block text-xs font-semibold text-ink">
        {km ? "ឈ្មោះកិច្ចការ" : "Task"}
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={editsKm ? 160 : 120} className={`${fieldClass} mt-1`} />
      </label>
      <RepeatPicker
        repeat={repeat}
        weekdays={weekdays}
        onChange={(nextRepeat, nextDays) => {
          setRepeat(nextRepeat);
          setWeekdays(nextDays);
        }}
        km={km}
      />
      {error && (
        <p role="alert" className="text-xs text-arom-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="min-h-9 rounded-full border border-arom-border bg-white px-4 text-xs font-semibold text-ink">
          {km ? "បោះបង់" : "Cancel"}
        </button>
        <button type="submit" disabled={saving || !title.trim()} className="min-h-9 rounded-full bg-arom px-4 text-xs font-semibold text-white disabled:opacity-50">
          {saving ? (km ? "កំពុងរក្សាទុក..." : "Saving...") : km ? "រក្សាទុក" : "Save"}
        </button>
      </div>
    </form>
  );
}

function ManageTab({ km, onAdd }: { km: boolean; onAdd: () => void }) {
  const plan = usePlan();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const tasks = plan.tasks;

  async function move(index: number, by: -1 | 1) {
    const ids = tasks.map((task) => task.id);
    const target = index + by;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const result = await reorderPlanTasks(ids);
    setError(result.ok ? "" : result.message);
  }

  async function remove(task: PlanTask) {
    const ok = await confirm({
      title: km ? "លុបកិច្ចការនេះ?" : "Delete this task?",
      message: titleOf(task, km),
      confirmLabel: km ? "លុប" : "Delete",
      cancelLabel: km ? "ទុកវា" : "Keep it",
      tone: "danger",
    });
    if (!ok) return;
    const result = await deletePlanTask(task.id);
    setError(result.ok ? "" : result.message);
  }

  if (!tasks.length) {
    return (
      <div className="rounded-2xl bg-arom-wash p-6 text-center">
        <p className="text-sm text-ink-muted">{km ? "មិនទាន់មានកិច្ចការនៅឡើយទេ។" : "No tasks yet."}</p>
        <button type="button" onClick={onAdd} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-arom px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} aria-hidden="true" />
          {km ? "បន្ថែមកិច្ចការ" : "Add a task"}
        </button>
      </div>
    );
  }

  const iconButton =
    "flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-arom-wash hover:text-arom disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <>
      {error && (
        <p role="alert" className="mb-3 text-xs text-arom-danger">
          {error}
        </p>
      )}
      <ul className="space-y-2">
        {tasks.map((task, index) => (
          <li key={task.id} className="rounded-2xl border border-arom-border p-2.5">
            {editing === task.id ? (
              <EditRow task={task} km={km} onDone={() => setEditing(null)} />
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-arom text-white">
                  <PlanTaskIcon icon={task.icon} size={18} className={task.icon === "ic_outline-mood" ? "brightness-0 invert" : ""} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{titleOf(task, km)}</p>
                  <p className="text-xs text-ink-muted">{repeatLabel(task, km)}</p>
                </div>
                <div className="flex shrink-0 items-center">
                  <button type="button" onClick={() => void move(index, -1)} disabled={index === 0} aria-label={km ? "ឡើងលើ" : "Move up"} className={iconButton}>
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void move(index, 1)}
                    disabled={index === tasks.length - 1}
                    aria-label={km ? "ចុះក្រោម" : "Move down"}
                    className={iconButton}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setEditing(task.id)} aria-label={`${km ? "កែ" : "Edit"}: ${titleOf(task, km)}`} className={iconButton}>
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(task)}
                    aria-label={`${km ? "លុប" : "Delete"}: ${titleOf(task, km)}`}
                    className={`${iconButton} hover:text-arom-danger`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {dialog}
    </>
  );
}

/** Add tasks (your own, ideas, MindGuide) and manage the list (edit, reorder, delete). */
export function PlanEditorDialog({ initialTab, km, onClose }: { initialTab: PlanEditorTab; km: boolean; onClose: () => void }) {
  const plan = usePlan();
  const [tab, setTab] = useState<PlanEditorTab>(initialTab);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tabs: { id: PlanEditorTab; label: string }[] = [
    { id: "add", label: km ? "បន្ថែម" : "Add" },
    { id: "manage", label: `${km ? "កិច្ចការរបស់ខ្ញុំ" : "My tasks"} (${plan.tasks.length})` },
  ];

  return (
    <SheetDialog
      closing={closing}
      onClosed={onClose}
      labelledBy="plan-editor-title"
      panelClassName="flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
    >
      <div className="border-b border-arom-border/70 px-5 pb-3 pt-4 sm:px-6 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="plan-editor-title" className="text-lg font-bold text-arom">
              {km ? "ផែនការរបស់អ្នក" : "Your plan"}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {km ? "ជ្រើសរើសអ្វីដែលល្អសម្រាប់អ្នក។ ថ្ងៃថ្មីនីមួយៗចាប់ផ្តើមឡើងវិញ។" : "Choose what is good for you. Each day starts fresh."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setClosing(true)}
            aria-label={km ? "បិទ" : "Close"}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-arom-wash hover:text-arom"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div role="tablist" className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-arom-wash p-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`min-h-9 rounded-lg text-sm font-semibold transition-colors ${tab === item.id ? "bg-white text-arom shadow-sm" : "text-ink-muted hover:text-arom"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-y-auto px-5 py-4 sm:px-6">
        {tab === "add" ? <AddTab km={km} /> : <ManageTab km={km} onAdd={() => setTab("add")} />}
      </div>
    </SheetDialog>
  );
}
