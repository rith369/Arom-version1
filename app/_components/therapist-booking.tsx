"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  Clock3,
  StickyNote,
  UserRound,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  getMeetingTypeLabel,
  getPeriodLabel,
  meetingTypes,
  timePeriods,
  type BookingDay,
  type MeetingType,
} from "@/lib/booking";
import {
  getTherapistName,
  getTherapistRole,
  type Therapist,
} from "@/lib/therapists";
import { DesktopNavigation } from "./app-navigation";
import { BookingComplete } from "./booking-complete";
import { useLanguage } from "./language-provider";

type Step = "meeting" | "time" | "review";

function getSteps(km: boolean): { id: Step; title: string; description: string }[] {
  return [
    {
      id: "meeting",
      title: km ? "តើអ្នកចង់ជួបពិគ្រោះតាមរបៀបណា?" : "How would you like to meet?",
      description: km
        ? "ជ្រើសរើសទម្រង់នៃការប្រឹក្សាដែលសមស្របសម្រាប់អ្នក។"
        : "Choose a session type that works for you.",
    },
    {
      id: "time",
      title: km ? "ជ្រើសរើសកាលបរិច្ឆេទ និងពេលវេលា" : "Choose a Date & Time",
      description: km
        ? "ជ្រើសរើសថ្ងៃ និងម៉ោងដែលស្របតាមកាលវិភាគរបស់អ្នក។"
        : "Pick a day and a time that suits your schedule.",
    },
    {
      id: "review",
      title: km ? "ពិនិត្យព័ត៌មានណាត់ជួបរបស់អ្នក" : "Review Your Appointment",
      description: km
        ? "ផ្ទៀងផ្ទាត់ព័ត៌មានលម្អិតមុនពេលបញ្ជាក់ការកក់។"
        : "Check the details before you confirm.",
    },
  ];
}

const meetingIcons: Record<MeetingType, LucideIcon> = {
  Online: Video,
  "In-person": UserRound,
};

const noteLimit = 500;
const easeOut = [0.23, 1, 0.32, 1] as const;

const optionClass = (selected: boolean) =>
  `cursor-pointer border transition-[background-color,border-color,box-shadow] duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-arom ${
    selected
      ? "border-arom bg-arom/12 shadow-[0_0_0_1px_var(--arom)]"
      : "border-[#d5dedb] bg-white hover:border-arom/45"
  }`;

function MeetingStep({
  options,
  value,
  onChange,
  km,
}: {
  options: MeetingType[];
  value: MeetingType | null;
  onChange: (value: MeetingType) => void;
  km: boolean;
}) {
  return (
    <div>
      <fieldset className="grid gap-3.5">
        <legend className="sr-only">{km ? "ទម្រង់នៃការប្រឹក្សា" : "Session type"}</legend>
        {meetingTypes
          .filter((meeting) => options.includes(meeting.type))
          .map((meeting) => {
            const selected = value === meeting.type;
            return (
              <label
                key={meeting.type}
                className={`grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-4 rounded-xl p-4 shadow-[0_6px_18px_rgba(20,34,31,0.08)] sm:p-5 ${optionClass(selected)}`}
              >
                <input
                  type="radio"
                  name="meeting-type"
                  value={meeting.type}
                  checked={selected}
                  onChange={() => onChange(meeting.type)}
                  className="sr-only"
                />
                <Image src={meeting.image} alt="" width={72} height={72} className="size-16 sm:size-[4.5rem]" unoptimized />
                <span className="min-w-0">
                  <span className="block text-xl font-semibold tracking-[-0.02em] text-ink">
                    {km ? meeting.kmTitle : meeting.title}
                  </span>
                  <span className="mt-1 block text-[0.82rem] leading-5 text-ink-muted">
                    {km ? meeting.kmDescription : meeting.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex size-6.5 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                    selected ? "border-arom" : "border-ink-muted/70"
                  }`}
                >
                  <span
                    className={`size-3 rounded-full bg-arom transition-transform duration-150 ease-(--ease-out) ${
                      selected ? "scale-100" : "scale-0"
                    }`}
                  />
                </span>
              </label>
            );
          })}
      </fieldset>

      <div className="mt-7 flex items-center gap-4 rounded-xl bg-arom-accent/16 px-5 py-4">
        <Image src="/booking/privacy-shield.svg" alt="" width={41} height={41} className="size-10 shrink-0" unoptimized />
        <div>
          <p className="text-base font-semibold text-arom">
            {km ? "ភាពឯកជនរបស់អ្នកត្រូវបានការពារយ៉ាងម៉ត់ចត់" : "Your privacy is protected."}
          </p>
          <p className="mt-0.5 text-sm font-light text-arom">
            {km
              ? "រាល់ការពិគ្រោះទាំងអស់ត្រូវបានរក្សាជាការសម្ងាត់ និងមានសុវត្ថិភាពខ្ពស់។"
              : "All sessions are confidential and secure."}
          </p>
        </div>
      </div>
    </div>
  );
}

function TimeStep({
  days,
  date,
  time,
  onDateChange,
  onTimeChange,
  km,
}: {
  days: BookingDay[];
  date: string;
  time: string | null;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  km: boolean;
}) {
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-base font-medium text-ink">
          {km ? "ជ្រើសរើសកាលបរិច្ឆេទ" : "Select a date"}
        </legend>
        <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <div className="grid min-w-[20rem] grid-cols-5 gap-2">
            {days.map((day) => {
              const selected = date === day.value;
              return (
                <label
                  key={day.value}
                  className={`flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-lg px-1 text-center ${optionClass(selected)}`}
                >
                  <input
                    type="radio"
                    name="booking-date"
                    value={day.value}
                    checked={selected}
                    onChange={() => onDateChange(day.value)}
                    className="sr-only"
                  />
                  <span className="text-[0.82rem] font-medium text-ink">
                    {km ? (day.kmLabel || day.label) : day.label}
                  </span>
                  <span className="text-[0.7rem] font-light text-ink">
                    {km ? (day.kmWeekday || day.weekday) : day.weekday}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-base font-medium text-ink">
          {km ? "ពេលវេលាដែលអាចជ្រើសរើសបាន" : "Available times"}
        </legend>
        <div className="mt-2 space-y-4">
          {timePeriods.map((period) => (
            <div key={period.label} role="group" aria-labelledby={`period-${period.label}`}>
              <p id={`period-${period.label}`} className="text-[0.94rem] font-medium text-ink">
                {getPeriodLabel(period.label, km)}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-2.5">
                {period.times.map((slot) => {
                  const selected = time === slot;
                  return (
                    <label
                      key={slot}
                      className={`flex h-10 items-center justify-center rounded-lg text-[0.95rem] text-ink ${optionClass(selected)}`}
                    >
                      <input
                        type="radio"
                        name="booking-time"
                        value={slot}
                        checked={selected}
                        onChange={() => onTimeChange(slot)}
                        className="sr-only"
                      />
                      {slot}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function ReviewStep({
  therapist,
  details,
  note,
  onNoteChange,
  km,
}: {
  therapist: Therapist;
  details: { icon: LucideIcon; label: string; value: string }[];
  note: string;
  onNoteChange: (value: string) => void;
  km: boolean;
}) {
  const therapistName = getTherapistName(therapist, km);
  const therapistRole = getTherapistRole(therapist, km);

  return (
    <div className="rounded-xl border border-[#d9d9d9] bg-white p-4 shadow-[0_8px_24px_rgba(20,34,31,0.1)] sm:p-5">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative h-[4.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-md bg-arom-soft">
          <Image
            src={therapist.image}
            alt={km ? `រូបថតរបស់ ${therapistName}` : `Portrait of ${therapist.name}`}
            fill
            sizes="88px"
            className="object-cover"
            style={{ objectPosition: therapist.imagePosition }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-ink">{therapistName}</p>
          <p className="mt-1 text-sm font-light text-ink">{therapistRole}</p>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-[#d9d9d9] px-1">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2.5">
            <Icon aria-hidden="true" size={18} className="shrink-0 text-arom" />
            <dt className="text-sm text-ink">{label}</dt>
            <dd className="ml-auto text-sm font-light text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-[#d9d9d9] px-1 pt-3">
        <label htmlFor="booking-note" className="flex items-center gap-3 text-sm font-light text-ink">
          <StickyNote aria-hidden="true" size={17} className="shrink-0 text-arom" />
          {km ? "កំណត់សម្គាល់សម្រាប់អ្នកជំនាញ (មិនបង្ខំ)" : "Note for Therapist (Optional)"}
        </label>
        <textarea
          id="booking-note"
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          maxLength={noteLimit}
          rows={3}
          placeholder={
            km
              ? "ចែករំលែកចំណុចដែលអ្នកចង់ឱ្យអ្នកជំនាញដឹងជាមុន (ឧទាហរណ៍៖ ប្រធានបទដែលអ្នកចង់ពិភាក្សា)"
              : "Share anything you would like the therapist to know (e.g., what you'd like to talk about)"
          }
          aria-describedby="booking-note-count"
          className="mt-3 w-full resize-none rounded-lg border border-[#cfd8d5] bg-white px-3.5 py-3 text-sm leading-5 text-ink shadow-[0_2px_6px_rgba(20,34,31,0.06)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#8a9592] focus:border-arom focus:ring-4 focus:ring-arom/10"
        />
        <p id="booking-note-count" className="mt-1 text-right text-xs text-ink-muted">
          {note.length}/{noteLimit}
        </p>
      </div>
    </div>
  );
}

export function TherapistBooking({ therapist, days }: { therapist: Therapist; days: BookingDay[] }) {
  const { language } = useLanguage();
  const km = language === "km";
  const therapistName = getTherapistName(therapist, km);
  const therapistRole = getTherapistRole(therapist, km);

  const meetingOptions = meetingTypes
    .map((meeting) => meeting.type)
    .filter((type) => therapist.sessionOptions.includes(type));

  const [stepIndex, setStepIndex] = useState(0);
  const [meeting, setMeeting] = useState<MeetingType | null>(
    meetingOptions.length === 1 ? meetingOptions[0] : null,
  );
  const [date, setDate] = useState(days[0]?.value ?? "");
  const [time, setTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  const steps = getSteps(km);
  const step = steps[stepIndex];
  const selectedDay = days.find((day) => day.value === date);
  const canContinue =
    (step.id === "meeting" && meeting !== null) || (step.id === "time" && Boolean(date && time));

  // Move focus to the new step's heading so screen readers announce it.
  useEffect(() => {
    if (!hasNavigated.current) return;
    headingRef.current?.focus();
  }, [stepIndex]);

  const goTo = (index: number) => {
    hasNavigated.current = true;
    setStepIndex(index);
  };

  const selectedDateLabel = km
    ? (selectedDay?.kmLongLabel || selectedDay?.longLabel || "")
    : (selectedDay?.longLabel || "");

  const reviewDetails = [
    { icon: CalendarDays, label: km ? "កាលបរិច្ឆេទ" : "Date", value: selectedDateLabel },
    { icon: Clock3, label: km ? "ពេលវេលា" : "Time", value: time ?? "" },
    {
      icon: meeting ? meetingIcons[meeting] : Video,
      label: km ? "ទម្រង់នៃការប្រឹក្សា" : "Session Type",
      value: getMeetingTypeLabel(meeting, km),
    },
  ];

  const completeDetails = [
    { icon: UserRound, label: km ? "អ្នកជំនាញ" : "Therapist", value: therapistName },
    { icon: CalendarDays, label: km ? "កាលបរិច្ឆេទ" : "Date", value: selectedDateLabel },
    { icon: Clock3, label: km ? "ពេលវេលា" : "Time", value: time ?? "" },
    {
      icon: meeting === "Online" ? Video : UsersRound,
      label: km ? "ទម្រង់នៃការប្រឹក្សា" : "Session Type",
      value: getMeetingTypeLabel(meeting, km),
    },
  ];

  const backButtonClass =
    "-ml-2 flex size-11 items-center justify-center rounded-full text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom";

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Professional" />

      <main className="min-w-0 bg-white lg:bg-canvas">
        <div className="mx-auto flex min-h-dvh w-full max-w-[64rem] flex-col px-4 pt-5 sm:px-8 lg:min-h-0 lg:px-10 lg:py-8 xl:px-14">
          <div className="flex items-center justify-between gap-4">
            {stepIndex === 0 || isComplete ? (
              <Link
                href={`/professional/${therapist.slug}`}
                aria-label={km ? `ត្រឡប់ទៅប្រវត្តិរូប ${therapistName}` : `Back to ${therapist.name}'s profile`}
                className={backButtonClass}
              >
                <ChevronLeft aria-hidden="true" size={28} strokeWidth={2.4} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => goTo(stepIndex - 1)}
                aria-label={km ? "ត្រឡប់ទៅជំហានមុន" : "Previous step"}
                className={backButtonClass}
              >
                <ChevronLeft aria-hidden="true" size={28} strokeWidth={2.4} />
              </button>
            )}

            <ol
              aria-label={km ? "ដំណើរការកក់ការណាត់ជួប" : "Booking progress"}
              className={`flex items-center gap-1.5 ${isComplete ? "invisible" : ""}`}
            >
              {steps.map((item, index) => (
                <li
                  key={item.id}
                  aria-current={index === stepIndex ? "step" : undefined}
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ease-(--ease-out) ${
                    index === stepIndex ? "w-7 bg-arom" : index < stepIndex ? "w-3 bg-arom/55" : "w-3 bg-arom-border"
                  }`}
                >
                  <span className="sr-only">
                    {km
                      ? `ជំហានទី ${index + 1} នៃ ${steps.length}: ${item.title}${index < stepIndex ? " (បានបញ្ចប់)" : ""}`
                      : `Step ${index + 1} of ${steps.length}: ${item.title}${index < stepIndex ? " (completed)" : ""}`}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {isComplete ? (
            <div className="mt-2 pb-[calc(2rem+env(safe-area-inset-bottom))] lg:mt-4 lg:rounded-3xl lg:bg-white lg:px-8 lg:py-10 lg:shadow-card">
              <BookingComplete details={completeDetails} viewHref="/" />
            </div>
          ) : (
            <div className="mt-4 grid flex-1 gap-8 lg:mt-8 lg:flex-none lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start xl:gap-12">
              <div className="flex min-w-0 flex-col lg:rounded-3xl lg:bg-white lg:p-8 lg:shadow-card">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.section
                    key={step.id}
                    aria-labelledby="booking-step-title"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateX(12px)" }}
                    animate={{ opacity: 1, transform: "translateX(0)" }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateX(-12px)" }}
                    transition={{ duration: shouldReduceMotion ? 0.12 : 0.2, ease: easeOut }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-arom-accent">
                      {km
                        ? `ជំហានទី ${stepIndex + 1} នៃ ${steps.length}`
                        : `Step ${stepIndex + 1} of ${steps.length}`}
                    </p>
                    <h1
                      id="booking-step-title"
                      ref={headingRef}
                      tabIndex={-1}
                      className="mt-1.5 text-[1.6rem] font-semibold leading-tight tracking-[-0.03em] text-ink outline-none sm:text-[1.75rem]"
                    >
                      {step.title}
                    </h1>
                    <p className="mt-1.5 text-[0.95rem] font-light text-ink">{step.description}</p>

                    <div className="mt-6">
                      {step.id === "meeting" && (
                        <MeetingStep
                          options={meetingOptions}
                          value={meeting}
                          onChange={setMeeting}
                          km={km}
                        />
                      )}
                      {step.id === "time" && (
                        <TimeStep
                          days={days}
                          date={date}
                          time={time}
                          onDateChange={setDate}
                          onTimeChange={setTime}
                          km={km}
                        />
                      )}
                      {step.id === "review" && (
                        <ReviewStep
                          therapist={therapist}
                          details={reviewDetails}
                          note={note}
                          onNoteChange={setNote}
                          km={km}
                        />
                      )}
                    </div>
                  </motion.section>
                </AnimatePresence>

                <div className="sticky bottom-0 -mx-4 mt-auto bg-white px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:mt-8 lg:p-0">
                  {step.id === "review" ? (
                    <button
                      type="button"
                      onClick={() => setIsComplete(true)}
                      className="flex h-[3.4rem] w-full items-center justify-center rounded-2xl bg-arom px-5 text-lg font-bold text-white transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                    >
                      {km ? "បញ្ជាក់ការកក់ណាត់ជួប" : "Confirm Appointment"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canContinue}
                      onClick={() => goTo(stepIndex + 1)}
                      className="flex h-[3.4rem] w-full items-center justify-center rounded-2xl bg-arom px-5 text-lg font-bold text-white transition-colors duration-150 hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom disabled:bg-[#b9c9c4] disabled:hover:bg-[#b9c9c4]"
                    >
                      {km ? "បន្តទៅមុខទៀត" : "Continue"}
                    </button>
                  )}
                </div>
              </div>

              <aside aria-label={km ? "ព័ត៌មានសង្ខេបអ្នកជំនាញ" : "Selected therapist"} className="hidden rounded-3xl bg-white p-5 shadow-card lg:block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-arom-soft">
                  <Image
                    src={therapist.image}
                    alt=""
                    fill
                    sizes="19rem"
                    className="object-cover"
                    style={{ objectPosition: therapist.imagePosition }}
                  />
                </div>
                <p className="mt-4 text-lg font-bold tracking-[-0.02em] text-ink">{therapistName}</p>
                <p className="text-sm text-ink-muted">{therapistRole}</p>
                <dl className="mt-4 space-y-2.5 border-t border-arom-border pt-4 text-sm">
                  {reviewDetails.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <Icon aria-hidden="true" size={16} className="shrink-0 text-arom" />
                      <dt className="text-ink-muted">{label}</dt>
                      <dd className="ml-auto font-medium text-ink">
                        {value || (km ? "មិនទាន់ជ្រើសរើស" : "Not selected")}
                      </dd>
                    </div>
                  ))}
                </dl>
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
