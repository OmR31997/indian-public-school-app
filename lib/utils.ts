import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCloudinaryRootFolder(): string {
  return (process.env.NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER || 'ips-education/assets').replace(/^\/+|\/+$/g, '');
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

  // Handle absolute Cloudinary URLs missing resource_type
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.includes('cloudinary.com')) {
      const rootFolder = getCloudinaryRootFolder();
      if (rootFolder) {
        const escapedRoot = rootFolder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        trimmed = trimmed.replace(new RegExp(`\\/${escapedRoot}\\/upload\\/`, 'gi'), '/image/upload/');
      }

      if (!trimmed.includes('/upload/')) {
        const isVideo = trimmed.includes('/Videos/') || /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)$/i.test(trimmed);
        const isRaw = /\.(doc|docx|xls|xlsx|zip|txt)$/i.test(trimmed);
        const typePrefix = isVideo ? 'video/upload' : isRaw ? 'raw/upload' : 'image/upload';
        const rootFolder = getCloudinaryRootFolder();
        return rootFolder ? trimmed.replace(new RegExp(`/${rootFolder}/`), `/${typePrefix}/${rootFolder}/`) : trimmed;
      }
    }
    return trimmed;
  }

  const rootFolder = getCloudinaryRootFolder();
  let cleanPath = trimmed.replace(/^\/+/, '');

  if (rootFolder && cleanPath.toLowerCase().startsWith(`${rootFolder.toLowerCase()}/`)) {
    cleanPath = cleanPath.slice(rootFolder.length).replace(/^\/+/, '');
  }

  cleanPath = cleanPath
    .replace(/(?:assets\/Videos\/)+assets\/Videos\//gi, 'assets/Videos/')
    .replace(/(?:Videos\/)+Videos\//gi, 'Videos/');

  const lowerPath = cleanPath.toLowerCase();

  let resourcePrefix = 'image/upload';
  const cloudinaryBase = (process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/niefrrkx').replace(/\/+$/, '');

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
    /\.(doc|docx|xls|xlsx|zip|txt)$/i.test(lowerPath)
  ) {
    resourcePrefix = 'raw/upload';
  }

  if (rootFolder) {
    cleanPath = `${rootFolder}/${cleanPath}`;
  }

  return cloudinaryBase ? `${cloudinaryBase}/${resourcePrefix}/${cleanPath}` : `/${resourcePrefix}/${cleanPath}`;
}
