import { getOptionalApi, unwrapCollection, unwrapSetting, type ApiRecord, type PaginatedData } from "@/lib/api-client";
import fallbackSiteData from "@/public/cloud-datasource.json";

export type SiteRecord = ApiRecord;

export interface SiteData {
  home: SiteRecord[];
  news?: SiteRecord[];
  galleryItems?: SiteRecord[];
  reviewsItems?: SiteRecord[];
  [key: string]: unknown;
}

export async function getSiteData(): Promise<SiteData> {
  const fallback = fallbackSiteData as SiteData;
  const [siteResponse, newsResponse, galleryResponse, reviewsResponse] = await Promise.all([
    getOptionalApi<SiteData | { value?: SiteData; _doc?: { value?: SiteData } }>("/regarding/datasource"),
    getOptionalApi<SiteRecord[] | PaginatedData<SiteRecord>>("/news", { limit: 8, page: 1, sortOrder: "desc" }),
    getOptionalApi<SiteRecord[] | PaginatedData<SiteRecord>>("/gallery", { limit: 50, page: 1, sortOrder: "desc" }),
    getOptionalApi<SiteRecord[] | PaginatedData<SiteRecord>>("/reviews", { limit: 12, page: 1, sortOrder: "desc" }),
  ]);
  const siteData = siteResponse ? unwrapSetting<SiteData>(siteResponse) : fallback;
  const apiNews = unwrapCollection(newsResponse);
  const apiGallery = unwrapCollection(galleryResponse);
  const apiReviews = unwrapCollection(reviewsResponse);
  const fallbackGallery = Array.isArray(fallback.gallery)
    ? fallback.gallery as SiteRecord[]
    : [];
  const fallbackReviews = Array.isArray(fallback.reviews)
    ? fallback.reviews as SiteRecord[]
    : [];

  return {
    ...fallback,
    ...siteData,
    // Each public endpoint is independent. A missing content setting must not
    // prevent live reviews, news, or gallery records from being displayed.
    home: siteData.home?.length ? siteData.home : fallback.home,
    news: apiNews.length ? apiNews : fallback.news,
    galleryItems: apiGallery.length ? apiGallery : fallbackGallery,
    reviewsItems: apiReviews.length ? apiReviews : fallbackReviews,
  };
}

export function homeData(siteData: SiteData): SiteRecord {
  return siteData.home?.[0] ?? {};
}

export function firstSection(home: SiteRecord, key: string): SiteRecord {
  const section = home[key];
  return Array.isArray(section) ? ((section[0] as SiteRecord) ?? {}) : {};
}

export function sectionItems(home: SiteRecord, key: string): SiteRecord[] {
  const section = home[key];
  return Array.isArray(section) ? (section as SiteRecord[]) : [];
}

export function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function textList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function imageUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string" && item.length > 0) ?? "";
  }
  return "";
}

export function imageUrls(record: SiteRecord): string[] {
  const value = record.fileUrls ?? record.fileUrl;
  if (!Array.isArray(value)) return imageUrl(value) ? [imageUrl(value)] : [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}
