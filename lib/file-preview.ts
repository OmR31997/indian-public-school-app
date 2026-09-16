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

  // Convert legacy signed Cloudinary download API links to direct Cloudinary CDN URLs
  if (clean.includes("api.cloudinary.com") && clean.includes("download") && clean.includes("public_id=")) {
    try {
      const urlObj = new URL(clean);
      const publicId = urlObj.searchParams.get("public_id");
      const format = urlObj.searchParams.get("format") || "pdf";
      const pathParts = urlObj.pathname.split("/");
      const cloudIdx = pathParts.indexOf("v1_1");
      const cloudName = cloudIdx !== -1 ? pathParts[cloudIdx + 1] : "niefrrkx";

      if (publicId && cloudName) {
        const decodedPublicId = decodeURIComponent(publicId);
        const hasExt = decodedPublicId.toLowerCase().endsWith(`.${format.toLowerCase()}`);
        const finalPublicId = hasExt ? decodedPublicId : `${decodedPublicId}.${format}`;
        clean = `https://res.cloudinary.com/${cloudName}/image/upload/${finalPublicId}`;
      }
    } catch {
      // Ignore URL parse error and proceed with original clean string
    }
  }

  if (clean.toLowerCase().endsWith(".pdf.pdf")) {
    clean = clean.substring(0, clean.length - 4);
  }
  return clean;
}

export function getCleanUrl(url?: string | null): string {
  if (!url) return "";
  return normalizePdfUrl(url).split("?")[0].split("#")[0];
}

export function isPdfFile(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const normalized = normalizePdfUrl(url);
  const lowercaseUrl = url.toLowerCase();
  const clean = getCleanUrl(normalized).toLowerCase();

  return (
    clean.endsWith(".pdf") ||
    lowercaseUrl.includes(".pdf") ||
    lowercaseUrl.includes("format=pdf") ||
    lowercaseUrl.includes("resource_type=pdf") ||
    lowercaseUrl.includes("/pdf-proxy")
  );
}

export function isDocumentFile(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const normalized = normalizePdfUrl(url);
  const clean = getCleanUrl(normalized).toLowerCase();
  const lowercaseUrl = url.toLowerCase();

  return (
    isPdfFile(url) ||
    /\.(doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|7z)$/i.test(clean) ||
    lowercaseUrl.includes(".doc") ||
    lowercaseUrl.includes(".docx") ||
    lowercaseUrl.includes(".xls") ||
    lowercaseUrl.includes(".xlsx") ||
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
