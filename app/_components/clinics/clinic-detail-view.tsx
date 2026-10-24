"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  Compass,
  CheckCircle2,
} from "lucide-react";
import type { ClinicBookingInfo } from "@/lib/clinic-booking";
import type { Clinic } from "./clinic-data";
import { ClinicBookingSheet } from "./clinic-booking-sheet";
import { ClinicTherapists } from "./clinic-therapists";
import { UpStudentBadge } from "../up-student/up-badge";
import { useAuth } from "../auth-provider";
import { useLanguage } from "../language-provider";

interface ClinicDetailViewProps {
  clinic: Clinic;
  onBack: () => void;
  // Open the booking form right away (`?book=1`, from My appointments).
  startBooking?: boolean;
}

type TabType = "overviews" | "services" | "therapists" | "reviews";

export function ClinicDetailView({ clinic, onBack, startBooking = false }: ClinicDetailViewProps) {
  const { language } = useLanguage();
  const isKm = language === "km";

  const [activeTab, setActiveTab] = useState<TabType>("overviews");
  // Therapists and times when this clinic takes bookings in AROM (section 34).
  const [booking, setBooking] = useState<ClinicBookingInfo | null>(null);
  const [bookingOpen, setBookingOpen] = useState(startBooking);

  useEffect(() => {
    let active = true;
    fetch(`/api/clinics/${clinic.slug}/booking`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as ClinicBookingInfo;
        if (active) setBooking(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [clinic.slug]);

  const hasTherapists = (booking?.therapists.length ?? 0) > 0;
  // Only user accounts book. A clinic's therapists can open the page but not book it.
  const { user } = useAuth();
  const canBook = !!booking?.takesBookings && (!user || user.role === "user");
  const tabClass = (tab: TabType) =>
    `rounded-xl py-2 px-2 text-xs sm:text-sm font-bold text-center transition-all cursor-pointer ${
      activeTab === tab ? "bg-[#185a4d] text-white shadow-xs" : "bg-[#dcefe9] text-[#185a4d] hover:bg-[#cde7df]"
    }`;

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar matching Figma */}
      <header className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          aria-label={isKm ? "ត្រឡប់ទៅបញ្ជីគ្លីនិក" : "Back to clinic list"}
          className="flex size-10 items-center justify-center rounded-xl text-arom hover:bg-arom-soft/60 transition-colors focus-visible:outline-2 focus-visible:outline-arom cursor-pointer"
        >
          <ChevronLeft size={24} strokeWidth={2.4} />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-arom">
          {isKm ? "ព័ត៌មានលម្អិតអំពីគ្លីនិក" : "Clinic Details"}
        </h1>
      </header>

      {/* Hero Image matching Figma */}
      <div className="relative h-52 sm:h-64 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-arom-border/80 shadow-xs bg-arom-soft">
        <Image
          src={clinic.image}
          alt={clinic.name}
          fill
          sizes="(max-width: 768px) 100vw, 680px"
          className="object-cover"
          priority
        />
      </div>

      {/* Main Clinic Information Card */}
      <div className="rounded-2xl sm:rounded-3xl border border-arom-border/80 bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(20,54,47,0.04)] space-y-3.5">
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-ink leading-snug">
          {isKm ? clinic.nameKm : clinic.name}
        </h2>
        {clinic.upStudentsOnly && <UpStudentBadge km={isKm} />}

        {/* Rating and Distance Row matching Figma */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          {/* Star Rating */}
          {clinic.reviewCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <Star size={16} className="fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-bold text-ink">{clinic.rating.toFixed(1)}</span>
              <span className="text-ink-muted">
                ({clinic.reviewCount} {isKm ? "ការវាយតម្លៃ" : "reviews"})
              </span>
            </div>
          ) : (
            <span />
          )}

          {/* Distance */}
          <div className="flex items-center gap-1 font-bold text-arom">
            <MapPin size={15} strokeWidth={2.2} className="text-arom" />
            <span>{isKm ? clinic.distanceKm : clinic.distance}</span>
          </div>
        </div>

        {/* Address Row matching Figma */}
        <div className="flex items-start gap-1.5 text-xs sm:text-sm text-ink-muted">
          <MapPin size={16} strokeWidth={2.2} className="text-arom shrink-0 mt-0.5" />
          <span className="leading-relaxed">{isKm ? clinic.addressKm : clinic.address}</span>
        </div>

        {/* Category & Tags Row matching Figma */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {(isKm ? clinic.tagsKm : clinic.tags).map((tag, idx) => (
            <span
              key={idx}
              className="rounded-full bg-[#dcefe9] px-3 py-1 text-xs font-medium text-[#185a4d]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Status Row matching Figma */}
        <div className="flex items-center gap-2 pt-0.5 text-xs sm:text-sm font-semibold text-arom">
          <Clock size={15} strokeWidth={2.2} className="text-arom" />
          <span>{isKm ? clinic.statusKm : clinic.status}</span>
        </div>

        {/* Segmented Control Tabs matching Figma */}
        <div
          className={`grid gap-2 pt-2 border-t border-arom-border/60 ${hasTherapists ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}
        >
          <button type="button" onClick={() => setActiveTab("overviews")} className={tabClass("overviews")}>
            {isKm ? "ទិដ្ឋភាពទូទៅ" : "Overviews"}
          </button>
          <button type="button" onClick={() => setActiveTab("services")} className={tabClass("services")}>
            {isKm ? "សេវាកម្ម" : "Services"}
          </button>
          {hasTherapists && (
            <button type="button" onClick={() => setActiveTab("therapists")} className={tabClass("therapists")}>
              {isKm ? "អ្នកព្យាបាល" : "Therapists"}
            </button>
          )}
          <button type="button" onClick={() => setActiveTab("reviews")} className={tabClass("reviews")}>
            {isKm ? "ការវាយតម្លៃ" : "Reviews"}
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="pt-2">
          {/* Overviews Tab matching Figma */}
          {activeTab === "overviews" && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-ink">
                {isKm ? "អំពីគ្លីនិក" : "About"}
              </h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                {isKm ? clinic.aboutKm : clinic.about}
              </p>

              {/* Highlights */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-arom-border/60">
                <div className="flex items-center gap-2 rounded-xl bg-arom-wash p-2.5 text-xs text-ink">
                  <CheckCircle2 size={16} className="text-arom shrink-0" />
                  <span>{isKm ? "បុគ្គលិកមានអាជ្ញាប័ណ្ណត្រឹមត្រូវ" : "Licensed psychologists & counselors"}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-arom-wash p-2.5 text-xs text-ink">
                  <CheckCircle2 size={16} className="text-arom shrink-0" />
                  <span>{isKm ? "រក្សាការសម្ងាត់ជូនអ្នកជំងឺកម្រិតខ្ពស់" : "Clinical grade confidentiality"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-ink">
                {isKm ? "សេវាកម្មដែលផ្តល់ជូន" : "Offered Services"}
              </h3>
              <div className="space-y-2.5">
                {clinic.services.map((svc) => (
                  <div
                    key={svc.id}
                    className="rounded-xl border border-arom-border/70 bg-arom-wash/50 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-ink">
                      <span>{isKm ? svc.nameKm : svc.name}</span>
                      <span className="text-arom">{svc.fee}</span>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {isKm ? svc.descriptionKm : svc.description}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-arom pt-1">
                      <Clock size={12} />
                      <span>{isKm ? svc.durationKm : svc.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Therapists Tab (clinics that take bookings in AROM) */}
          {activeTab === "therapists" && booking && (
            <ClinicTherapists therapists={booking.therapists} km={isKm} />
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-ink">
                  {isKm ? "ការវាយតម្លៃពីអ្នកប្រើប្រាស់" : "Seeker Reviews"}
                </h3>
                {clinic.reviewCount > 0 && (
                  <span className="text-xs font-semibold text-arom">
                    {clinic.rating.toFixed(1)} / 5.0
                  </span>
                )}
              </div>
              {clinic.reviews.length === 0 && (
                <p className="text-sm text-ink-muted">
                  {isKm ? "មិនទាន់មានការវាយតម្លៃនៅឡើយទេ។" : "No reviews yet."}
                </p>
              )}
              <div className="space-y-2.5">
                {clinic.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-arom-border/60 bg-arom-wash/40 p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">{rev.author}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {isKm ? rev.commentKm : rev.comment}
                    </p>
                    <span className="block text-[10.5px] text-ink-muted/70">{rev.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Book at this clinic (section 34) */}
      {canBook && (
        <button
          type="button"
          onClick={() => setBookingOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#185a4d] py-3.5 px-6 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#13463c] focus-visible:outline-2 focus-visible:outline-arom sm:rounded-full"
        >
          <CalendarCheck size={18} strokeWidth={2.4} />
          {isKm ? "កក់វគ្គ (Book a session)" : "Book a session"}
        </button>
      )}

      {bookingOpen && canBook && booking && (
        <ClinicBookingSheet
          slug={clinic.slug}
          clinicName={isKm ? clinic.nameKm : clinic.name}
          info={booking}
          km={isKm}
          onClose={() => setBookingOpen(false)}
        />
      )}

      {/* Action Buttons matching Figma */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* Get Direction Button (Outlined green with compass/arrow icon) */}
        <a
          href={clinic.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl sm:rounded-full border-2 border-[#185a4d] bg-white py-3.5 px-6 text-sm font-bold text-[#185a4d] transition-all hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-arom cursor-pointer shadow-2xs"
        >
          <Compass size={18} strokeWidth={2.4} className="text-[#185a4d]" />
          <span>{isKm ? "មើលទិសដៅផ្លូវ (Get Direction)" : "Get Direction"}</span>
        </a>

        {/* Call Button (Solid green with phone icon) */}
        {clinic.phone && (
          <a
            href={`tel:${clinic.phone}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl sm:rounded-full bg-[#185a4d] py-3.5 px-6 text-sm font-bold text-white transition-all hover:bg-[#13463c] focus-visible:outline-2 focus-visible:outline-arom cursor-pointer shadow-xs"
          >
            <Phone size={18} strokeWidth={2.4} />
            <span>
              {isKm ? "ទូរស័ព្ទហៅ (Call)" : "Call"} {clinic.phoneDisplay}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
