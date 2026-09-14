/**
 * File Preview Utilities for Cloudinary & Universal File Viewer
 */

export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.includes("cloudinary.com") || url.includes("res.cloudinary.com");
}

export function normalizePdfUrl(url?: string | null): string {
  if (!url) return "";
  let clean = url.trim();
  if (clean.toLowerCase().endsWith(".pdf.pdf")) {
    clean = clean.substring(0, clean.length - 4);
  }
  return clean;
}

export function getCleanUrl(url?: string | null): string {
  if (!url) return "";
  return normalizePdfUrl(url).split("?")[0];
}

export function isPdfFile(url?: string | null): boolean {
  if (!url) return false;
  const clean = getCleanUrl(url).toLowerCase();
  return (
    clean.endsWith(".pdf") ||
    clean.includes("resource_type=pdf") ||
    (isCloudinaryUrl(url) && (clean.includes(".pdf") || clean.includes("/raw/upload/")))
  );
}

export function isDocumentFile(url?: string | null): boolean {
  if (!url) return false;
  const clean = getCleanUrl(url).toLowerCase();
  return (
    isPdfFile(url) ||
    /\.(doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|7z)$/i.test(clean) ||
    clean.includes("/raw/upload/")
  );
}

/**
 * Returns an internal Next.js PDF proxy URL so CORS and Content-Disposition headers
 * are handled server-side seamlessly for any external/Cloudinary PDF file.
 */
export function getPdfProxyUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = normalizePdfUrl(url);
  if (trimmed.startsWith("/api/pdf-proxy")) return trimmed;
  return `/api/pdf-proxy?url=${encodeURIComponent(trimmed)}`;
}

/**
 * Generates a high-quality JPG picture thumbnail URL for Cloudinary PDFs.
 * Page parameter specifies which PDF page to render as a picture (default page 1).
 */
export function getCloudinaryPdfThumbnailUrl(url?: string | null, page = 1, width = 800): string {
  if (!url) return "";
  const trimmed = normalizePdfUrl(url);

  if (isCloudinaryUrl(trimmed)) {
    if (trimmed.includes("/image/upload/")) {
      const parts = trimmed.split("/image/upload/");
      const transformation = `pg_${page},f_jpg,w_${width},q_auto,c_limit/`;
      let rest = parts[1];
      if (rest.toLowerCase().endsWith(".pdf")) {
        rest = rest.substring(0, rest.length - 4) + ".jpg";
      }
      return `${parts[0]}/image/upload/${transformation}${rest}`;
    }
    if (trimmed.includes("/raw/upload/")) {
      const parts = trimmed.split("/raw/upload/");
      const transformation = `pg_${page},f_jpg,w_${width},q_auto,c_limit/`;
      let rest = parts[1];
      if (rest.toLowerCase().endsWith(".pdf")) {
        rest = rest.substring(0, rest.length - 4) + ".jpg";
      }
      return `${parts[0]}/image/upload/${transformation}${rest}`;
    }
  }

  if (isPdfFile(trimmed)) {
    return `/api/pdf-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

/**
 * Returns a Cloudinary URL forced with `fl_inline` so browsers open & preview the file
 * directly instead of triggering a download attachment.
 */
export function getCloudinaryInlineViewerUrl(url?: string | null): string {
  if (!url) return "";
  return normalizePdfUrl(url);
}

/**
 * Returns an embedded Google Docs Viewer URL suitable for rendering inside an <iframe>.
 */
export function getGoogleDocsViewerUrl(url?: string | null): string {
  if (!url) return "";
  const inlineUrl = getCloudinaryInlineViewerUrl(url);
  return `https://docs.google.com/viewer?url=${encodeURIComponent(inlineUrl)}&embedded=true`;
}
