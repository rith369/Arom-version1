"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import {
  countActiveFilters,
  emptyFilters,
  getAvailabilityLabel,
  getSpecialtyLabel,
  getTherapistName,
  getTherapistRole,
  matchesFilters,
  therapists,
  type Therapist,
  type TherapistFilters,
} from "@/lib/therapists";
import { AromBrand, DesktopNavigation, MobileNavigation } from "./app-navigation";
import { useLanguage } from "./language-provider";
import { TherapistFilter } from "./therapist-filter";
import { useSidebar } from "./sidebar-provider";
import { UserAvatar } from "./user-avatar";

const locations = [
  { en: "Phnom Penh, Cambodia", km: "ភ្នំពេញ, កម្ពុជា (Phnom Penh)" },
  { en: "Siem Reap, Cambodia", km: "សៀមរាប, កម្ពុជា (Siem Reap)" },
  { en: "Online sessions", km: "ការប្រឹក្សាតាមអនឡាញ (Online Sessions)" },
];
const easeOut = [0.23, 1, 0.32, 1] as const;

function TherapistCard({ therapist }: { therapist: Therapist }) {
  const { language } = useLanguage();
  const km = language === "km";
  const name = getTherapistName(therapist, km);
  const role = getTherapistRole(therapist, km);
  const availability = getAvailabilityLabel(therapist.availability, km);

  return (
    <article>
      <Link
        href={`/professional/${therapist.slug}`}
        aria-label={`View ${name}'s profile`}
        className="group grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 rounded-2xl border border-arom-border bg-white p-3.5 shadow-card transition-[border-color,box-shadow] duration-150 hover:border-arom/30 hover:shadow-[0_20px_48px_rgba(25,87,72,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:p-4 xl:block xl:overflow-hidden xl:p-0"
      >
      <div className="relative h-[5.2rem] overflow-hidden rounded-xl bg-arom-soft sm:h-[6.2rem] xl:h-48 xl:w-full xl:rounded-none">
        <Image
          src={therapist.image}
          alt={`Portrait of ${name}`}
          fill
          sizes="(max-width: 639px) 72px, (max-width: 1279px) 88px, 30vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.015]"
          style={{ objectPosition: therapist.imagePosition }}
        />
      </div>

      <div className="min-w-0 xl:p-5">
        <h3 className="truncate text-[0.98rem] font-bold tracking-[-0.015em] text-ink sm:text-base xl:text-lg">
          {name}
        </h3>
        <p className="mt-0.5 text-xs font-medium text-ink-muted sm:text-sm">{role}</p>
        <p className="mt-1 line-clamp-1 text-[0.72rem] leading-5 text-ink-muted sm:text-xs xl:line-clamp-2">
          {km
            ? `ជំនាញឯកទេសលើ ${therapist.specialties.map((s) => getSpecialtyLabel(s, km)).join(", ")}`
            : `Specializes in ${therapist.specialties.join(", ")}`}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {therapist.specialties.map((specialty) => (
            <span
              key={specialty}
              className="rounded-full bg-arom-soft px-2.5 py-1 text-[0.66rem] font-medium leading-none text-arom-deep sm:text-[0.7rem]"
            >
              {getSpecialtyLabel(specialty, km)}
            </span>
          ))}
        </div>

        <p className="mt-2.5 flex items-center gap-2 text-[0.7rem] font-semibold text-arom sm:text-xs">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-arom-accent" />
          {availability}
        </p>
      </div>
      </Link>
    </article>
  );
}

export function TherapistDirectory() {
  const { language } = useLanguage();
  const sidebar = useSidebar();
  const km = language === "km";
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(locations[0].en);
  const [filters, setFilters] = useState<TherapistFilters>(emptyFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const activeFilterCount = countActiveFilters(filters);
  const selectedLocationObj = locations.find((l) => l.en === location) || locations[0];

  const filteredTherapists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return therapists.filter(
      (therapist) =>
        matchesFilters(therapist, filters) &&
        [
          therapist.name,
          therapist.kmName || "",
          therapist.role,
          therapist.kmRole || "",
          ...therapist.specialties,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
    );
  }, [query, filters]);

  const clearAll = () => {
    setQuery("");
    setFilters(emptyFilters);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.055 },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      transform: shouldReduceMotion ? "translateY(0)" : "translateY(8px)",
    },
    visible: {
      opacity: 1,
      transform: "translateY(0)",
    },
  };

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="Professional" />

      <div className="min-w-0">
        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto min-h-screen w-full max-w-[78rem] px-4 pb-28 pt-5 sm:px-8 sm:pt-7 lg:px-10 lg:pb-12 lg:pt-8 xl:px-12"
        >
          <motion.header variants={itemVariants} className="flex items-center justify-between gap-3">
            <div className="lg:hidden">
              <AromBrand />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-arom-accent">
                {km ? "បណ្តាញថែទាំសុខភាពផ្លូវចិត្ត (Care Network)" : "Trusted care network"}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {km ? "ការគាំទ្រដែលត្រូវនឹងតម្រូវការរបស់អ្នក" : "Support that fits your needs"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={sidebar.openSidebar}
                aria-label={km ? "បើកម៉ឺនុយរុករក" : "Open sidebar navigation"}
                className="flex size-9 sm:size-10 items-center justify-center rounded-2xl bg-arom-soft border border-arom/30 shadow-[0_2px_10px_rgba(31,111,91,0.12)] text-arom transition-all hover:bg-arom-soft/80 active:scale-95 cursor-pointer lg:hidden"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1f6f5b"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </button>
              <Link
                href="/profile"
                aria-label="Open profile and settings"
                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-arom"
              >
                <UserAvatar className="size-10 rounded-full ring-2 ring-white shadow-[0_5px_18px_rgba(20,75,63,0.15)] text-xs" />
              </Link>
            </div>
          </motion.header>

          <motion.section variants={itemVariants} className="mt-8 lg:mt-12">
            <div className="max-w-2xl">
              <p className="hidden text-xs font-bold uppercase tracking-[0.16em] text-arom-accent lg:block">
                {km ? "បញ្ជីអ្នកជំនាញ (Professional Directory)" : "Professional directory"}
              </p>
              <h1 className="text-[1.7rem] font-bold leading-tight tracking-[-0.04em] text-ink sm:text-3xl lg:mt-2 lg:text-[2.6rem]">
                {km ? "ស្វែងរកអ្នកជំនាញសុខភាពផ្លូវចិត្ត (Find Professional)" : "Find Professional Support"}
              </h1>
              <p className="mt-2 hidden max-w-xl text-sm leading-6 text-ink-muted sm:block">
                {km
                  ? "ភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកជំនាញដែលមានបទពិសោធន៍ និងភាពទំនេរស្របតាមតម្រូវការរបស់អ្នកថ្ងៃនេះ។"
                  : "Connect with a professional whose experience and availability match what you need today."}
              </p>
            </div>

            <div className="mt-5 grid gap-3 lg:mt-7 grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1.6fr)_auto_minmax(18rem,0.8fr)]">
              <label className="relative block">
                <span className="sr-only">Search professionals</span>
                <Search
                  aria-hidden="true"
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={km ? "ស្វែងរកឈ្មោះអ្នកជំនាញ ឬជំនាញឯកទេស..." : "Search professional ..."}
                  className="h-12 w-full rounded-xl border border-arom-border bg-white pl-12 pr-11 text-sm text-ink shadow-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-muted/72 focus:border-arom focus:ring-4 focus:ring-arom/10"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted hover:bg-arom-wash hover:text-arom focus-visible:outline-2 focus-visible:outline-arom"
                  >
                    <X aria-hidden="true" size={17} />
                  </button>
                )}
              </label>

              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                aria-haspopup="dialog"
                aria-label={activeFilterCount ? `Filters, ${activeFilterCount} active` : "Filters"}
                className={`relative flex h-12 items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-semibold shadow-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom sm:px-4 ${
                  activeFilterCount
                    ? "border-arom bg-arom text-white hover:bg-arom-deep"
                    : "border-arom-border bg-white text-arom hover:bg-arom-wash"
                }`}
              >
                <SlidersHorizontal aria-hidden="true" size={19} />
                <span className="hidden sm:inline">{km ? "ចម្រោះ (Filters)" : "Filters"}</span>
                {activeFilterCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-arom-accent text-[0.68rem] font-bold text-white ring-2 ring-canvas sm:static sm:size-auto sm:min-w-5 sm:bg-white/20 sm:px-1.5 sm:py-0.5 sm:ring-0"
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <label className="relative col-span-2 block lg:col-span-1">
                <span className="sr-only">Choose location</span>
                <MapPin
                  aria-hidden="true"
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-arom"
                />
                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-arom-border bg-white pl-12 pr-20 text-sm text-ink shadow-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-arom focus:ring-4 focus:ring-arom/10"
                >
                  {locations.map((item) => (
                    <option key={item.en} value={item.en}>
                      {km ? item.km : item.en}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-arom underline decoration-arom/30 underline-offset-4">
                  {km ? "ប្តូរ" : "Change"}
                </span>
              </label>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} aria-labelledby="recommended-title" className="mt-6 lg:mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-arom-accent lg:block">
                  {km ? `ទំនេរនៅក្បែរ ${selectedLocationObj.km.split(",")[0]}` : `Available near ${location.split(",")[0]}`}
                </p>
                <h2 id="recommended-title" className="text-xl font-bold tracking-[-0.025em] text-ink lg:mt-1.5 lg:text-2xl">
                  {km ? "ណែនាំសម្រាប់អ្នក (Recommended)" : "Recommended for You"}
                </h2>
              </div>
              <span className="rounded-full bg-arom-soft px-3 py-1 text-xs font-semibold text-arom">
                {km ? `ត្រូវគ្នា ${filteredTherapists.length}` : `${filteredTherapists.length} ${filteredTherapists.length === 1 ? "match" : "matches"}`}
              </span>
            </div>

            {filteredTherapists.length > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                {filteredTherapists.map((therapist) => (
                  <motion.div key={therapist.name} variants={itemVariants}>
                    <TherapistCard therapist={therapist} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-dashed border-arom/30 bg-white px-6 py-14 text-center">
                <p className="font-semibold text-ink">
                  {km
                    ? query
                      ? `រកមិនឃើញអ្នកជំនាញដែលត្រូវនឹង "${query}" ឡើយ`
                      : "រកមិនឃើញអ្នកជំនាញដែលត្រូវនឹងលក្ខខណ្ឌចម្រោះនេះទេ"
                    : query
                      ? `No professionals match “${query}”`
                      : "No professionals match these filters"}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {km
                    ? "សូមសាកល្បងកាត់បន្ថយលក្ខខណ្ឌចម្រោះ ឬស្វែងរកតាមឈ្មោះ ឬជំនាញឯកទេសដូចជា ការថប់បារម្ភ..."
                    : "Try fewer filters, or search a name, role, or specialty such as anxiety."}
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 rounded-full bg-arom px-5 py-2.5 text-sm font-semibold text-white hover:bg-arom-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
                >
                  {km ? "សម្អាតការស្វែងរក និងលក្ខខណ្ឌចម្រោះ (Clear)" : "Clear search and filters"}
                </button>
              </div>
            )}
          </motion.section>
        </motion.main>
      </div>

      <MobileNavigation active="Professional" />

      <TherapistFilter
        open={isFilterOpen}
        filters={filters}
        onClose={() => setIsFilterOpen(false)}
        onApply={(nextFilters) => {
          setFilters(nextFilters);
          setIsFilterOpen(false);
        }}
      />
    </div>
  );
}
