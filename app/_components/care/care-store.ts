'use client';

import { useSyncExternalStore } from 'react';

import { ALL_LESSONS } from '../learn/learn-data';
import { ALL_PRACTICES } from '../practice/practice-data';
import { ALL_TIPS } from '../tips/tips-data';

// Care tasks a professional gives a client between sessions. They show in the
// client's "Your Plan For Today". The client checks them off; the professional
// sees that progress only if the client agrees to share it.
//
// Mock only: everything lives in memory and resets on refresh.

export type CareTaskKind = 'mindguide' | 'mission' | 'goal' | 'reminder';
export type MindGuideType = 'lesson' | 'tip' | 'practice';
// 1 is Monday, 7 is Sunday (same as the professional schedule).
export type CareWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// once: done one time (a lesson, or a goal reached). days: repeat on the chosen weekdays.
export type CareRepeat = { type: 'once' } | { type: 'days'; days: CareWeekday[] };

export type CareTask = {
  id: string;
  professionalId: string;
  clientId: string;
  // The session it was given after, when there was one.
  bookingId: string | null;
  kind: CareTaskKind;
  // Only for kind "mindguide".
  mindguide: { type: MindGuideType; itemId: string } | null;
  // Written by the professional for mission, goal and reminder. Empty for MindGuide.
  title: string;
  note: string;
  repeat: CareRepeat;
  startDate: string;
  endDate: string | null;
  // "HH:MM" Cambodia time. Sent later by the Telegram bot, not by this app.
  reminderTime: string | null;
  createdAt: string;
  stoppedAt: string | null;
};

// One check off by the client, on one Cambodia date.
export type CareCheckIn = { taskId: string; date: string; doneAt: string };

export const MAX_TASK_TITLE = 120;
export const MAX_TASK_NOTE = 300;

export const KIND_LABELS: Record<CareTaskKind, { en: string; km: string; hint: string; kmHint: string }> = {
  mindguide: {
    en: 'MindGuide',
    km: 'MindGuide',
    hint: 'A lesson, tip or practice from MindGuide.',
    kmHint: 'មេរៀន គន្លឹះ ឬលំហាត់ពី MindGuide។',
  },
  mission: {
    en: 'Mission',
    km: 'បេសកកម្ម',
    hint: 'A small real life step, for example a 10 minute walk.',
    kmHint: 'ជំហានតូចមួយក្នុងជីវិតពិត ឧ. ដើរ ១០ នាទី។',
  },
  goal: {
    en: 'Goal',
    km: 'គោលដៅ',
    hint: 'Something to work toward until a date. The client marks it reached.',
    kmHint: 'អ្វីមួយដែលត្រូវខិតខំរហូតដល់ថ្ងៃកំណត់។ អតិថិជនសម្គាល់ពេលសម្រេចបាន។',
  },
  reminder: {
    en: 'Reminder',
    km: 'ការរំលឹក',
    hint: 'A simple daily nudge, for example drink water or take medicine as prescribed by their doctor.',
    kmHint: 'ការរំលឹកសាមញ្ញប្រចាំថ្ងៃ ឧ. ផឹកទឹក ឬលេបថ្នាំតាមវេជ្ជបញ្ជារបស់វេជ្ជបណ្ឌិត។',
  },
};

export const WEEKDAY_LABELS: Record<CareWeekday, { en: string; km: string }> = {
  1: { en: 'Mon', km: 'ច' },
  2: { en: 'Tue', km: 'អ' },
  3: { en: 'Wed', km: 'ពុ' },
  4: { en: 'Thu', km: 'ព្រ' },
  5: { en: 'Fri', km: 'សុ' },
  6: { en: 'Sat', km: 'ស' },
  7: { en: 'Sun', km: 'អា' },
};

export const EVERY_DAY: CareWeekday[] = [1, 2, 3, 4, 5, 6, 7];

// MindGuide items a professional can assign: only the ones users can open.
export type MindGuideOption = {
  type: MindGuideType;
  id: string;
  title: string;
  kmTitle: string;
  duration: string;
  kmDuration: string;
  href: string;
};

export const MINDGUIDE_OPTIONS: MindGuideOption[] = [
  ...ALL_LESSONS.filter((item) => item.isAvailable).map((item) => ({
    type: 'lesson' as const,
    id: item.id,
    title: item.title,
    kmTitle: item.kmTitle ?? item.title,
    duration: item.duration,
    kmDuration: item.kmDuration ?? item.duration,
    href: `/mindguide/learn?open=${item.id}`,
  })),
  ...ALL_TIPS.filter((item) => item.isAvailable).map((item) => ({
    type: 'tip' as const,
    id: item.id,
    title: item.title,
    kmTitle: item.kmTitle,
    duration: item.duration,
    kmDuration: item.kmDuration,
    href: `/mindguide/tips?open=${item.id}`,
  })),
  ...ALL_PRACTICES.filter((item) => item.isAvailable).map((item) => ({
    type: 'practice' as const,
    id: item.id,
    title: item.title,
    kmTitle: item.kmTitle ?? item.title,
    duration: item.duration,
    kmDuration: item.kmDuration ?? item.duration,
    href: `/mindguide/practice?open=${item.id}`,
  })),
];

export const MINDGUIDE_TYPE_LABELS: Record<MindGuideType, { en: string; km: string }> = {
  lesson: { en: 'Lesson', km: 'មេរៀន' },
  tip: { en: 'Tip', km: 'គន្លឹះ' },
  practice: { en: 'Practice', km: 'លំហាត់' },
};

export function mindguideOption(task: CareTask) {
  if (!task.mindguide) return undefined;
  const { type, itemId } = task.mindguide;
  return MINDGUIDE_OPTIONS.find((item) => item.type === type && item.id === itemId);
}

export function taskTitle(task: CareTask, km: boolean) {
  const option = mindguideOption(task);
  if (option) return km ? option.kmTitle : option.title;
  return task.title;
}

export function taskHref(task: CareTask) {
  return mindguideOption(task)?.href ?? '/care-plan';
}

// "Every day until 21 Oct · remind at 21:00", in English or Khmer.
export function scheduleLabel(task: CareTask, km: boolean) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const format = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const date = (value: string) => format.format(new Date(`${value}T00:00:00Z`));
  const parts: string[] = [];
  if (task.kind === 'goal') {
    if (task.endDate) parts.push(t(`សម្រេចមុន ${date(task.endDate)}`, `Reach by ${date(task.endDate)}`));
  } else {
    if (task.repeat.type === 'once') parts.push(t('ម្តង', 'Once'));
    else if (task.repeat.days.length === 7) parts.push(t('រៀងរាល់ថ្ងៃ', 'Every day'));
    else parts.push(task.repeat.days.map((day) => (km ? WEEKDAY_LABELS[day].km : WEEKDAY_LABELS[day].en)).join(', '));
    if (task.endDate) parts.push(t(`រហូតដល់ ${date(task.endDate)}`, `until ${date(task.endDate)}`));
  }
  if (task.reminderTime) parts.push(t(`រំលឹកម៉ោង ${task.reminderTime}`, `remind at ${task.reminderTime}`));
  return parts.join(' · ');
}

// ---------- Dates (Cambodia) ----------

export function cambodiaToday(now: number) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function shiftDate(date: string, days: number) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function weekdayOfDate(date: string): CareWeekday {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return (day === 0 ? 7 : day) as CareWeekday;
}

// ---------- Rules ----------

export function isActive(task: CareTask, today: string) {
  if (task.stoppedAt) return false;
  if (task.startDate > today) return false;
  return task.endDate === null || today <= task.endDate;
}

export function doneOnce(task: CareTask, checkIns: CareCheckIn[]) {
  return checkIns.some((item) => item.taskId === task.id);
}

export function doneOn(task: CareTask, checkIns: CareCheckIn[], date: string) {
  return checkIns.some((item) => item.taskId === task.id && item.date === date);
}

// Shown in "Your Plan For Today": repeating tasks on their days; one time tasks
// until done (and on the day they were done, so the tick stays visible).
export function isDueToday(task: CareTask, checkIns: CareCheckIn[], today: string) {
  if (!isActive(task, today)) return false;
  if (task.repeat.type === 'once') {
    const check = checkIns.find((item) => item.taskId === task.id);
    return !check || check.date === today;
  }
  return task.repeat.days.includes(weekdayOfDate(today));
}

export function isDoneToday(task: CareTask, checkIns: CareCheckIn[], today: string) {
  return task.repeat.type === 'once' ? doneOnce(task, checkIns) : doneOn(task, checkIns, today);
}

// Progress over the last `days` days, counting only days the task was due.
export function recentProgress(task: CareTask, checkIns: CareCheckIn[], today: string, days = 7) {
  if (task.repeat.type === 'once') return null;
  const result: { date: string; due: boolean; done: boolean }[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = shiftDate(today, -offset);
    const due =
      date >= task.startDate &&
      (task.endDate === null || date <= task.endDate) &&
      (!task.stoppedAt || date <= task.stoppedAt.slice(0, 10)) &&
      task.repeat.days.includes(weekdayOfDate(date));
    result.push({ date, due, done: due && doneOn(task, checkIns, date) });
  }
  return result;
}

// ---------- Mock store ----------

type State = {
  tasks: CareTask[];
  checkIns: CareCheckIn[];
  // `${professionalId}:${clientId}` -> the client shares their progress.
  sharing: Record<string, boolean>;
};

const SEED_NOW = Date.now();
const seedToday = cambodiaToday(SEED_NOW);
const firstOption = (type: MindGuideType) => {
  const option = MINDGUIDE_OPTIONS.find((item) => item.type === type);
  return option ? { type, itemId: option.id } : null;
};
const seedStamp = (daysAgo: number) => new Date(SEED_NOW - daysAgo * 86_400_000).toISOString();

const seedTasks: CareTask[] = [
  {
    id: 'care-seed-1',
    professionalId: 'sopheap-chan',
    clientId: 'demo-user-001',
    bookingId: null,
    kind: 'mindguide',
    mindguide: firstOption('practice'),
    title: '',
    note: 'Before bed, even if you only manage two minutes.',
    repeat: { type: 'days', days: EVERY_DAY },
    startDate: shiftDate(seedToday, -6),
    endDate: shiftDate(seedToday, 8),
    reminderTime: '21:00',
    createdAt: seedStamp(6),
    stoppedAt: null,
  },
  {
    id: 'care-seed-2',
    professionalId: 'sopheap-chan',
    clientId: 'demo-user-001',
    bookingId: null,
    kind: 'mission',
    mindguide: null,
    title: 'Take a 10 minute walk after lunch',
    note: 'Leave your phone in your bag while you walk.',
    repeat: { type: 'days', days: [1, 3, 5] },
    startDate: shiftDate(seedToday, -6),
    endDate: shiftDate(seedToday, 8),
    reminderTime: null,
    createdAt: seedStamp(6),
    stoppedAt: null,
  },
  {
    id: 'care-seed-3',
    professionalId: 'sopheap-chan',
    clientId: 'demo-user-001',
    bookingId: null,
    kind: 'goal',
    mindguide: null,
    title: 'Go to bed before 11 pm on most nights',
    note: '',
    repeat: { type: 'once' },
    startDate: shiftDate(seedToday, -6),
    endDate: shiftDate(seedToday, 20),
    reminderTime: null,
    createdAt: seedStamp(6),
    stoppedAt: null,
  },
  {
    id: 'care-seed-4',
    professionalId: 'sopheap-chan',
    clientId: 'demo-user-001',
    bookingId: null,
    kind: 'mindguide',
    mindguide: firstOption('lesson'),
    title: '',
    note: 'We will talk about it next session.',
    repeat: { type: 'once' },
    startDate: shiftDate(seedToday, -6),
    endDate: null,
    reminderTime: null,
    createdAt: seedStamp(6),
    stoppedAt: null,
  },
  {
    id: 'care-seed-5',
    professionalId: 'sopheap-chan',
    clientId: 'demo-user-005',
    bookingId: null,
    kind: 'mission',
    mindguide: null,
    title: 'Write down one thing that went well today',
    note: '',
    repeat: { type: 'days', days: EVERY_DAY },
    startDate: shiftDate(seedToday, -3),
    endDate: shiftDate(seedToday, 11),
    reminderTime: '20:00',
    createdAt: seedStamp(3),
    stoppedAt: null,
  },
];

// Sok Dara did the practice on most days, and the walk once.
const seedCheckIns: CareCheckIn[] = [
  ...[6, 5, 3, 2, 1].map((daysAgo) => ({ taskId: 'care-seed-1', date: shiftDate(seedToday, -daysAgo), doneAt: seedStamp(daysAgo) })),
  ...[1, 2, 3, 4, 5, 6]
    .map((daysAgo) => shiftDate(seedToday, -daysAgo))
    .filter((date) => [1, 3, 5].includes(weekdayOfDate(date)))
    .slice(0, 1)
    .map((date) => ({ taskId: 'care-seed-2', date, doneAt: `${date}T06:30:00.000Z` })),
  { taskId: 'care-seed-4', date: shiftDate(seedToday, -4), doneAt: seedStamp(4) },
];

const initial: State = {
  tasks: seedTasks.filter((task) => task.kind !== 'mindguide' || task.mindguide),
  checkIns: seedCheckIns,
  sharing: { 'sopheap-chan:demo-user-001': true },
};

let state: State = initial;
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCareStore() {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

export const sharingKey = (professionalId: string, clientId: string) => `${professionalId}:${clientId}`;

export function addCareTasks(tasks: Omit<CareTask, 'id' | 'createdAt' | 'stoppedAt'>[]) {
  const createdAt = new Date().toISOString();
  setState({
    ...state,
    tasks: [
      ...state.tasks,
      ...tasks.map((task, index) => ({ ...task, id: `care-${Date.now()}-${index}`, createdAt, stoppedAt: null })),
    ],
  });
}

export function stopCareTask(id: string) {
  const stoppedAt = new Date().toISOString();
  setState({ ...state, tasks: state.tasks.map((task) => (task.id === id ? { ...task, stoppedAt } : task)) });
}

// The client ticks or unticks a task for a date.
export function toggleCheckIn(task: CareTask, date: string) {
  const done = task.repeat.type === 'once' ? doneOnce(task, state.checkIns) : doneOn(task, state.checkIns, date);
  setState({
    ...state,
    checkIns: done
      ? state.checkIns.filter((item) => !(item.taskId === task.id && (task.repeat.type === 'once' || item.date === date)))
      : [...state.checkIns, { taskId: task.id, date, doneAt: new Date().toISOString() }],
  });
}

export function setProgressSharing(professionalId: string, clientId: string, value: boolean) {
  setState({ ...state, sharing: { ...state.sharing, [sharingKey(professionalId, clientId)]: value } });
}
