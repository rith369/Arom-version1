"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, ChevronRight, ClipboardList, Lock } from "lucide-react";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { useLanguage } from "../language-provider";
import {
  KIND_LABELS,
  MINDGUIDE_TYPE_LABELS,
  cambodiaToday,
  isActive,
  isDoneToday,
  isDueToday,
  mindguideOption,
  scheduleLabel,
  setProgressSharing,
  sharingKey,
  taskHref,
  taskTitle,
  toggleCheckIn,
  useCareStore,
  type CareTask,
} from "./care-store";

export function UserCarePlan() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  const { status, tasks, checkIns, sharing, professionals } = useCareStore("client");
  const [today] = useState(() => cambodiaToday(Date.now()));

  const doneDate = new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  // The API returns only the signed in person's own tasks.
  const mine = tasks;
  const professionalIds = [...new Set(mine.map((task) => task.professionalId))];

  const taskRow = (task: CareTask, past: boolean) => {
    const option = mindguideOption(task);
    const due = !past && isDueToday(task, checkIns, today);
    const done = due && isDoneToday(task, checkIns, today);
    const finished = task.repeat.type === "once" ? checkIns.find((item) => item.taskId === task.id) : undefined;
    return (
      <li key={task.id} className="flex items-start gap-3 rounded-2xl border border-arom-border p-4">
        {due ? (
          <button
            type="button"
            onClick={() => void toggleCheckIn(task, today)}
            aria-pressed={done}
            aria-label={done ? t("សម្គាល់ថាមិនទាន់ធ្វើ", "Mark not done") : t("សម្គាល់ថាបានធ្វើ", "Mark done")}
            className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
              done ? "border-arom bg-arom text-white" : "border-arom-border bg-white text-transparent hover:border-arom"
            }`}
          >
            <Check size={15} strokeWidth={2.5} />
          </button>
        ) : finished ? (
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-arom text-white" aria-hidden="true">
            <Check size={15} strokeWidth={2.5} />
          </span>
        ) : (
          <span className="mt-0.5 size-7 shrink-0" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-ink">
            {taskTitle(task, km)}
            <span className="rounded-full bg-arom-wash px-2 py-0.5 text-[0.7rem] font-medium text-ink-muted">
              {option
                ? km
                  ? MINDGUIDE_TYPE_LABELS[option.type].km
                  : MINDGUIDE_TYPE_LABELS[option.type].en
                : km
                  ? KIND_LABELS[task.kind].km
                  : KIND_LABELS[task.kind].en}
            </span>
            {due && <span className="rounded-full bg-arom-soft px-2 py-0.5 text-[0.7rem] font-semibold text-arom-deep">{t("ថ្ងៃនេះ", "Today")}</span>}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">{scheduleLabel(task, km)}</p>
          {task.note && <p className="mt-1.5 text-sm text-ink">&ldquo;{task.note}&rdquo;</p>}
          {finished && !due && (
            <p className="mt-1.5 text-xs font-medium text-arom">
              {task.kind === "goal" ? t("បានសម្រេច", "Reached") : t("បានធ្វើ", "Done")} {doneDate.format(new Date(`${finished.date}T00:00:00Z`))}
            </p>
          )}
          {task.kind === "reminder" && (
            <p className="mt-1 text-xs text-ink-muted">
              {t("សូមលេបថ្នាំតែតាមវេជ្ជបញ្ជារបស់វេជ្ជបណ្ឌិតរបស់អ្នកប៉ុណ្ណោះ។", "Only take medicine as prescribed by your doctor.")}
            </p>
          )}
        </div>
        {option && !past && (
          <Link href={taskHref(task)} className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-arom hover:underline">
            {t("បើក", "Open")}
            <ChevronRight size={15} aria-hidden="true" />
          </Link>
        )}
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Home" />
      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-arom sm:text-3xl">
            <ClipboardList size={26} aria-hidden="true" />
            {t("ផែនការថែទាំរបស់អ្នក (Care plan)", "Your care plan")}
          </h1>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            {t(
              "កិច្ចការដែលអ្នកជំនាញរបស់អ្នកបានផ្ដល់ឱ្យរវាងវគ្គ។ កិច្ចការថ្ងៃនេះក៏បង្ហាញក្នុងផែនការប្រចាំថ្ងៃរបស់អ្នកដែរ។",
              "Things your professional asked you to try between sessions. Today's tasks also show in Your Plan For Today.",
            )}
          </p>
          {status === "loading" ? (
            <p role="status" className="mt-6 text-sm text-ink-muted">
              {t("កំពុងផ្ទុក...", "Loading...")}
            </p>
          ) : status === "error" ? (
            <p role="alert" className="mt-6 text-sm text-arom-danger">
              {t("មិនអាចផ្ទុកផែនការថែទាំរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។", "We could not load your care plan. Please try again.")}
            </p>
          ) : professionalIds.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-arom-border bg-white p-8 text-center shadow-card">
              <p className="font-medium text-ink">{t("មិនទាន់មានផែនការថែទាំ", "No care plan yet")}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {t("បន្ទាប់ពីវគ្គពិគ្រោះ អ្នកជំនាញរបស់អ្នកអាចផ្ដល់កិច្ចការនៅទីនេះ។", "After a session, your professional can give you tasks here.")}
              </p>
            </div>
          ) : (
            professionalIds.map((professionalId) => {
              const professional = professionals.find((item) => item.slug === professionalId);
              const name = professional ? (km && professional.kmName ? professional.kmName : professional.name) : t("អ្នកជំនាញរបស់អ្នក", "Your professional");
              const theirs = mine.filter((task) => task.professionalId === professionalId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
              const current = theirs.filter((task) => isActive(task, today));
              const past = theirs.filter((task) => !isActive(task, today));
              const clientId = theirs[0]?.clientId ?? "";
              const shares = sharing[sharingKey(professionalId, clientId)] === true;
              return (
                <section key={professionalId} className="mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6">
                  <header className="flex items-center gap-3">
                    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-arom-soft font-semibold text-arom">
                      {professional?.photoUrl ? (
                        <Image src={professional.photoUrl} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <span aria-hidden="true">{name.charAt(0)}</span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-ink-muted">{t("ពី", "From")}</p>
                      <h2 className="truncate text-base font-bold text-ink">{name}</h2>
                    </div>
                    <Link href={`/messages/${professionalId}`} className="text-sm font-semibold text-arom hover:underline">
                      {t("ផ្ញើសារ", "Message")}
                    </Link>
                  </header>

                  <div className="mt-4 flex items-start gap-3 rounded-2xl bg-arom-wash/70 p-3.5">
                    <Lock size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-arom" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{t(`ចែករំលែកវឌ្ឍនភាពជាមួយ ${name}`, `Share my progress with ${name}`)}</p>
                      <p className="mt-0.5 text-xs leading-5 text-ink-muted">
                        {t(
                          "ពេលបើក ពួកគេឃើញតែកិច្ចការណាដែលអ្នកបានធ្វើ។ កំណត់ហេតុ អារម្មណ៍ និងចម្លើយផ្សេងៗរបស់អ្នកមិនត្រូវបានចែករំលែកទេ។",
                          "When on, they see only which of these tasks you ticked. Your journal, mood and other answers are not shared.",
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={shares}
                      aria-label={t(`ចែករំលែកវឌ្ឍនភាពជាមួយ ${name}`, `Share my progress with ${name}`)}
                      onClick={() => void setProgressSharing(professionalId, clientId, !shares)}
                      className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${shares ? "bg-arom" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${shares ? "left-[1.375rem]" : "left-0.5"}`} />
                    </button>
                  </div>

                  {current.length === 0 ? (
                    <p className="mt-4 text-sm text-ink-muted">{t("គ្មានកិច្ចការសកម្មទេ។", "No active tasks.")}</p>
                  ) : (
                    <ul className="mt-4 space-y-3">{current.map((task) => taskRow(task, false))}</ul>
                  )}

                  {past.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-semibold text-arom">
                        {t(`កិច្ចការមុនៗ (${past.length})`, `Past tasks (${past.length})`)}
                      </summary>
                      <ul className="mt-3 space-y-3 opacity-80">{past.map((task) => taskRow(task, true))}</ul>
                    </details>
                  )}
                </section>
              );
            })
          )}
        </div>
      </main>
      <MobileNavigation active="Home" />
    </div>
  );
}
