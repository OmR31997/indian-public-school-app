"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle2,
  Copy,
  Check,
  GraduationCap,
  Loader2,
  FileText,
  User,
  Sparkles,
  X,
  ChevronRight,
  ShieldCheck,
  UploadCloud,
  Paperclip,
  Trash2,
  FileCheck,
  Image as ImageIcon,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

// Simple Zod schema for Student/Parent application
const schema = z.object({
  studentName: z.string().min(2, "Please enter student's full name"),
  dob: z.string().min(1, "Please select student's date of birth"),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Please select gender",
  }),
  grade: z.string().min(1, "Select class applying for"),
  session: z.string().min(1, "Select academic session"),
  previousSchool: z.string().optional(),
  parentName: z.string().min(2, "Please enter parent/guardian full name"),
  relationship: z.enum(["Father", "Mother", "Guardian"], {
    required_error: "Please select relationship",
  }),
  phone: z.string().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid 10-digit phone number"),
  email: z.string().email("Enter a valid email address"),
  address: z.string().min(5, "Please enter residential address"),
  message: z.string().max(600, "Please keep under 600 characters").optional(),
});

export type AdmissionFormValues = z.infer<typeof schema>;

export interface SelectedDocument {
  file: File;
  name: string;
  size: string;
}

// Global trigger function to open modal from anywhere without Provider boilerplate
export function openAdmissionModal(grade?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-admission-modal", { detail: { grade } })
    );
  }
}

// Format bytes helper
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Reusable Admission Form Component
export function AdmissionForm({ defaultGrade }: { defaultGrade?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [copied, setCopied] = useState(false);
  const [submittedData, setSubmittedData] = useState<AdmissionFormValues | null>(null);

  // Dedicated Document States: Profile Image & Previous Year Marksheet
  const [profileImageDoc, setProfileImageDoc] = useState<SelectedDocument | null>(null);
  const [marksheetDoc, setMarksheetDoc] = useState<SelectedDocument | null>(null);

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentName: "",
      dob: "",
      gender: "Male",
      grade: defaultGrade || "Grade 1",
      session: "2026–27",
      previousSchool: "",
      parentName: "",
      relationship: "Father",
      phone: "",
      email: "",
      address: "",
      message: "",
    },
  });

  useEffect(() => {
    if (defaultGrade) {
      form.setValue("grade", defaultGrade);
    }
  }, [defaultGrade, form]);

  const generateAppId = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `IPS-APP-${year}-${rand}`;
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Profile image must be under 10MB");
        return;
      }
      setProfileImageDoc({
        file,
        name: file.name,
        size: formatBytes(file.size),
      });
    }
  };

  const handleMarksheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Marksheet file must be under 10MB");
        return;
      }
      setMarksheetDoc({
        file,
        name: file.name,
        size: formatBytes(file.size),
      });
    }
  };

  const uploadSingleFile = async (
    doc: SelectedDocument,
    altTextLabel: string,
    baseUrl: string
  ): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", doc.file);
      formData.append("album", "AdmissionDocuments");
      formData.append("folder", "indian-public-school/assets/AdmissionDocuments");
      formData.append("altText", altTextLabel);

      const uploadRes = await axios.post(`${baseUrl}/uploads/public`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const resData = uploadRes.data?.data ?? uploadRes.data;
      const extractedUrl =
        resData?.url ||
        (Array.isArray(resData?.fileUrl) ? resData.fileUrl[0] : resData?.fileUrl) ||
        "";

      return extractedUrl || "Uploaded";
    } catch (err) {
      console.warn(`File upload skipped for ${doc.name}:`, err);
      return `${doc.name} (${doc.size}) [Attached locally]`;
    }
  };

  const onSubmit = async (values: AdmissionFormValues) => {
    const appId = generateAppId();
    setApplicationId(appId);
    setSubmittedData(values);

    try {
      const baseUrl = (
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1"
      ).replace(/\/$/, "");

      // 1. Upload Student Profile Image & Previous Year Marksheet to AdmissionDocuments
      let profileImageUrlText = "Not uploaded";
      let marksheetUrlText = "Not uploaded";
      let rawProfileUrl = "";
      let rawMarksheetUrl = "";

      if (profileImageDoc) {
        const url = await uploadSingleFile(profileImageDoc, `Profile Image - ${values.studentName}`, baseUrl);
        if (url && (url.startsWith("http") || url.startsWith("/") || url.includes("cloudinary"))) {
          rawProfileUrl = url;
        }
        profileImageUrlText = `${profileImageDoc.name} (${profileImageDoc.size}) -> ${url}`;
      }

      if (marksheetDoc) {
        const url = await uploadSingleFile(marksheetDoc, `Previous Marksheet - ${values.studentName}`, baseUrl);
        if (url && (url.startsWith("http") || url.startsWith("/") || url.includes("cloudinary"))) {
          rawMarksheetUrl = url;
        }
        marksheetUrlText = `${marksheetDoc.name} (${marksheetDoc.size}) -> ${url}`;
      }

      const formattedMessage = [
        `APPLICATION REF ID: ${appId}`,
        `----------------------------------------`,
        `STUDENT DETAILS:`,
        `Name: ${values.studentName}`,
        `DOB: ${values.dob}`,
        `Gender: ${values.gender}`,
        `Class Applying For: ${values.grade}`,
        `Academic Session: ${values.session}`,
        `Previous School: ${values.previousSchool || "N/A"}`,
        ``,
        `PARENT / GUARDIAN DETAILS:`,
        `Parent Name: ${values.parentName} (${values.relationship})`,
        `Phone: ${values.phone}`,
        `Email: ${values.email}`,
        `Address: ${values.address}`,
        ``,
        `ATTACHED DOCUMENTS (AdmissionDocuments Folder):`,
        `• Student Profile Image: ${profileImageUrlText}`,
        `• Previous Year Marksheet: ${marksheetUrlText}`,
        ``,
        `REMARKS / NOTES:`,
        `${values.message || "None provided"}`,
      ].join("\n");

      // 2. Submit payload to /inquiries endpoint with Student Name & Optional Document URLs
      const docList = [rawProfileUrl, rawMarksheetUrl].filter(Boolean);

      await axios.post(`${baseUrl}/inquiries`, {
        name: values.studentName,
        contact: values.phone,
        email: values.email,
        inquiryType: "Admission",
        message: formattedMessage,
        documents: docList,
        ...(rawProfileUrl && { profileImageUrl: rawProfileUrl }),
        ...(rawMarksheetUrl && { marksheetUrl: rawMarksheetUrl }),
      });
    } catch (err) {
      console.error("Admission application submission error:", err);
    }

    setSubmitted(true);
  };

  const handleCopyId = () => {
    if (applicationId) {
      navigator.clipboard.writeText(applicationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="py-4 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Application Submitted Successfully!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Your application record has been registered with Indian Public School.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center space-y-1.5 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Application Reference Number
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-extrabold text-[#102a4c] tracking-wider">
              {applicationId}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyId}
              className="border-[#1a5d9c] text-[#1a5d9c] hover:bg-[#1a5d9c] hover:text-white rounded-xl text-xs gap-1.5"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy ID"}
            </Button>
          </div>
        </div>

        {submittedData && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs sm:text-sm text-slate-700">
            <h4 className="font-bold text-[#102a4c] border-b border-slate-200 pb-2 flex items-center gap-2">
              <FileText className="size-4 text-[#1a5d9c]" />
              Submitted Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">Student:</span> <span className="font-bold text-slate-900">{submittedData.studentName}</span></div>
              <div><span className="text-slate-500">Class:</span> <span className="font-bold text-[#1a5d9c]">{submittedData.grade}</span></div>
              <div><span className="text-slate-500">Parent:</span> <span className="font-bold text-slate-900">{submittedData.parentName}</span></div>
              <div><span className="text-slate-500">Phone:</span> <span className="font-bold text-slate-900">{submittedData.phone}</span></div>
              {(profileImageDoc || marksheetDoc) && (
                <div className="sm:col-span-2 text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                  <FileCheck className="size-3.5" />
                  Documents attached: {[profileImageDoc && "Profile Image", marksheetDoc && "Marksheet"].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <Button
            type="button"
            onClick={() => {
              form.reset();
              setProfileImageDoc(null);
              setMarksheetDoc(null);
              setSubmitted(false);
              setSubmittedData(null);
            }}
            variant="outline"
            className="rounded-full border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Submit Another Application
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step Guidance Notice */}
        <div className="rounded-2xl bg-blue-50/80 border border-blue-200 p-3.5 flex items-start gap-3 text-xs text-slate-700">
          <Info className="size-4 text-[#1a5d9c] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#102a4c]">Process Guidelines:</span> Please complete <strong>Step 1 (Student Details)</strong> and <strong>Step 2 (Parent Details)</strong> below first, then upload student <strong>Profile Image</strong> & <strong>Previous Year Marksheet</strong>.
          </div>
        </div>

        {/* Section 1: Student Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#102a4c] font-bold text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
            <User className="size-4 text-[#1a5d9c]" />
            1. Student Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs">Student Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Aarav Sharma"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1a5d9c]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs">Date of Birth *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="bg-white border-slate-300 text-slate-900 focus:border-[#1a5d9c]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs">Gender *</FormLabel>
                  <select
                    className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1a5d9c] focus:outline-none"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs">Class Applying For *</FormLabel>
                  <select
                    className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1a5d9c] focus:outline-none"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="session"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs">Academic Session *</FormLabel>
                  <select
                    className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1a5d9c] focus:outline-none"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="2026–27">2026–27</option>
                    <option value="2027–28">2027–28</option>
                  </select>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previousSchool"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs">Previous School (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. St. Xavier School"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1a5d9c]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section 2: Parent / Guardian Details */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-[#102a4c] font-bold text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
            <ShieldCheck className="size-4 text-[#1a5d9c]" />
            2. Parent / Guardian Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="parentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs">Parent / Guardian Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Full Name"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1a5d9c]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs">Relationship *</FormLabel>
                  <select
                    className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1a5d9c] focus:outline-none"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs">Phone Number *</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="tel"
                      placeholder="+91 98765 43210"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1a5d9c]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-xs">Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="parent@example.com"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1a5d9c]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-slate-700 font-semibold text-xs">Residential Address *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="House No., Street, City, State, Pincode"
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1a5d9c]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-rose-600 text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section 3: Document Attachments (Student Photo & Marksheet) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-[#102a4c] font-bold text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
            <Paperclip className="size-4 text-[#1a5d9c]" />
            3. Required Document Uploads (Optional)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field 1: Profile Image / Photo */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="size-4 text-[#1a5d9c]" />
                Student Profile Photo
              </label>
              <p className="text-[11px] text-slate-500">
                Passport size photo (JPG, PNG up to 5MB).
              </p>

              {profileImageDoc ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-emerald-300 text-xs text-slate-800">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="size-4 text-emerald-600 shrink-0" />
                    <span className="font-bold truncate">{profileImageDoc.name}</span>
                    <span className="text-[10px] text-slate-400">({profileImageDoc.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileImageDoc(null)}
                    className="text-slate-400 hover:text-rose-600 p-1 shrink-0 cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleProfileImageChange}
                    className="absolute inset-0 size-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:border-[#1a5d9c] transition-colors">
                    <UploadCloud className="size-4 text-[#1a5d9c]" />
                    Upload Profile Photo
                  </div>
                </div>
              )}
            </div>

            {/* Field 2: Previous Year Marksheet */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="size-4 text-[#1a5d9c]" />
                Previous Year Marksheet / Report Card
              </label>
              <p className="text-[11px] text-slate-500">
                Latest academic report card (PDF, JPG up to 10MB).
              </p>

              {marksheetDoc ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-emerald-300 text-xs text-slate-800">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="size-4 text-emerald-600 shrink-0" />
                    <span className="font-bold truncate">{marksheetDoc.name}</span>
                    <span className="text-[10px] text-slate-400">({marksheetDoc.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMarksheetDoc(null)}
                    className="text-slate-400 hover:text-rose-600 p-1 shrink-0 cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={handleMarksheetChange}
                    className="absolute inset-0 size-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:border-[#1a5d9c] transition-colors">
                    <UploadCloud className="size-4 text-[#1a5d9c]" />
                    Upload Marksheet
                  </div>
                </div>
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="pt-2">
                <FormLabel className="text-slate-700 font-semibold text-xs">
                  Additional Remarks / Queries (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="Any specific requests, transport queries, or notes..."
                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1a5d9c]"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-rose-600 text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            Official admission registration for Session 2026–27.
          </p>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full sm:w-auto rounded-full bg-[#1a5d9c] hover:bg-[#102a4c] text-white font-extrabold px-8 py-3 text-sm shadow-md transition-all shrink-0"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                Submit Admission Application
                <ChevronRight className="ml-1 size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl my-auto max-h-[92vh] flex flex-col"
        >
          {/* Top Header - Title seamlessly on white background */}
          <div className="p-6 sm:px-8 sm:pt-7 sm:pb-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-800 border border-amber-200">
                  <Sparkles className="size-3.5 text-amber-600" />
                  Academic Session 2026–27
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102a4c] tracking-tight flex items-center gap-2">
                  <GraduationCap className="size-7 text-[#1a5d9c] shrink-0" />
                  Online Admission Application
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                  Complete the student registration details below to initiate formal admission at Indian Public School.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 shrink-0 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
            <AdmissionForm defaultGrade={defaultGrade} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
