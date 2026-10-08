"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Phone,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { AuthErrorBody } from "@/lib/auth";
import type { AdminOverview, OpenFlag, OverviewRange, PendingApplication } from "@/lib/admin-overview";
import { useLanguage } from "../../_components/language-provider";
import { SignupsChart } from "./signups-chart";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string; forbidden: boolean }
  | { status: "ready"; data: AdminOverview };

type Severity = "critical" | "warning" | "info";

type AttentionItem = {
  key: string;
  severity: Severity;
  icon: LucideIcon;
  title: string;
  meta: string;
  application?: PendingApplication;
};

const RANGES: OverviewRange[] = [7, 30, 90];
const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

const severityStyles: Record<Severity, { icon: string; chip: string }> = {
  critical: { icon: "bg-arom-danger-soft text-arom-danger", chip: "bg-arom-danger-soft text-arom-danger" },
  warning: { icon: "bg-arom-warning-soft text-arom-warning", chip: "bg-arom-warning-soft text-arom-warning" },
  info: { icon: "bg-arom-wash text-arom", chip: "bg-arom-wash text-arom" },
};

function Panel({ title, action, children, className = "" }: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-arom-line bg-white shadow-panel ${className}`}>
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-arom-border px-5 py-3">
        <h2 className="text-[0.95rem] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Dashboard() {
  const { language } = useLanguage();
  const km = language === "km";
  const t = (khmer: string, english: string) => (km ? khmer : english);
  const locale = km ? "km-KH" : "en-GB";

  const [range, setRange] = useState<OverviewRange>(30);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [confirming, setConfirming] = useState<{ id: string; approve: boolean } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/overview?days=${range}`, { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as AuthErrorBody | null;
          setState({
            status: "error",
            forbidden: response.status === 401 || response.status === 403,
            message: body?.error.message ?? "We could not load the overview.",
          });
          return;
        }
        setState({ status: "ready", data: (await response.json()) as AdminOverview });
      })
      .catch(() => {
        if (active) setState({ status: "error", forbidden: false, message: "You seem to be offline." });
      });
    return () => {
      active = false;
    };
  }, [range, reloadKey]);

  /** Relative to when the server built the overview, so render stays pure. */
  const relative = (iso: string, now: string) => {
    const minutes = Math.max(0, Math.round((new Date(now).getTime() - new Date(iso).getTime()) / 60000));
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (minutes < 60) return rtf.format(-minutes, "minute");
    if (minutes < 60 * 24) return rtf.format(-Math.round(minutes / 60), "hour");
    return rtf.format(-Math.round(minutes / (60 * 24)), "day");
  };

  const flagTitle = (flag: OpenFlag) =>
    ({
      self_harm_risk: t("ហានិភ័យធ្វើបាបខ្លួនឯង (Self harm risk)", "Self harm risk"),
      harmful_content: t("មាតិកាគ្រោះថ្នាក់ (Harmful content)", "Harmful content"),
      harassment: t("ការយាយី (Harassment)", "Harassment"),
      other: t("បញ្ហាផ្សេងទៀត (Other concern)", "Other concern"),
    })[flag.reason];

  const review = async (application: PendingApplication, approve: boolean) => {
    setBusyId(application.id);
    setNotice("");
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as AuthErrorBody | null;
        setNotice(body?.error.message ?? t("មិនអាចរក្សាទុកបានទេ។", "That review could not be saved."));
        return;
      }
      setNotice(
        approve
          ? t(`${application.fullName} ឥឡូវជាអ្នកជំនាញ។`, `${application.fullName} is now a verified professional.`)
          : t(`បានបដិសេធពាក្យស្នើរបស់ ${application.fullName}។`, `${application.fullName}'s application was rejected.`),
      );
      setConfirming(null);
      reload();
    } finally {
      setBusyId(null);
    }
  };

  if (state.status === "loading") {
    return (
      <div aria-busy="true" aria-label={t("កំពុងផ្ទុក", "Loading overview")}>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-arom-soft" />
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <div className="h-56 animate-pulse rounded-2xl bg-white" />
            <div className="h-80 animate-pulse rounded-2xl bg-white" />
          </div>
          <div className="h-[34rem] animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="mx-auto mt-16 max-w-md text-center">
        <ShieldAlert aria-hidden="true" size={32} className="mx-auto text-arom-danger" />
        <h1 className="mt-4 text-xl font-semibold text-ink">
          {state.forbidden ? t("សម្រាប់អ្នកគ្រប់គ្រងតែប៉ុណ្ណោះ", "Admins only") : t("មិនអាចផ្ទុកបានទេ", "Overview did not load")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          {state.forbidden
            ? t("សូមចូលដោយគណនីអ្នកគ្រប់គ្រង។", "Log in with an admin account to see platform data.")
            : state.message}
        </p>
        {!state.forbidden && (
          <button
            type="button"
            onClick={reload}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-arom px-5 py-2.5 text-sm font-medium text-white hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
          >
            <RotateCw aria-hidden="true" size={16} /> {t("ព្យាយាមម្តងទៀត", "Try again")}
          </button>
        )}
      </div>
    );
  }

  const { data } = state;
  const { stats } = data;

  const attention: AttentionItem[] = [
    ...data.flags.map((flag): AttentionItem => ({
      key: `flag-${flag.id}`,
      severity: flag.reason === "self_harm_risk" ? "critical" : "warning",
      icon: flag.reason === "self_harm_risk" ? AlertTriangle : ShieldAlert,
      title: flagTitle(flag),
      meta: `${flag.status === "reviewing" ? t("កំពុងពិនិត្យ", "Reviewing") : t("បើក", "Open")} · ${relative(flag.createdAt, data.generatedAt)}`,
    })),
    ...(data.hotlines.active === 0
      ? [{
          key: "hotlines-none",
          severity: "critical" as const,
          icon: Phone,
          title: t("មិនទាន់មានលេខជំនួយបន្ទាន់ (No crisis hotlines yet)", "No crisis hotlines added yet"),
          meta: t("អ្នកប្រើឃើញលេខទាំងនេះមុនគេពេលមានវិបត្តិ", "People in crisis see these first. Add verified numbers."),
        }]
      : data.hotlines.missingPhone > 0
        ? [{
            key: "hotlines-missing",
            severity: "warning" as const,
            icon: Phone,
            title: t(
              `ខ្សែជំនួយ ${data.hotlines.missingPhone} មិនមានលេខទូរស័ព្ទ`,
              `${data.hotlines.missingPhone} of ${data.hotlines.active} crisis hotlines have no phone number`,
            ),
            meta: t("អ្នកប្រើឃើញលេខទាំងនេះមុនគេពេលមានវិបត្តិ", "People in crisis see these first."),
          }]
        : []),
    ...data.applications.map((application): AttentionItem => ({
      key: `app-${application.id}`,
      severity: "info",
      icon: UserRoundCheck,
      title: `${application.fullName} · ${application.title}`,
      meta: `${t("ពាក្យស្នើអ្នកជំនាញ", "Therapist application")} · ${relative(application.createdAt, data.generatedAt)}`,
      application,
    })),
  ].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const signupTotal = data.signups.reduce((sum, day) => sum + day.count, 0);
  const updated = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: "Asia/Phnom_Penh" }).format(new Date(data.generatedAt));
  const roleRows = [
    { label: t("សមាជិក", "Members"), value: stats.usersByRole.user },
    { label: t("អ្នកជំនាញ", "Professionals"), value: stats.usersByRole.professional },
    { label: t("អ្នកគ្រប់គ្រង", "Admins"), value: stats.usersByRole.admin },
  ];
  const roleMax = Math.max(1, ...roleRows.map((row) => row.value));
  const number = (value: number) => value.toLocaleString(locale);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-[-0.025em] text-ink">
            {t("ទិដ្ឋភាពទូទៅ", "Overview")}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {t(`ធ្វើបច្ចុប្បន្នភាព ${updated} · ម៉ោងកម្ពុជា`, `Updated ${updated}, Cambodia time`)}
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="inline-flex items-center gap-2 rounded-full border border-arom-border bg-white px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
        >
          <RotateCw aria-hidden="true" size={15} /> {t("ផ្ទុកឡើងវិញ", "Refresh")}
        </button>
      </div>

      <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-arom-line bg-white shadow-panel sm:grid-cols-4">
        {[
          { label: t("គណនីសរុប", "Accounts"), value: stats.usersTotal, note: t(`+${number(stats.newUsers7d)} ក្នុង ៧ ថ្ងៃ`, `+${number(stats.newUsers7d)} in 7 days`) },
          { label: t("អ្នកជំនាញដែលបានផ្ទៀងផ្ទាត់", "Verified professionals"), value: stats.verifiedProfessionals, note: t(`${number(stats.pendingApplications)} កំពុងរង់ចាំ`, `${number(stats.pendingApplications)} applications waiting`) },
          { label: t("ការណាត់ជួបខាងមុខ", "Upcoming sessions"), value: stats.upcomingAppointments, note: t(`${number(stats.activeGroups)} ក្រុមគាំទ្រសកម្ម`, `${number(stats.activeGroups)} active support groups`) },
          { label: t("សញ្ញាសុវត្ថិភាពបើក", "Open safety flags"), value: stats.openSafetyFlags, note: t(`${number(stats.suspendedAccounts)} គណនីបានផ្អាក`, `${number(stats.suspendedAccounts)} suspended accounts`), alert: stats.openSafetyFlags > 0 },
        ].map((item) => (
          <div key={item.label} className="min-w-0 border-arom-grid px-5 py-4 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0 [&:not(:first-child)]:border-l [&:nth-child(3)]:border-l-0 sm:[&:nth-child(3)]:border-l">
            <dt className="text-xs font-medium text-ink-muted">{item.label}</dt>
            <dd className={`mt-1 text-2xl font-semibold tabular-nums tracking-[-0.02em] ${item.alert ? "text-arom-danger" : "text-ink"}`}>
              {number(item.value)}
            </dd>
            <dd className="mt-0.5 truncate text-xs text-ink-muted">{item.note}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Panel
            title={t("ត្រូវការការយកចិត្តទុកដាក់", "Needs attention")}
            action={
              attention.length > 0 ? (
                <span className="rounded-full bg-arom-wash px-2.5 py-0.5 text-xs font-semibold tabular-nums text-arom">
                  {number(attention.length)}
                </span>
              ) : undefined
            }
          >
            {attention.length === 0 ? (
              <div className="flex items-center gap-3 px-5 py-8">
                <CheckCircle2 aria-hidden="true" size={22} className="shrink-0 text-arom" />
                <div>
                  <p className="text-sm font-medium text-ink">{t("គ្មានអ្វីត្រូវធ្វើទេ", "All clear")}</p>
                  <p className="text-sm text-ink-muted">
                    {t("គ្មានសញ្ញា ឬពាក្យស្នើកំពុងរង់ចាំ។", "No open flags, waiting applications or hotline gaps.")}
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-arom-border">
                {attention.map((item) => {
                  const Icon = item.icon;
                  const style = severityStyles[item.severity];
                  const app = item.application;
                  const isConfirming = app && confirming?.id === app.id;
                  return (
                    <li key={item.key} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
                        <Icon aria-hidden="true" size={18} />
                      </span>
                      <div className="min-w-[11rem] flex-1">
                        <p className="text-sm font-medium text-ink sm:truncate">
                          {item.severity === "critical" && <span className="sr-only">{t("បន្ទាន់: ", "Urgent: ")}</span>}
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted sm:truncate">{item.meta}</p>
                      </div>
                      {app ? (
                        <div className="ml-[3.25rem] flex items-center gap-2 sm:ml-0">
                          {isConfirming ? (
                            <>
                              <button
                                type="button"
                                disabled={busyId === app.id}
                                onClick={() => review(app, confirming.approve)}
                                className={`rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom ${confirming.approve ? "bg-arom hover:bg-arom-deep" : "bg-arom-danger hover:opacity-90"}`}
                              >
                                {busyId === app.id
                                  ? t("កំពុងរក្សាទុក…", "Saving…")
                                  : confirming.approve
                                    ? t("បញ្ជាក់ការអនុម័ត", "Confirm approve")
                                    : t("បញ្ជាក់ការបដិសេធ", "Confirm reject")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirming(null)}
                                className="rounded-full px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-arom"
                              >
                                {t("បោះបង់", "Cancel")}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setConfirming({ id: app.id, approve: true })}
                                className="rounded-full bg-arom px-4 py-2 text-xs font-semibold text-white hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                              >
                                {t("អនុម័ត", "Approve")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirming({ id: app.id, approve: false })}
                                className="rounded-full border border-arom-border px-4 py-2 text-xs font-semibold text-ink hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom"
                              >
                                {t("បដិសេធ", "Reject")}
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style.chip}`}>
                          {item.severity === "critical" ? t("បន្ទាន់", "Urgent") : t("ពិនិត្យ", "Review")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <p role="status" aria-live="polite" className="empty:hidden border-t border-arom-border px-5 py-3 text-sm text-arom">
              {notice}
            </p>
          </Panel>

          <Panel
            title={t("គណនីថ្មី", "New accounts")}
            action={
              <div role="group" aria-label={t("រយៈពេល", "Time range")} className="inline-flex rounded-full border border-arom-border p-0.5">
                {RANGES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={range === option}
                    onClick={() => setRange(option)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-arom ${range === option ? "bg-arom text-white" : "text-ink-muted hover:text-arom"}`}
                  >
                    {t(`${option} ថ្ងៃ`, `${option}d`)}
                  </button>
                ))}
              </div>
            }
          >
            <div className="px-5 pt-4">
              <p className="text-sm text-ink-muted">
                <span className="text-xl font-semibold tabular-nums tracking-[-0.02em] text-ink">{number(signupTotal)}</span>{" "}
                {t(`គណនីថ្មីក្នុង ${range} ថ្ងៃចុងក្រោយ`, `new accounts in the last ${range} days`)}
              </p>
              <div className="mt-3">
                <SignupsChart
                  data={data.signups}
                  locale={locale}
                  unitLabel={(count) => t(`${number(count)} គណនីថ្មី`, `${number(count)} new ${count === 1 ? "account" : "accounts"}`)}
                  summaryLabel={t(
                    `គណនីថ្មីប្រចាំថ្ងៃ ${range} ថ្ងៃចុងក្រោយ សរុប ${signupTotal}។ ប្រើព្រួញឆ្វេងស្តាំ។`,
                    `Daily new accounts over the last ${range} days, ${signupTotal} in total. Use the left and right arrow keys to read each day.`,
                  )}
                />
              </div>
              {signupTotal === 0 && (
                <p className="pb-2 text-sm text-ink-muted">
                  {t("មិនទាន់មានការចុះឈ្មោះក្នុងរយៈពេលនេះទេ។", "No sign ups in this period yet.")}
                </p>
              )}
            </div>
            <div className="border-t border-arom-border">
              <button
                type="button"
                aria-expanded={showTable}
                onClick={() => setShowTable((value) => !value)}
                className="flex w-full items-center gap-2 px-5 py-3 text-xs font-semibold text-arom hover:bg-arom-wash focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-arom"
              >
                <ChevronDown aria-hidden="true" size={15} className={`transition-transform duration-150 ${showTable ? "rotate-180" : ""}`} />
                {showTable ? t("លាក់តារាង", "Hide table") : t("មើលជាតារាង", "View as table")}
              </button>
              {showTable && (
                <div className="max-h-72 overflow-y-auto border-t border-arom-border">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">{t("គណនីថ្មីប្រចាំថ្ងៃ", "New accounts per day")}</caption>
                    <thead className="sticky top-0 bg-arom-wash text-xs text-ink-muted">
                      <tr>
                        <th scope="col" className="px-5 py-2 font-medium">{t("ថ្ងៃ", "Day")}</th>
                        <th scope="col" className="px-5 py-2 text-right font-medium">{t("គណនីថ្មី", "New accounts")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-arom-border">
                      {[...data.signups].reverse().map((day) => (
                        <tr key={day.date}>
                          <td className="px-5 py-2 text-ink">
                            {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${day.date}T00:00:00Z`))}
                          </td>
                          <td className="px-5 py-2 text-right tabular-nums text-ink">{number(day.count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Panel>
        </div>

        <aside className="min-w-0 space-y-6">
          <Panel title={t("គណនីតាមតួនាទី", "Accounts by role")}>
            <ul className="space-y-3 px-5 py-4">
              {roleRows.map((row) => (
                <li key={row.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm">
                  <span className="truncate text-ink-muted">{row.label}</span>
                  <span className="h-2 rounded-full bg-arom-wash">
                    <span
                      className="block h-2 rounded-full bg-arom"
                      style={{ width: row.value === 0 ? 0 : `${Math.max(4, (row.value / roleMax) * 100)}%` }}
                    />
                  </span>
                  <span className="text-right font-semibold tabular-nums text-ink">{number(row.value)}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={t("សកម្មភាព ៧ ថ្ងៃចុងក្រោយ", "Wellbeing activity, 7 days")}>
            <dl className="divide-y divide-arom-border">
              {[
                { label: t("កំណត់ហេតុប្រចាំថ្ងៃ", "Journal entries"), value: stats.journalEntries7d },
                { label: t("ការត្រួតពិនិត្យរោគសញ្ញា", "Symptom checks"), value: stats.symptomChecks7d },
                { label: t("ការណាត់ជួបបានបញ្ចប់", "Completed sessions"), value: stats.appointmentsByStatus.completed ?? 0 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <dt className="text-ink-muted">{row.label}</dt>
                  <dd className="font-semibold tabular-nums text-ink">{number(row.value)}</dd>
                </div>
              ))}
            </dl>
            <p className="flex gap-2 border-t border-arom-border px-5 py-3 text-xs leading-5 text-ink-muted">
              <ShieldCheck aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-arom" />
              {t(
                "ចំនួនតែប៉ុណ្ណោះ។ អ្នកគ្រប់គ្រងមិនអាចអានកំណត់ហេតុ ចម្លើយ ឬកំណត់ចំណាំវគ្គបានទេ។",
                "Counts only. Admins cannot read journals, answers or session notes.",
              )}
            </p>
          </Panel>

          <Panel title={t("សកម្មភាពអ្នកគ្រប់គ្រងថ្មីៗ", "Recent admin actions")}>
            {data.audit.length === 0 ? (
              <p className="px-5 py-4 text-sm text-ink-muted">{t("មិនទាន់មានសកម្មភាព។", "No admin actions yet.")}</p>
            ) : (
              <ol className="space-y-3 px-5 py-4">
                {data.audit.map((entry) => (
                  <li key={entry.id} className="text-sm">
                    <p className="text-ink">
                      <span className="font-medium">{entry.action.replace(/_/g, " ")}</span>
                      {entry.from && entry.to && (
                        <span className="text-ink-muted"> · {entry.from} → {entry.to}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {entry.adminName ?? t("ប្រព័ន្ធ", "System")} · {relative(entry.createdAt, data.generatedAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
