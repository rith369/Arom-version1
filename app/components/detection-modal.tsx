"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Compass, X } from "lucide-react";
import { FigmaIcon } from "./figma-icon";
import { useLanguage } from "../_components/language-provider";

type DetectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DetectionModal({ isOpen, onClose }: DetectionModalProps) {
  const { language } = useLanguage();
  const km = language === "km";
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detection-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-sm p-0 transition-opacity duration-200 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-t-[32px] bg-white px-5 pb-8 pt-3.5 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom sm:max-w-md sm:rounded-[28px] sm:p-6 sm:shadow-2xl sm:slide-in-from-bottom-0 sm:zoom-in-95 sm:fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle indicator on phone only */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d2d6db] sm:hidden" />

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="detection-sheet-title"
              className="text-2xl font-semibold tracking-tight text-black"
            >
              {km ? "តាមដានសុខុមាលភាពផ្លូវចិត្ត (Track Your Mind)" : "Track your mind"}
            </h2>
            <p className="mt-1 text-sm text-[#444444] sm:text-[15px]">
              {km
                ? "បន្តយល់ដឹងពីអារម្មណ៍ និងស្ថានភាពរបស់អ្នកពីមួយថ្ងៃទៅមួយថ្ងៃ។"
                : "Keep understand how you’re doing. day to day."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3.5">
          {/* Journal Card (Figma Component 133) */}
          <Link
            href="/detection/journal"
            onClick={onClose}
            className="group flex items-center gap-4 rounded-[22px] border border-gray-200/90 bg-white p-4 shadow-sm transition-all duration-200 hover:border-[#1f6f5b] hover:shadow-md hover:bg-[#e6f6f1] focus-visible:outline-2 focus-visible:outline-[#1f6f5b]"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-[#dff3ee] transition-colors duration-200 group-hover:bg-[#1f6f5b]">
              <span className="group-hover:brightness-0 group-hover:invert transition-all">
                <FigmaIcon name="bi_journal-bookmark-fill" size={24} />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-black transition-colors duration-200 group-hover:text-[#1f6f5b]">
                  {km ? "កំណត់ត្រាអារម្មណ៍ (Journal)" : "Journal"}
                </p>
                <span className="text-[11px] font-medium text-[#1f6f5b] bg-[#e6f6f1] px-2.5 py-0.5 rounded-full">
                  {km ? "រួចរាល់ (Ready)" : "Ready"}
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-[#4b5563] transition-colors duration-200 group-hover:text-[#1f6f5b]/90">
                {km ? "សរសេរដោយសេរីអំពីអារម្មណ៍ប្រចាំថ្ងៃរបស់អ្នក" : "write freely about your day"}
              </p>
            </div>

            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-[#1f6f5b] group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </Link>

          {/* Symptom Detection Card (Figma Component 134) */}
          <Link
            href="/detection/symptoms"
            onClick={onClose}
            className="group flex w-full items-center text-left gap-4 rounded-[22px] border border-gray-200/90 bg-white p-4 shadow-sm transition-all duration-200 hover:border-[#1f6f5b] hover:shadow-md hover:bg-[#e6f6f1] focus-visible:outline-2 focus-visible:outline-[#1f6f5b]"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-[#dff3ee] transition-colors duration-200 group-hover:bg-[#1f6f5b]">
              <span className="group-hover:brightness-0 group-hover:invert transition-all">
                <FigmaIcon name="oui_anomaly-detection" size={24} />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-black transition-colors duration-200 group-hover:text-[#1f6f5b]">
                  {km ? "ការតាមដានរោគសញ្ញា (Symptom Detection)" : "Symptom Detection"}
                </p>
                <span className="text-[11px] font-medium text-[#1f6f5b] bg-[#e6f6f1] px-2.5 py-0.5 rounded-full">
                  {km ? "រួចរាល់ (Ready)" : "Ready"}
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-[#757575] transition-colors duration-200 group-hover:text-[#1f6f5b]/90">
                {km ? "ពិនិត្យ និងស្ទង់កម្រិតអារម្មណ៍រហ័ស" : "A quick check-in on how you’re doing"}
              </p>
            </div>

            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-[#1f6f5b] group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </Link>

          {/* Understand yourself: values, how I handle stress, my patterns */}
          <Link
            href="/understand"
            onClick={onClose}
            className="group flex w-full items-center text-left gap-4 rounded-[22px] border border-gray-200/90 bg-white p-4 shadow-sm transition-all duration-200 hover:border-[#1f6f5b] hover:shadow-md hover:bg-[#e6f6f1] focus-visible:outline-2 focus-visible:outline-[#1f6f5b]"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[15px] bg-[#dff3ee] text-[#1f6f5b] transition-colors duration-200 group-hover:bg-[#1f6f5b] group-hover:text-white">
              <Compass size={24} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-black transition-colors duration-200 group-hover:text-[#1f6f5b]">
                  {km ? "ស្គាល់ខ្លួនឯង (Understand yourself)" : "Understand yourself"}
                </p>
                <span className="text-[11px] font-medium text-[#1f6f5b] bg-[#e6f6f1] px-2.5 py-0.5 rounded-full">
                  {km ? "ថ្មី (New)" : "New"}
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-[#757575] transition-colors duration-200 group-hover:text-[#1f6f5b]/90">
                {km ? "តម្លៃរបស់អ្នក និងរបៀបដែលអ្នកទប់ទល់នឹងភាពតានតឹង" : "Your values and how you handle stress"}
              </p>
            </div>

            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-[#1f6f5b] group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
