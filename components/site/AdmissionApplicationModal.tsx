"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion-presets";
import { AdmissionEnquiryForm } from "@/components/site/AdmissionEnquiryForm";

// Global trigger function to open modal from anywhere
export function openAdmissionModal(grade?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-admission-modal", { detail: { grade } })
    );
  }
}

// Re-export AdmissionForm for backwards compatibility
export const AdmissionForm = AdmissionEnquiryForm;

// Modal component listening to window "open-admission-modal" event
export function AdmissionApplicationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultGrade, setDefaultGrade] = useState<string | undefined>();

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ grade?: string }>;
      if (customEvent.detail?.grade) {
        setDefaultGrade(customEvent.detail.grade);
      }
      setIsOpen(true);
    };

    window.addEventListener("open-admission-modal", handleOpen);
    return () => {
      window.removeEventListener("open-admission-modal", handleOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#082A52]/70 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-[#dce6f2] bg-white text-slate-900 shadow-2xl my-auto flex flex-col"
        >
          {/* Header Banner - Standard School Blue & Gold Combination */}
          <div className="p-5 sm:p-6 border-b border-[#dce6f2] bg-gradient-to-r from-[#082A52] via-[#123B70] to-[#1a5d9c] text-white shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center rounded-full bg-[#F4C430]/20 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#F4C430] border border-[#F4C430]/30">
                  Academic Session 2026–27
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Quick Admission Enquiry
                </h2>
                <p className="text-xs text-[#dbeafe] max-w-sm font-medium">
                  Provide the 4 quick details below and our admissions team will get back to you immediately.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition cursor-pointer shrink-0 border border-white/20 font-bold text-sm"
                title="Close Form"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
            <AdmissionEnquiryForm defaultGrade={defaultGrade} onClose={() => setIsOpen(false)} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
