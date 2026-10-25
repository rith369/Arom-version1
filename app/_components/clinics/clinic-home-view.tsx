"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { LocateFixed } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { visibleClinics, type Clinic } from "./clinic-data";
import { useAuth } from "../auth-provider";
import { useClinicAccess } from "./use-clinic-access";
import { useClinics } from "./use-clinics";
import { skipLocationAsk, useUserLocation } from "./use-user-location";
import { useLanguage } from "../language-provider";
import { useConfirm } from "../confirm-dialog";
import { ClinicListView } from "./clinic-list-view";
import { ClinicDetailView } from "./clinic-detail-view";

function ClinicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicSlug = searchParams.get("clinic");
  // Real clinics from the database, then the samples (section 32).
  const { clinics } = useClinics();
  // UP only clinics open for confirmed UP students and staff only, even from a shared link.
  const upStudent = useAuth().user?.upStudent ?? false;
  const allowed = useClinicAccess();
  const visible = useMemo(() => visibleClinics(clinics, upStudent, allowed), [clinics, upStudent, allowed]);
  const { location, request, shouldAsk } = useUserLocation();
  const { language } = useLanguage();
  const { confirm, dialog } = useConfirm();

  // Many students miss the small "Use my location" link, so explain it once
  // when the page opens. The browser's own question only shows after "Allow".
  const offered = useRef(false);
  useEffect(() => {
    if (!shouldAsk || offered.current) return;
    offered.current = true;
    const km = language === "km";
    void confirm({
      icon: LocateFixed,
      title: km ? "ស្វែងរកគ្លីនិកជិតអ្នក?" : "See clinics near you?",
      message: km
        ? "អនុញ្ញាតឱ្យប្រើទីតាំង ដើម្បីមើលថាគ្លីនិកនីមួយៗនៅឆ្ងាយប៉ុណ្ណា ហើយគ្លីនិកជិតបំផុតនៅខាងលើ។ ទីតាំងនៅលើឧបករណ៍របស់អ្នកប៉ុណ្ណោះ មិនរក្សាទុកទេ។"
        : "Allow your location to see how far each clinic is, with the closest first. It stays on your device and is never saved.",
      confirmLabel: km ? "អនុញ្ញាតទីតាំង" : "Allow location",
      cancelLabel: km ? "ពេលក្រោយ" : "Not now",
    }).then((allow) => {
      if (allow) request();
      else skipLocationAsk();
    });
  }, [shouldAsk, confirm, request, language]);

  // The open clinic follows the address (?clinic=slug), so links and Back work.
  const selectedClinic = clinicSlug ? (visible.find((c) => c.slug === clinicSlug) ?? null) : null;

  const handleSelectClinic = (clinic: Clinic) => {
    router.push(`/clinic-hospital?clinic=${clinic.slug}`, { scroll: false });
  };

  const handleBackToList = () => {
    router.push("/clinic-hospital", { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      {dialog}
      <AnimatePresence mode="wait">
        {selectedClinic ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ClinicDetailView
              clinic={selectedClinic}
              onBack={handleBackToList}
              startBooking={searchParams.get("book") === "1"}
              me={location.status === "ready" ? location.coords : null}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ClinicListView
              clinics={visible}
              onSelectClinic={handleSelectClinic}
              location={location}
              onRequestLocation={request}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ClinicHomeView() {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <DesktopNavigation active="ClinicHospital" />
      <main className="min-w-0 px-4 pb-28 pt-4 sm:px-8 lg:px-10 lg:py-8">
        <Suspense
          fallback={
            <div className="mx-auto max-w-xl animate-pulse space-y-4 pt-4">
              <div className="h-8 w-48 rounded-xl bg-arom-border/60" />
              <div className="h-12 w-full rounded-2xl bg-arom-border/40" />
              <div className="h-48 w-full rounded-3xl bg-arom-border/30" />
            </div>
          }
        >
          <ClinicContent />
        </Suspense>
      </main>
      <MobileNavigation active="ClinicHospital" />
    </div>
  );
}
