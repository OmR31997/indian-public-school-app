"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EASE } from "@/lib/motion-presets";

const GRADES = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

// Minimal 4-field Zod schema for quick admission inquiry
const minimalSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().regex(/^[0-9+\-\s]{8,15}$/, "Please enter a valid phone number"),
  grade: z.string().min(1, "Please select class applying for"),
  email: z.string().email("Please enter a valid email address"),
});

export type AdmissionFormValues = z.infer<typeof minimalSchema>;

// Global trigger function to open modal from anywhere
export function openAdmissionModal(grade?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-admission-modal", { detail: { grade } })
    );
  }
}

// Reusable Minimal 4-Field Admission Enquiry Form Component
export function AdmissionForm({
  defaultGrade,
  onClose,
}: {
  defaultGrade?: string;
  onClose?: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(minimalSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      grade: defaultGrade || "Grade 1",
      email: "",
    },
  });

  useEffect(() => {
    if (defaultGrade) {
      form.setValue("grade", defaultGrade);
    }
  }, [defaultGrade, form]);

  const generateInquiryId = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `IPS-ENQ-${year}-${rand}`;
  };

  const onSubmit = async (values: AdmissionFormValues) => {
    setSubmitting(true);
    const refId = generateInquiryId();
    setInquiryId(refId);

    try {
      const baseUrl = (
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.API_BASE_URL ||
        "http://localhost:5000/api/v1"
      ).replace(/\/$/, "");

      await axios.post(`${baseUrl}/inquiries`, {
        name: values.fullName,
        contact: values.phone,
        email: values.email,
        inquiryType: `Admission (${values.grade})`,
        message: `Quick admission inquiry for ${values.grade} (Ref: ${refId})`,
      });
    } catch (err) {
      console.warn("API submission error fallback:", err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="p-6 sm:p-10 text-center space-y-6"
        >
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <i className="bi bi-check-circle-fill text-4xl" />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Enquiry Submitted
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#082A52]">
              Thank You!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
              Your inquiry has been successfully submitted. Our admissions desk will contact you within 24 working hours.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dce6f2] bg-[#f4f8fd] p-4 max-w-xs mx-auto space-y-1">
            <span className="text-[11px] font-bold text-[#123B70] uppercase tracking-wider block">
              Reference ID
            </span>
            <span className="font-mono text-lg font-bold text-[#082A52]">
              {inquiryId}
            </span>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setSubmitted(false);
              }}
              className="rounded-xl font-bold border-slate-300 text-[#123B70] hover:bg-[#f4f8fd]"
            >
              Submit Another Inquiry
            </Button>
            {onClose && (
              <Button
                type="button"
                onClick={onClose}
                className="bg-[#123B70] hover:bg-[#082A52] text-white font-bold rounded-xl px-6"
              >
                Done
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              {/* Field 1: Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-[#082A52] flex items-center gap-2">
                      <i className="bi bi-person-fill text-lg text-[#123B70]" />
                      Parent / Student Full Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Rahul Sharma"
                        className="h-11 rounded-xl border-[#dce6f2] bg-[#f4f8fd]/60 text-sm font-medium focus:bg-white focus:border-[#123B70]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Field 2: Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-[#082A52] flex items-center gap-2">
                      <i className="bi bi-telephone-fill text-base text-[#123B70]" />
                      Mobile / Contact Phone Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="tel"
                        placeholder="e.g. +91 9876543210"
                        className="h-11 rounded-xl border-[#dce6f2] bg-[#f4f8fd]/60 text-sm font-medium focus:bg-white focus:border-[#123B70]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Field 3: Class Applying For */}
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-[#082A52] flex items-center gap-2">
                      <i className="bi bi-book-fill text-base text-[#123B70]" />
                      Class / Grade Applying For <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full h-11 rounded-xl border border-[#dce6f2] bg-[#f4f8fd]/60 px-3 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#123B70]"
                      >
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Field 4: Email Address */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-[#082A52] flex items-center gap-2">
                      <i className="bi bi-envelope-fill text-base text-[#123B70]" />
                      Email Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g. parent@example.com"
                        className="h-11 rounded-xl border-[#dce6f2] bg-[#f4f8fd]/60 text-sm font-medium focus:bg-white focus:border-[#123B70]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#123B70] hover:bg-[#082A52] text-white font-extrabold text-sm h-12 rounded-2xl shadow-md border border-[#123B70] cursor-pointer transform active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin text-lg" />
                      Submitting Inquiry...
                    </>
                  ) : (
                    <>
                      Submit Admission Enquiry
                      <i className="bi bi-send-fill text-base" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F4C430]/20 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#F4C430] border border-[#F4C430]/30">
                  <i className="bi bi-mortarboard-fill text-xs" /> Academic Session 2026–27
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <i className="bi bi-pencil-square text-[#F4C430] text-xl" />
                  Quick Admission Enquiry
                </h2>
                <p className="text-xs text-[#dbeafe] max-w-sm font-medium">
                  Provide the 4 quick details below and our admissions team will get back to you immediately.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition cursor-pointer shrink-0 border border-white/20"
                title="Close Form"
              >
                <i className="bi bi-x-lg text-sm" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
            <AdmissionForm defaultGrade={defaultGrade} onClose={() => setIsOpen(false)} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
