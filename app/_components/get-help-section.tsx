"use client";

import { Globe, LifeBuoy, Mail, MessageSquare, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "./language-provider";
import {
  SUPPORT_CONTACT,
  type CrisisHelpline,
  type SupportContact,
  activeHelplines,
  smsHref,
  telHref,
} from "./support-contacts";

const actionClass =
  "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-arom-border bg-white px-3.5 text-xs font-semibold text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom";

// Crisis helplines and AROM support, managed by admins in Admin, Settings.
export function GetHelpSection() {
  const { language } = useLanguage();
  const km = language === "km";
  const [helplines, setHelplines] = useState<CrisisHelpline[]>([]);
  const [support, setSupport] = useState<SupportContact>(SUPPORT_CONTACT);

  // Public list, managed by admins. The emergency services message above the
  // list always shows, so nothing is missing while this loads or if it fails.
  useEffect(() => {
    let active = true;
    fetch("/api/crisis-resources")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { helplines: CrisisHelpline[]; supportContact?: SupportContact } | null) => {
        if (!active || !data) return;
        setHelplines(activeHelplines(data.helplines));
        if (data.supportContact) setSupport(data.supportContact);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const hasSupport = Boolean(support.email || support.phone);

  return (
    <section
      aria-labelledby="get-help-title"
      className="mt-6 rounded-3xl border border-arom-border bg-white p-5 shadow-card sm:p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-arom-soft text-arom">
          <LifeBuoy size={22} aria-hidden="true" />
        </div>
        <div>
          <h2 id="get-help-title" className="text-base font-bold text-ink sm:text-lg">
            {km ? "ជំនួយបន្ទាន់ (Get help now)" : "Get help now"}
          </h2>
          <p className="text-xs text-ink-muted sm:text-sm">
            {km
              ? "អ្នកមិនចាំបាច់ដោះស្រាយតែម្នាក់ឯងទេ។"
              : "You do not have to handle this alone."}
          </p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-arom-danger-soft p-3.5 text-sm leading-6 text-ink">
        {km
          ? "ប្រសិនបើអ្នក ឬនរណាម្នាក់កំពុងមានគ្រោះថ្នាក់ឥឡូវនេះ សូមទាក់ទងសេវាសង្គ្រោះបន្ទាន់ក្នុងតំបន់ភ្លាមៗ។"
          : "If you or someone else is in danger right now, contact your local emergency services straight away."}
      </p>

      {helplines.length > 0 && (
        <ul className="mt-4 divide-y divide-arom-border/60">
          {helplines.map((item) => (
            <li key={item.id} className="py-3.5">
              <p className="text-sm font-semibold text-ink">{km ? item.kmName : item.name}</p>
              {(km ? item.kmDescription : item.description) && (
                <p className="text-xs text-ink-muted">{km ? item.kmDescription : item.description}</p>
              )}
              {(km ? item.kmHours || item.hours : item.hours) && (
                <p className="mt-0.5 text-xs text-ink-muted">{km ? item.kmHours || item.hours : item.hours}</p>
              )}
              <div className="mt-2.5 flex flex-wrap gap-2">
                {item.phone && (
                  <a href={telHref(item.phone)} className={actionClass}>
                    <Phone size={14} aria-hidden="true" />
                    {km ? "ហៅ" : "Call"} {item.phone}
                  </a>
                )}
                {item.sms && (
                  <a href={smsHref(item.sms)} className={actionClass}>
                    <MessageSquare size={14} aria-hidden="true" />
                    {km ? "ផ្ញើសារ" : "Text"} {item.sms}
                  </a>
                )}
                {item.website && (
                  <a href={item.website} target="_blank" rel="noopener noreferrer" className={actionClass}>
                    <Globe size={14} aria-hidden="true" />
                    {km ? "គេហទំព័រ" : "Website"}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasSupport && (
        <div className="mt-4 border-t border-arom-border/60 pt-4">
          <p className="text-sm font-semibold text-ink">
            {km ? "ជំនួយពី AROM" : "AROM support"}
          </p>
          <p className="text-xs text-ink-muted">
            {km
              ? "សម្រាប់សំណួរអំពីកម្មវិធី មិនមែនសម្រាប់ករណីបន្ទាន់ទេ។"
              : "For questions about the app, not for emergencies."}
            {(km ? support.kmHours || support.hours : support.hours) &&
              ` ${km ? support.kmHours || support.hours : support.hours}`}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {support.email && (
              <a href={`mailto:${support.email}`} className={actionClass}>
                <Mail size={14} aria-hidden="true" />
                {support.email}
              </a>
            )}
            {support.phone && (
              <a href={telHref(support.phone)} className={actionClass}>
                <Phone size={14} aria-hidden="true" />
                {support.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
