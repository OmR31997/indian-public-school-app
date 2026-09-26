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

export interface ApiMenuItem {
  _id?: string;
  menuId?: string;
  title: string;
  slug?: string;
  targetUrl?: string;
  linkUrl?: string;
  parentId?: string | null;
  level?: number;
  category?: string;
  isPublished?: boolean;
  order?: number;
  subItems?: ApiMenuItem[];
  [key: string]: unknown;
}

export function buildMenuHierarchy(flatItems: any[]): ApiMenuItem[] {
  if (!Array.isArray(flatItems) || flatItems.length === 0) return [];

  const alreadyNested = flatItems.some(
    (item) => Array.isArray(item.subItems) && item.subItems.length > 0
  );
  if (alreadyNested) {
    return flatItems as ApiMenuItem[];
  }

  const validItems = flatItems.filter((item) => {
    if (item.isPublished === false) return false;
    if (item.category && String(item.category).toLowerCase() !== "header") return false;
    return true;
  });

  validItems.sort((a, b) => {
    const levelA = Number(a.level) || 1;
    const levelB = Number(b.level) || 1;
    if (levelA !== levelB) return levelA - levelB;
    const orderA = Number(a.order) || 0;
    const orderB = Number(b.order) || 0;
    return orderA - orderB;
  });

  const nodeMap = new Map<string, ApiMenuItem>();
  const idToNodeMap = new Map<string, ApiMenuItem>();

  validItems.forEach((item) => {
    const targetUrl =
      item.targetUrl ||
      item.linkUrl ||
      item.redirectUrl ||
      (item.slug ? `/${item.slug}` : "/");

    const node: ApiMenuItem = {
      _id: String(item._id || item.menuId || item.id),
      menuId: item.menuId ? String(item.menuId) : undefined,
      slug: item.slug ? String(item.slug) : undefined,
      title: String(item.title || item.heading || ""),
      targetUrl,
      linkUrl: targetUrl,
      order: Number(item.order) || 0,
      level: Number(item.level) || 1,
      isPublished: item.isPublished !== false,
      subItems: [],
    };

    const nodeKey = String(item._id || item.menuId);
    nodeMap.set(nodeKey, node);
    if (item._id) idToNodeMap.set(String(item._id), node);
    if (item.menuId) idToNodeMap.set(String(item.menuId), node);
    if (item.slug) idToNodeMap.set(String(item.slug), node);
  });

  const rootNodes: ApiMenuItem[] = [];

  validItems.forEach((item) => {
    const nodeKey = String(item._id || item.menuId);
    const node = nodeMap.get(nodeKey);
    if (!node) return;

    const parentIdStr = item.parentId ? String(item.parentId).trim() : null;
    if (parentIdStr) {
      const parentNode = idToNodeMap.get(parentIdStr);
      if (parentNode && parentNode !== node) {
        parentNode.subItems!.push(node);
      } else {
        rootNodes.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

export interface SiteData {
  home: SiteRecord[];
  news?: SiteRecord[];
  galleryItems?: SiteRecord[];
  reviewsItems?: SiteRecord[];
  menuItems?: SiteRecord[];
  menuitems?: SiteRecord[];
  site_logo?: SiteLogoSetting;
  certified_board?: CertifiedBoardSetting;
  trust_board?: TrustBoardSetting;
  whatsapp?: WhatsAppSetting;
  [key: string]: unknown;
}

export async function getSiteData(): Promise<SiteData> {
  const fallback = fallbackSiteData as SiteData;
  const rawFallbackMenuitems = Array.isArray(fallback.menuItems)
    ? fallback.menuItems
    : Array.isArray(fallback.menuitems)
      ? fallback.menuitems
      : [];
  const fallbackMenuitemsTree = buildMenuHierarchy(rawFallbackMenuitems as SiteRecord[]);

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

  const finalMenuItems = apiMenuItems.length > 0
    ? buildMenuHierarchy(apiMenuItems)
    : fallbackMenuitemsTree;

  return {
    ...fallback,
    ...siteData,
    // Each public endpoint is independent. A missing content setting must not
    // prevent live reviews, news, gallery, or menu records from being displayed.
    home: siteData.home?.length ? siteData.home : fallback.home,
    news: apiNews.length ? apiNews : fallback.news,
    galleryItems: apiGallery.length ? apiGallery : fallbackGallery,
    reviewsItems: apiReviews.length ? apiReviews : fallbackReviews,
    menuItems: finalMenuItems,
    menuitems: rawFallbackMenuitems as SiteRecord[],
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
  if (typeof value === "string") {
    const url = value.trim();
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("/")) {
      return url;
    }
    return `/${url}`;
  }
  if (Array.isArray(value)) {
    const found = value.find((item): item is string => typeof item === "string" && item.trim().length > 0);
    return found ? imageUrl(found) : "";
  }
  return "";
}

export function imageUrls(record: SiteRecord): string[] {
  const value = record.fileUrls ?? record.fileUrl;
  if (!Array.isArray(value)) return imageUrl(value) ? [imageUrl(value)] : [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export interface OfficeTimingItem {
  days: string;
  hours: string;
}

export function getOfficeTimingsList(
  contactData: Record<string, unknown> | undefined,
  footerConfig: Record<string, unknown> | undefined
): OfficeTimingItem[] {
  const office = (contactData?.["office-timings"] as Record<string, unknown>) ?? {};
  const entries = Object.entries(office).filter(
    ([_, v]) => typeof v === "string" && (v as string).trim() !== ""
  );

  if (entries.length > 0) {
    return entries.map(([days, hours]) => ({ days, hours: String(hours) }));
  }

  const footerHours = typeof footerConfig?.officeHours === "string" ? footerConfig.officeHours.trim() : "";
  if (footerHours) {
    if (footerHours.includes("|")) {
      return footerHours.split("|").map((part) => {
        const [d, h] = part.split(":");
        return { days: d?.trim() || "Hours", hours: h?.trim() || part.trim() };
      });
    }
    return [{ days: "Office Hours", hours: footerHours }];
  }

  return [
    { days: "Monday-Friday", hours: "7:30 AM - 5:00 PM" },
    { days: "Saturday", hours: "9:00 AM - 1:00 PM" },
    { days: "Sunday", hours: "8:00 AM - 2:00 PM" },
  ];
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

