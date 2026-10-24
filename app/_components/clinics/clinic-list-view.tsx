"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  ChevronLeft,
  Search,
  MapPin,
  Heart,
  Building2,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { visibleClinics, type Clinic } from "./clinic-data";
import { useAuth } from "../auth-provider";
import { useLanguage } from "../language-provider";
import { UpStudentBadge } from "../up-student/up-badge";

type FilterType = "all" | "nearby" | "clinic" | "hospital";

interface ClinicListViewProps {
  onSelectClinic: (clinic: Clinic) => void;
  selectedClinicId?: string | null;
}

export function ClinicListView({ onSelectClinic, selectedClinicId }: ClinicListViewProps) {
  const { language } = useLanguage();
  const isKm = language === "km";
  const { user } = useAuth();
  const upStudent = user?.upStudent ?? false;
  const clinics = useMemo(() => visibleClinics(upStudent), [upStudent]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("nearby");
  const [activePinId, setActivePinId] = useState<string | null>(null);

  // Filtered and searched clinics
  const filteredClinics = useMemo(() => {
    let list = [...clinics];

    // Filter type
    if (activeFilter === "clinic") {
      list = list.filter((c) => c.category === "clinic");
    } else if (activeFilter === "hospital") {
      list = list.filter((c) => c.category === "hospital");
    } else if (activeFilter === "nearby") {
      // Sort closest first
      list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }

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
  }, [activeFilter, searchQuery, clinics]);

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
          onClick={() => setActiveFilter(activeFilter === "nearby" ? "all" : "nearby")}
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

      {/* Interactive Map Preview Card matching Figma */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-arom-border shadow-xs bg-slate-100">
        <Image
          src="/clinics/map-preview.jpg"
          alt="Map showing clinic locations in Phnom Penh"
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-cover"
          priority
        />

        {/* Interactive Location Pins for Clinics */}
        {clinics.map((clinic) => {
          const isSelected = selectedClinicId === clinic.id;
          const isHovered = activePinId === clinic.id;

          return (
            <div
              key={clinic.id}
              style={{
                left: `${clinic.mapCoords.x}%`,
                top: `${clinic.mapCoords.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-10 transition-transform duration-200 hover:scale-110"
              onMouseEnter={() => setActivePinId(clinic.id)}
              onMouseLeave={() => setActivePinId(null)}
              onClick={() => onSelectClinic(clinic)}
            >
              {/* Tooltip on hover/select */}
              <AnimatePresence>
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: -4 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-arom-deep px-2.5 py-1 text-[11px] font-bold text-white shadow-md pointer-events-none"
                  >
                    {isKm ? clinic.nameKm : clinic.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-arom-deep" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pin marker styled exactly like Figma (dark blue teardrop with white dot) */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`flex size-8 items-center justify-center rounded-full shadow-md transition-colors ${
                    isSelected ? "bg-arom ring-4 ring-white" : "bg-[#18395f] hover:bg-[#112742]"
                  }`}
                >
                  <span className="size-2.5 rounded-full bg-white shadow-xs" />
                </div>
                {/* Pointer tip */}
                <div
                  className={`-mt-1 size-2 rotate-45 ${
                    isSelected ? "bg-arom" : "bg-[#18395f]"
                  }`}
                />
              </div>
            </div>
          );
        })}

        {/* User live position beacon */}
        <div
          style={{ left: "42%", top: "65%" }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="relative flex size-4 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-arom opacity-75" />
            <span className="relative inline-flex size-3 rounded-full border-2 border-white bg-arom shadow-sm" />
          </div>
        </div>

        {/* Map Legend pill */}
        <div className="absolute bottom-2.5 left-2.5 rounded-lg bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-semibold text-arom-deep shadow-2xs border border-arom-border/60">
          {isKm ? "ផែនទីទីតាំងជាក់ស្តែង" : "Phnom Penh Clinic Map"}
        </div>
      </div>

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
                  <Image
                    src={clinic.image}
                    alt={clinic.name}
                    fill
                    sizes="(max-width: 640px) 90px, 110px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Info & action content */}
                <div className="flex flex-col justify-between h-full min-w-0">
                  {/* Title & Distance */}
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-ink leading-tight line-clamp-1">
                      {isKm ? clinic.nameKm : clinic.name}
                    </h2>
                    {clinic.upStudentsOnly && (
                      <div className="mt-1">
                        <UpStudentBadge km={isKm} />
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-between text-xs text-ink-muted">
                      <div className="flex items-center gap-1 min-w-0 truncate">
                        <MapPin size={13} strokeWidth={2.2} className="text-arom shrink-0" />
                        <span className="truncate">{isKm ? clinic.cityKm : clinic.city}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-arom shrink-0 ml-2">
                        <MapPin size={13} strokeWidth={2.2} className="text-arom" />
                        <span>{isKm ? clinic.distanceKm : clinic.distance}</span>
                      </div>
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
