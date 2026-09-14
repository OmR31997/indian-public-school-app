import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves absolute or relative media/file paths to full URLs.
 * - Absolute URLs (http://, https://, data:, blob:) are returned as-is.
 * - Relative paths are resolved against NEXT_PUBLIC_CLOUDINARY_BASE_URL or NEXT_PUBLIC_BASE_URL.
 */
export function getAssetUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const cloudinaryBase = process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL;
  if (cloudinaryBase) {
    const cleanBase = cloudinaryBase.replace(/\/+$/, '');
    const cleanPath = trimmed.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  }

  return trimmed;
}

