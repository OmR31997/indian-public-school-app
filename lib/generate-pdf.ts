/**
 * generate-pdf.ts
 *
 * Lightweight, zero-external-dependency Printable Document Engine
 * powered by pure HTML5/CSS printing templates.
 * Replaces heavy client-side libraries (jspdf/jspdf-autotable) with
 * high-performance browser-native document rendering.
 */
export * from "./pdf-template";

import {
  generatePdfHtmlTemplate,
  generateDisclosureHtmlTemplate,
  PdfTemplateSection,
  PdfTemplateRow,
  DisclosureSectionData,
} from "./pdf-template";

export interface GeneratedPdfResult {
  html: string;
  blob: Blob;
  blobUrl: string;
  fileName: string;
  download: () => void;
  print: () => void;
}

export interface GeneratePdfOptions {
  title: string;
  subtitle?: string;
  docNumber?: string;
  date?: string;
  school?: {
    schoolName?: string;
    tagline?: string;
    affiliationNo?: string;
    schoolCode?: string;
    trustName?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    secondaryLogoUrl?: string;
    showSecondaryLogo?: boolean;
  };
  sections: Array<{
    title: string;
    badge?: string;
    description?: string;
    columns?: Array<string | { header: string }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows?: any[][];
    notes?: string[];
  }>;
  fileName?: string;
  autoDownload?: boolean;
}

export function generatePdfDocument(opts: GeneratePdfOptions): GeneratedPdfResult {
  const {
    title,
    subtitle,
    docNumber,
    date,
    school = {},
    sections = [],
    fileName = `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`,
  } = opts;

  const templateSections: PdfTemplateSection[] = sections.map((s) => ({
    title: s.title,
    badge: s.badge,
    description: s.description,
    columns: s.columns?.map((c) => (typeof c === "string" ? c : c.header)),
    rows: s.rows as PdfTemplateRow[],
  }));

  const html = generatePdfHtmlTemplate({
    title,
    subtitle,
    docNumber,
    date,
    schoolName: school.schoolName,
    affiliationNo: school.affiliationNo,
    schoolCode: school.schoolCode,
    trustName: school.trustName,
    address: school.address,
    phone: school.phone,
    email: school.email,
    website: school.website,
    logoUrl: school.logoUrl,
    secondaryLogoUrl: school.secondaryLogoUrl,
    showSecondaryLogo: school.showSecondaryLogo,
    sections: templateSections,
  });

  const blob =
    typeof Blob !== "undefined"
      ? new Blob([html], { type: "text/html" })
      : (null as unknown as Blob);
  const blobUrl =
    blob && typeof URL !== "undefined" && URL.createObjectURL
      ? URL.createObjectURL(blob)
      : "";

  const print = () => {
    if (typeof window === "undefined") return;
    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        try {
          printWin.print();
        } catch (e) {
          console.warn("Print error", e);
        }
      }, 350);
    }
  };

  const download = () => {
    print();
  };

  return {
    html,
    blob,
    blobUrl,
    fileName,
    download,
    print,
  };
}

export function generateDisclosurePdf(opts: {
  sections: DisclosureSectionData[];
  schoolName?: string;
  affiliationNo?: string;
  schoolCode?: string;
  pageTitle?: string;
  logoUrl?: string;
  secondaryLogoUrl?: string;
  showSecondaryLogo?: boolean;
  autoDownload?: boolean;
}): GeneratedPdfResult {
  const html = generateDisclosureHtmlTemplate(opts);
  const fileName = `${(opts.schoolName || "Indian_Public_School_Mandatory_Disclosure").replace(
    /\s+/g,
    "_"
  )}.pdf`;
  const blob =
    typeof Blob !== "undefined"
      ? new Blob([html], { type: "text/html" })
      : (null as unknown as Blob);
  const blobUrl =
    blob && typeof URL !== "undefined" && URL.createObjectURL
      ? URL.createObjectURL(blob)
      : "";

  const print = () => {
    if (typeof window === "undefined") return;
    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        try {
          printWin.print();
        } catch (e) {
          console.warn("Print error", e);
        }
      }, 350);
    }
  };

  return {
    html,
    blob,
    blobUrl,
    fileName,
    print,
    download: print,
  };
}
