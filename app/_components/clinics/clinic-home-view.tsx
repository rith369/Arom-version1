"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { DesktopNavigation, MobileNavigation } from "../app-navigation";
import { CLINICS_DATA, type Clinic } from "./clinic-data";
import { ClinicListView } from "./clinic-list-view";
import { ClinicDetailView } from "./clinic-detail-view";

function ClinicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicSlug = searchParams.get("clinic");

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(() => {
    if (clinicSlug) {
      return CLINICS_DATA.find((c) => c.slug === clinicSlug) || null;
    }
    return null;
  });

  // Keep state in sync with URL parameter
  useEffect(() => {
    if (clinicSlug) {
      const match = CLINICS_DATA.find((c) => c.slug === clinicSlug);
      if (match) {
        setSelectedClinic(match);
        return;
      }
    }
    setSelectedClinic(null);
  }, [clinicSlug]);

  const handleSelectClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    router.push(`/clinic-hospital?clinic=${clinic.slug}`, { scroll: false });
  };

  const handleBackToList = () => {
    setSelectedClinic(null);
    router.push("/clinic-hospital", { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <AnimatePresence mode="wait">
        {selectedClinic ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ClinicDetailView clinic={selectedClinic} onBack={handleBackToList} />
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
              onSelectClinic={handleSelectClinic}
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
