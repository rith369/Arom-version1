"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { ChevronLeft, Search, MapPin, Heart, Building2, Compass, LocateFixed, Hospital } from "lucide-react";
import { distanceKm, formatDistance, type Clinic } from "./clinic-data";
import type { UserLocation } from "./use-user-location";
import { useLanguage } from "../language-provider";
import { UpStudentBadge } from "../up-student/up-badge";

// The real map (OpenStreetMap through Leaflet) only runs in the browser.
const ClinicMap = dynamic(() => import("./clinic-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-arom-wash" />,
});

/** A "Call to book" label for real places AROM is not connected to. */
export function ListedBadge({ km }: { km: boolean }) {
  return (
    <span
      title={km ? "មិនទាន់ភ្ជាប់ជាមួយ AROM ទេ។ សូមទូរស័ព្ទទៅពួកគេដោយផ្ទាល់។" : "Not connected to AROM. Call them directly."}
      className="inline-flex w-fit items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[0.68rem] font-semibold text-sky-800"
    >
      {km ? "ទូរស័ព្ទដើម្បីកក់ (Call to book)" : "Call to book"}
    </span>
  );
}

/** The clinic's photo, or a calm icon when we have no real photo of the place. */
export function ClinicPhoto({
  clinic,
  sizes,
  className = "",
  priority = false,
}: {
  clinic: Clinic;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  if (!clinic.image) {
    const Icon = clinic.category === "hospital" ? Hospital : Building2;
    return (
      <div className="flex h-full w-full items-center justify-center bg-arom-soft text-arom/70" aria-hidden="true">
        <Icon className="size-1/3 max-h-16 max-w-16" strokeWidth={1.6} />
      </div>
    );
  }
  return (
    <Image
      src={clinic.image}
      alt={clinic.name}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}

type FilterType = "all" | "nearby" | "clinic" | "hospital";

interface ClinicListViewProps {
  // AROM clinics first, then listed real places; already filtered for UP only clinics.
  clinics: Clinic[];
  onSelectClinic: (clinic: Clinic) => void;
  location: UserLocation;
  onRequestLocation: () => void;
}

export function ClinicListView({ clinics, onSelectClinic, location, onRequestLocation }: ClinicListViewProps) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const me = location.status === "ready" ? location.coords : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("nearby");

  // Filtered and searched clinics
  const filteredClinics = useMemo(() => {
    let list = [...clinics];

    // Filter type
    if (activeFilter === "clinic") {
      list = list.filter((c) => c.category === "clinic");
    } else if (activeFilter === "hospital") {
      list = list.filter((c) => c.category === "hospital");
    }

    // The UP clinic always comes first. The rest go closest first, from the
    // person's real location, or keep their order when we have no location.
    list.sort((a, b) => {
      const upFirst = Number(!!b.upStudentsOnly) - Number(!!a.upStudentsOnly);
      if (upFirst !== 0 || !me) return upFirst;
      return distanceKm(me, a) - distanceKm(me, b);
    });

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameKm.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [activeFilter, searchQuery, clinics, me]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar matching Figma */}
      <header className="flex items-center gap-3 pt-1">
        <Link
          href="/professional"
          aria-label={isKm ? "ត្រឡប់ក្រោយ" : "Go back"}
          className="flex size-10 items-center justify-center rounded-xl text-arom hover:bg-arom-soft/60 transition-colors focus-visible:outline-2 focus-visible:outline-arom"
        >
          <ChevronLeft size={24} strokeWidth={2.4} />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-arom">
          {isKm ? "ស្វែងរកគ្លីនិក និងមន្ទីរពេទ្យ" : "Find Clinic & Hospital"}
        </h1>
      </header>

      {/* Search Bar matching Figma */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-muted">
          <Search size={18} strokeWidth={2} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            isKm
              ? "ស្វែងរកគ្លីនិក មន្ទីរពេទ្យ ឬសេវាកម្ម..."
              : "Search clinic, hospital, or service..."
          }
          className="w-full rounded-2xl border border-arom-border bg-white py-3 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted/80 shadow-2xs transition-all focus:border-arom focus:outline-none focus:ring-2 focus:ring-arom/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-ink-muted hover:text-arom"
          >
            {isKm ? "សម្អាត" : "Clear"}
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* All pill */}
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer select-none shrink-0 ${
            activeFilter === "all"
              ? "bg-[#185a4d] text-white shadow-xs"
              : "bg-[#dcefe9] text-[#185a4d] hover:bg-[#cde7df]"
          }`}
        >
          <span>{isKm ? "ទាំងអស់ (All)" : "All"}</span>
        </button>

        {/* Nearby pill */}
        <button
          type="button"
          onClick={() => {
            const next = activeFilter === "nearby" ? "all" : "nearby";
            setActiveFilter(next);
            if (next === "nearby" && (location.status === "idle" || location.status === "denied")) onRequestLocation();
          }}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer select-none shrink-0 ${
            activeFilter === "nearby"
              ? "bg-[#185a4d] text-white shadow-xs"
              : "bg-[#dcefe9] text-[#185a4d] hover:bg-[#cde7df]"
          }`}
        >
          <Compass size={14} strokeWidth={2.2} />
          <span>{isKm ? "នៅក្បែរនេះ (Nearby)" : "Nearby"}</span>
        </button>

        {/* Clinic pill */}
        <button
          type="button"
          onClick={() => setActiveFilter(activeFilter === "clinic" ? "all" : "clinic")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer select-none shrink-0 ${
            activeFilter === "clinic"
              ? "bg-[#185a4d] text-white shadow-xs"
              : "bg-[#dcefe9] text-[#185a4d] hover:bg-[#cde7df]"
          }`}
        >
          <Heart size={14} strokeWidth={2.2} />
          <span>{isKm ? "គ្លីនិក (Clinic)" : "Clinic"}</span>
        </button>

        {/* Hospital pill */}
        <button
          type="button"
          onClick={() => setActiveFilter(activeFilter === "hospital" ? "all" : "hospital")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer select-none shrink-0 ${
            activeFilter === "hospital"
              ? "bg-[#185a4d] text-white shadow-xs"
              : "bg-[#dcefe9] text-[#185a4d] hover:bg-[#cde7df]"
          }`}
        >
          <Building2 size={14} strokeWidth={2.2} />
          <span>{isKm ? "មន្ទីរពេទ្យ (Hospital)" : "Hospital"}</span>
        </button>
      </div>

      {/* Real map: OpenStreetMap, pins at each clinic's location */}
      <div className="relative isolate h-56 w-full overflow-hidden rounded-2xl border border-arom-border bg-arom-wash shadow-xs sm:h-64 sm:rounded-3xl">
        <ClinicMap clinics={clinics} me={me} km={isKm} onSelect={onSelectClinic} />
      </div>

      {/* Distance needs the person's location, asked only when they want it */}
      {location.status !== "ready" && (
        <div className="-mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          {location.status === "asking" ? (
            <span role="status">{isKm ? "កំពុងស្វែងរកទីតាំងរបស់អ្នក..." : "Finding your location..."}</span>
          ) : (
            <>
              <button
                type="button"
                onClick={onRequestLocation}
                className="inline-flex items-center gap-1.5 rounded-full bg-arom-soft px-3.5 py-2 text-sm font-semibold text-arom transition-colors hover:bg-[#cde7df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
              >
                <LocateFixed size={16} aria-hidden="true" />
                {isKm ? "ប្រើទីតាំងរបស់ខ្ញុំ ដើម្បីមើលចម្ងាយ" : "Use my location to see distances"}
              </button>
              <span>
                {location.status === "denied"
                  ? isKm
                    ? "ទីតាំងត្រូវបានបិទ។ អ្នកអាចបើកវានៅក្នុងការកំណត់កម្មវិធីរុករក។"
                    : "Location is blocked. You can allow it in your browser settings."
                  : location.status === "unavailable"
                    ? isKm
                      ? "មិនអាចរកទីតាំងបានទេ។"
                      : "Your location could not be found."
                    : isKm
                      ? "ទីតាំងនៅលើឧបករណ៍របស់អ្នកប៉ុណ្ណោះ មិនរក្សាទុកទេ។"
                      : "It stays on your device and is never saved."}
              </span>
            </>
          )}
        </div>
      )}

      {/* Clinic Cards List matching Figma */}
      <div className="flex flex-col gap-3.5 pt-1">
        {filteredClinics.length === 0 ? (
          <div className="rounded-2xl border border-arom-border bg-white p-8 text-center">
            <p className="text-sm font-semibold text-ink">
              {isKm ? "រកមិនឃើញគ្លីនិក ឬមន្ទីរពេទ្យដែលត្រូវគ្នានឹងការស្វែងរកទេ" : "No clinics or hospitals match your search."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="mt-3 text-xs font-bold text-arom hover:underline"
            >
              {isKm ? "កំណត់ការស្វែងរកឡើងវិញ" : "Reset filters"}
            </button>
          </div>
        ) : (
          filteredClinics.map((clinic) => (
            <article
              key={clinic.id}
              className="group rounded-2xl sm:rounded-3xl border border-arom-border/80 bg-white p-3.5 shadow-[0_2px_12px_rgba(20,54,47,0.04)] transition-all hover:border-arom/40 hover:shadow-[0_8px_24px_rgba(20,54,47,0.08)]"
            >
              <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[6.5rem_minmax(0,1fr)] gap-3.5 items-start">
                {/* Thumbnail image */}
                <div className="relative h-22 sm:h-26 w-full overflow-hidden rounded-xl bg-arom-soft">
                  <ClinicPhoto
                    clinic={clinic}
                    sizes="(max-width: 640px) 90px, 110px"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Info & action content */}
                <div className="flex flex-col justify-between h-full min-w-0">
                  {/* Title & Distance */}
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-ink leading-tight line-clamp-1">
                      {isKm ? clinic.nameKm : clinic.name}
                    </h2>
                    {(clinic.upStudentsOnly || clinic.isListed) && (
                      <div className="mt-1">
                        {clinic.isListed ? <ListedBadge km={isKm} /> : <UpStudentBadge km={isKm} />}
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-between text-xs text-ink-muted">
                      <div className="flex items-center gap-1 min-w-0 truncate">
                        <MapPin size={13} strokeWidth={2.2} className="text-arom shrink-0" />
                        <span className="truncate">{isKm ? clinic.cityKm : clinic.city}</span>
                      </div>
                      {me && (
                        <div className="flex items-center gap-1 font-semibold text-arom shrink-0 ml-2">
                          <MapPin size={13} strokeWidth={2.2} className="text-arom" />
                          <span>{formatDistance(distanceKm(me, clinic), isKm)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags row */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {(isKm ? clinic.tagsKm : clinic.tags).map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-[#dcefe9] px-2.5 py-0.5 text-[10.5px] font-medium text-[#185a4d]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* View Details Button matching Figma */}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectClinic(clinic)}
                      className="rounded-full border border-[#185a4d] bg-white px-4 py-1.5 text-xs font-semibold text-[#185a4d] transition-all hover:bg-[#185a4d] hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-arom"
                    >
                      {isKm ? "មើលព័ត៌មានលម្អិត" : "View details"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
