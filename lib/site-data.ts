import { getOptionalApi, unwrapCollection, unwrapSetting, type ApiRecord, type PaginatedData } from "@/lib/api-client";
import fallbackSiteData from "@/public/cloud-datasource.json";

export type SiteRecord = ApiRecord;

export interface SiteLogoSetting {
  logoUrl?: string;
  logoText?: string;
  logoSubText?: string;
}

export interface CertifiedBoardSetting {
  title?: string;
  code?: string;
  badgeUrl?: string;
  description?: string;
  linkUrl?: string;
  enabled?: boolean;
}

export interface TrustBoardSetting {
  trustName?: string;
  regNo?: string;
  logoUrl?: string;
  description?: string;
  linkUrl?: string;
  enabled?: boolean;
}

export interface WhatsAppSetting {
  enabled?: boolean;
  phone?: string;
  agentName?: string;
  agentRole?: string;
  welcomeMessage?: string;
  presetMessages?: string[];
  position?: "bottom-left" | "bottom-right";
}

export interface SiteData {
  home: SiteRecord[];
  news?: SiteRecord[];
  galleryItems?: SiteRecord[];
  reviewsItems?: SiteRecord[];
  menuItems?: SiteRecord[];
  site_logo?: SiteLogoSetting;
  certified_board?: CertifiedBoardSetting;
  trust_board?: TrustBoardSetting;
  whatsapp?: WhatsAppSetting;
  [key: string]: unknown;
}

export async function getSiteData(): Promise<SiteData> {
  const fallback = fallbackSiteData as SiteData;
  const [siteResponse, newsResponse, galleryResponse, reviewsResponse, menuItemsResponse] = await Promise.all([
    getOptionalApi<SiteData | { value?: SiteData; _doc?: { value?: SiteData } }>("/regarding/datasource"),
    getOptionalApi<SiteRecord[] | PaginatedData<SiteRecord>>("/news", { limit: 8, page: 1, sortOrder: "desc" }),
    getOptionalApi<SiteRecord[] | PaginatedData<SiteRecord>>("/gallery", { limit: 50, page: 1, sortOrder: "desc" }),
    getOptionalApi<SiteRecord[] | PaginatedData<SiteRecord>>("/reviews", { limit: 12, page: 1, sortOrder: "desc" }),
    getOptionalApi<SiteRecord[] | PaginatedData<SiteRecord>>("/menu-items", { publishedOnly: "true" }),
  ]);
  const siteData = siteResponse ? unwrapSetting<SiteData>(siteResponse) : fallback;
  const apiNews = unwrapCollection(newsResponse);
  const apiGallery = unwrapCollection(galleryResponse);
  const apiReviews = unwrapCollection(reviewsResponse);
  const apiMenuItems = unwrapCollection(menuItemsResponse);
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
    // prevent live reviews, news, gallery, or menu records from being displayed.
    home: siteData.home?.length ? siteData.home : fallback.home,
    news: apiNews.length ? apiNews : fallback.news,
    galleryItems: apiGallery.length ? apiGallery : fallbackGallery,
    reviewsItems: apiReviews.length ? apiReviews : fallbackReviews,
    menuItems: apiMenuItems.length ? apiMenuItems : [],
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

export function getWhatsAppConfig(siteData?: SiteData | null): Required<WhatsAppSetting> {
  const home = siteData?.home?.[0] as SiteRecord | undefined;
  const identityObj = (home?.identity as SiteRecord | undefined) ?? {};
  const wa = (identityObj?.whatsapp as WhatsAppSetting | undefined) ?? (siteData?.whatsapp as WhatsAppSetting | undefined) ?? {};

  const phone = text(wa.phone) || "+91 97351 81684";
  const enabled = wa.enabled !== false;
  const agentName = text(wa.agentName) || "IPS Admissions & Support";
  const agentRole = text(wa.agentRole) || "Official Helpdesk";
  const welcomeMessage = text(wa.welcomeMessage) || "Hello! Welcome to Indian Public School. How can we assist you with admissions or campus details today?";
  const presetMessages = Array.isArray(wa.presetMessages) && wa.presetMessages.length > 0
    ? wa.presetMessages.map((m) => String(m))
    : ["Admission Inquiry", "Fee Structure", "Schedule Campus Visit", "General Query"];
  const position = wa.position === "bottom-right" ? "bottom-right" : "bottom-left";

  return {
    enabled,
    phone,
    agentName,
    agentRole,
    welcomeMessage,
    presetMessages,
    position,
  };
}
