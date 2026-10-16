"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FileCheck,
  FileText,
  ExternalLink,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Building2,
  Users,
  BookOpen,
  Award,
  ShieldCheck,
  Printer,
  X,
  Filter,
  Layers,
  Eye,
  Loader2,
} from "lucide-react";
import { FileViewerModal } from "@/components/ui/FileViewerModal";
import { getAssetUrl, isExternalUrl } from "@/lib/utils";
import { isPdfFile, isDocumentFile } from "@/lib/file-preview";
import { getSectionBadge } from "@/lib/sequence-serializer";
import { DEFAULT_HERO_IMAGE, DEFAULT_CREST_LOGO, DEFAULT_SECONDARY_LOGO, homeData, imageUrl, isBannerLogoUrl } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";
import { generateDisclosureHtmlTemplate } from "@/lib/pdf-template";

export interface DisclosureViewData {
  label?: string;
  type?: "PDF" | "LINK";
  url: string;
  openInNewTab?: boolean;
}

export interface DisclosureRowData {
  rowId?: string;
  srNo: number | string;
  title: string;
  detail?: string;
  view?: DisclosureViewData | null;
  order?: number;
}

export interface DisclosureSectionData {
  _id?: string;
  id?: string;
  publicId?: string;
  sectionKey: string;
  sectionTitle: string;
  order: number;
  isPublished: boolean;
  items: DisclosureRowData[];
}

interface PublicDisclosureViewProps {
  initialSections: DisclosureSectionData[];
  schoolName?: string;
  affiliationNo?: string;
  schoolCode?: string;
  showNotice?: boolean;
  complianceNote?: string;
  pageTitle?: string;
}

export function PublicDisclosureView({
  initialSections,
  schoolName = "INDIAN PUBLIC SCHOOL",
  affiliationNo = "330833",
  schoolCode = "65830",
  showNotice = true,
  complianceNote = "Fields marked [Enter details] and document links are awaiting the school's verified information.",
  pageTitle = "Mandatory Disclosure",
}: PublicDisclosureViewProps) {
  const siteData = useSiteData();
  const homeIdentity = (homeData(siteData).identity as Record<string, unknown>) || {};
  const siteLogo = (siteData?.site_logo as Record<string, any>) || (homeIdentity.site_logo as Record<string, any>) || {};
  const headerConfig = (homeIdentity.header as Record<string, any>) || (siteData?.header as Record<string, any>) || {};

  const bannerLogo = (siteLogo.logoUrl ? String(siteLogo.logoUrl).trim() : "") ||
    (headerConfig.logoUrl ? String(headerConfig.logoUrl).trim() : "") ||
    "/assets/Settings/Logos/IPSLogo.png";

  const rawSecLogo = (siteLogo.secondaryLogoUrl ? String(siteLogo.secondaryLogoUrl).trim() : "") ||
    (headerConfig.secondaryLogoUrl ? String(headerConfig.secondaryLogoUrl).trim() : "") ||
    DEFAULT_SECONDARY_LOGO;

  const showSec = siteLogo.showSecondaryLogo !== false && headerConfig.showSecondaryLogo !== false;

  const [sections] = useState<DisclosureSectionData[]>(initialSections);
  const [search, setSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Default all expanded
    const initial: Record<string, boolean> = {};
    for (const sec of initialSections) {
      initial[sec.sectionKey] = true;
    }
    return initial;
  });

  // Modal preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrint = useCallback(() => {
    try {
      const html = generateDisclosureHtmlTemplate({
        sections,
        schoolName,
        affiliationNo,
        schoolCode,
        pageTitle,
        logoUrl: imageUrl(bannerLogo) || "/assets/Settings/Logos/IPSLogo.png",
        secondaryLogoUrl: imageUrl(rawSecLogo) || DEFAULT_SECONDARY_LOGO,
        showSecondaryLogo: showSec,
      });
      setPreviewUrl(null);
      setPreviewHtml(html);
      setPreviewTitle(`${schoolName} - ${pageTitle}`);
    } catch (err) {
      console.error("Failed to generate document print template:", err);
    }
  }, [sections, schoolName, affiliationNo, schoolCode, pageTitle, bannerLogo, rawSecLogo, showSec]);

  const allExpanded = useMemo(() => {
    return sections.length > 0 && sections.every((s) => expandedSections[s.sectionKey] !== false);
  }, [sections, expandedSections]);

  const toggleAllSections = () => {
    const nextState = !allExpanded;
    const update: Record<string, boolean> = {};
    for (const s of sections) {
      update[s.sectionKey] = nextState;
    }
    setExpandedSections(update);
  };

  // Filter sections by search
  const filteredSections = useMemo(() => {
    return sections
      .filter((sec) => sec.isPublished !== false)
      .filter((sec) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const titleMatch = sec.sectionTitle.toLowerCase().includes(q);
        const rowMatch = sec.items.some(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            (r.detail && r.detail.toLowerCase().includes(q)) ||
            (r.view && r.view.label && r.view.label.toLowerCase().includes(q)),
        );
        return titleMatch || rowMatch;
      })
      .map((sec) => {
        if (!search.trim()) return sec;
        const q = search.toLowerCase();
        return {
          ...sec,
          items: sec.items.filter(
            (r) =>
              sec.sectionTitle.toLowerCase().includes(q) ||
              r.title.toLowerCase().includes(q) ||
              (r.detail && r.detail.toLowerCase().includes(q)),
          ),
        };
      });
  }, [sections, search]);


  return (
    <div className="flex-1 bg-background text-foreground min-h-screen">
      {/* Signature Indian Public School Hero Banner (Consistent with Dynamic Pages) */}
      <section
        className="relative overflow-hidden py-14 sm:py-18 text-white shadow-xl border-b-2 border-[var(--gold)]/40"
        style={{ background: "var(--gradient-navy, linear-gradient(140deg, #102a4c, #1a5d9c))" }}
      >
        <div className="absolute inset-0 z-0">
          <img
            src={getAssetUrl(DEFAULT_HERO_IMAGE)}
            alt={pageTitle}
            className="h-full w-full object-cover object-center filter brightness-[0.35] contrast-[1.15] opacity-60 scale-105 transition-transform duration-700 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--gold)]/20 via-transparent to-transparent opacity-80 pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-90" />
        </div>

        <div className="container-page relative z-10 max-w-5xl flex flex-col items-start gap-4">
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
                {pageTitle}
              </span>
            </div>
          </nav>

          <div className="mt-2 space-y-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-md leading-tight font-[var(--font-display)]">
              {pageTitle}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container-page py-10 lg:py-16 max-w-5xl space-y-8">
        {/* Statutory Compliance Notice Bar (Indian Public School theme, responsive & dynamic) */}
        {showNotice && (
          <div className="relative overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800/90 border-l-4 border-l-amber-500 dark:border-l-amber-400 bg-gradient-to-r from-blue-50/70 via-slate-50/60 to-amber-50/30 dark:from-slate-900/95 dark:via-slate-900 dark:to-blue-950/25 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="grid size-7 place-items-center rounded-lg bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                <ShieldCheck className="size-4" />
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  CBSE Affiliation No.{" "}
                  <span className="font-bold text-[#102a4c] dark:text-blue-300">
                    {affiliationNo || "330833"}
                  </span>
                </span>
                <span className="text-amber-500 dark:text-amber-400 font-bold mx-2">·</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  School Code{" "}
                  <span className="font-bold text-[#102a4c] dark:text-blue-300">
                    {schoolCode || "65830"}
                  </span>
                </span>
                {complianceNote && (
                  <>
                    <span className="text-slate-400 dark:text-slate-600 mx-1.5 sm:mx-2">·</span>
                    <span className="text-slate-600 dark:text-slate-400 font-normal">
                      {complianceNote}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
        {/* Search & Actions Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search disclosures, certificates, safety documents, staff…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#1a5d9c] focus:outline-hidden focus:ring-2 focus:ring-[#1a5d9c]/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleAllSections}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs print:hidden cursor-pointer"
            >
              <ChevronDown
                size={14}
                className={`text-[#1a5d9c] dark:text-blue-400 transition-transform duration-200 ${
                  allExpanded ? "rotate-180" : ""
                }`}
              />
              <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs print:hidden cursor-pointer"
              title="Open document preview to print or save as PDF (Ctrl + P)"
            >
              <Printer size={14} className="text-[#1a5d9c] dark:text-blue-400" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Disclosure Sections Accordion / Cards */}
        {filteredSections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
            <FileText className="mx-auto size-10 text-muted-foreground/60" />
            <h3 className="text-base font-bold text-foreground">No Disclosures Found</h3>
            <p className="text-xs text-muted-foreground">
              {search
                ? `No disclosure records match "${search}". Try clearing the search term.`
                : "Public disclosure information will be updated shortly."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSections.map((sec, secIdx) => {
              const isExpanded = expandedSections[sec.sectionKey] !== false;

              return (
                <article
                  key={sec.sectionKey || secIdx}
                  id={sec.sectionKey}
                  className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 ring-1 ring-black/[0.02]"
                >
                  {/* Section Title Header */}
                  <header
                    onClick={() => toggleSection(sec.sectionKey)}
                    className="flex cursor-pointer items-center justify-between border-b border-navy-950/20 dark:border-slate-800 bg-gradient-to-r from-[#091b30] via-[#102a4c] to-[#16416f] p-4 sm:p-5 text-white select-none transition-all hover:brightness-105 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black font-mono text-sm shadow-md shadow-amber-500/20 ring-2 ring-white/20 shrink-0">
                        {getSectionBadge(sec.sectionTitle, secIdx)}
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-[var(--font-display)] truncate">
                          {sec.sectionTitle}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`grid size-9 place-items-center rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-all duration-300 shadow-2xs ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </header>

                  {/* Section Items */}
                  {isExpanded && (
                    <div className="bg-white dark:bg-slate-900">
                      {/* Subtle accent rule below header */}
                      <div className="h-0.5 bg-gradient-to-r from-amber-400 via-amber-300/40 to-transparent" />

                      {sec.items.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                          No records listed under this section yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b-2 border-[#102a4c]/20 dark:border-amber-400/30 bg-[#f4f7fa] dark:bg-slate-900/90 text-[#102a4c] dark:text-amber-300 text-[11px] font-extrabold uppercase tracking-wider font-[var(--font-display)]">
                                <th className="py-3.5 px-3 text-center w-16 sm:w-20 border-r border-slate-200/90 dark:border-slate-800">
                                  Sr.
                                </th>
                                <th className="py-3.5 px-4 sm:px-5 w-2/5 sm:w-1/3 min-w-[220px] border-r border-slate-200/90 dark:border-slate-800">
                                  Information / Subject
                                </th>
                                <th className="py-3.5 px-4 sm:px-5 border-r border-slate-200/90 dark:border-slate-800">
                                  Details / Information
                                </th>
                                <th className="py-3.5 px-4 text-center w-36 sm:w-44 min-w-[140px]">
                                  Document
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800 text-xs">
                              {sec.items.map((row, rowIdx) => {
                                const hasDetail = Boolean(row.detail && row.detail.trim());
                                const hasDoc = Boolean(row.view && row.view.url);
                                const rawUrl = row.view?.url || "";
                                const resolvedUrl = getAssetUrl(rawUrl) || rawUrl;
                                const isExternalWeb =
                                  row.view?.type === "LINK" &&
                                  !isPdfFile(rawUrl) &&
                                  !isDocumentFile(rawUrl) &&
                                  isExternalUrl(rawUrl);

                                return (
                                  <tr
                                    key={row.rowId || rowIdx}
                                    className="even:bg-slate-50/70 dark:even:bg-slate-900/40 hover:bg-[#1a5d9c]/5 dark:hover:bg-slate-800/60 transition-colors"
                                  >
                                    {/* Serial Number */}
                                    <td className="py-4 px-3 text-center border-r border-slate-200/80 dark:border-slate-800/80 align-middle">
                                      <span className="inline-flex size-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                                        {row.srNo ?? rowIdx + 1}
                                      </span>
                                    </td>

                                    {/* Row Title */}
                                    <td className="py-4 px-4 sm:px-5 border-r border-slate-200/80 dark:border-slate-800/80 align-middle">
                                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] leading-snug">
                                        {row.title}
                                      </span>
                                    </td>

                                    {/* Text Detail */}
                                    <td className="py-4 px-4 sm:px-5 border-r border-slate-200/80 dark:border-slate-800/80 align-middle">
                                      {hasDetail ? (
                                        <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 text-xs sm:text-[13px] font-sans leading-relaxed">
                                          {row.detail}
                                        </p>
                                      ) : (
                                        <span className="text-slate-300 dark:text-slate-600 font-mono text-sm select-none">—</span>
                                      )}
                                    </td>

                                    {/* Document Action Button */}
                                    <td className="py-4 px-4 text-center align-middle">
                                      {hasDoc ? (
                                        <div className="inline-flex justify-center">
                                          {isExternalWeb ? (
                                            <a
                                              href={resolvedUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#102a4c] to-[#1a5d9c] hover:from-[#1a5d9c] hover:to-[#226eb6] text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] border border-amber-400/30 group cursor-pointer"
                                            >
                                              <FileText size={13} className="text-amber-300 group-hover:scale-110 transition-transform" />
                                              <span>{row.view?.label || "VIEW"}</span>
                                              <ExternalLink size={11} className="text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                                            </a>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setPreviewUrl(resolvedUrl);
                                                setPreviewTitle(row.title || "Mandatory Disclosure Document");
                                              }}
                                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#102a4c] to-[#1a5d9c] hover:from-[#1a5d9c] hover:to-[#226eb6] text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] border border-amber-400/30 group cursor-pointer"
                                            >
                                              <FileText size={13} className="text-amber-300 group-hover:scale-110 transition-transform" />
                                              <span>{row.view?.label || "VIEW"}</span>
                                              <Eye size={12} className="text-white/70 group-hover:text-white transition-colors" />
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-slate-300 dark:text-slate-600 font-mono text-sm select-none">—</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* PDF / Document Viewer Modal */}
      {Boolean(previewUrl || previewHtml) && (
        <FileViewerModal
          isOpen={Boolean(previewUrl || previewHtml)}
          onClose={() => {
            setPreviewUrl(null);
            setPreviewHtml(null);
          }}
          url={previewUrl}
          htmlContent={previewHtml ?? undefined}
          title={previewTitle || "Mandatory Disclosure Document"}
        />
      )}
    </div>
  );
}
