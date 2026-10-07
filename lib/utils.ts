import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCloudinaryRootFolder(): string {
  return (process.env.NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER || 'ips-education/assets').replace(/^\/+|\/+$/g, '');
}


/**
 * Normalizes full Cloudinary or local paths into clean relative paths like /Videos/IPSIntroVideo.mp4 or /Album/ClassRoom.webp
 */
export function toCleanRelativeAssetPath(url?: string | null): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Extract relative path from Cloudinary full URL
  if (trimmed.includes('cloudinary.com')) {
    const match = trimmed.match(/\/(?:ips-education\/assets|assets)\/(.+)$/i);
    if (match && match[1]) {
      const cleanSubPath = match[1].replace(/^\/+/, '');
      return `/${cleanSubPath}`;
    }
  }

  let clean = trimmed.replace(/^https?:\/\/[^\/]+/i, '').replace(/^\/+/, '');
  if (clean.toLowerCase().startsWith('assets/')) {
    clean = clean.slice('assets/'.length);
  }
  return `/${clean}`;
}

/**
 * Resolves absolute or relative media/file paths to full URLs dynamically.
 */
export function getAssetUrl(url?: string | null): string {
  if (!url) return '';
  let trimmed = url.trim()
    .replace(/(?:assets\/Videos\/)+assets\/Videos\//gi, 'assets/Videos/')
    .replace(/(?:Videos\/)+Videos\//gi, 'Videos/');
  if (!trimmed) return '';

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Extract subpath from Cloudinary full URLs if available
  let cleanPath = trimmed;
  if (trimmed.includes('cloudinary.com')) {
    const match = trimmed.match(/\/(?:ips-education\/assets|assets)\/(.+)$/i);
    if (match && match[1]) {
      cleanPath = match[1].replace(/^\/+/, '');
    } else {
      const rootFolder = getCloudinaryRootFolder();
      if (rootFolder) {
        const escapedRoot = rootFolder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        trimmed = trimmed.replace(new RegExp(`\\/${escapedRoot}\\/upload\\/`, 'gi'), '/image/upload/');
      }

      if (!trimmed.includes('/upload/')) {
        const isVideo = trimmed.includes('/Videos/') || /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)$/i.test(trimmed);
        const isRaw = /\.(doc|docx|xls|xlsx|zip|txt|pdf)$/i.test(trimmed);
        const typePrefix = isVideo ? 'video/upload' : isRaw ? 'raw/upload' : 'image/upload';
        const rootFolder = getCloudinaryRootFolder();
        return rootFolder ? trimmed.replace(new RegExp(`/${rootFolder}/`), `/${typePrefix}/${rootFolder}/`) : trimmed;
      }
    }
  }

  // Return standard absolute HTTP URLs if not matched to internal assets
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  cleanPath = cleanPath.replace(/^\/+/, '');
  if (cleanPath.toLowerCase().startsWith('assets/')) {
    cleanPath = cleanPath.slice('assets/'.length);
  }

  cleanPath = cleanPath
    .replace(/(?:assets\/Videos\/)+assets\/Videos\//gi, 'assets/Videos/')
    .replace(/(?:Videos\/)+Videos\//gi, 'Videos/');

  // Return local asset path for relative asset paths (/Videos/..., /Album/..., /Settings/..., /Documents/..., /PressRelease/..., /Review/...)
  if (
    trimmed.startsWith('/assets/') ||
    cleanPath.startsWith('Videos/') ||
    cleanPath.startsWith('Album/') ||
    cleanPath.startsWith('Documents/') ||
    cleanPath.startsWith('Settings/') ||
    cleanPath.startsWith('PressRelease/') ||
    cleanPath.startsWith('Review/') ||
    cleanPath.toLowerCase().includes('bannerlogo') ||
    cleanPath.toLowerCase().includes('ipslogo') ||
    process.env.NEXT_PUBLIC_SERVE_LOCAL_ASSETS === 'true'
  ) {
    return `/assets/${cleanPath}`;
  }

  const rootFolder = getCloudinaryRootFolder();
  const lowerPath = cleanPath.toLowerCase();
  let resourcePrefix = 'image/upload';
  const cloudinaryBase = (process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/dnw7mgysa').replace(/\/+$/, '');

  if (
    lowerPath.startsWith('video/upload/') ||
    lowerPath.startsWith('image/upload/') ||
    lowerPath.startsWith('raw/upload/')
  ) {
    return cloudinaryBase ? `${cloudinaryBase}/${cleanPath}` : `/${cleanPath}`;
  }

  if (
    lowerPath.includes('videos/') ||
    /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)$/i.test(lowerPath)
  ) {
    resourcePrefix = 'video/upload';
  } else if (
    /\.(doc|docx|xls|xlsx|zip|txt|pdf)$/i.test(lowerPath)
  ) {
    resourcePrefix = 'raw/upload';
  }

  let finalCloudPath = cleanPath;
  if (rootFolder) {
    finalCloudPath = `${rootFolder}/${cleanPath}`;
  }

  return cloudinaryBase ? `${cloudinaryBase}/${resourcePrefix}/${finalCloudPath}` : `/${resourcePrefix}/${finalCloudPath}`;
}
