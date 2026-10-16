import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ShieldCheck, FileText, Calendar } from "lucide-react";
import { AdmissionForm } from "@/components/site/AdmissionApplicationModal";
import { getPageSeoMetadata } from "@/lib/seo";
import { getAssetUrl } from "@/lib/utils";
import { DEFAULT_HERO_IMAGE } from "@/lib/site-data";

export const metadata: Metadata = getPageSeoMetadata("admission", "/admission");

export default function AdmissionPage() {
  return (
    <main className="flex-1 bg-background text-foreground min-h-screen">
      {/* Signature Indian Public School Hero Banner (Consistent with Dynamic Pages) */}
      <section
        className="relative overflow-hidden py-14 sm:py-18 text-white shadow-xl border-b-2 border-[var(--gold)]/40"
        style={{ background: "var(--gradient-navy, linear-gradient(140deg, #102a4c, #1a5d9c))" }}
      >
        <div className="absolute inset-0 z-0">
          <img
            src={getAssetUrl(DEFAULT_HERO_IMAGE)}
            alt="Admissions"
            className="h-full w-full object-cover object-center filter brightness-[0.35] contrast-[1.15] opacity-60 scale-105 transition-transform duration-700 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--gold)]/20 via-transparent to-transparent opacity-80 pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-90" />
        </div>

        <div className="container-page relative z-10 max-w-6xl flex flex-col items-start gap-4">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex flex-wrap items-center gap-2.5 border border-[var(--gold)]/40 bg-slate-950/80 px-5 py-2 text-xs font-semibold text-white/95 shadow-2xl backdrop-blur-md sm:text-sm"
            style={{ borderRadius: "var(--badge-radius, 9999px)" }}
          >
            <GraduationCap className="size-4 text-[var(--gold)] shrink-0 mr-0.5" />
            <div className="inline-flex items-center gap-2.5">
              <Link
                href="/"
                className="transition-colors hover:text-[var(--gold)] hover:underline text-white/80"
              >
                Home
              </Link>
            </div>
            <span className="text-[var(--gold)] font-extrabold text-xs sm:text-sm">*</span>
            <div className="inline-flex items-center gap-2.5">
              <span className="font-bold text-[var(--gold)] drop-shadow-sm">
                Admissions
              </span>
            </div>
          </nav>

          <div className="mt-2 space-y-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-md leading-tight font-[var(--font-display)]">
              Admissions
            </h1>
          </div>
        </div>
      </section>

      {/* Guidelines & Form Container */}
      <section className="container-page py-12 lg:py-20 max-w-6xl space-y-12">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 space-y-2 shadow-xs">
            <div className="grid size-12 place-items-center rounded-xl bg-amber-400/20 text-gold mb-4">
              <FileText className="size-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">1. Submit Form</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Provide student details, parent contact information, and class selection online.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 space-y-2 shadow-xs">
            <div className="grid size-12 place-items-center rounded-xl bg-amber-400/20 text-gold mb-4">
              <Calendar className="size-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">2. Interaction Slot</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Our admissions team will contact you within 24 hours to schedule a campus visit and interaction.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 space-y-2 shadow-xs">
            <div className="grid size-12 place-items-center rounded-xl bg-amber-400/20 text-gold mb-4">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">3. Final Enrollment</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Verify original documents, complete fee submission, and finalize admission enrollment.
            </p>
          </div>
        </div>

        {/* Embedded Form Card */}
        <div className="rounded-3xl border border-border bg-card text-card-foreground p-6 sm:p-10 shadow-lift">
          <div className="mb-8 border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold uppercase text-gold border border-amber-400/30 mb-2">
                Official Application Form
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Student Registration Form
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
              Please fill out all mandatory fields marked with (*).
            </p>
          </div>

          <AdmissionForm />
        </div>
      </section>
    </main>
  );
}
