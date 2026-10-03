import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCloudinaryRootFolder(): string {
  return (process.env.NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER || 'ips-education').replace(/^\/+|\/+$/g, '');
}

/**
 * Resolves absolute or relative media/file paths to full URLs.
 * - Absolute URLs (http://, https://, data:, blob:) are returned as-is, with Cloudinary resource_type fixes applied if missing.
 * - Relative paths automatically incorporate NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER and appropriate Cloudinary resource_type prefix (video/upload, image/upload, raw/upload).
 */
export function getAssetUrl(url?: string | null): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (trimmed === '/assets/Logos/IPSLOGO.png' || trimmed === '/assets/IPSLOGO.png' || trimmed === 'assets/Logos/IPSLOGO.png') {
    trimmed = 'assets/Settings/Logos/IPSStandardLogo.png';
  }

  if (trimmed === '/IPSIntroVideo.mp4' || trimmed === 'IPSIntroVideo.mp4' || trimmed === '/assets/IPSIntroVideo.mp4' || trimmed === 'assets/IPSIntroVideo.mp4') {
    trimmed = 'assets/Videos/IPSIntroVideo.mp4';
  }

  // Handle absolute Cloudinary URLs missing resource_type (video/upload, image/upload)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.includes('cloudinary.com') && !trimmed.includes('/upload/')) {
      const isVideo = trimmed.includes('/Videos/') || /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)$/i.test(trimmed);
      const isRaw = trimmed.includes('/Documents/') || /\.(pdf|doc|docx|xls|xlsx|zip|txt)$/i.test(trimmed);
      const typePrefix = isVideo ? 'video/upload' : isRaw ? 'raw/upload' : 'image/upload';
      const rootFolder = getCloudinaryRootFolder();
      return trimmed.replace(new RegExp(`/${rootFolder}/`), `/${typePrefix}/${rootFolder}/`);
    }
    return trimmed;
  }

  const rootFolder = getCloudinaryRootFolder();
  let cleanPath = trimmed.replace(/^\/+/, '');

  // Strip hardcoded root folders (ips-education or indian-public-school) so environment variable controls the root folder
  cleanPath = cleanPath
    .replace(/^ips-education\//, '')
    .replace(/^indian-public-school\//, '');

  const lowerPath = cleanPath.toLowerCase();

  let resourcePrefix = 'image/upload';
  if (
    lowerPath.startsWith('video/upload/') ||
    lowerPath.startsWith('image/upload/') ||
    lowerPath.startsWith('raw/upload/')
  ) {
    const cloudinaryBase = process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/niefrrkx';
    const cleanBase = cloudinaryBase.replace(/\/+$/, '');
    return `${cleanBase}/${cleanPath}`;
  }

  if (
    lowerPath.includes('videos/') ||
    /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)$/i.test(lowerPath)
  ) {
    resourcePrefix = 'video/upload';
  } else if (
    lowerPath.includes('documents/') ||
    /\.(pdf|doc|docx|xls|xlsx|zip|txt)$/i.test(lowerPath)
  ) {
    resourcePrefix = 'raw/upload';
  }

  if (rootFolder) {
    cleanPath = `${rootFolder}/${cleanPath}`;
  }

  const cloudinaryBase = process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/niefrrkx';
  const cleanBase = cloudinaryBase.replace(/\/+$/, '');
  return `${cleanBase}/${resourcePrefix}/${cleanPath}`;
}
