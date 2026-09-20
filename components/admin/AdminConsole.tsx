"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import fallbackSiteData from "@/public/cloud-datasource.json";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  GalleryVerticalEnd,
  GraduationCap,
  ImageIcon,
  LayoutDashboard,
  LoaderCircle,
  LogIn,
  LogOut,
  Menu,
  MessageSquareHeart,
  Pencil,
  Trash2,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  UploadCloud,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  ExternalLink,
  Grid,
  List,
  Folder,
  Crown,
  Shield,
  UserCheck,
  Lock,
  Workflow,
  Save,
  GitBranch,
  ArrowUp,
  ArrowDown,
  Video,
  Music,
  File,
  ChevronLeft,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  RefreshCw,
  Briefcase,
} from "lucide-react";
import { RichTextBox } from "@/components/ui/RichTextBox";
import { CloudinaryGalleryModal, getFileType } from "@/components/admin/CloudinaryGalleryModal";
import { FileViewerModal } from "@/components/ui/FileViewerModal";
import { PdfCanvasThumbnail } from "@/components/ui/PdfCanvasThumbnail";
import { getCloudinaryPdfThumbnailUrl, isPdfFile, getCloudinaryInlineViewerUrl } from "@/lib/file-preview";
import { imageUrl } from "@/lib/site-data";
import { useInquiryNotifications } from "@/lib/hooks/useInquiryNotifications";
import { CareersAdmin } from "@/components/admin/careers/CareersAdmin";
import { useCareerNotifications } from "@/lib/hooks/useCareerNotifications";

function parseJwt(token: string): { sub?: string; email?: string; role?: string; name?: string; allowedModules?: string[] } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isSuperAdminRole(roleValue: unknown): boolean {
  const str = String(roleValue || "").toLowerCase().trim();
  return str.includes("super") || str === "super_admin" || str === "superadmin";
}

function isSubAdminRole(roleValue: unknown): boolean {
  const str = String(roleValue || "").toLowerCase().trim();
  return str.includes("sub") || str === "sub_admin" || str === "subadmin" || str === "admin" || str.includes("school");
}

function hasPermission(
  userModules: string[] | undefined,
  isSuper: boolean,
  resourceKey: ResourceKey,
  action: "access" | "update" | "delete"
): boolean {
  if (isSuper) return true;
  if (resourceKey === "careers") return true;
  if (!userModules) return true;
  if (userModules.includes("*")) return true;

  // Granular check e.g. "students:access", "students:update", "students:delete"
  if (userModules.includes(`${resourceKey}:${action}`)) return true;

  // Legacy/Full module access check e.g. "students"
  if (userModules.includes(resourceKey)) return true;

  return false;
}


function RoleBadge({ role }: { role: unknown }) {
  const r = String(role || "Sub Admin");
  if (isSuperAdminRole(r)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 shadow-2xs">
        <Crown size={13} className="fill-amber-500 text-amber-600" />
        <span>Super Admin</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-bold text-[#1a5d9c]">
      <Shield size={13} className="text-[#1a5d9c]" />
      <span>Sub Admin</span>
    </span>
  );
}

type RecordItem = Record<string, unknown>;
type ResourceKey =
  | "students"
  | "staff"
  | "inquiries"
  | "news"
  // | "notices"
  | "gallery"
  | "reviews"
  | "school-settings"
  | "menu-items"
  | "pages"
  | "users"
  | "careers";

type InputType = "text" | "date" | "number" | "textarea" | "boolean" | "file" | "select" | "richtext";

type Resource = {
  key: ResourceKey;
  label: string;
  description: string;
  icon: any;
  protected?: boolean;
  fields: string[];
  inputs: Record<string, InputType>;
  options?: Record<string, string[]>;
};

const API_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
const resourcePath: Record<ResourceKey, string> = {
  students: "students",
  staff: "staff",
  inquiries: "inquiries",
  news: "news",
  // notices: "notices",
  gallery: "gallery",
  reviews: "reviews",
  "school-settings": "school-settings",
  "menu-items": "menu-items",
  pages: "pages",
  users: "auth/users",
  careers: "careers",
};

const resources: Resource[] = [
  {
    key: "students",
    label: "Students",
    description: "Admissions and student records",
    icon: GraduationCap,
    protected: true,
    fields: ["name", "grade", "section", "parentName", "parentEmail", "status", "createdAt", "updatedAt"],
    inputs: { name: "text", grade: "text", section: "text", dob: "date", gender: "select", parentName: "text", parentPhone: "text", parentEmail: "text", address: "textarea", status: "select", avatar: "file" },
    options: { gender: ["Male", "Female", "Other"], status: ["Active", "Inactive"] },
  },
  {
    key: "staff",
    label: "Staff",
    description: "Faculty and employee directory",
    icon: Users,
    protected: true,
    fields: ["name", "designation", "department", "email", "status", "createdAt", "updatedAt"],
    inputs: { name: "text", email: "text", phone: "text", department: "text", staffType: "select", designation: "text", qualification: "text", joinDate: "date", status: "select", avatar: "file" },
    options: { staffType: ["Teaching", "Non-Teaching", "Administrative", "Support Staff", "Management"], status: ["Active", "On Leave", "Inactive"] },
  },
  {
    key: "inquiries",
    label: "Enquiries",
    description: "Admission and contact leads",
    icon: ClipboardList,
    protected: true,
    fields: ["name", "inquiryType", "email", "contact", "status", "createdAt", "updatedAt"],
    inputs: {
      name: "text",
      contact: "text",
      email: "text",
      inquiryType: "select",
      message: "textarea",
      status: "select",
    },
    options: { inquiryType: ["Admission", "General", "Academic", "Transport", "Fee Structure", "Other"], status: ["Pending", "In Progress", "Resolved", "Closed"] },
  },
  {
    key: "news",
    label: "News",
    description: "Homepage announcements",
    icon: FileText,
    protected: true,
    fields: ["title", "redirectUrl", "createdAt", "updatedAt"],
    inputs: { title: "text", redirectUrl: "text", attachmentUrl: "file" },
  },
  // {
  //   key: "notices",
  //   label: "Notices",
  //   description: "Notice-board publishing",
  //   icon: Bell,
  //   protected: true,
  //   fields: ["title", "category", "priority", "isPublished", "createdAt", "updatedAt"],
  //   inputs: { title: "text", category: "select", content: "textarea", priority: "select", targetAudience: "select", publishDate: "date", expiryDate: "date", isPublished: "boolean", attachmentUrl: "file" },
  //   options: {
  //     category: ["Academic", "Holiday", "Events", "Examination", "General"],
  //     priority: ["Low", "Medium", "High", "Urgent"],
  //     targetAudience: ["ALL", "Students", "Parents", "Staff", "Public"],
  //   },
  // },
  {
    key: "gallery",
    label: "Gallery",
    description: "Campus media library, albums and directory folders",
    icon: ImageIcon,
    protected: true,
    fields: ["eventName", "directory", "eventType", "fileUrl", "createdAt", "updatedAt"],
    inputs: { eventName: "text", directory: "select", eventType: "select", fileUrl: "file" },
    options: {
      directory: [
        "/album/General",
        "/album/Campus",
        "/album/Events",
        "/album/Sports",
        "/album/Activities",
        "/album/Hostel",
        "/album/AdmissionDocuments",
        "indian-public-school/assets/AdmissionDocuments",
        "indian-public-school/assets/Documents",
        "indian-public-school/assets/Header",
        "indian-public-school/assets/Home",
        "indian-public-school/assets/Infrastructure",
        "indian-public-school/assets/LIFE@IPS",
        "indian-public-school/assets/LIFE@IPS/Competition@365Days",
        "indian-public-school/assets/LIFE@IPS/LifeInHostel",
        "indian-public-school/assets/LIFE@IPS/OurLearningPartners",
        "indian-public-school/assets/LIFE@IPS/StudentEmpowerment",
        "indian-public-school/assets/Logos",
        "indian-public-school/assets/MandatoryDisclosure",
        "indian-public-school/assets/News",
        "indian-public-school/assets/PressRelease",
        "indian-public-school/assets/Review",
        "indian-public-school/assets/Staff",
        "indian-public-school/assets/Videos",
      ],
      eventType: [
        "General",
        "AdmissionDocuments",
        "Documents",
        "News",
        "Campus",
        "Events",
        "Sports",
        "Activities",
        "Hostel",
        "Arts",
        "Awareness",
        "Celebration",
        "Academic",
        "Infrastructure",
      ],
    },
  },
  {
    key: "reviews",
    label: "Reviews",
    description: "Testimonials moderation",
    icon: MessageSquareHeart,
    protected: true,
    fields: ["name", "batch", "rating", "isApproved", "createdAt", "updatedAt"],
    inputs: { name: "text", batch: "text", rating: "number", feedback: "textarea", avatar: "file", isApproved: "boolean" },
  },
  {
    key: "school-settings",
    label: "Settings",
    description: "School identity and configuration",
    icon: Settings,
    protected: true,
    fields: ["key", "category", "value", "status", "isPublic", "createdAt", "updatedAt"],
    inputs: { key: "text", category: "select", value: "textarea", description: "textarea", status: "select", isPublic: "boolean" },
    options: { category: ["Content", "Header", "Footer", "General"], status: ["Active", "Inactive"] },
  },
  {
    key: "menu-items",
    label: "Website menu",
    description: "Navigation structure (up to 3 levels)",
    icon: Menu,
    fields: ["title", "level", "parentId", "category", "isPublished", "order", "createdAt", "updatedAt"],
    inputs: { title: "text", parentId: "select", targetUrl: "text", category: "select", order: "number", isPublished: "boolean" },
    options: { category: ["Header", "Footer", "Quick Links", "Sidebar"] },
  },
  {
    key: "pages",
    label: "Pages",
    description: "Manage dynamic pages & rich text content",
    icon: FileText,
    protected: true,
    fields: ["title", "targetUrl", "isPublished", "createdAt", "updatedAt"],
    inputs: { title: "text", targetUrl: "text", textContent: "richtext", isPublished: "boolean" },
  },
  {
    key: "users",
    label: "Administrators",
    description: "Authorised user accounts",
    icon: ShieldCheck,
    protected: true,
    fields: ["name", "email", "role", "status", "createdAt", "updatedAt"],
    inputs: { name: "text", email: "text", password: "text", role: "text", status: "select" },
    options: { status: ["ACTIVE", "INACTIVE", "SUSPENDED"] },
  },
  {
    key: "careers",
    label: "Careers",
    description: "Manage job openings, dynamic table fields, and candidate applications",
    icon: Briefcase,
    protected: true,
    fields: ["title", "qualification", "isActive", "createdAt"],
    inputs: { title: "text", qualification: "text", image: "file", description: "textarea", isActive: "boolean" },
  },
];

const OPTIONAL_FIELDS = new Set([
  "avatar",
  "attachmentUrl",
  "fileUrl",
  "file",
  "description",
  "expiryDate",
  "house",
  "transportRoute",
  "altText",
  "menuId",
  "redirectUrl",
  "targetUrl",
  "parentId",
  "textContent",
  "isPublic",
  "isPublished",
  "isApproved",
]);

function isRequiredField(field: string, resourceKey: string, isEdit: boolean): boolean {
  if (field === "password" && isEdit) return false;
  return !OPTIONAL_FIELDS.has(field);
}

const sectionNames = ["Overview", "People", "Content", "System"] as const;
const resourceSections: Record<ResourceKey, (typeof sectionNames)[number]> = {
  students: "People", staff: "People", inquiries: "People", news: "Content", gallery: "Content", reviews: "Content", "menu-items": "Content", pages: "Content", "school-settings": "System", users: "System", careers: "People",
};

function flattenMenuItems(list: RecordItem[]): RecordItem[] {
  const result: RecordItem[] = [];
  const visited = new Set<string>();

  function walk(item: RecordItem) {
    const id = itemId(item);
    if (!id || visited.has(id)) return;
    visited.add(id);
    const { subItems, children, ...rest } = item;
    result.push(rest as RecordItem);
    const subs = Array.isArray(subItems) ? subItems : Array.isArray(children) ? children : [];
    subs.forEach((sub: RecordItem) => walk(sub as RecordItem));
  }

  list.forEach((item) => walk(item));
  return result;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface QueryParamsState {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  filterKey?: string;
  filterValue?: string;
}

export const DEFAULT_QUERY: QueryParamsState = {
  page: 1,
  limit: 8,
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  filterKey: "",
  filterValue: "All",
};

function asPaginatedPayload(payload: unknown, resourceKey?: string): { items: RecordItem[]; meta: PaginationMeta } {
  if (!payload || typeof payload !== "object") {
    return {
      items: [],
      meta: { page: 1, limit: 8, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    };
  }

  const pObj = payload as Record<string, unknown>;
  let items: RecordItem[] = [];

  // Extract items array
  if (Array.isArray(pObj.data)) {
    items = pObj.data as RecordItem[];
  } else if (Array.isArray(pObj.items)) {
    items = pObj.items as RecordItem[];
  } else if (pObj.data && typeof pObj.data === "object") {
    const dataObj = pObj.data as Record<string, unknown>;
    if (Array.isArray(dataObj.items)) {
      items = dataObj.items as RecordItem[];
    } else if (Array.isArray(dataObj.data)) {
      items = dataObj.data as RecordItem[];
    }
  } else if (Array.isArray(payload)) {
    items = payload as RecordItem[];
  }

  // Extract meta/pagination info from top-level meta, data object, or top-level payload
  const metaObj =
    (pObj.meta && typeof pObj.meta === "object" ? (pObj.meta as Record<string, unknown>) : null) ||
    (pObj.data && typeof pObj.data === "object" && !Array.isArray(pObj.data) ? (pObj.data as Record<string, unknown>) : null) ||
    pObj;

  const total = typeof metaObj.total === "number" ? metaObj.total : items.length;
  const page = typeof metaObj.page === "number" ? metaObj.page : 1;
  const limit = typeof metaObj.limit === "number" ? metaObj.limit : (items.length || 8);
  const totalPages = typeof metaObj.totalPages === "number" ? metaObj.totalPages : Math.ceil(total / (limit || 1)) || 1;
  const hasNextPage = typeof metaObj.hasNextPage === "boolean" ? metaObj.hasNextPage : page < totalPages;
  const hasPrevPage = typeof metaObj.hasPrevPage === "boolean" ? metaObj.hasPrevPage : page > 1;

  if (resourceKey === "menu-items" || items.some((i) => Array.isArray(i.subItems) && i.subItems.length > 0)) {
    items = flattenMenuItems(items);
  }

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
}

function asItems(payload: unknown, resourceKey?: string): RecordItem[] {
  return asPaginatedPayload(payload, resourceKey).items;
}

function itemId(item: RecordItem) {
  return String(item.publicId || item.id || item._id || item.menuId || "");
}

function formatValue(field: string, value: unknown, item?: RecordItem, allItems: RecordItem[] = []) {
  if (field === "isRead") {
    return value === true ? "Read" : "Unread";
  }
  if (value === null || value === undefined || value === "") return "—";

  if (field === "name" && item?.message && typeof item.message === "string") {
    const studentMatch = item.message.match(/STUDENT DETAILS:\s*[\r\n]+Name:\s*([^\r\n]+)/i);
    if (studentMatch && studentMatch[1]) {
      const sName = studentMatch[1].trim();
      const rawName = String(value).trim();
      if (sName.toLowerCase() !== rawName.toLowerCase() && !rawName.toLowerCase().includes(sName.toLowerCase())) {
        return `${sName} (Parent: ${rawName})`;
      }
      return sName;
    }
  }

  if (field === "level") {
    return `Level ${String(value)}`;
  }
  if (field === "parentId") {
    if (item?.parentTitle) return String(item.parentTitle);
    if (typeof item?.parent === "object" && item.parent && "title" in (item.parent as object)) {
      return String((item.parent as Record<string, unknown>).title);
    }
    if (typeof value === "object" && value !== null && "title" in (value as object)) {
      return String((value as Record<string, unknown>).title);
    }
    if (value && allItems.length > 0) {
      const parentIdStr = typeof value === "object" && value && "_id" in (value as object)
        ? String((value as RecordItem)._id)
        : String(value);
      const parentItem = allItems.find((i) => itemId(i) === parentIdStr || String(i._id) === parentIdStr || String(i.menuId) === parentIdStr || String(i.slug) === parentIdStr);
      if (parentItem?.title) return String(parentItem.title);
    }
    return value ? `Parent (${String(value).slice(-6)})` : "—";
  }
  if (field === "createdAt" || field === "updatedAt" || field.toLowerCase().endsWith("at") || field.toLowerCase().endsWith("date")) {
    const d = new Date(String(value));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    }
  }
  if (typeof value === "boolean") return value ? "Published" : "Draft";
  if (Array.isArray(value)) return `${value.length} asset${value.length === 1 ? "" : "s"}`;
  if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) {
    return value.split("/").pop() || value;
  }
  if (typeof value === "string" && value.length > 42) return `${value.slice(0, 42)}…`;
  if (typeof value === "object") return "Configured";
  return String(value);
}

function titleCase(value: string) {
  if (value === "inquiryType" || value === "enquirieType") return "Enquiry Type";
  if (value === "profileImageUrl") return "Student Profile Photo (Cloudinary)";
  if (value === "marksheetUrl") return "Previous Year Marksheet (Cloudinary)";
  if (value === "parentId") return "Parent Item (Hierarchy)";
  if (value === "targetUrl") return "Target Redirect URL";
  if (value === "textContent") return "Page Rich Content (HTML/Text)";
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export function AdminConsole() {
  const [active, setActive] = useState<ResourceKey | "overview">("overview");
  const [data, setData] = useState<Partial<Record<ResourceKey, RecordItem[]>>>({});
  const [metaData, setMetaData] = useState<Partial<Record<ResourceKey, PaginationMeta>>>({});
  const [queryParams, setQueryParams] = useState<Partial<Record<ResourceKey, QueryParamsState>>>({});
  const queryParamsRef = useRef(queryParams);
  useEffect(() => {
    queryParamsRef.current = queryParams;
  }, [queryParams]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [token, setToken] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [saving, setSaving] = useState(false);





  const currentUser = useMemo(() => {
    if (!token) return null;
    return parseJwt(token);
  }, [token]);

  const isSuperAdmin = currentUser ? isSuperAdminRole(currentUser.role) : true;

  const allowedModules = useMemo(() => {
    if (!currentUser || isSuperAdmin) return ["*"];
    return currentUser.allowedModules || [];
  }, [currentUser, isSuperAdmin]);

  const canAccessResource = useCallback((resourceKey: ResourceKey): boolean => {
    return hasPermission(allowedModules, isSuperAdmin, resourceKey, "access");
  }, [isSuperAdmin, allowedModules]);

  const canUpdateResource = useCallback((resourceKey: ResourceKey): boolean => {
    return hasPermission(allowedModules, isSuperAdmin, resourceKey, "update");
  }, [isSuperAdmin, allowedModules]);

  const canDeleteResource = useCallback((resourceKey: ResourceKey): boolean => {
    return hasPermission(allowedModules, isSuperAdmin, resourceKey, "delete");
  }, [isSuperAdmin, allowedModules]);


  const fetchResource = useCallback(async (key: ResourceKey, overrideQuery?: Partial<QueryParamsState>) => {
    try {
      const defaultLimit = key === "gallery" ? 100 : DEFAULT_QUERY.limit;
      const currentQuery = {
        ...DEFAULT_QUERY,
        limit: defaultLimit,
        ...(queryParamsRef.current[key] || {}),
        ...(overrideQuery || {}),
      };

      const params: Record<string, unknown> = {
        page: currentQuery.page,
        limit: currentQuery.limit,
      };

      if (currentQuery.search.trim()) {
        params.search = currentQuery.search.trim();
      }
      if (currentQuery.sortBy) {
        params.sortBy = currentQuery.sortBy;
        params.sortOrder = currentQuery.sortOrder;
      }
      if (currentQuery.filterKey && currentQuery.filterValue && currentQuery.filterValue !== "All") {
        params[currentQuery.filterKey] = currentQuery.filterValue;
      }

      if (key === "menu-items") {
        params.flat = "true";
      }

      const response = await axios.get(`${API_URL}/${resourcePath[key]}`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const parsed = asPaginatedPayload(response.data, key);
      setData((previous) => ({ ...previous, [key]: parsed.items }));
      setMetaData((previous) => ({ ...previous, [key]: parsed.meta }));
      setQueryParams((previous) => ({ ...previous, [key]: currentQuery }));
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 404) && key === "users") {
        setToken("");
        window.localStorage.removeItem("ips_admin_token");
        document.cookie = "ips_admin_session=; Path=/; Max-Age=0; SameSite=Lax";
      }
      throw err;
    }
  }, [token]);

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    const readable = resources.filter((resource) => (resource.key !== "users" || token) && canAccessResource(resource.key));
    const results = await Promise.allSettled(readable.map((resource) => fetchResource(resource.key)));
    const networkFailures = results.filter(
      (result) => result.status === "rejected" && (!axios.isAxiosError(result.reason) || !result.reason.response)
    ).length;
    if (readable.length > 0 && networkFailures === readable.length) {
      setError("Cannot connect to backend API server. Check that the API is running on http://localhost:5000.");
    }
    setLoading(false);
  }, [fetchResource, token, canAccessResource]);

  // Notification Hook (SOLID Architecture & Smart Load Optimization)
  const {
    unreadCount,
    unreadNotifications,
    isNotificationOpen: notificationOpen,
    setIsNotificationOpen: setNotificationOpen,
    markAsRead: markInquiryAsRead,
    markAllAsRead: markAllInquiriesAsRead,
    refreshNotifications: fetchUnreadNotifications,
  } = useInquiryNotifications(
    API_URL,
    token,
    data.inquiries as Record<string, unknown>[] | undefined,
    useCallback(() => {
      if (active === "inquiries") {
        void fetchResource("inquiries");
      }
    }, [active, fetchResource])
  );

  const careerNotifications = useCareerNotifications(API_URL, token);

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }
    if (notificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationOpen, setNotificationOpen]);

  useEffect(() => { setToken(window.localStorage.getItem("ips_admin_token") || ""); }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const current = resources.find((resource) => resource.key === active);
  const currentItems = useMemo(() => {
    if (!current) return [];
    return data[current.key] || [];
  }, [current, data]);

  const securedRequest = async (method: "post" | "patch" | "delete", path: string, body?: unknown) => {
    if (!token) { setLoginOpen(true); throw new Error("Please sign in to make changes."); }
    return axios({ method, url: `${API_URL}/${path}`, data: body, headers: { Authorization: `Bearer ${token}` } });
  };

  const save = async (values: Record<string, unknown>) => {
    if (!current) return;
    setSaving(true); setError("");
    try {
      if (current.key === "users") {
        const id = editing ? itemId(editing) : "";
        if (id) {
          await securedRequest("patch", `auth/users/${id}`, values);
        } else {
          await securedRequest("post", "auth/register", values);
        }
      } else {
        const payload = { ...values };
        if (current.key === "menu-items") {
          const title = String(payload.title || "").trim();
          const slug = String(payload.slug || "").trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `menu-${Date.now()}`;
          payload.slug = slug;
          if (editing?.menuId) {
            payload.menuId = String(editing.menuId);
          } else {
            payload.menuId = slug;
          }
          if (!payload.menuId) delete payload.menuId;
        }
        if (current.key === "pages") {
          const title = String(payload.title || "").trim();
          const slug = String(payload.slug || "").trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `page-${Date.now()}`;
          payload.slug = slug;
          if (!payload.targetUrl || String(payload.targetUrl).trim() === "") {
            payload.targetUrl = `/pages/${slug}`;
          }
        }
        const id = editing ? itemId(editing) : "";
        const path = current.key === "menu-items" && id ? `${current.key}/${id}` : editing ? `${current.key}/${id}` : current.key;
        await securedRequest(editing ? "patch" : "post", path, payload);
      }
      setFormOpen(false); setEditing(null); await fetchResource(current.key);
    } catch (reason) {
      if (axios.isAxiosError(reason)) {
        const data = reason.response?.data as { message?: string | string[] } | undefined;
        const msg = data?.message || reason.message;
        setError(Array.isArray(msg) ? msg.join(", ") : String(msg));
        if (reason.response?.status === 404) {
          setFormOpen(false);
          setEditing(null);
          void fetchResource(current.key);
        }
      } else {
        setError(reason instanceof Error ? reason.message : "Unable to save this record.");
      }
    }
    finally { setSaving(false); }
  };

  const remove = async (item: RecordItem) => {
    if (!current) return;
    if (current.key === "users" && isSuperAdminRole(item.role)) {
      alert("Super Admin accounts cannot be deleted directly from the console for safety.");
      return;
    }
    if (!window.confirm("Delete this record? Associated Cloudinary files will also be removed.")) return;
    try {
      const id = itemId(item);
      const path = current.key === "users" ? `auth/users/${id}` : `${current.key}/${id}`;
      await securedRequest("delete", path);
      await fetchResource(current.key);
    } catch (reason) {
      if (axios.isAxiosError(reason)) {
        const data = reason.response?.data as { message?: string | string[] } | undefined;
        const msg = data?.message || reason.message;
        setError(Array.isArray(msg) ? msg.join(", ") : String(msg));
        if (reason.response?.status === 404) {
          void fetchResource(current.key);
        }
      } else {
        setError(reason instanceof Error ? reason.message : "Unable to delete this record.");
      }
    }
  };

  const signOut = () => { window.localStorage.removeItem("ips_admin_token"); document.cookie = "ips_admin_session=; Path=/; Max-Age=0; SameSite=Lax"; window.location.assign("/admin/login"); };

  return <main className="min-h-screen bg-[#f4f7fb] text-slate-800">
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-[272px] flex-col bg-[#102a4c] px-4 py-5 text-slate-200 shadow-2xl transition-transform lg:translate-x-0 ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-9 flex items-center gap-3 px-2"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4bd4f] text-[#102a4c] overflow-hidden p-1"><img src="/assets/Logos/IPSLOGO.png" alt="IPS Logo" className="h-full w-full object-contain" /></div><div><p className="font-display text-lg font-bold text-white">IPS Admin</p><p className="text-xs text-blue-200">Indian Public School</p></div></div>
      <nav className="flex-1 space-y-5 overflow-y-auto">
        <button onClick={() => { setActive("overview"); setMobileMenu(false); }} className={`sidebar-link ${active === "overview" ? "sidebar-link-active" : ""}`}><LayoutDashboard size={18} /> Overview</button>
        {sectionNames.slice(1).map((section) => {
          const sectionResources = resources.filter((resource) => resourceSections[resource.key] === section && canAccessResource(resource.key));
          if (!sectionResources.length) return null;
          return (
            <div key={section}>
              <div className="mb-2 flex items-center justify-between px-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">{section}</p>
                {section === "System" && <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-[#ffd983]"><Crown size={10} /> SUPER</span>}
              </div>
              <div className="space-y-1">
                {sectionResources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <button
                      key={resource.key}
                      onClick={() => { setActive(resource.key); setMobileMenu(false); }}
                      className={`sidebar-link ${active === resource.key ? "sidebar-link-active" : ""}`}
                    >
                      <Icon size={18} />
                      <span>{resource.label}</span>
                      {resource.key === "inquiries" && (data.inquiries?.length || 0) > 0 && (
                        <span className="ml-auto rounded-full bg-[#f4bd4f] px-2 py-0.5 text-[10px] font-bold text-[#102a4c]">
                          {data.inquiries?.length}
                        </span>
                      )}
                      {resource.key === "careers" && careerNotifications.unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-[#f4bd4f] px-2 py-0.5 text-[10px] font-bold text-[#102a4c]">
                          {careerNotifications.unreadCount}
                        </span>
                      )}
                      {resource.key === "users" && <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-amber-300"><Crown size={11} /></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 pt-4 space-y-2">
        {token ? (
          <>
            <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5 border border-white/10">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg font-bold text-xs ${isSuperAdmin ? "bg-amber-400 text-[#102a4c]" : "bg-blue-200 text-[#102a4c]"}`}>
                {isSuperAdmin ? <Crown size={18} /> : <Shield size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">{currentUser?.name || currentUser?.email || "Administrator"}</p>
                <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">{currentUser?.role || (isSuperAdmin ? "Super Admin" : "Sub Admin")}</p>
              </div>
            </div>
            <button onClick={() => setChangePasswordOpen(true)} className="sidebar-link w-full text-xs">
              <KeyRound size={16} /> Change password
            </button>
            <button onClick={signOut} className="sidebar-link w-full text-xs">
              <LogOut size={16} /> Sign out
            </button>
          </>
        ) : (
          <button onClick={() => setLoginOpen(true)} className="sidebar-link w-full">
            <LogIn size={18} /> Admin sign in
          </button>
        )}
      </div>
    </aside>
    {mobileMenu && <button aria-label="Close navigation" onClick={() => setMobileMenu(false)} className="fixed inset-0 z-20 bg-slate-950/40 lg:hidden" />}
    <section className="min-h-screen lg:pl-[272px]">
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-[#f4f7fb] px-5 shadow-xs lg:px-9">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileMenu(true)} className="rounded-lg p-2 text-slate-600 lg:hidden"><Menu /></button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#d69d26]">School administration</p>
            <h1 className="font-display text-xl font-bold text-[#102a4c]">{active === "overview" ? "Good morning, Administrator" : current?.label}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notificationRef}>
            {(() => {
              const totalUnread = unreadCount + careerNotifications.unreadCount;
              return (
                <>
                  <button
                    onClick={() => setNotificationOpen((prev) => !prev)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                    title="Notifications"
                  >
                    <Bell size={18} className="text-[#102a4c]" />
                    {totalUnread > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
                        {totalUnread > 99 ? "99+" : totalUnread}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover Dropdown */}
                  {notificationOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-50 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Bell size={16} className="text-[#1a5d9c]" />
                          <h3 className="font-bold text-[#102a4c] text-sm">Notifications</h3>
                          {totalUnread > 0 && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              {totalUnread} Unread
                            </span>
                          )}
                        </div>
                        {totalUnread > 0 && (
                          <button
                            onClick={async () => {
                              if (unreadCount > 0) await markAllInquiriesAsRead();
                              if (careerNotifications.unreadCount > 0) await careerNotifications.markAllAsRead();
                            }}
                            className="text-[11px] font-bold text-[#1a5d9c] hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="mt-3 max-h-80 overflow-y-auto space-y-2 scrollbar-thin">
                        {/* Career Application Notifications */}
                        {careerNotifications.unreadNotifications.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 px-1">
                              Job Applications ({careerNotifications.unreadNotifications.length})
                            </div>
                            {careerNotifications.unreadNotifications.map((cApp) => {
                              const cId = String(cApp._id || cApp.id || cApp.publicId || "");
                              return (
                                <div
                                  key={cId}
                                  onClick={() => {
                                    setNotificationOpen(false);
                                    setActive("careers");
                                    void careerNotifications.markAsRead(cId);
                                  }}
                                  className="group flex flex-col gap-1 rounded-xl border border-amber-200 bg-[#fdf3da]/60 p-3 text-left transition hover:bg-amber-100/80 cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-[#102a4c] truncate">
                                      {String(cApp.fullName || "New Candidate")}
                                    </span>
                                    <span className="rounded-md bg-[#102a4c] text-[#f4bd4f] px-1.5 py-0.5 text-[9px] font-extrabold uppercase">
                                      {String(cApp.postTitle || "Career")}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700 font-mono">
                                    App Ref: {String(cApp.applicationNo || "APP-REF")}
                                  </p>
                                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                                    <span>{String(cApp.email || cApp.phone || "")}</span>
                                    <span className="font-bold text-[#1a5d9c] group-hover:underline">Review candidate →</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Inquiry Notifications */}
                        {unreadNotifications.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 px-1">
                              Enquiries ({unreadNotifications.length})
                            </div>
                            {unreadNotifications.map((inq) => {
                              const id = itemId(inq);
                              return (
                                <div
                                  key={id}
                                  onClick={() => {
                                    setNotificationOpen(false);
                                    setActive("inquiries");
                                    setEditing(inq);
                                    setFormOpen(true);
                                    void markInquiryAsRead(id);
                                  }}
                                  className="group flex flex-col gap-1 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-left transition hover:bg-blue-100/70 cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-[#102a4c] truncate">
                                      {String(inq.name || "New Applicant")}
                                    </span>
                                    <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                                      {String(inq.inquiryType || "Admission")}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 line-clamp-2">
                                    {String(inq.message || "No message body")}
                                  </p>
                                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                                    <span>{inq.contact ? String(inq.contact) : String(inq.email || "")}</span>
                                    <span className="font-semibold text-blue-800 group-hover:underline">View details →</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {totalUnread === 0 && (
                          <div className="py-8 text-center text-xs text-slate-400">
                            <Check size={24} className="mx-auto mb-2 text-emerald-500 opacity-80" />
                            All notifications read! No pending items.
                          </div>
                        )}
                      </div>

                      <div className="mt-3 border-t border-slate-100 pt-2.5 flex items-center justify-around text-xs font-bold text-[#1a5d9c]">
                        <button
                          onClick={() => {
                            setNotificationOpen(false);
                            setActive("careers");
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Applications ({careerNotifications.unreadCount})
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => {
                            setNotificationOpen(false);
                            setActive("inquiries");
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Enquiries ({unreadCount})
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <button
            onClick={() => {
              void refresh();
              void fetchUnreadNotifications();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Console Data"
          >
            <RefreshCw size={18} className="text-[#102a4c]" />
          </button>
          {token && (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 shadow-xs">
              <div className={`grid h-8 w-8 place-items-center rounded-full font-bold text-xs ${isSuperAdmin ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-blue-100 text-[#1a5d9c]"}`}>
                {isSuperAdmin ? <Crown size={15} className="text-amber-600 fill-amber-400" /> : <Shield size={15} />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#102a4c]">{currentUser?.name || "Administrator"}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{isSuperAdmin ? "Super Admin" : "Sub Admin"}</p>
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="p-5 lg:p-9">{error && <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><span>{error}</span><button onClick={() => setError("")}><X size={16} /></button></div>}{active === "overview" ? <Overview data={data} loading={loading} onNavigate={setActive} /> : active === "careers" ? <CareersAdmin apiUrl={API_URL} token={token} onRefreshNotifications={careerNotifications.refreshNotifications} /> : current && <ResourceView resource={current} items={currentItems} loading={loading} query={queryParams[current.key] || DEFAULT_QUERY} meta={metaData[current.key]} onQueryChange={(newQuery) => void fetchResource(current.key, newQuery)} onCreate={() => { setEditing(null); setFormOpen(true); }} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={remove} token={token} />}</div>
    </section>
    {formOpen && current && <RecordDialog token={token} resource={current} record={editing} saving={saving} allSectionPages={data.pages || []} allMenuItems={data["menu-items"] || []} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={save} />}
    {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} onLoggedIn={(accessToken) => { window.localStorage.setItem("ips_admin_token", accessToken); document.cookie = `ips_admin_session=${encodeURIComponent(accessToken)}; Path=/; SameSite=Lax; Max-Age=28800${location.protocol === "https:" ? "; Secure" : ""}`; setToken(accessToken); setLoginOpen(false); }} />}
    {changePasswordOpen && token && <ChangePasswordDialog token={token} onClose={() => setChangePasswordOpen(false)} />}
  </main>;
}

function Overview({ data, loading, onNavigate }: { data: Partial<Record<ResourceKey, RecordItem[]>>; loading: boolean; onNavigate: (key: ResourceKey) => void }) {
  const cards = [{ key: "students" as const, label: "Students", icon: GraduationCap, tint: "bg-blue-50 text-blue-700" }, { key: "staff" as const, label: "Staff members", icon: Users, tint: "bg-violet-50 text-violet-700" }, { key: "inquiries" as const, label: "Open enquiries", icon: ClipboardList, tint: "bg-amber-50 text-amber-700" }, { key: "news" as const, label: "News", icon: FileText, tint: "bg-emerald-50 text-emerald-700" }];
  const actions = [{ key: "students" as const, title: "Add student", text: "Create an enrolment record" }, { key: "news" as const, title: "Publish news", text: "Share an important update" }, { key: "gallery" as const, title: "Update gallery", text: "Add campus moments" }];
  return <div className="space-y-7"><div className="overflow-hidden rounded-2xl bg-[#102a4c] p-7 text-white shadow-xl"><div className="relative z-10 max-w-xl"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#ffd983]"><Sparkles size={13} /> Operations at a glance</span><h2 className="mt-4 font-display text-3xl font-bold leading-tight">Everything your school needs, in one calm workspace.</h2><p className="mt-3 text-sm leading-6 text-blue-100">Manage people, public content and day-to-day communication from the same dashboard.</p></div><div className="pointer-events-none absolute right-12 top-24 hidden h-52 w-52 rounded-full border-[32px] border-[#f4bd4f]/20 lg:block" /></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ key, label, icon: Icon, tint }) => <button key={key} onClick={() => onNavigate(key)} className="group rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}><Icon size={20} /></div><p className="mt-5 text-3xl font-bold text-[#102a4c]">{loading ? "—" : data[key]?.length ?? 0}</p><div className="mt-1 flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><ChevronRight className="text-slate-300 transition group-hover:translate-x-1" size={17} /></div></button>)}</div><div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]"><section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-display text-xl font-bold text-[#102a4c]">Recent enquiries</h3><p className="text-sm text-slate-500">Follow up with prospective families</p></div><button onClick={() => onNavigate("inquiries")} className="text-sm font-bold text-[#1a5d9c]">View all</button></div><div className="space-y-3">{(data.inquiries || []).slice(0, 4).map((item) => <div key={itemId(item)} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#dce9f8] text-sm font-bold text-[#1a5d9c]">{String(item.name || "?").slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-700">{String(item.name || "New enquiry")}</p><p className="truncate text-xs text-slate-500">{String(item.inquiryType || "General inquiry")}</p></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">{String(item.status || "Pending")}</span></div>)}{!loading && !data.inquiries?.length && <Empty text="No enquiries yet" />}</div></section><section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h3 className="font-display text-xl font-bold text-[#102a4c]">Quick actions</h3><div className="mt-4 space-y-2">{actions.map((action) => <button key={action.key} onClick={() => onNavigate(action.key)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[#edf5fc]"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#fdf3da] text-[#b7790a]"><Plus size={17} /></div><div><p className="text-sm font-bold text-slate-700">{action.title}</p><p className="text-xs text-slate-500">{action.text}</p></div></button>)}</div></section></div></div>;
}

function MediaDetailDialog({
  item,
  onClose,
  onEdit,
  onDelete,
}: {
  item: RecordItem;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [activeUrlIndex, setActiveUrlIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const getMediaUrls = (val: unknown): string[] => {
    const list: string[] = [];
    if (Array.isArray(val)) list.push(...val.map(String));
    else if (typeof val === "string" && val.trim()) list.push(val.trim());

    if (item.profileImageUrl && typeof item.profileImageUrl === "string") list.push(item.profileImageUrl);
    if (item.marksheetUrl && typeof item.marksheetUrl === "string") list.push(item.marksheetUrl);
    if (Array.isArray(item.documents)) {
      item.documents.forEach((d: unknown) => {
        if (typeof d === "string" && d.trim()) list.push(d.trim());
      });
    }

    // Extract URLs embedded in inquiry message text
    if (item.message && typeof item.message === "string") {
      const matched = item.message.match(/https?:\/\/[^\s"'>\)]+/gi) || [];
      matched.forEach((url) => {
        if (url.includes("cloudinary") || url.includes("/uploads/")) {
          list.push(url);
        }
      });
    }

    return Array.from(new Set(list.filter((s) => s && s.startsWith("http"))));
  };

  const urls = getMediaUrls(item.fileUrl || item.url || item.path || item.attachmentUrl || item.avatar);
  const primaryUrl = urls[activeUrlIndex] || urls[0] || "";
  const title = String(item.eventName || item.title || item.name || item.originalname || item.album || "Media Item");
  const album = String(item.eventType || item.album || item.category || "General");
  const fileType = getFileType(primaryUrl);
  const isPdf = isPdfFile(primaryUrl);

  const copyUrl = () => {
    if (primaryUrl) {
      void navigator.clipboard.writeText(primaryUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-h-[90vh] w-full max-w-3xl flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 shrink-0 rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#1a5d9c]">
              {fileType === "video" ? (
                <Video size={20} />
              ) : fileType === "audio" ? (
                <Music size={20} />
              ) : fileType === "document" ? (
                <FileText size={20} />
              ) : (
                <ImageIcon size={20} />
              )}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#102a4c]">{title}</h2>
              <p className="text-xs text-slate-500">
                Album: <span className="font-semibold text-[#1a5d9c]">{album}</span>
                {urls.length > 1 && (
                  <span className="ml-2 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    {urls.length} Attached Files
                  </span>
                )}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Media Preview Container */}
          <div className="group relative flex min-h-[260px] max-h-[440px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-3">
            {primaryUrl ? (
              fileType === "video" ? (
                <video src={primaryUrl} controls autoPlay muted className="max-h-[400px] w-auto max-w-full rounded-xl object-contain shadow-lg" />
              ) : fileType === "audio" ? (
                <div className="flex flex-col items-center gap-4 p-8 text-center text-white">
                  <Music size={56} className="text-purple-400 animate-pulse" />
                  <p className="text-sm font-bold text-purple-200">{primaryUrl.split("/").pop()}</p>
                  <audio src={primaryUrl} controls className="w-full max-w-md" />
                </div>
              ) : isPdf ? (
                <div className="relative flex h-full w-full min-h-[280px] max-h-[340px] flex-col items-center justify-center bg-slate-950 p-2">
                  <PdfCanvasThumbnail url={primaryUrl} alt={title} className="max-h-[300px] w-auto max-w-full rounded-xl" />
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsViewerOpen(true)}
                      className="flex items-center gap-2 rounded-xl bg-[#1a5d9c] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition cursor-pointer"
                    >
                      <Eye size={15} /> <span>Open Full Interactive Viewer</span>
                    </button>
                  </div>
                </div>
              ) : fileType === "document" ? (
                <div className="flex flex-col items-center gap-4 p-8 text-center text-white">
                  <FileText size={56} className="text-blue-400" />
                  <div>
                    <p className="text-sm font-bold text-slate-200">{primaryUrl.split("/").pop()}</p>
                    <p className="mt-1 text-xs text-slate-400">Document File</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsViewerOpen(true)}
                    className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 cursor-pointer"
                  >
                    <Eye size={15} /> Open Document Viewer
                  </button>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={primaryUrl} alt={title} className="max-h-[380px] w-auto max-w-full rounded-xl object-contain shadow-lg" />
              )
            ) : (
              <div className="text-sm text-slate-400">No media preview available</div>
            )}
          </div>

          {/* Multiple Attached Files Selector */}
          {urls.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              <span className="text-xs font-bold text-slate-500 shrink-0">Files ({urls.length}):</span>
              {urls.map((u, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveUrlIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${activeUrlIndex === idx
                    ? "bg-[#1a5d9c] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  Asset #{idx + 1} ({getFileType(u)})
                </button>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={copyUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 cursor-pointer"
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                <span>{copied ? "Copied URL!" : "Copy Media URL"}</span>
              </button>
              {primaryUrl && (
                <button
                  type="button"
                  onClick={() => setIsViewerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-[#1a5d9c] shadow-sm transition hover:bg-blue-100 cursor-pointer"
                >
                  <Eye size={16} />
                  <span>Preview Full Media</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-300"
                >
                  <Pencil size={15} /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    onClose();
                    onDelete();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={15} /> Delete
                </button>
              )}
            </div>
          </div>

          {/* Complete Metadata Details */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Complete Record Details</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(item)
                    .filter(([key]) => key !== "_id" && key !== "__v")
                    .map(([key, val]) => (
                    <tr key={key} className="hover:bg-slate-50/50">
                      <td className="w-1/3 whitespace-nowrap bg-slate-50/70 px-4 py-3 font-bold text-slate-600">
                        {titleCase(key)}
                      </td>
                      <td className="break-all px-4 py-3 font-mono text-slate-800">
                        {Array.isArray(val)
                          ? val.join(", ")
                          : typeof val === "object" && val !== null
                            ? JSON.stringify(val)
                            : String(val ?? "")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <FileViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        url={primaryUrl}
        title={title}
      />
    </div>
  );
}

function MenuHierarchyFlow({
  items,
  onEdit,
  onDelete,
}: {
  items: RecordItem[];
  onEdit: (item: RecordItem) => void;
  onDelete: (item: RecordItem) => void;
}) {
  const itemMap = new Map<string, RecordItem & { children: any[] }>();

  items.forEach((item) => {
    const id = itemId(item);
    itemMap.set(id, { ...item, children: [] });
  });

  const roots: any[] = [];

  items.forEach((item) => {
    const id = itemId(item);
    const node = itemMap.get(id);
    const parentId =
      typeof item.parentId === "object" && item.parentId && "_id" in (item.parentId as object)
        ? String((item.parentId as RecordItem)._id)
        : String(item.parentId || "");

    if (parentId && itemMap.has(parentId)) {
      itemMap.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50/50">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Workflow className="text-[#1a5d9c]" size={18} />
          <h3 className="text-sm font-bold text-[#102a4c]">Website Navigation Hierarchy & Flow Connectivity Wire</h3>
        </div>
        <p className="text-xs font-semibold text-slate-500">Visual Parent-Child Connectivity Map (3 Levels)</p>
      </div>

      <div className="space-y-6">
        {roots.map((root) => (
          <div key={itemId(root)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            {/* Level 1 Root Item Node */}
            <div className="flex items-center justify-between gap-3 bg-[#102a4c] text-white p-3.5 rounded-xl shadow-xs">
              <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                <Folder size={18} className="fill-amber-400 text-amber-400 shrink-0" />
                <span className="font-bold text-sm truncate">{String(root.title || "Untitled")}</span>
                <span className="rounded-full bg-blue-500/30 border border-blue-300/40 px-2.5 py-0.5 text-[10px] font-bold text-blue-200">
                  Level 1 (Root)
                </span>
                {root.children.length > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold">
                    <GitBranch size={11} /> {root.children.length} sub-items attached
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">(No sub-items)</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(root)}
                  className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white"
                  title="Edit Root Item"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(root)}
                  className="rounded-lg p-1.5 text-red-300 hover:bg-white/10 hover:text-red-200"
                  title="Delete Root Item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Level 2 Sub-items Branch Wire */}
            {root.children.length > 0 && (
              <div className="mt-3.5 ml-4 pl-4 border-l-2 border-dashed border-blue-400 space-y-3">
                {root.children.map((sub: any) => (
                  <div key={itemId(sub)} className="relative">
                    <div className="absolute -left-4 top-4 h-0.5 w-4 bg-blue-400"></div>
                    <div className="flex items-center justify-between gap-3 bg-blue-50/80 border border-blue-200/80 p-3 rounded-xl">
                      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                        <FileText size={16} className="text-[#1a5d9c] shrink-0" />
                        <span className="font-bold text-xs text-slate-800 truncate">{String(sub.title || "Untitled")}</span>
                        <span className="rounded-full bg-blue-100 text-[#1a5d9c] px-2 py-0.5 text-[10px] font-bold">
                          Level 2 (Sub-item)
                        </span>
                        {sub.children.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 text-[10px] font-bold">
                            <GitBranch size={11} /> {sub.children.length} sub-items
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEdit(sub)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-100 hover:text-[#1a5d9c]"
                          title="Edit Sub Item"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(sub)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete Sub Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Level 3 Sub-sub-items Branch Wire */}
                    {sub.children.length > 0 && (
                      <div className="mt-2.5 ml-4 pl-4 border-l-2 border-dashed border-emerald-400 space-y-2">
                        {sub.children.map((subSub: any) => (
                          <div key={itemId(subSub)} className="relative">
                            <div className="absolute -left-4 top-3.5 h-0.5 w-4 bg-emerald-400"></div>
                            <div className="flex items-center justify-between gap-3 bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                                <span className="font-semibold text-xs text-slate-800 truncate">{String(subSub.title || "Untitled")}</span>
                                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-bold">
                                  Level 3 (Sub-item)
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onEdit(subSub)}
                                  className="rounded-lg p-1 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700"
                                  title="Edit Sub-item"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDelete(subSub)}
                                  className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                  title="Delete Sub-item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {roots.length === 0 && <Empty text="No menu items configured." />}
      </div>
    </div>
  );
}

const RESOURCE_FILTERS: Record<string, { label: string; key: string; options: string[] }[]> = {
  students: [
    { label: "Grade", key: "grade", options: ["All", "Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"] },
    { label: "Status", key: "status", options: ["All", "Active", "Inactive", "Graduated", "Transferred"] },
  ],
  staff: [
    { label: "Department", key: "department", options: ["All", "Teaching", "Administration", "Sports", "Support", "Management"] },
    { label: "Role", key: "role", options: ["All", "Teacher", "Principal", "Vice Principal", "Headmaster", "Staff", "Admin"] },
  ],
  news: [
    { label: "Category", key: "category", options: ["All", "Academic", "Sports", "Events", "General", "Announcement"] },
  ],
  // notices: [
  //   { label: "Priority", key: "priority", options: ["All", "Low", "Medium", "High", "Urgent"] },
  //   { label: "Audience", key: "targetAudience", options: ["All", "ALL", "Students", "Parents", "Staff", "Public"] },
  // ],
  pages: [
    { label: "Status", key: "isPublished", options: ["All", "Published", "Draft"] },
  ],
  "menu-items": [
    { label: "Status", key: "isPublished", options: ["All", "Published", "Draft"] },
    { label: "Category", key: "category", options: ["All", "Header", "Footer", "Quick Links", "Sidebar"] },
  ],
  reviews: [
    { label: "Status", key: "status", options: ["All", "Pending", "Approved", "Rejected"] },
  ],
  inquiries: [
    { label: "Status", key: "status", options: ["All", "New", "In Progress", "Contacted", "Resolved", "Closed"] },
  ],
  gallery: [
    { label: "Event Type", key: "eventType", options: ["All", "General", "AdmissionDocuments", "Documents", "News", "Campus", "Events", "Sports", "Activities", "Hostel", "Arts", "Awareness", "Celebration", "Academic", "Infrastructure"] },
    {
      label: "Directory",
      key: "directory",
      options: [
        "All",
        "indian-public-school/assets/AdmissionDocuments",
        "indian-public-school/assets/Documents",
        "indian-public-school/assets/News",
        "indian-public-school/assets/Home",
        "indian-public-school/assets/Header",
        "indian-public-school/assets/Infrastructure",
        "indian-public-school/assets/LIFE@IPS",
        "indian-public-school/assets/Logos",
        "indian-public-school/assets/MandatoryDisclosure",
        "indian-public-school/assets/PressRelease",
        "indian-public-school/assets/Review",
        "indian-public-school/assets/Staff",
        "indian-public-school/assets/Videos",
        "/album/General",
        "/album/Campus",
        "/album/Events",
        "/album/Sports",
        "/album/AdmissionDocuments",
      ],
    },
  ],
  "school-settings": [
    { label: "Status", key: "status", options: ["All", "Active", "Inactive"] },
    { label: "Category", key: "category", options: ["All", "Content", "Header", "Footer", "General"] },
  ],
  users: [
    { label: "Status", key: "status", options: ["All", "ACTIVE", "INACTIVE", "SUSPENDED"] },
    { label: "Role", key: "role", options: ["All", "Super Admin", "Admin", "Sub Admin"] },
  ],
};

function HeaderFooterSettingsCard({
  token,
  items,
  onSaveComplete,
}: {
  token: string;
  items: RecordItem[];
  onSaveComplete: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"logo" | "certified" | "trust">("logo");
  const [galleryPickerField, setGalleryPickerField] = useState<"logoUrl" | "badgeUrl" | "trustLogoUrl" | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const siteDsItem = useMemo(() => items.find((i) => i.key === "site_datasource"), [items]);
  const logoItem = useMemo(() => items.find((i) => i.key === "site_logo"), [items]);
  const certItem = useMemo(() => items.find((i) => i.key === "certified_board"), [items]);
  const trustItem = useMemo(() => items.find((i) => i.key === "trust_board"), [items]);

  const [siteLogo, setSiteLogo] = useState({
    logoUrl: "",
    logoText: "Indian Public School",
    logoSubText: "Learn · Lead · Inspire",
  });

  const [certifiedBoard, setCertifiedBoard] = useState({
    title: "CBSE Affiliated School",
    code: "Affiliation No. 1530211 | School Code: 53123",
    badgeUrl: "",
    description: "Affiliated to Central Board of Secondary Education, New Delhi",
    linkUrl: "/mandatory-disclosure",
    enabled: true,
  });

  const [trustBoard, setTrustBoard] = useState({
    trustName: "K.S. Dalmia Education Trust",
    regNo: "Established under KS Dalmia Education Trust",
    logoUrl: "",
    description: "Dedicated to character building, academic excellence, and holistic personality development.",
    linkUrl: "/about-us/school-establishment",
    enabled: true,
  });

  useEffect(() => {
    const dsVal = (siteDsItem?.value as Record<string, any>) || {};
    const homeIdentity = (Array.isArray(dsVal.home) ? dsVal.home[0]?.identity : dsVal.identity) || {};

    if (homeIdentity.site_logo && typeof homeIdentity.site_logo === "object") {
      setSiteLogo((prev) => ({ ...prev, ...(homeIdentity.site_logo as object) }));
    } else if (logoItem?.value && typeof logoItem.value === "object") {
      setSiteLogo((prev) => ({ ...prev, ...(logoItem.value as object) }));
    }

    if (homeIdentity.certified_board && typeof homeIdentity.certified_board === "object") {
      setCertifiedBoard((prev) => ({ ...prev, ...(homeIdentity.certified_board as object) }));
    } else if (certItem?.value && typeof certItem.value === "object") {
      setCertifiedBoard((prev) => ({ ...prev, ...(certItem.value as object) }));
    }

    if (homeIdentity.trust_board && typeof homeIdentity.trust_board === "object") {
      setTrustBoard((prev) => ({ ...prev, ...(homeIdentity.trust_board as object) }));
    } else if (trustItem?.value && typeof trustItem.value === "object") {
      setTrustBoard((prev) => ({ ...prev, ...(trustItem.value as object) }));
    }
  }, [siteDsItem, logoItem, certItem, trustItem]);

  const saveSettings = async () => {
    if (!token) {
      setError("Please sign in to save identity settings.");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const currentDsVal = (siteDsItem?.value as Record<string, any>) || {};
      const homeList = Array.isArray(currentDsVal.home) ? [...currentDsVal.home] : [{}];
      const firstHome = { ...(homeList[0] || {}) };
      const identityObj = {
        ...(firstHome.identity || {}),
        site_logo: siteLogo,
        certified_board: certifiedBoard,
        trust_board: trustBoard,
      };
      firstHome.identity = identityObj;
      homeList[0] = firstHome;

      const finalVal = {
        ...currentDsVal,
        site_logo: siteLogo,
        certified_board: certifiedBoard,
        trust_board: trustBoard,
        home: homeList,
      };

      await axios.post(
        `${API_URL}/school-settings`,
        {
          key: "site_datasource",
          category: "Content",
          description: "Full home page and website section layout configuration datasource",
          value: finalVal,
          isPublic: true,
          status: "Active",
        },
        { headers }
      );

      setMessage("Header & Footer identity settings saved successfully inside site_datasource!");
      onSaveComplete();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { message?: string })?.message || err.message;
        setError(Array.isArray(msg) ? msg.join(", ") : String(msg));
      } else {
        setError("Failed to save identity settings.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
              Identity Setup
            </span>
            <h3 className="font-display text-xl font-bold text-[#102a4c]">Header & Footer Branding Settings</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Configure School Logo, Certified Board info, and Trust Board details. Applied automatically if present.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={saveSettings}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5d9c] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#124c81] disabled:opacity-60 cursor-pointer shrink-0"
        >
          {saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{saving ? "Saving..." : "Save Identity Settings"}</span>
        </button>
      </div>

      {message && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 border border-emerald-200">
          <span><i className="bi bi-cloud-check-fill"></i> {message}</span>
          <button type="button" onClick={() => setMessage("")}><X size={14} /></button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-red-50 p-3.5 text-xs font-bold text-red-800 border border-red-200">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {/* Tabs Header */}
      <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("logo")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${activeTab === "logo" ? "bg-[#102a4c] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
          <GraduationCap size={15} /> School Logo & Tagline
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("certified")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${activeTab === "certified" ? "bg-[#102a4c] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
          <Crown size={15} /> Certified Company Board
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("trust")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${activeTab === "trust" ? "bg-[#102a4c] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
          <ShieldCheck size={15} /> Trust Board
        </button>
      </div>

      {/* Tab 1: Logo */}
      {activeTab === "logo" && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Logo Image URL</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://res.cloudinary.com/... or /assets/logo.png"
                  value={siteLogo.logoUrl}
                  onChange={(e) => setSiteLogo((p) => ({ ...p, logoUrl: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
                />
                <button
                  type="button"
                  onClick={() => setGalleryPickerField("logoUrl")}
                  className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <UploadCloud size={14} /> Gallery
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Leave empty to keep current default icon setup.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">School Name</label>
              <input
                type="text"
                value={siteLogo.logoText}
                onChange={(e) => setSiteLogo((p) => ({ ...p, logoText: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Tagline / Subtitle</label>
              <input
                type="text"
                value={siteLogo.logoSubText}
                onChange={(e) => setSiteLogo((p) => ({ ...p, logoSubText: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logo Preview</p>
            <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-xs">
              {siteLogo.logoUrl ? (
                <img src={siteLogo.logoUrl} alt="Logo preview" className="h-10 w-auto object-contain" />
              ) : (
                <span className="grid size-10 place-items-center rounded-xl bg-[#102a4c] text-white">
                  <GraduationCap className="size-5" />
                </span>
              )}
              <div className="text-left">
                <p className="font-display text-sm font-bold text-[#102a4c]">{siteLogo.logoText || "Indian Public School"}</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{siteLogo.logoSubText || "Learn · Lead · Inspire"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Certified Company Board */}
      {activeTab === "certified" && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cert-enabled"
              checked={certifiedBoard.enabled}
              onChange={(e) => setCertifiedBoard((p) => ({ ...p, enabled: e.target.checked }))}
              className="size-4 rounded text-[#1a5d9c]"
            />
            <label htmlFor="cert-enabled" className="text-xs font-bold text-slate-700 cursor-pointer">
              Enable Certified Company Board in Footer
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Board / Certification Title</label>
              <input
                type="text"
                placeholder="e.g. CBSE Affiliated School"
                value={certifiedBoard.title}
                onChange={(e) => setCertifiedBoard((p) => ({ ...p, title: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Affiliation Code / Registration No.</label>
              <input
                type="text"
                placeholder="e.g. Affiliation No. 1530211 | School Code: 53123"
                value={certifiedBoard.code}
                onChange={(e) => setCertifiedBoard((p) => ({ ...p, code: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Badge / Logo Image URL</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="https://res.cloudinary.com/... badge image"
                value={certifiedBoard.badgeUrl}
                onChange={(e) => setCertifiedBoard((p) => ({ ...p, badgeUrl: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
              <button
                type="button"
                onClick={() => setGalleryPickerField("badgeUrl")}
                className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <UploadCloud size={14} /> Gallery
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Description / Details</label>
              <textarea
                rows={2}
                placeholder="Details regarding CBSE certification & quality standards"
                value={certifiedBoard.description}
                onChange={(e) => setCertifiedBoard((p) => ({ ...p, description: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Verification Link URL</label>
              <input
                type="text"
                placeholder="e.g. /mandatory-disclosure"
                value={certifiedBoard.linkUrl}
                onChange={(e) => setCertifiedBoard((p) => ({ ...p, linkUrl: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Trust Board */}
      {activeTab === "trust" && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="trust-enabled"
              checked={trustBoard.enabled}
              onChange={(e) => setTrustBoard((p) => ({ ...p, enabled: e.target.checked }))}
              className="size-4 rounded text-[#1a5d9c]"
            />
            <label htmlFor="trust-enabled" className="text-xs font-bold text-slate-700 cursor-pointer">
              Enable Trust Board in Footer
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Trust Name</label>
              <input
                type="text"
                placeholder="e.g. K.S. Dalmia Education Trust"
                value={trustBoard.trustName}
                onChange={(e) => setTrustBoard((p) => ({ ...p, trustName: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Registration / Board Details</label>
              <input
                type="text"
                placeholder="e.g. Established under KS Dalmia Education Trust"
                value={trustBoard.regNo}
                onChange={(e) => setTrustBoard((p) => ({ ...p, regNo: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Trust Seal / Crest Logo Image URL</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="https://res.cloudinary.com/... trust logo"
                value={trustBoard.logoUrl}
                onChange={(e) => setTrustBoard((p) => ({ ...p, logoUrl: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
              <button
                type="button"
                onClick={() => setGalleryPickerField("trustLogoUrl")}
                className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <UploadCloud size={14} /> Gallery
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Trust Description</label>
              <textarea
                rows={2}
                placeholder="Description of the educational trust and vision"
                value={trustBoard.description}
                onChange={(e) => setTrustBoard((p) => ({ ...p, description: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Official Trust Link URL</label>
              <input
                type="text"
                placeholder="e.g. /about-us/school-establishment"
                value={trustBoard.linkUrl}
                onChange={(e) => setTrustBoard((p) => ({ ...p, linkUrl: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cloudinary picker modal */}
      <CloudinaryGalleryModal
        isOpen={Boolean(galleryPickerField)}
        onClose={() => setGalleryPickerField(null)}
        onSelectImage={(url) => {
          if (galleryPickerField === "logoUrl") setSiteLogo((p) => ({ ...p, logoUrl: url }));
          if (galleryPickerField === "badgeUrl") setCertifiedBoard((p) => ({ ...p, badgeUrl: url }));
          if (galleryPickerField === "trustLogoUrl") setTrustBoard((p) => ({ ...p, logoUrl: url }));
          setGalleryPickerField(null);
        }}
      />
    </div>
  );
}

function ResourceView({
  resource,
  items,
  loading,
  query = DEFAULT_QUERY,
  meta,
  onQueryChange,
  canCreate: canCreateProp = true,
  canEdit: canEditProp = true,
  canDelete: canDeleteProp = true,
  onCreate,
  onEdit,
  onDelete,
  token,
}: {
  resource: Resource;
  items: RecordItem[];
  loading: boolean;
  query?: QueryParamsState;
  meta?: PaginationMeta;
  onQueryChange: (newQuery: Partial<QueryParamsState>) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onCreate: () => void;
  onEdit: (item: RecordItem) => void;
  onDelete: (item: RecordItem) => void;
  token?: string;
}) {
  const isMediaResource = resource.key === "gallery";
  const isMenuResource = resource.key === "menu-items";
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMediaResource ? "grid" : "list");
  const [menuViewMode, setMenuViewMode] = useState<"table" | "flow">("table");
  const [activeAlbum, setActiveAlbum] = useState<string>("All");
  const [detailItem, setDetailItem] = useState<RecordItem | null>(null);
  const [localSearch, setLocalSearch] = useState(query.search || "");

  useEffect(() => {
    setLocalSearch(query.search || "");
  }, [query.search]);

  const canCreate = canCreateProp && Object.keys(resource.inputs).length > 0;
  const canEdit = canEditProp && Object.keys(resource.inputs).length > 0;
  const canDelete = canDeleteProp;

  const filtersConfig = RESOURCE_FILTERS[resource.key] || [];

  // Pagination bounds
  const totalItems = meta?.total ?? items.length;
  const currentPage = meta?.page ?? query.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const limit = meta?.limit ?? query.limit ?? 8;
  const startItem = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, totalItems);

  const isFiltered = Boolean(
    query.search ||
    (query.filterKey && query.filterValue && query.filterValue !== "All") ||
    query.sortBy !== "createdAt" ||
    query.sortOrder !== "desc"
  );

  const getMediaUrl = (item: RecordItem): string => {
    const val =
      item.fileUrl ||
      item.fileUrls ||
      item.url ||
      item.secure_url ||
      item.path ||
      item.attachmentUrl ||
      item.avatar ||
      item.src;
    let raw = "";
    if (Array.isArray(val)) {
      raw = String(val[0] || "");
    } else {
      raw = String(val || "");
    }
    if (!raw) {
      return "https://res.cloudinary.com/niefrrkx/image/upload/v1789163175/indian-public-school/assets/Home/hero-campus.jpg";
    }
    return imageUrl(raw);
  };

  const handleSearchSubmit = () => {
    onQueryChange({ search: localSearch.trim(), page: 1 });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl font-bold text-[#102a4c]">{resource.label}</h2>
          <p className="mt-1 text-slate-500">{resource.description}</p>
        </div>
        {canCreate && (
          <button
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5d9c] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#124c81]"
          >
            <Plus size={17} /> {resource.key === "school-settings" ? "Add / Edit Setting" : `Add ${resource.label.endsWith("s") ? resource.label.slice(0, -1) : resource.label}`}
          </button>
        )}
      </div>

      {resource.key === "school-settings" && (
        <HeaderFooterSettingsCard
          token={token || ""}
          items={items}
          onSaveComplete={() => onQueryChange({})}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Header Controls */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-slate-50/70 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-3 py-1 text-xs font-bold text-[#1a5d9c] shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-[#1a5d9c]"></span>
              <span>{totalItems}</span>
              <span className="capitalize font-medium text-slate-600">{resource.label.toLowerCase()}</span>
            </div>

            {/* Domain Filter Selectors */}
            {filtersConfig.map((filter) => {
              const currentValue = query.filterKey === filter.key ? query.filterValue || "All" : "All";
              return (
                <div key={filter.key} className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs shadow-2xs transition hover:border-slate-300">
                  <SlidersHorizontal size={13} className="text-[#1a5d9c]" />
                  <span className="font-semibold text-slate-500">{filter.label}:</span>
                  <select
                    value={currentValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "All") {
                        onQueryChange({ filterKey: "", filterValue: "All", page: 1 });
                      } else {
                        onQueryChange({ filterKey: filter.key, filterValue: val, page: 1 });
                      }
                    }}
                    className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer pr-1"
                  >
                    {filter.options.map((opt) => {
                      const displayLabel = opt.startsWith("indian-public-school/assets/")
                        ? opt.replace("indian-public-school/assets/", "Assets/")
                        : opt;
                      return (
                        <option key={opt} value={opt}>{displayLabel}</option>
                      );
                    })}
                  </select>
                </div>
              );
            })}

            {/* Sort Field & Order Toggle */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs shadow-2xs transition hover:border-slate-300">
              <ArrowUpDown size={13} className="text-[#1a5d9c]" />
              <span className="font-semibold text-slate-500">Sort:</span>
              <select
                value={query.sortBy || "createdAt"}
                onChange={(e) => onQueryChange({ sortBy: e.target.value, page: 1 })}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="name">Name / Title</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => onQueryChange({ sortOrder: query.sortOrder === "asc" ? "desc" : "asc", page: 1 })}
                className="ml-1 flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 font-extrabold uppercase tracking-wider text-[10px] text-slate-700 shadow-2xs hover:bg-slate-200 transition"
                title="Toggle sort direction"
              >
                {query.sortOrder === "asc" ? (
                  <><span>ASC</span><ArrowUp size={10} /></>
                ) : (
                  <><span>DESC</span><ArrowDown size={10} /></>
                )}
              </button>
            </div>

            {/* Clear Filters Button */}
            {isFiltered && (
              <button
                onClick={() => {
                  setLocalSearch("");
                  onQueryChange(DEFAULT_QUERY);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100 transition active:scale-95"
              >
                <RotateCcw size={13} className="text-amber-700" /> Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-slate-400 sm:w-64 shadow-2xs focus-within:border-[#1a5d9c] focus-within:ring-2 focus-within:ring-blue-100 transition duration-150">
              <Search size={15} className="text-slate-400" />
              <input
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearchSubmit();
                }}
                onBlur={handleSearchSubmit}
                placeholder={`Search ${resource.label.toLowerCase()}...`}
                className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>

            {isMediaResource && (
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 shadow-2xs">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-1.5 transition ${viewMode === "grid" ? "bg-white text-[#1a5d9c] shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  title="Album Grid View"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-1.5 transition ${viewMode === "list" ? "bg-white text-[#1a5d9c] shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  title="Table View"
                >
                  <List size={16} />
                </button>
              </div>
            )}

            {isMenuResource && (
              <div className="flex items-center rounded-xl border border-blue-200 bg-blue-50 p-1">
                <button
                  onClick={() => setMenuViewMode("table")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${menuViewMode === "table" ? "bg-white text-[#1a5d9c] shadow-2xs border border-blue-200" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <List size={14} /> Table View
                </button>
                <button
                  onClick={() => setMenuViewMode("flow")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${menuViewMode === "flow" ? "bg-white text-[#1a5d9c] shadow-2xs border border-blue-200" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <Workflow size={14} /> Hierarchy Wire Flow
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Mode Switcher */}
        {viewMode === "grid" && isMediaResource ? (
          <div className="p-6">
            {loading ? (
              <div className="py-16 text-center">
                <LoaderCircle className="mx-auto animate-spin text-[#1a5d9c]" />
              </div>
            ) : items.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => {
                  const mediaUrl = getMediaUrl(item);
                  const title = String(
                    item.eventName || item.title || item.name || item.originalname || item.album || "Media Asset"
                  );
                  const album = String(item.eventType || item.album || item.category || "General");

                  return (
                    <div
                      key={itemId(item)}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md"
                    >
                      {/* Media Card Preview */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                        {mediaUrl ? (
                          (() => {
                            const fType = getFileType(mediaUrl);

                            if (fType === "video") {
                              return (
                                <div className="relative h-full w-full flex flex-col items-center justify-center bg-slate-950 text-white">
                                  <Video size={36} className="text-blue-400" />
                                  <span className="mt-1 text-[11px] font-semibold text-slate-300">Video Asset</span>
                                </div>
                              );
                            }
                            if (fType === "audio") {
                              return (
                                <div className="relative h-full w-full flex flex-col items-center justify-center bg-slate-950 text-white">
                                  <Music size={36} className="text-emerald-400" />
                                  <span className="mt-1 text-[11px] font-semibold text-slate-300">Audio Asset</span>
                                </div>
                              );
                            }
                            if (fType === "document") {
                              return (
                                <div className="relative h-full w-full flex flex-col items-center justify-center bg-slate-950 text-white">
                                  <FileText size={36} className="text-amber-400" />
                                  <span className="mt-1 text-[11px] font-semibold text-slate-300">Document</span>
                                </div>
                              );
                            }
                            return (
                              <img
                                src={mediaUrl}
                                alt={title}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            );
                          })()
                        ) : (
                          <div className="flex flex-col items-center text-slate-500">
                            <ImageIcon size={32} />
                            <span className="mt-1 text-[11px]">No Media</span>
                          </div>
                        )}

                        {/* Album Tag Overlay */}
                        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                          <span className="rounded-full bg-slate-900/70 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white backdrop-blur-xs">
                            {album}
                          </span>
                          {Array.isArray(item.fileUrl) && (item.fileUrl as string[]).length > 1 && (
                            <span className="rounded-full bg-blue-600/90 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-xs">
                              {(item.fileUrl as string[]).length} Files
                            </span>
                          )}
                        </div>

                        {/* Hover Quick Action Buttons */}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/60 opacity-0 transition duration-200 group-hover:opacity-100">
                          <button
                            onClick={() => setDetailItem(item)}
                            className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-800 shadow-md transition hover:scale-110 hover:bg-blue-50 hover:text-[#1a5d9c]"
                            title="View Complete Details"
                          >
                            <Eye size={17} />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-800 shadow-md transition hover:scale-110 hover:bg-blue-50 hover:text-[#1a5d9c]"
                              title="Edit Asset"
                            >
                              <Pencil size={17} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="grid h-9 w-9 place-items-center rounded-xl bg-white text-red-600 shadow-md transition hover:scale-110 hover:bg-red-50"
                              title="Delete Asset"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom Details */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <h4 className="line-clamp-1 text-sm font-bold text-[#102a4c]" title={title}>
                            {title}
                          </h4>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-400 break-all font-mono">
                            {mediaUrl || "No URL"}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          <button
                            onClick={() => setDetailItem(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1a5d9c] transition hover:underline"
                          >
                            <Eye size={14} /> View Details
                          </button>

                          <div className="flex items-center gap-1">
                            {canEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-[#1a5d9c]"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => onDelete(item)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty text={`No ${resource.label.toLowerCase()} found.`} />
            )}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {resource.fields.map((field) => (
                    <th key={field} className="whitespace-nowrap px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {titleCase(field)}
                    </th>
                  ))}
                  {(canEdit || canDelete || isMediaResource) && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={resource.fields.length + 1} className="px-5 py-14 text-center">
                      <LoaderCircle className="mx-auto animate-spin text-[#1a5d9c]" />
                    </td>
                  </tr>
                ) : items.length ? (
                  isMenuResource && menuViewMode === "flow" ? (
                    <tr>
                      <td colSpan={resource.fields.length + 1} className="p-0">
                        <MenuHierarchyFlow items={items} onEdit={onEdit} onDelete={onDelete} />
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const isSuperUser = resource.key === "users" && isSuperAdminRole(item.role);
                      return (
                        <tr
                          key={itemId(item)}
                          className="transition hover:bg-slate-50/70"
                        >
                          {resource.fields.map((field) => {
                            const isMenuTitle = resource.key === "menu-items" && field === "title";
                            const level = Number(item.level || 1);
                            const subCount = items.filter((i) => {
                              const parent =
                                typeof i.parentId === "object" && i.parentId && "_id" in (i.parentId as object)
                                  ? String((i.parentId as RecordItem)._id)
                                  : String(i.parentId || "");
                              return parent === itemId(item);
                            }).length;

                            if (isMenuTitle) {
                              return (
                                <td key={field} className="px-5 py-4 text-sm font-semibold text-slate-800">
                                  <div className="flex items-center gap-2">
                                    {level === 1 ? (
                                      <div className="flex items-center gap-2">
                                        <Folder size={16} className="text-amber-500 fill-amber-100 shrink-0" />
                                        <span className="font-bold text-[#102a4c]">{String(item.title)}</span>
                                        {subCount > 0 && (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-[#1a5d9c]">
                                            <GitBranch size={11} /> {subCount} sub-item{subCount === 1 ? "" : "s"}
                                          </span>
                                        )}
                                      </div>
                                    ) : level === 2 ? (
                                      <div className="flex items-center gap-2 pl-4">
                                        <span className="font-mono text-xs text-slate-300 font-bold">├──</span>
                                        <FileText size={15} className="text-blue-500 shrink-0" />
                                        <span className="text-slate-700">{String(item.title)}</span>
                                        {subCount > 0 && (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                                            <GitBranch size={11} /> {subCount} sub-item{subCount === 1 ? "" : "s"}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 pl-8">
                                        <span className="font-mono text-xs text-slate-300 font-bold">│ &nbsp;└──</span>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                                        <span className="text-slate-600 text-xs">{String(item.title)}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            }

                            return (
                              <td key={field} className="max-w-[220px] px-5 py-4 text-sm text-slate-600">
                                <span
                                  className={
                                    field === "isRead"
                                      ? `rounded-full px-2.5 py-1 text-xs font-bold ${
                                          item[field]
                                            ? "bg-slate-100 text-slate-600"
                                            : "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                                        }`
                                      : typeof item[field] === "boolean"
                                        ? `rounded-full px-2.5 py-1 text-xs font-bold ${
                                            item[field] ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                          }`
                                        : ""
                                  }
                                >
                                  {formatValue(field, item[field], item, items)}
                                </span>
                              </td>
                            );
                          })}
                          {(canEdit || canDelete || isMediaResource) && (
                            <td className="whitespace-nowrap px-5 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setDetailItem(item)}
                                  className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-[#1a5d9c]"
                                  title="View details"
                                >
                                  <Eye size={16} />
                                </button>
                                {canEdit && (
                                  <button
                                    onClick={() => onEdit(item)}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-[#1a5d9c]"
                                    title="Edit record"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                )}
                                {canDelete && (
                                  isSuperUser ? (
                                    <button
                                      disabled
                                      className="rounded-lg p-2 text-slate-300 cursor-not-allowed"
                                      title="Super Admin accounts cannot be deleted"
                                    >
                                      <Lock size={16} />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => onDelete(item)}
                                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                      title="Delete record"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )
                ) : (
                  <tr>
                    <td colSpan={resource.fields.length + 1}>
                      <Empty text={`No ${resource.label.toLowerCase()} found`} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination Toolbar */}
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <span>
              Showing {startItem}–{endItem} of {totalItems} entries
            </span>
            <div className="flex items-center gap-2">
              <span>Items per page:</span>
              <select
                value={limit}
                onChange={(e) => onQueryChange({ limit: Number(e.target.value), page: 1 })}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 outline-none shadow-2xs"
              >
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500 (All)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={meta ? !meta.hasPrevPage : currentPage <= 1}
              onClick={() => onQueryChange({ page: Math.max(1, currentPage - 1) })}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} /> Previous
            </button>

            <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#102a4c] shadow-2xs">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={meta ? !meta.hasNextPage : currentPage >= totalPages}
              onClick={() => onQueryChange({ page: currentPage + 1 })}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Complete Details Modal */}
      {detailItem && (
        <MediaDetailDialog
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={canEdit ? () => onEdit(detailItem) : undefined}
          onDelete={canDelete && !(resource.key === "users" && isSuperAdminRole(detailItem.role)) ? () => onDelete(detailItem) : undefined}
        />
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="px-5 py-12 text-center text-sm text-slate-400">{text}</div>;
}

function HomeLayoutEditorModal({
  token,
  record,
  saving,
  onClose,
  onSave,
}: {
  token: string;
  record: RecordItem | null;
  saving: boolean;
  onClose: () => void;
  onSave: (value: Record<string, unknown>) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "header" | "footer" | "whatsapp" | "hero" | "banner" | "quickCards" | "video" | "sec1" | "sec2" | "sec3" | "sec4" | "sec5" | "sec6" | "sec7" | "sec8" | "sec9" | "sec10" | "rawJson"
  >("header");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");

  const initialValue = useMemo(() => {
    let val = record?.value;
    if (typeof val === "string") {
      try { val = JSON.parse(val); } catch { val = null; }
    }
    if (val && typeof val === "object" && "home" in val && Array.isArray((val as any).home)) {
      return val as any;
    }
    return fallbackSiteData as any;
  }, [record]);

  const [datasource, setDatasource] = useState<any>(initialValue);
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(initialValue, null, 2));

  const homeObj = useMemo(() => {
    return datasource?.home?.[0] || {};
  }, [datasource]);

  const updateHome = (updater: (prevHomeObj: any) => any) => {
    const updatedHomeObj = updater({ ...homeObj });
    const updatedDs = { ...datasource, home: [updatedHomeObj] };
    setDatasource(updatedDs);
    setJsonText(JSON.stringify(updatedDs, null, 2));
  };

  const uploadImage = async (file: File, album = "Home", folder?: string): Promise<string> => {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("album", album);
      if (folder) {
        formData.append("folder", folder);
      }

      const res = await axios.post(`${API_URL}/uploads`, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data?.data ?? res.data;
      const url = data?.url || (Array.isArray(data?.fileUrl) ? data.fileUrl[0] : data?.fileUrl);
      if (!url) throw new Error("No URL returned from upload");
      return url;
    } catch (err) {
      setUploadError(axios.isAxiosError(err) ? String(err.response?.data?.message || err.message) : "Upload failed.");
      return "";
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    let finalVal = datasource;
    if (activeTab === "rawJson") {
      try {
        finalVal = JSON.parse(jsonText);
      } catch {
        setUploadError("Invalid JSON syntax in Raw JSON Editor tab");
        return;
      }
    }

    const homeList = Array.isArray(finalVal.home) ? [...finalVal.home] : [{}];
    const firstHome = { ...(homeList[0] || {}) };
    const currentIdentity = { ...(firstHome.identity || {}) };

    const headerObj = { ...(finalVal.header || currentIdentity.header || {}) };
    const footerObj = { ...(finalVal.footer || currentIdentity.footer || {}) };
    const waObj = { ...(finalVal.whatsapp || currentIdentity.whatsapp || {}) };
    const logoObj = { ...(finalVal.site_logo || currentIdentity.site_logo || {}) };
    const certObj = { ...(finalVal.certified_board || currentIdentity.certified_board || {}) };
    const trustObj = { ...(finalVal.trust_board || currentIdentity.trust_board || {}) };

    firstHome.identity = {
      ...currentIdentity,
      header: headerObj,
      footer: footerObj,
      whatsapp: waObj,
      site_logo: logoObj,
      certified_board: certObj,
      trust_board: trustObj,
    };
    homeList[0] = firstHome;

    finalVal = {
      ...finalVal,
      header: headerObj,
      footer: footerObj,
      whatsapp: waObj,
      site_logo: logoObj,
      certified_board: certObj,
      trust_board: trustObj,
      home: homeList,
    };

    onSave({
      key: record?.key || "site_datasource",
      category: record?.category || "Content",
      description: record?.description || "Full home page layout configuration datasource",
      status: "Active",
      value: finalVal,
      isPublic: true,
    });
  };

  const updateHeaderField = (field: string, val: string) => {
    setDatasource((prev: any) => {
      const homeList = Array.isArray(prev?.home) ? [...prev.home] : [{}];
      const firstHome = { ...(homeList[0] || {}) };
      const identityObj = { ...(firstHome.identity || {}) };
      const headerObj = { ...(identityObj.header || prev?.header || {}), [field]: val };

      identityObj.header = headerObj;
      firstHome.identity = identityObj;
      homeList[0] = firstHome;

      const next = {
        ...prev,
        header: headerObj,
        home: homeList,
      };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const updateFooterField = (field: string, val: string) => {
    setDatasource((prev: any) => {
      const homeList = Array.isArray(prev?.home) ? [...prev.home] : [{}];
      const firstHome = { ...(homeList[0] || {}) };
      const identityObj = { ...(firstHome.identity || {}) };
      const footerObj = { ...(identityObj.footer || prev?.footer || {}), [field]: val };

      identityObj.footer = footerObj;
      firstHome.identity = identityObj;
      homeList[0] = firstHome;

      const next = {
        ...prev,
        footer: footerObj,
        home: homeList,
      };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const updateWhatsAppField = (field: string, val: any) => {
    setDatasource((prev: any) => {
      const homeList = Array.isArray(prev?.home) ? [...prev.home] : [{}];
      const firstHome = { ...(homeList[0] || {}) };
      const identityObj = { ...(firstHome.identity || {}) };
      const waObj = { ...(identityObj.whatsapp || prev?.whatsapp || {}), [field]: val };

      identityObj.whatsapp = waObj;
      firstHome.identity = identityObj;
      homeList[0] = firstHome;

      const next = {
        ...prev,
        whatsapp: waObj,
        home: homeList,
      };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  // Helper array manipulation functions for nested section arrays
  const addItemToSection = (secKey: string, defaultObj: any) => {
    updateHome((prev) => {
      const secList = [...(prev[secKey] || [{}])];
      const listKey = secList[0]?.list ? "list" : "cardItem";
      const items = [...(secList[0]?.[listKey] || [])];
      items.push(defaultObj);
      secList[0] = { ...secList[0], [listKey]: items };
      return { ...prev, [secKey]: secList };
    });
  };

  const deleteItemFromSection = (secKey: string, index: number) => {
    updateHome((prev) => {
      const secList = [...(prev[secKey] || [{}])];
      const listKey = secList[0]?.list ? "list" : "cardItem";
      const items = (secList[0]?.[listKey] || []).filter((_: any, i: number) => i !== index);
      secList[0] = { ...secList[0], [listKey]: items };
      return { ...prev, [secKey]: secList };
    });
  };

  const moveItemInSection = (secKey: string, index: number, dir: "up" | "down") => {
    updateHome((prev) => {
      const secList = [...(prev[secKey] || [{}])];
      const listKey = secList[0]?.list ? "list" : "cardItem";
      const items = [...(secList[0]?.[listKey] || [])];
      const targetIdx = dir === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIdx];
      items[targetIdx] = temp;
      secList[0] = { ...secList[0], [listKey]: items };
      return { ...prev, [secKey]: secList };
    });
  };

  const addTopArrayItem = (key: string, defaultObj: any) => {
    updateHome((prev) => {
      const list = [...(prev[key] || [])];
      list.push(defaultObj);
      return { ...prev, [key]: list };
    });
  };

  const deleteTopArrayItem = (key: string, index: number) => {
    updateHome((prev) => {
      const list = (prev[key] || []).filter((_: any, i: number) => i !== index);
      return { ...prev, [key]: list };
    });
  };

  const moveTopArrayItem = (key: string, index: number, dir: "up" | "down") => {
    updateHome((prev) => {
      const list = [...(prev[key] || [])];
      const targetIdx = dir === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, [key]: list };
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 shrink-0 rounded-t-3xl">
          <div>
            <h2 className="font-display text-xl font-bold text-[#102a4c] flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              Home Page Complete Layout & Content Manager
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dynamically add, remove, reorder, edit cards and upload images for any section.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50/90 p-3 overflow-x-auto scrollbar-thin shrink-0 whitespace-nowrap">
          {[
            { id: "header", label: "Header Config", icon: "bi-card-heading" },
            { id: "footer", label: "Footer Config", icon: "bi-layout-text-window" },
            { id: "whatsapp", label: "WhatsApp Widget", icon: "bi-whatsapp" },
            { id: "hero", label: "Hero Poster", icon: "bi-person-standing" },
            { id: "banner", label: "Banner Slider", icon: "bi-flag-fill" },
            { id: "quickCards", label: "Quick Cards", icon: "bi-grid-3x3-gap" },
            { id: "video", label: "Intro Video Setup", icon: "bi-camera-video-fill" },
            { id: "sec1", label: "Sec 1: About", icon: "bi-building" },
            { id: "sec2", label: "Sec 2: Key Stats", icon: "bi-bar-chart-fill" },
            { id: "sec3", label: "Sec 3: Why Choose", icon: "bi-star-fill" },
            { id: "sec4", label: "Sec 4: Academics", icon: "bi-book-fill" },
            { id: "sec5", label: "Sec 5: Activities", icon: "bi-activity" },
            { id: "sec6", label: "Sec 6: Campus", icon: "bi-building-fill" },
            { id: "sec7", label: "Sec 7: Student Life", icon: "bi-people-fill" },
            { id: "sec8", label: "Sec 8: Courses", icon: "bi-mortarboard-fill" },
            { id: "sec9", label: "Sec 9: Director Message", icon: "bi-person-badge-fill" },
            { id: "sec10", label: "Sec 10: News & Notices", icon: "bi-newspaper" },
            { id: "rawJson", label: "Raw JSON", icon: "bi-code-slash" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition border whitespace-nowrap cursor-pointer ${activeTab === tab.id
                ? "border-[#1a5d9c] bg-[#1a5d9c] text-white shadow-xs"
                : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300"
                }`}
            >
              <i className={`bi ${tab.icon}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {uploadError && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center justify-between">
              <span>{uploadError}</span>
              <button type="button" onClick={() => setUploadError("")} className="text-red-500 hover:text-red-700">
                <X size={14} />
              </button>
            </div>
          )}

          {/* TAB: Header */}
          {activeTab === "header" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                  <i className="bi bi-card-heading text-[#1a5d9c]" /> Website Header & Navigation Top Bar Configuration
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Top Announcement / Notice Bar Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Admissions Open for Session 2026-27 | Apply Online Today"
                      value={datasource?.home?.[0]?.identity?.header?.noticeText || datasource?.header?.noticeText || ""}
                      onChange={(e) => updateHeaderField("noticeText", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Helpline / Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91-9876543210"
                      value={datasource?.home?.[0]?.identity?.header?.phone || datasource?.header?.phone || ""}
                      onChange={(e) => updateHeaderField("phone", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Official Support Email</label>
                    <input
                      type="text"
                      placeholder="e.g. info@indianpublicschool.in"
                      value={datasource?.home?.[0]?.identity?.header?.email || datasource?.header?.email || ""}
                      onChange={(e) => updateHeaderField("email", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Header Action Button Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Apply Now"
                      value={datasource?.home?.[0]?.identity?.header?.ctaText || datasource?.header?.ctaText || ""}
                      onChange={(e) => updateHeaderField("ctaText", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Header Action Button Target Link</label>
                    <input
                      type="text"
                      placeholder="e.g. /admission"
                      value={datasource?.home?.[0]?.identity?.header?.ctaUrl || datasource?.header?.ctaUrl || ""}
                      onChange={(e) => updateHeaderField("ctaUrl", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Footer */}
          {activeTab === "footer" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                  <i className="bi bi-layout-text-window text-[#1a5d9c]" /> Website Footer & Contact Info Configuration
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Footer About Snippet</label>
                    <textarea
                      rows={2}
                      placeholder="Brief introduction displayed in website footer"
                      value={datasource?.home?.[0]?.identity?.footer?.aboutText || datasource?.footer?.aboutText || ""}
                      onChange={(e) => updateFooterField("aboutText", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none resize-y"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Campus Address</label>
                    <input
                      type="text"
                      placeholder="e.g. IPS Main Campus, School Road, City Center"
                      value={datasource?.home?.[0]?.identity?.footer?.address || datasource?.footer?.address || ""}
                      onChange={(e) => updateFooterField("address", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Footer Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91-9876543210"
                      value={datasource?.home?.[0]?.identity?.footer?.phone || datasource?.footer?.phone || ""}
                      onChange={(e) => updateFooterField("phone", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Footer Email</label>
                    <input
                      type="text"
                      placeholder="e.g. contact@indianpublicschool.in"
                      value={datasource?.home?.[0]?.identity?.footer?.email || datasource?.footer?.email || ""}
                      onChange={(e) => updateFooterField("email", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">School Office Hours</label>
                    <input
                      type="text"
                      placeholder="e.g. 7:30 AM - 5:00 PM"
                      value={datasource?.footer?.officeHours || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, officeHours: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Copyright Notice</label>
                    <input
                      type="text"
                      placeholder="e.g. © 2026 Indian Public School. All Rights Reserved."
                      value={datasource?.footer?.copyright || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, copyright: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Affiliation / Board Registration Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Affiliated to CBSE, New Delhi"
                      value={datasource?.footer?.affiliation || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, affiliation: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Facebook URL</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/..."
                      value={datasource?.footer?.facebook || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, facebook: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Instagram URL</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/..."
                      value={datasource?.footer?.instagram || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, instagram: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">YouTube Channel URL</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/..."
                      value={datasource?.footer?.youtube || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, youtube: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Twitter / X URL</label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/..."
                      value={datasource?.footer?.twitter || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, twitter: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WhatsApp */}
          {activeTab === "whatsapp" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-whatsapp text-emerald-600 text-lg" /> Floating WhatsApp Chat Widget Configuration
                  </h3>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                    <input
                      type="checkbox"
                      checked={(datasource?.home?.[0]?.identity?.whatsapp?.enabled ?? datasource?.whatsapp?.enabled) !== false}
                      onChange={(e) => updateWhatsAppField("enabled", e.target.checked)}
                      className="size-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Enable Floating WhatsApp Widget</span>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">WhatsApp Contact Phone Number (Default: +91 97351 81684)</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 97351 81684"
                      value={datasource?.home?.[0]?.identity?.whatsapp?.phone || datasource?.whatsapp?.phone || "+91 97351 81684"}
                      onChange={(e) => updateWhatsAppField("phone", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Helpdesk Agent / Desk Name</label>
                    <input
                      type="text"
                      placeholder="e.g. IPS Admissions & Support"
                      value={datasource?.home?.[0]?.identity?.whatsapp?.agentName || datasource?.whatsapp?.agentName || "IPS Admissions & Support"}
                      onChange={(e) => updateWhatsAppField("agentName", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Agent Role / Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. Official Helpdesk"
                      value={datasource?.home?.[0]?.identity?.whatsapp?.agentRole || datasource?.whatsapp?.agentRole || "Official Helpdesk"}
                      onChange={(e) => updateWhatsAppField("agentRole", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Widget Position on Screen</label>
                    <select
                      value={datasource?.home?.[0]?.identity?.whatsapp?.position || datasource?.whatsapp?.position || "bottom-left"}
                      onChange={(e) => updateWhatsAppField("position", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    >
                      <option value="bottom-left">Bottom Left (Recommended)</option>
                      <option value="bottom-right">Bottom Right (Stacked)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Welcome Greeting Message</label>
                    <textarea
                      rows={2}
                      placeholder="Greeting text displayed when visitor opens chat box"
                      value={datasource?.home?.[0]?.identity?.whatsapp?.welcomeMessage || datasource?.whatsapp?.welcomeMessage || "Hello! 👋 Welcome to Indian Public School. How can we assist you with admissions or campus details today?"}
                      onChange={(e) => updateWhatsAppField("welcomeMessage", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none resize-y focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Quick Inquiry Topic Options (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="Admission Inquiry 🎓, Fee Structure 💰, Schedule Campus Visit 🏫, General Query 💬"
                      value={
                        Array.isArray(datasource?.home?.[0]?.identity?.whatsapp?.presetMessages)
                          ? datasource.home[0].identity.whatsapp.presetMessages.join(", ")
                          : Array.isArray(datasource?.whatsapp?.presetMessages)
                          ? datasource.whatsapp.presetMessages.join(", ")
                          : "Admission Inquiry 🎓, Fee Structure 💰, Schedule Campus Visit 🏫, General Query 💬"
                      }
                      onChange={(e) => {
                        const items = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                        updateWhatsAppField("presetMessages", items);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Hero */}
          {activeTab === "hero" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                  <i className="bi bi-person-standing text-[#1a5d9c]" /> Hero Main Poster & Content Settings
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Session Badge Text</label>
                    <input
                      type="text"
                      value={homeObj.hero?.content?.[0]?.session || ""}
                      onChange={(e) => {
                        const content = [...(homeObj.hero?.content || [{}])];
                        content[0] = { ...content[0], session: e.target.value };
                        updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Main Hero Title</label>
                    <input
                      type="text"
                      value={homeObj.hero?.content?.[0]?.title || ""}
                      onChange={(e) => {
                        const content = [...(homeObj.hero?.content || [{}])];
                        content[0] = { ...content[0], title: e.target.value };
                        updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500">Hero Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={homeObj.hero?.content?.[0]?.description || ""}
                    onChange={(e) => {
                      const content = [...(homeObj.hero?.content || [{}])];
                      content[0] = { ...content[0], description: e.target.value };
                      updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                  />
                </div>

                {/* Feature Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500">Feature Badges (e.g. CBSE Affiliated)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const content = [...(homeObj.hero?.content || [{}])];
                        const icoBtn = [...(content[0].icoBtn || [])];
                        icoBtn.push({ text: "New Badge", icoUrl: "" });
                        content[0] = { ...content[0], icoBtn };
                        updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#1a5d9c] hover:underline"
                    >
                      <Plus size={13} /> Add Badge
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(Array.isArray(homeObj.hero?.content?.[0]?.icoBtn) ? homeObj.hero.content[0].icoBtn : []).map((badge: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1">
                        <input
                          type="text"
                          value={badge.text || ""}
                          onChange={(e) => {
                            const content = [...(homeObj.hero?.content || [{}])];
                            const icoBtn = [...(content[0].icoBtn || [])];
                            icoBtn[idx] = { ...icoBtn[idx], text: e.target.value };
                            content[0] = { ...content[0], icoBtn };
                            updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
                          }}
                          className="w-full text-xs font-semibold outline-none bg-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const content = [...(homeObj.hero?.content || [{}])];
                            const icoBtn = (content[0].icoBtn || []).filter((_: any, i: number) => i !== idx);
                            content[0] = { ...content[0], icoBtn };
                            updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
                          }}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hero Posters Upload */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500">Hero Background Posters ({(homeObj.hero?.fileUrls || []).length})</label>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {(Array.isArray(homeObj.hero?.fileUrls) ? homeObj.hero.fileUrls : []).map((url: string, idx: number) => (
                      <div key={idx} className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Hero ${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const fileUrls = (homeObj.hero?.fileUrls || []).filter((_: any, i: number) => i !== idx);
                            updateHome((prev) => ({ ...prev, hero: { ...prev.hero, fileUrls } }));
                          }}
                          className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}

                    <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-3 text-center transition hover:bg-slate-50">
                      <UploadCloud className="text-[#1a5d9c]" size={20} />
                      <span className="mt-1 text-[11px] font-bold text-[#1a5d9c]">Upload Poster</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadImage(file);
                            if (url) {
                              const fileUrls = [...(homeObj.hero?.fileUrls || []), url];
                              updateHome((prev) => ({ ...prev, hero: { ...prev.hero, fileUrls } }));
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Banners */}
          {activeTab === "banner" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-flag-fill text-[#1a5d9c]" /> Sliding Banner Posters
                  </h3>
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#102a4c]">
                    <UploadCloud size={14} /> Upload New Banner Poster
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          if (url) {
                            const currentUrls = Array.isArray(homeObj.banner?.fileUrls)
                              ? homeObj.banner.fileUrls
                              : Array.isArray(homeObj.banner)
                                ? homeObj.banner.map((b: any) => typeof b === "string" ? b : b.fileUrl)
                                : [];
                            updateHome((prev) => ({
                              ...prev,
                              banner: { ...(typeof prev.banner === "object" && !Array.isArray(prev.banner) ? prev.banner : {}), fileUrls: [...currentUrls, url] },
                            }));
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    Array.isArray(homeObj.banner?.fileUrls)
                      ? homeObj.banner.fileUrls
                      : Array.isArray(homeObj.banner)
                        ? homeObj.banner
                        : []
                  ).map((item: any, idx: number) => {
                    const imgUrl = typeof item === "string" ? item : item?.fileUrl || "";
                    return (
                      <div key={idx} className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl} alt={`Banner ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = Array.isArray(homeObj.banner?.fileUrls)
                              ? homeObj.banner.fileUrls
                              : Array.isArray(homeObj.banner)
                                ? homeObj.banner
                                : [];
                            const updated = currentList.filter((_: any, i: number) => i !== idx);
                            if (Array.isArray(homeObj.banner?.fileUrls)) {
                              updateHome((prev) => ({ ...prev, banner: { ...prev.banner, fileUrls: updated } }));
                            } else {
                              updateHome((prev) => ({ ...prev, banner: updated }));
                            }
                          }}
                          className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Quick Cards */}
          {activeTab === "quickCards" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-grid-3x3-gap text-[#1a5d9c]" /> Quick Action Menu Cards ({(homeObj.menuCard || []).length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => addTopArrayItem("menuCard", { heading: "New Action Card", subHeading: "Explore options", redirectUrl: "/about" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Action Card
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {(Array.isArray(homeObj.menuCard) ? homeObj.menuCard : []).map((card: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-[#1a5d9c]">Card #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveTopArrayItem("menuCard", idx, "up")} disabled={idx === 0} className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={13} />
                          </button>
                          <button type="button" onClick={() => moveTopArrayItem("menuCard", idx, "down")} disabled={idx === homeObj.menuCard.length - 1} className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={13} />
                          </button>
                          <button type="button" onClick={() => deleteTopArrayItem("menuCard", idx)} className="rounded p-1 text-red-500 hover:text-red-700">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Heading"
                        value={card.heading || ""}
                        onChange={(e) => {
                          const cards = [...(homeObj.menuCard || [])];
                          cards[idx] = { ...cards[idx], heading: e.target.value };
                          updateHome((prev) => ({ ...prev, menuCard: cards }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold outline-none"
                      />
                      <input
                        type="text"
                        placeholder="SubHeading"
                        value={card.subHeading || ""}
                        onChange={(e) => {
                          const cards = [...(homeObj.menuCard || [])];
                          cards[idx] = { ...cards[idx], subHeading: e.target.value };
                          updateHome((prev) => ({ ...prev, menuCard: cards }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Redirect URL (e.g. /admissions)"
                        value={card.redirectUrl || ""}
                        onChange={(e) => {
                          const cards = [...(homeObj.menuCard || [])];
                          cards[idx] = { ...cards[idx], redirectUrl: e.target.value };
                          updateHome((prev) => ({ ...prev, menuCard: cards }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 1 */}
          {activeTab === "sec1" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                  <i className="bi bi-building text-[#1a5d9c]" /> Section 1: About Our School
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Section Title</label>
                    <input
                      type="text"
                      value={homeObj["section-1"]?.[0]?.heading || ""}
                      onChange={(e) => {
                        const sec = [...(homeObj["section-1"] || [{}])];
                        sec[0] = { ...sec[0], heading: e.target.value };
                        updateHome((prev) => ({ ...prev, "section-1": sec }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Sub Heading</label>
                    <input
                      type="text"
                      value={homeObj["section-1"]?.[0]?.subHeading || ""}
                      onChange={(e) => {
                        const sec = [...(homeObj["section-1"] || [{}])];
                        sec[0] = { ...sec[0], subHeading: e.target.value };
                        updateHome((prev) => ({ ...prev, "section-1": sec }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Description Paragraph 1</label>
                    <textarea
                      rows={3}
                      value={homeObj["section-1"]?.[0]?.description?.[0] || ""}
                      onChange={(e) => {
                        const sec = [...(homeObj["section-1"] || [{}])];
                        const desc = [...(sec[0].description || ["", ""])];
                        desc[0] = e.target.value;
                        sec[0] = { ...sec[0], description: desc };
                        updateHome((prev) => ({ ...prev, "section-1": sec }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Description Paragraph 2</label>
                    <textarea
                      rows={3}
                      value={homeObj["section-1"]?.[0]?.description?.[1] || ""}
                      onChange={(e) => {
                        const sec = [...(homeObj["section-1"] || [{}])];
                        const desc = [...(sec[0].description || ["", ""])];
                        desc[1] = e.target.value;
                        sec[0] = { ...sec[0], description: desc };
                        updateHome((prev) => ({ ...prev, "section-1": sec }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Mission & Vision Cards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500">Mission & Vision Cards</label>
                    <button
                      type="button"
                      onClick={() => addItemToSection("section-1", { heading: "New Pillar", description: "Pillar details", redirectUrl: "/about" })}
                      className="flex items-center gap-1 text-xs font-bold text-[#1a5d9c] hover:underline"
                    >
                      <Plus size={13} /> Add Card
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(Array.isArray(homeObj["section-1"]?.[0]?.cardItem) ? homeObj["section-1"][0].cardItem : []).map((card: any, idx: number) => (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">Pillar #{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveItemInSection("section-1", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                              <ArrowUp size={12} />
                            </button>
                            <button type="button" onClick={() => moveItemInSection("section-1", idx, "down")} disabled={idx === homeObj["section-1"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                              <ArrowDown size={12} />
                            </button>
                            <button type="button" onClick={() => deleteItemFromSection("section-1", idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={card.heading || ""}
                          onChange={(e) => {
                            const sec = [...(homeObj["section-1"] || [{}])];
                            const cards = [...(sec[0].cardItem || [])];
                            cards[idx] = { ...cards[idx], heading: e.target.value };
                            sec[0] = { ...sec[0], cardItem: cards };
                            updateHome((prev) => ({ ...prev, "section-1": sec }));
                          }}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold outline-none"
                        />
                        <textarea
                          rows={2}
                          value={card.description || ""}
                          onChange={(e) => {
                            const sec = [...(homeObj["section-1"] || [{}])];
                            const cards = [...(sec[0].cardItem || [])];
                            cards[idx] = { ...cards[idx], description: e.target.value };
                            sec[0] = { ...sec[0], cardItem: cards };
                            updateHome((prev) => ({ ...prev, "section-1": sec }));
                          }}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campus Photo */}
                <div className="flex items-center gap-4 pt-2">
                  {homeObj["section-1"]?.[0]?.briefCard?.[0]?.fileUrl && (
                    <div className="relative h-20 w-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={homeObj["section-1"][0].briefCard[0].fileUrl} alt="Campus Aerial" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-[#1a5d9c] hover:bg-blue-50">
                    <UploadCloud size={16} /> Upload Campus Cover Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          if (url) {
                            const sec = [...(homeObj["section-1"] || [{}])];
                            const briefCard = [...(sec[0].briefCard || [{}])];
                            briefCard[0] = { ...briefCard[0], fileUrl: url };
                            sec[0] = { ...sec[0], briefCard };
                            updateHome((prev) => ({ ...prev, "section-1": sec }));
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 2 */}
          {activeTab === "sec2" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-bar-chart-fill text-[#1a5d9c]" /> Section 2: Key Statistics Counters ({(homeObj["section-2"] || []).length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => addTopArrayItem("section-2", { count: "100+", heading: "New Stat", "sub-heading": "Stat description" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Stat Counter
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {(Array.isArray(homeObj["section-2"]) ? homeObj["section-2"] : []).map((stat: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Stat #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveTopArrayItem("section-2", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveTopArrayItem("section-2", idx, "down")} disabled={idx === homeObj["section-2"].length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteTopArrayItem("section-2", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Count (e.g. 1000+)"
                        value={stat.count || ""}
                        onChange={(e) => {
                          const stats = [...(homeObj["section-2"] || [])];
                          stats[idx] = { ...stats[idx], count: e.target.value };
                          updateHome((prev) => ({ ...prev, "section-2": stats }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-[#1a5d9c] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Heading"
                        value={stat.heading || ""}
                        onChange={(e) => {
                          const stats = [...(homeObj["section-2"] || [])];
                          stats[idx] = { ...stats[idx], heading: e.target.value };
                          updateHome((prev) => ({ ...prev, "section-2": stats }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 3 */}
          {activeTab === "sec3" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-star-fill text-[#1a5d9c]" /> Section 3: Why Choose IPS ({(homeObj["section-3"]?.[0]?.cardItem || []).length} Cards)
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-3", { heading: "New Commitment", description: "Commitment details", icoUrl: "", redirectUrl: "/about" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Commitment Card
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Array.isArray(homeObj["section-3"]?.[0]?.cardItem) ? homeObj["section-3"][0].cardItem : []).map((card: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Card #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveItemInSection("section-3", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveItemInSection("section-3", idx, "down")} disabled={idx === homeObj["section-3"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteItemFromSection("section-3", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={card.heading || ""}
                        onChange={(e) => {
                          const sec3 = [...(homeObj["section-3"] || [{}])];
                          const cards = [...(sec3[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], heading: e.target.value };
                          sec3[0] = { ...sec3[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-3": sec3 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold outline-none"
                      />
                      <textarea
                        rows={2}
                        value={card.description || ""}
                        onChange={(e) => {
                          const sec3 = [...(homeObj["section-3"] || [{}])];
                          const cards = [...(sec3[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], description: e.target.value };
                          sec3[0] = { ...sec3[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-3": sec3 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 4 */}
          {activeTab === "sec4" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-book-fill text-[#1a5d9c]" /> Section 4: Academic Journey Stages ({(homeObj["section-4"]?.[0]?.cardItem || []).length} Stages)
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-4", { heading: "Grade X – XII", mainHeading: "New Stage", description: "Stage curriculum details" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Academic Stage
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Array.isArray(homeObj["section-4"]?.[0]?.cardItem) ? homeObj["section-4"][0].cardItem : []).map((stage: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Stage #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveItemInSection("section-4", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveItemInSection("section-4", idx, "down")} disabled={idx === homeObj["section-4"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteItemFromSection("section-4", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Grade range"
                          value={stage.heading || ""}
                          onChange={(e) => {
                            const sec4 = [...(homeObj["section-4"] || [{}])];
                            const stages = [...(sec4[0].cardItem || [])];
                            stages[idx] = { ...stages[idx], heading: e.target.value };
                            sec4[0] = { ...sec4[0], cardItem: stages };
                            updateHome((prev) => ({ ...prev, "section-4": sec4 }));
                          }}
                          className="w-1/2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Stage title"
                          value={stage.mainHeading || ""}
                          onChange={(e) => {
                            const sec4 = [...(homeObj["section-4"] || [{}])];
                            const stages = [...(sec4[0].cardItem || [])];
                            stages[idx] = { ...stages[idx], mainHeading: e.target.value };
                            sec4[0] = { ...sec4[0], cardItem: stages };
                            updateHome((prev) => ({ ...prev, "section-4": sec4 }));
                          }}
                          className="w-1/2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-[#1a5d9c] outline-none"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={stage.description || ""}
                        onChange={(e) => {
                          const sec4 = [...(homeObj["section-4"] || [{}])];
                          const stages = [...(sec4[0].cardItem || [])];
                          stages[idx] = { ...stages[idx], description: e.target.value };
                          sec4[0] = { ...sec4[0], cardItem: stages };
                          updateHome((prev) => ({ ...prev, "section-4": sec4 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 5 */}
          {activeTab === "sec5" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-activity text-[#1a5d9c]" /> Section 5: Co-Curricular Activities ({(homeObj["section-5"]?.[0]?.cardItem || []).length} Cards)
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-5", { heading: "New Activity", description: "Activity details", redirectUrl: "/about" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Activity
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Array.isArray(homeObj["section-5"]?.[0]?.cardItem) ? homeObj["section-5"][0].cardItem : []).map((activity: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Activity #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveItemInSection("section-5", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveItemInSection("section-5", idx, "down")} disabled={idx === homeObj["section-5"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteItemFromSection("section-5", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={activity.heading || ""}
                        onChange={(e) => {
                          const sec5 = [...(homeObj["section-5"] || [{}])];
                          const cards = [...(sec5[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], heading: e.target.value };
                          sec5[0] = { ...sec5[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-5": sec5 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold outline-none"
                      />
                      <textarea
                        rows={2}
                        value={activity.description || ""}
                        onChange={(e) => {
                          const sec5 = [...(homeObj["section-5"] || [{}])];
                          const cards = [...(sec5[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], description: e.target.value };
                          sec5[0] = { ...sec5[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-5": sec5 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 6 */}
          {activeTab === "sec6" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-building-fill text-[#1a5d9c]" /> Section 6: Campus Infrastructure Cards ({(homeObj["section-6"]?.[0]?.cardItem || []).length} Cards)
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-6", { title: "New Facility", "sub-title": "Facility features", fileUrl: "" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Facility Card
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Array.isArray(homeObj["section-6"]?.[0]?.cardItem) ? homeObj["section-6"][0].cardItem : []).map((infra: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Facility #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveItemInSection("section-6", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveItemInSection("section-6", idx, "down")} disabled={idx === homeObj["section-6"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteItemFromSection("section-6", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {infra.fileUrl && (
                          <div className="relative h-16 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={infra.fileUrl} alt={infra.title} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            placeholder="Title"
                            value={infra.title || ""}
                            onChange={(e) => {
                              const sec6 = [...(homeObj["section-6"] || [{}])];
                              const cards = [...(sec6[0].cardItem || [])];
                              cards[idx] = { ...cards[idx], title: e.target.value };
                              sec6[0] = { ...sec6[0], cardItem: cards };
                              updateHome((prev) => ({ ...prev, "section-6": sec6 }));
                            }}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Sub-title"
                            value={infra["sub-title"] || infra.subTitle || ""}
                            onChange={(e) => {
                              const sec6 = [...(homeObj["section-6"] || [{}])];
                              const cards = [...(sec6[0].cardItem || [])];
                              cards[idx] = { ...cards[idx], "sub-title": e.target.value };
                              sec6[0] = { ...sec6[0], cardItem: cards };
                              updateHome((prev) => ({ ...prev, "section-6": sec6 }));
                            }}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none"
                          />
                        </div>
                      </div>
                      <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-1.5 text-[11px] font-bold text-[#1a5d9c] hover:bg-blue-50">
                        <UploadCloud size={13} /> Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImage(file);
                              if (url) {
                                const sec6 = [...(homeObj["section-6"] || [{}])];
                                const cards = [...(sec6[0].cardItem || [])];
                                cards[idx] = { ...cards[idx], fileUrl: url };
                                sec6[0] = { ...sec6[0], cardItem: cards };
                                updateHome((prev) => ({ ...prev, "section-6": sec6 }));
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 7 */}
          {activeTab === "sec7" && (() => {
            const sec7Data = homeObj["section-7"]?.[0] || {};
            const cardsList: Array<{ title?: string; heading?: string; fileUrl: string }> = Array.isArray(sec7Data.cardItem)
              ? sec7Data.cardItem
              : [];
            const descText = Array.isArray(sec7Data.description)
              ? sec7Data.description[0] || ""
              : typeof sec7Data.description === "string"
              ? sec7Data.description
              : "";

            return (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                      <i className="bi bi-people-fill text-[#1a5d9c]" /> Section 7: Student Life Showcase
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1a5d9c] border border-blue-100">
                      {cardsList.length} {cardsList.length === 1 ? "Image" : "Images"} configured
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Eyebrow / Sub-Heading</label>
                      <input
                        type="text"
                        placeholder="e.g. Student Life"
                        value={sec7Data.heading || ""}
                        onChange={(e) => {
                          const sec7 = [...(homeObj["section-7"] || [{}])];
                          sec7[0] = { ...sec7[0], heading: e.target.value };
                          updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1a5d9c]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Main Heading</label>
                      <input
                        type="text"
                        placeholder="e.g. A day here is never quiet"
                        value={sec7Data.mainHeading || ""}
                        onChange={(e) => {
                          const sec7 = [...(homeObj["section-7"] || [{}])];
                          sec7[0] = { ...sec7[0], mainHeading: e.target.value };
                          updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#1a5d9c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Section Description</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Assemblies, house matches, rehearsals, science fairs and quiet reading corners..."
                      value={descText}
                      onChange={(e) => {
                        const sec7 = [...(homeObj["section-7"] || [{}])];
                        sec7[0] = { ...sec7[0], description: [e.target.value] };
                        updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#1a5d9c] resize-none"
                    />
                  </div>
                </div>

                {/* Section 7 Images Grid Editor */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-[#102a4c]">Student Life Showcase Photos</h4>
                      <p className="text-[11px] text-slate-500">Upload multiple photos to display in the Student Life section masonry grid.</p>
                    </div>

                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1a5d9c] px-4 py-2 text-xs font-bold text-white hover:bg-[#124272] transition-colors shadow-sm">
                      <Plus size={16} /> Add Image(s)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          const currentCards = [...(homeObj["section-7"]?.[0]?.cardItem || [])];
                          for (const file of files) {
                            const url = await uploadImage(file);
                            if (url) {
                              const autoTitle = file.name
                                .replace(/\.[^/.]+$/, "")
                                .replace(/[-_]/g, " ")
                                .trim();
                              currentCards.push({ title: autoTitle, fileUrl: url });
                            }
                          }
                          const sec7 = [...(homeObj["section-7"] || [{}])];
                          sec7[0] = { ...sec7[0], cardItem: currentCards };
                          updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {cardsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center">
                      <ImageIcon className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-600">No Student Life images added yet</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Click &quot;Add Image(s)&quot; above to upload photos for this section.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {cardsList.map((card, cardIdx) => (
                        <div
                          key={`sec7-card-${cardIdx}`}
                          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-3 hover:border-slate-300 transition-all shadow-xs"
                        >
                          <div className="space-y-3">
                            <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                              {card.fileUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={card.fileUrl}
                                  alt={card.title || card.heading || `Student Life ${cardIdx + 1}`}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                  No image
                                </div>
                              )}
                              <span className="absolute top-2 left-2 rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                                #{cardIdx + 1}
                              </span>
                            </div>

                            <input
                              type="text"
                              placeholder="Image Caption / Title"
                              value={card.title || card.heading || ""}
                              onChange={(e) => {
                                const sec7 = [...(homeObj["section-7"] || [{}])];
                                const cards = [...(sec7[0].cardItem || [])];
                                cards[cardIdx] = { ...cards[cardIdx], title: e.target.value };
                                sec7[0] = { ...sec7[0], cardItem: cards };
                                updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#1a5d9c]"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/60">
                            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-[#1a5d9c] hover:underline">
                              <UploadCloud size={14} /> Change Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await uploadImage(file);
                                    if (url) {
                                      const sec7 = [...(homeObj["section-7"] || [{}])];
                                      const cards = [...(sec7[0].cardItem || [])];
                                      cards[cardIdx] = { ...cards[cardIdx], fileUrl: url };
                                      sec7[0] = { ...sec7[0], cardItem: cards };
                                      updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                const sec7 = [...(homeObj["section-7"] || [{}])];
                                const cards = (sec7[0].cardItem || []).filter((_: any, idx: number) => idx !== cardIdx);
                                sec7[0] = { ...sec7[0], cardItem: cards };
                                updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                              }}
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete photo"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB: Video Setup */}
          {activeTab === "video" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-camera-video-fill text-[#1a5d9c]" /> Campus Introduction Video Setup
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                    Controls IntroVideo section &amp; site_datasource media
                  </span>
                </div>

                {(() => {
                  const secVid = homeObj["section-video"]?.[0] || {};
                  const sec8 = homeObj["section-8"]?.[0] || {};
                  const eyebrowVal = secVid.eyebrow || sec8.videoEyebrow || "Discover IPS";
                  const titleVal = secVid.title || secVid.heading || sec8.videoTitle || "Experience life at Indian Public School";
                  const descVal = secVid.description || sec8.videoDescription || "Take a look at the campus, learning spaces and student life.";
                  const FALLBACK_SEED_VIDEO = "https://www.indianpublicschool.in/assets/img/IPS.mp4";
                  let videoUrlVal = secVid.introFileUrl || secVid.videoUrl || sec8.introFileUrl || sec8.videoUrl;
                  if (!videoUrlVal || videoUrlVal === "/IPSIntroVideo.mp4") {
                    videoUrlVal = FALLBACK_SEED_VIDEO;
                  }
                  const folderVal = secVid.cloudinaryFolder || sec8.cloudinaryFolder || "indian-public-school/assets/Videos";

                  const updateVideoData = (updates: Record<string, any>) => {
                    updateHome((prev) => {
                      const prevVid = prev["section-video"]?.[0] || {};
                      const prevSec8 = prev["section-8"]?.[0] || {};
                      const newVid = { ...prevVid, ...updates };
                      const newSec8 = { ...prevSec8, ...updates };
                      return {
                        ...prev,
                        "section-video": [newVid],
                        "section-8": [newSec8],
                      };
                    });
                  };

                  const autoPlayVal = secVid.autoPlay ?? sec8.autoPlay ?? true;
                  const loopVal = secVid.loop ?? sec8.loop ?? true;
                  const mutedVal = secVid.muted ?? sec8.muted ?? true;
                  const controlsVal = secVid.controls ?? sec8.controls ?? true;
                  const posterVal = secVid.poster || sec8.poster || secVid.posterUrl || sec8.posterUrl || "";

                  return (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Eyebrow Tagline</label>
                          <input
                            type="text"
                            placeholder="e.g. Discover IPS"
                            value={eyebrowVal}
                            onChange={(e) => updateVideoData({ eyebrow: e.target.value, videoEyebrow: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1a5d9c]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Main Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Experience life at Indian Public School"
                            value={titleVal}
                            onChange={(e) => updateVideoData({ title: e.target.value, heading: e.target.value, videoTitle: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1a5d9c]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Description</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Take a look at the campus, learning spaces and student life."
                          value={descVal}
                          onChange={(e) => updateVideoData({ description: e.target.value, videoDescription: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
                        />
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                        <label className="text-[11px] font-bold text-[#102a4c] flex items-center gap-1.5">
                          🎛️ Video Playback Controls &amp; Player Settings
                        </label>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-100 transition">
                            <input
                              type="checkbox"
                              checked={autoPlayVal}
                              onChange={(e) => updateVideoData({ autoPlay: e.target.checked })}
                              className="rounded text-[#1a5d9c] focus:ring-[#1a5d9c]"
                            />
                            <span>AutoPlay Video on Load</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-100 transition">
                            <input
                              type="checkbox"
                              checked={loopVal}
                              onChange={(e) => updateVideoData({ loop: e.target.checked })}
                              className="rounded text-[#1a5d9c] focus:ring-[#1a5d9c]"
                            />
                            <span>Loop Video Continuously</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-100 transition">
                            <input
                              type="checkbox"
                              checked={mutedVal}
                              onChange={(e) => updateVideoData({ muted: e.target.checked })}
                              className="rounded text-[#1a5d9c] focus:ring-[#1a5d9c]"
                            />
                            <span>Mute Audio by Default</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-100 transition">
                            <input
                              type="checkbox"
                              checked={controlsVal}
                              onChange={(e) => updateVideoData({ controls: e.target.checked })}
                              className="rounded text-[#1a5d9c] focus:ring-[#1a5d9c]"
                            />
                            <span>Show Player Controls (Play/Pause, Sound)</span>
                          </label>
                        </div>

                        <div className="space-y-1 pt-1">
                          <label className="text-[11px] font-bold text-slate-600">Video Poster / Thumbnail Frame URL (Optional)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="e.g. https://res.cloudinary.com/.../poster.jpg"
                              value={posterVal}
                              onChange={(e) => updateVideoData({ poster: e.target.value, posterUrl: e.target.value })}
                              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono outline-none focus:border-[#1a5d9c]"
                            />
                            <label className="flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#1a5d9c] hover:bg-blue-50 shrink-0">
                              <UploadCloud size={14} /> Upload Thumbnail
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await uploadImage(file, "Home", folderVal);
                                    if (url) {
                                      updateVideoData({ poster: url, posterUrl: url });
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-[#102a4c] flex items-center gap-1.5">
                            ☁️ Cloudinary Target Storage Location / Folder
                          </label>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            Direct Cloudinary Upload
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. indian-public-school/assets/Videos"
                          value={folderVal}
                          onChange={(e) => updateVideoData({ cloudinaryFolder: e.target.value })}
                          className="w-full rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 outline-none focus:border-[#1a5d9c]"
                        />
                        <p className="text-[11px] text-slate-500">
                          Videos uploaded here will be stored in your Cloudinary account at path: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">{folderVal}</code>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-600">Video File URL (Cloudinary Link or MP4 Path)</label>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            placeholder="e.g. https://res.cloudinary.com/.../IPSIntroVideo.mp4"
                            value={videoUrlVal}
                            onChange={(e) => updateVideoData({ introFileUrl: e.target.value, videoUrl: e.target.value })}
                            className="flex-1 min-w-[240px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-[#1a5d9c]"
                          />
                          <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-blue-500 bg-[#1a5d9c] px-4 py-2 text-xs font-bold text-white hover:bg-[#102a4c] transition shrink-0 shadow-xs">
                            <UploadCloud size={16} /> Upload Video to Cloudinary
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await uploadImage(file, "Videos", folderVal);
                                  if (url) {
                                    updateVideoData({ introFileUrl: url, videoUrl: url });
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {videoUrlVal && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Are you sure you want to remove the video from your layout?")) {
                                  updateVideoData({ introFileUrl: "", videoUrl: "" });
                                }
                              }}
                              className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 hover:text-red-700 transition shrink-0"
                            >
                              <Trash2 size={14} /> Delete Video
                            </button>
                          )}
                        </div>
                      </div>

                      {videoUrlVal && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-600">Live Video Preview</label>
                            {videoUrlVal.includes("cloudinary.com") && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                ✓ Hosted on Cloudinary
                              </span>
                            )}
                          </div>
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 aspect-video max-h-64 flex items-center justify-center">
                            <video
                              key={videoUrlVal}
                              controls
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="h-full w-full object-contain"
                            >
                              <source src={videoUrlVal} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB: Section 8 */}
          {activeTab === "sec8" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-mortarboard-fill text-[#1a5d9c]" /> Section 8: Our Courses ({(homeObj["section-8"]?.[0]?.cardItem || []).length} Level Cards)
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-8", { title: "New Level", description: "Course level details", fileUrl: "" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Course Level
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Array.isArray(homeObj["section-8"]?.[0]?.cardItem) ? homeObj["section-8"][0].cardItem : []).map((course: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Course Level #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveItemInSection("section-8", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveItemInSection("section-8", idx, "down")} disabled={idx === homeObj["section-8"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteItemFromSection("section-8", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {course.fileUrl && (
                          <div className="relative h-16 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={course.fileUrl} alt={course.title} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={course.title || ""}
                          onChange={(e) => {
                            const sec8 = [...(homeObj["section-8"] || [{}])];
                            const cards = [...(sec8[0].cardItem || [])];
                            cards[idx] = { ...cards[idx], title: e.target.value };
                            sec8[0] = { ...sec8[0], cardItem: cards };
                            updateHome((prev) => ({ ...prev, "section-8": sec8 }));
                          }}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold outline-none"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={course.description || ""}
                        onChange={(e) => {
                          const sec8 = [...(homeObj["section-8"] || [{}])];
                          const cards = [...(sec8[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], description: e.target.value };
                          sec8[0] = { ...sec8[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-8": sec8 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none"
                      />
                      <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-1 text-[11px] font-bold text-[#1a5d9c] hover:bg-blue-50">
                        <UploadCloud size={13} /> Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImage(file);
                              if (url) {
                                const sec8 = [...(homeObj["section-8"] || [{}])];
                                const cards = [...(sec8[0].cardItem || [])];
                                cards[idx] = { ...cards[idx], fileUrl: url };
                                sec8[0] = { ...sec8[0], cardItem: cards };
                                updateHome((prev) => ({ ...prev, "section-8": sec8 }));
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 9 */}
          {activeTab === "sec9" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                  <i className="bi bi-person-badge-fill text-[#1a5d9c]" /> Section 9: Best CBSE School / Director Message
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Heading"
                    value={homeObj["section-9"]?.[0]?.heading || ""}
                    onChange={(e) => {
                      const sec9 = [...(homeObj["section-9"] || [{}])];
                      sec9[0] = { ...sec9[0], heading: e.target.value };
                      updateHome((prev) => ({ ...prev, "section-9": sec9 }));
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none"
                  />
                  <input
                    type="text"
                    placeholder="SubHeading"
                    value={homeObj["section-9"]?.[0]?.subHeading || ""}
                    onChange={(e) => {
                      const sec9 = [...(homeObj["section-9"] || [{}])];
                      sec9[0] = { ...sec9[0], subHeading: e.target.value };
                      updateHome((prev) => ({ ...prev, "section-9": sec9 }));
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Description"
                  value={homeObj["section-9"]?.[0]?.description || ""}
                  onChange={(e) => {
                    const sec9 = [...(homeObj["section-9"] || [{}])];
                    sec9[0] = { ...sec9[0], description: e.target.value };
                    updateHome((prev) => ({ ...prev, "section-9": sec9 }));
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                />

                <div className="flex items-center gap-4">
                  {homeObj["section-9"]?.[0]?.fileUrls?.[0] && (
                    <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={homeObj["section-9"][0].fileUrls[0]} alt="Director" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-bold text-[#1a5d9c] hover:bg-blue-50">
                    <UploadCloud size={16} /> Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          if (url) {
                            const sec9 = [...(homeObj["section-9"] || [{}])];
                            sec9[0] = { ...sec9[0], fileUrls: [url] };
                            updateHome((prev) => ({ ...prev, "section-9": sec9 }));
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 10 */}
          {activeTab === "sec10" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-newspaper text-[#1a5d9c]" /> Section 10: News & Notice Board Items ({(homeObj["section-10"]?.[0]?.list || []).length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-10", { title: "New School Notice / Announcement", createdAt: new Date().toISOString(), redirectUrl: "/news" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Notice Item
                  </button>
                </div>

                <div className="space-y-3">
                  {(Array.isArray(homeObj["section-10"]?.[0]?.list) ? homeObj["section-10"][0].list : []).map((news: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <button type="button" onClick={() => moveItemInSection("section-10", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                          <ArrowUp size={12} />
                        </button>
                        <button type="button" onClick={() => moveItemInSection("section-10", idx, "down")} disabled={idx === homeObj["section-10"][0].list.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Notice / Event Title"
                        value={news.title || ""}
                        onChange={(e) => {
                          const sec10 = [...(homeObj["section-10"] || [{}])];
                          const list = [...(sec10[0].list || [])];
                          list[idx] = { ...list[idx], title: e.target.value };
                          sec10[0] = { ...sec10[0], list };
                          updateHome((prev) => ({ ...prev, "section-10": sec10 }));
                        }}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Target Link / PDF URL"
                        value={news.redirectUrl || ""}
                        onChange={(e) => {
                          const sec10 = [...(homeObj["section-10"] || [{}])];
                          const list = [...(sec10[0].list || [])];
                          list[idx] = { ...list[idx], redirectUrl: e.target.value };
                          sec10[0] = { ...sec10[0], list };
                          updateHome((prev) => ({ ...prev, "section-10": sec10 }));
                        }}
                        className="w-1/3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => deleteItemFromSection("section-10", idx)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                        title="Delete Notice Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Raw JSON */}
          {activeTab === "rawJson" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                <i className="bi bi-code-slash text-[#1a5d9c]" /> Advanced Raw JSON Schema Editor for all sections
              </p>
              <textarea
                rows={22}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400 outline-none leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <span className="text-xs text-slate-500 font-medium">
            Editing <strong className="text-[#1a5d9c]">{activeTab}</strong> — edits update the live datasource instantly.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save & Publish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordDialog({ token, resource, record, saving, allSectionPages = [], allMenuItems = [], onClose, onSave }: { token: string; resource: Resource; record: RecordItem | null; saving: boolean; allSectionPages?: RecordItem[]; allMenuItems?: RecordItem[]; onClose: () => void; onSave: (value: Record<string, unknown>) => void }) {
  if (resource.key === "school-settings" && (record?.key === "site_datasource" || !record)) {
    return (
      <HomeLayoutEditorModal
        token={token}
        record={record}
        saving={saving}
        onClose={onClose}
        onSave={onSave}
      />
    );
  }
  const initial = Object.fromEntries(
    Object.keys(resource.inputs).map((key) => {
      let val = record?.[key] ?? (resource.inputs[key] === "boolean" ? false : "");
      if (resource.key === "school-settings" && key === "value" && typeof val === "object" && val !== null) {
        val = JSON.stringify(val, null, 2);
      }
      if (resource.key === "gallery" && key === "directory" && !val) {
        val = "/album/";
      }
      return [key, val];
    })
  );
  if (resource.key === "users") {
    if (!initial.role) initial.role = "Sub Admin";
    if (!initial.allowedModules) {
      initial.allowedModules = Array.isArray(record?.allowedModules)
        ? record.allowedModules
        : initial.role === "Super Admin"
          ? ["*"]
          : ["students", "notices", "gallery"];
    }
  }

  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [galleryPickerField, setGalleryPickerField] = useState<string | null>(null);

  const setValue = (field: string, value: unknown) => setValues((previous) => ({ ...previous, [field]: value }));

  const handleFileUpload = async (field: string, file: File) => {
    setUploading(field);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("album", resource.label);

      const targetFolder =
        (typeof values.directory === "string" && values.directory.trim()) ||
        (typeof values.folder === "string" && values.folder.trim()) ||
        (typeof values.cloudinaryFolder === "string" && values.cloudinaryFolder.trim()) ||
        "";

      if (targetFolder) {
        formData.append("folder", targetFolder);
      }

      const res = await axios.post(`${API_URL}/uploads`, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data?.data ?? res.data;
      const uploadedUrl = data?.url || (Array.isArray(data?.fileUrl) ? data.fileUrl[0] : data?.fileUrl);

      if (!uploadedUrl) {
        throw new Error("No URL returned from upload response.");
      }

      if (field === "fileUrl" || Array.isArray(values[field])) {
        const existingList = Array.isArray(values[field]) ? (values[field] as string[]) : typeof values[field] === "string" && values[field] ? [values[field] as string] : [];
        setValue(field, [...existingList, uploadedUrl]);
      } else {
        setValue(field, uploadedUrl);
      }

      setValues((prev) => {
        const curRedirect = String(prev.redirectUrl || prev.targetUrl || "").trim();
        if (!curRedirect) {
          return { ...prev, redirectUrl: uploadedUrl };
        }
        return prev;
      });
    } catch (err) {
      setUploadError(axios.isAxiosError(err) ? String(err.response?.data?.message || err.message) : "Failed to upload image to Cloudinary.");
    } finally {
      setUploading(null);
    }
  };

  const removeImage = (field: string, urlToRemove?: string) => {
    if (urlToRemove && Array.isArray(values[field])) {
      const updated = (values[field] as string[]).filter((url) => url !== urlToRemove);
      setValue(field, updated);
    } else {
      setValue(field, "");
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { ...values };
    if (!payload.redirectUrl && payload.attachmentUrl) {
      payload.redirectUrl = String(payload.attachmentUrl);
    }
    if (resource.key === "gallery" && typeof payload.fileUrl === "string") {
      payload.fileUrl = String(payload.fileUrl).split("\n").map((url) => url.trim()).filter(Boolean);
    }
    if (resource.key === "school-settings" && typeof payload.value === "string") {
      try { payload.value = JSON.parse(payload.value); } catch { /* Plain-text setting values are valid. */ }
    }
    onSave(payload);
  };

  const isLargeModal = resource.key === "pages" || Object.values(resource.inputs).includes("richtext");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <form onSubmit={submit} className={`max-h-[92vh] w-full flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 transition-all ${isLargeModal ? "max-w-5xl" : "max-w-2xl"}`}>
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 shrink-0 rounded-t-3xl z-20">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#102a4c]">
              {record ? "Edit" : resource.key === "school-settings" ? "Add / Edit" : "Add"} {resource.label.endsWith("s") ? resource.label.slice(0, -1) : resource.label}
            </h2>
            <p className="text-sm text-slate-500">Changes are sent to the school API and synced to Cloudinary.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid gap-4 sm:grid-cols-2">
          {uploadError && (
            <div className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
              {uploadError}
            </div>
          )}
          {Object.entries(resource.inputs).map(([field, type]) => {
            const required = isRequiredField(field, resource.key, Boolean(record));
            return (
              <label key={field} className={type === "textarea" || type === "file" || type === "richtext" || field === "role" ? "sm:col-span-2" : ""}>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {titleCase(field)}
                  {required && <span className="ml-1 font-bold text-red-500" title="Required field">*</span>}
                </span>
                {type === "file" ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-semibold text-[#1a5d9c] transition hover:bg-blue-50">
                        {uploading === field ? <LoaderCircle size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                        <span>{uploading === field ? "Uploading to Cloudinary…" : "Upload file to Cloudinary"}</span>
                        <input
                          type="file"
                          accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void handleFileUpload(field, file);
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setGalleryPickerField(field)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                      >
                        <ImageIcon size={18} className="text-amber-500" />
                        <span>Pick from Cloudinary Gallery</span>
                      </button>
                    </div>
                    {(() => {
                      const rawVal = values[field];
                      const fileUrls: string[] = Array.isArray(rawVal)
                        ? (rawVal as string[]).map(String).filter(Boolean)
                        : typeof rawVal === "string" && rawVal.trim()
                          ? [rawVal.trim()]
                          : [];

                      if (fileUrls.length === 0) return null;

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                          {fileUrls.map((url, idx) => {
                            const fType = getFileType(url);
                            const filename = url.split("/").pop() || "Media Asset";
                            return (
                              <div
                                key={`${url}-${idx}`}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xs transition hover:shadow-md"
                              >
                                <div className="relative h-32 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                                  {fType === "video" ? (
                                    <div className="relative h-full w-full flex flex-col items-center justify-center text-white bg-slate-950">
                                      <video src={url} muted className="h-full w-full object-cover opacity-70" />
                                      <Video size={28} className="absolute text-blue-400 drop-shadow-md" />
                                    </div>
                                  ) : fType === "audio" ? (
                                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-950 p-3 text-white text-center">
                                      <Music size={32} className="text-purple-300 mb-1 animate-pulse" />
                                      <span className="text-[11px] font-bold text-purple-200 truncate w-full px-2">{filename}</span>
                                    </div>
                                  ) : isPdfFile(url) ? (
                                    <div className="relative h-full w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                                      <PdfCanvasThumbnail url={url} alt={filename} className="h-full w-full" />
                                      <span className="absolute bottom-1 right-1.5 rounded-md bg-red-950/90 border border-red-700/50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-200 shadow-md pointer-events-none">
                                        📄 PDF
                                      </span>
                                    </div>
                                  ) : fType === "document" ? (
                                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-3 text-white text-center">
                                      <FileText size={32} className="text-blue-400 mb-1" />
                                      <span className="text-[11px] font-bold text-slate-300 truncate w-full px-2">{filename}</span>
                                    </div>
                                  ) : (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={url} alt="Uploaded Cloudinary preview" className="h-full w-full object-cover transition group-hover:scale-105" />
                                  )}
                                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                                    <a
                                      href={getCloudinaryInlineViewerUrl(url)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-full bg-slate-900/80 p-1.5 text-slate-200 hover:bg-blue-600 hover:text-white transition"
                                      title="Open media in new tab"
                                    >
                                      <ExternalLink size={13} />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => (Array.isArray(rawVal) ? removeImage(field, url) : removeImage(field))}
                                      className="rounded-full bg-slate-900/80 p-1.5 text-slate-200 hover:bg-red-600 hover:text-white transition cursor-pointer"
                                      title="Remove asset"
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>
                                </div>
                                <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-bold text-slate-700 truncate">{filename}</span>
                                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">{fType}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                ) : type === "boolean" ? (
                  <button
                    type="button"
                    onClick={() => setValue(field, !values[field])}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold ${values[field] ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                  >
                    <span>{values[field] ? "Enabled" : "Disabled"}</span>
                    <span className={`h-5 w-9 rounded-full p-0.5 ${values[field] ? "bg-emerald-500" : "bg-slate-300"}`}>
                      <span className={`block h-4 w-4 rounded-full bg-white transition ${values[field] ? "translate-x-4" : ""}`} />
                    </span>
                  </button>
                ) : type === "richtext" ? (
                  <RichTextBox
                    value={String(values[field] ?? "")}
                    onChange={(val) => setValue(field, val)}
                    placeholder="Write page rich text content, headings, formatting..."
                  />
                ) : field === "parentId" ? (
                  <div className="relative">
                    <select
                      value={
                        typeof values.parentId === "object" && values.parentId && "_id" in (values.parentId as object)
                          ? String((values.parentId as RecordItem)._id)
                          : String(values.parentId ?? "")
                      }
                      onChange={(event) => setValue("parentId", event.target.value || null)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#1a5d9c] focus:ring-2 focus:ring-blue-100 shadow-2xs cursor-pointer"
                    >
                      <option value="">-- None (Root Level 1 Item) --</option>
                      {(resource.key === "menu-items" ? allMenuItems : allSectionPages)
                        .filter((item) => itemId(item) !== (record ? itemId(record) : ""))
                        .filter(
                          (item, idx, arr) =>
                            arr.findIndex(
                              (i) =>
                                String(i.title || "").toLowerCase().trim() ===
                                String(item.title || "").toLowerCase().trim() &&
                                Number(i.level || 1) === Number(item.level || 1)
                            ) === idx
                        )
                        .map((item) => {
                          const level = Number(item.level || 1);
                          const isMaxDepth = resource.key === "menu-items" && level >= 3;
                          return (
                            <option key={itemId(item)} value={itemId(item)} disabled={isMaxDepth}>
                              {level === 1 ? "📁 " : level === 2 ? "└─ 📄 " : "    └─ ▫️ "}
                              {String(item.title || "Untitled")} (Level {level})
                              {isMaxDepth ? " - Max 3-level depth reached" : ""}
                            </option>
                          );
                        })}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                ) : field === "targetUrl" || field === "redirectUrl" || field === "linkUrl" ? (
                  (() => {
                    const defaultSitePages = [
                      { title: "Home", url: "/" },
                      { title: "About Us", url: "/about" },
                      { title: "Admission", url: "/admission" },
                      { title: "Notice & News", url: "/news" },
                      { title: "Other Link", url: "/other" },
                    ];

                    const pagesMap = new Map<string, string>();
                    defaultSitePages.forEach((p) => pagesMap.set(p.url, p.title));
                    allSectionPages.forEach((p) => {
                      const isPublished = p.isPublished !== false && p.isPublished !== "false";
                      if (!isPublished) return;
                      const pageUrl = String(p.targetUrl || (p.slug ? `/pages/${p.slug}` : "")).trim();
                      if (pageUrl) {
                        pagesMap.set(pageUrl, String(p.title || pageUrl));
                      }
                    });

                    const allPages = Array.from(pagesMap.entries()).map(([url, title]) => ({ url, title }));
                    const currentVal = String(values[field] || "").trim();
                    const isKnownPage = allPages.some((p) => p.url === currentVal);

                    return (
                      <div className="space-y-2">
                        <div className="relative">
                          <select
                            value={isKnownPage ? currentVal : "__custom__"}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== "__custom__") {
                                setValue(field, val);
                                const matched = allPages.find((p) => p.url === val);
                                if (matched && (!values.title || values.title === "")) {
                                  setValue("title", matched.title);
                                }
                              }
                            }}
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#1a5d9c] focus:ring-2 focus:ring-blue-100 shadow-2xs cursor-pointer"
                          >
                            <option value="__custom__">🔗 Custom URL / External Link (Type below)...</option>

                            <optgroup label="📄 Website Pages">
                              {allPages.map((page) => (
                                <option key={page.url} value={page.url}>
                                  📄 {page.title} ({page.url})
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        <input
                          type="text"
                          required={required}
                          placeholder="e.g. /pages/about-us or https://external-link.com"
                          value={String(values[field] ?? "")}
                          onChange={(event) => setValue(field, event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#1a5d9c] focus:ring-2 focus:ring-blue-100 shadow-2xs"
                        />
                        <p className="text-[11px] text-slate-400">
                          Pick a page from the dropdown list, or type a custom internal/external URL above.
                        </p>
                      </div>
                    );
                  })()
                ) : type === "textarea" ? (
                  <textarea
                    required={required}
                    value={String(values[field] ?? "")}
                    onChange={(event) => setValue(field, event.target.value)}
                    rows={field === "value" || field === "content" || field === "message" || field === "feedback" || field === "textContent" ? 14 : 3}
                    className={`w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1a5d9c] focus:ring-2 focus:ring-blue-100 shadow-2xs ${field === "value" || (typeof values[field] === "string" && (values[field] as string).trim().startsWith("{")) ? "font-mono text-xs" : ""
                      }`}
                  />
                ) : field === "role" ? (
                  <div className="space-y-4 pt-1">
                    {record && isSuperAdminRole(record.role) ? (
                      <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-900 shadow-2xs">
                        <Crown size={18} className="shrink-0 fill-amber-400 text-amber-600" />
                        <div>
                          <p className="font-bold text-amber-950">👑 Primary Super Admin Account (Full Privileges)</p>
                          <p className="mt-0.5 text-[11px] text-amber-800">Only 1 Super Admin account is permitted in the system. Component access restrictions cannot be applied to this account.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs font-bold text-[#1a5d9c]">
                          <div className="flex items-center gap-2">
                            <Shield size={16} />
                            <span>Role: Sub Admin</span>
                          </div>
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] text-blue-800 font-semibold">Configurable Component Permissions</span>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-4">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Sub-Admin Component Access & Action Permissions</p>
                              <p className="text-[11px] text-slate-500">Configure which components this Sub-Admin can access (view), update (add/edit), and delete:</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-[#1a5d9c]">
                              <button
                                type="button"
                                onClick={() => {
                                  const allPerms = resources.flatMap((r) => [`${r.key}:access`, `${r.key}:update`, `${r.key}:delete`]);
                                  setValue("allowedModules", allPerms);
                                }}
                                className="hover:underline"
                              >
                                Grant Full Sub-Admin Access
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => setValue("allowedModules", [])}
                                className="text-slate-500 hover:underline hover:text-slate-700"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            {resources.map((res) => {
                              const list = Array.isArray(values.allowedModules) ? (values.allowedModules as string[]) : [];
                              const hasFullModule = list.includes(res.key) || list.includes("*");

                              const canAccess = hasFullModule || list.includes(`${res.key}:access`);
                              const canUpdate = hasFullModule || list.includes(`${res.key}:update`);
                              const canDelete = hasFullModule || list.includes(`${res.key}:delete`);

                              const toggleAction = (act: "access" | "update" | "delete") => {
                                let next = [...list];
                                if (next.includes("*")) {
                                  next = resources.flatMap((r) => [`${r.key}:access`, `${r.key}:update`, `${r.key}:delete`]);
                                }
                                const permKey = `${res.key}:${act}`;
                                if (next.includes(permKey)) {
                                  next = next.filter((p) => p !== permKey && p !== res.key);
                                } else {
                                  next.push(permKey);
                                }
                                setValue("allowedModules", next);
                              };

                              const Icon = res.icon;

                              return (
                                <div
                                  key={res.key}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs gap-2"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-[#1a5d9c]">
                                      <Icon size={16} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-[#102a4c]">{res.label}</p>
                                      <p className="text-[10px] text-slate-400">{res.description}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-1 sm:pt-0">
                                    <label
                                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${canAccess
                                        ? "border-blue-300 bg-blue-50 text-[#1a5d9c]"
                                        : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
                                        }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={canAccess}
                                        onChange={() => toggleAction("access")}
                                        className="h-3.5 w-3.5 rounded text-[#1a5d9c]"
                                      />
                                      <Eye size={12} /> Access
                                    </label>

                                    <label
                                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${canUpdate
                                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                        : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
                                        }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={canUpdate}
                                        onChange={() => toggleAction("update")}
                                        className="h-3.5 w-3.5 rounded text-emerald-600"
                                      />
                                      <Pencil size={12} /> Update
                                    </label>

                                    <label
                                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${canDelete
                                        ? "border-red-300 bg-red-50 text-red-700"
                                        : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
                                        }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={canDelete}
                                        onChange={() => toggleAction("delete")}
                                        className="h-3.5 w-3.5 rounded text-red-600"
                                      />
                                      <Trash2 size={12} /> Delete
                                    </label>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : type === "select" ? (
                  (() => {
                    const isGalleryEventType = resource.key === "gallery" && field === "eventType";
                    const isGalleryDirectory = resource.key === "gallery" && field === "directory";
                    const currentVal = String(values[field] ?? "");

                    const handleSelectEventType = (val: string) => {
                      setValue("eventType", val);
                      // Auto-sync directory if untouched or matching default album pattern
                      const currentDir = String(values["directory"] ?? "");
                      if (!currentDir || currentDir === "/album/" || currentDir.startsWith("/album/") || currentDir.startsWith("indian-public-school/assets/")) {
                        if (val === "Documents") {
                          setValue("directory", "indian-public-school/assets/Documents");
                        } else if (val === "News") {
                          setValue("directory", "indian-public-school/assets/News");
                        } else if (val === "Infrastructure") {
                          setValue("directory", "indian-public-school/assets/Infrastructure");
                        } else {
                          setValue("directory", `/album/${val}`);
                        }
                      }
                    };

                    const optionsList = resource.options?.[field] || [];

                    return (
                      <div className="relative">
                        <select
                          required={required}
                          value={currentVal}
                          onChange={(event) => {
                            const val = event.target.value;
                            if (isGalleryEventType) {
                              handleSelectEventType(val);
                            } else {
                              setValue(field, val);
                            }
                          }}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#1a5d9c] focus:ring-2 focus:ring-blue-100 shadow-2xs cursor-pointer"
                        >
                          <option value="" disabled className="text-slate-400">
                            Select {titleCase(field)}
                          </option>
                          {optionsList.map((opt) => (
                            <option key={opt} value={opt} className="text-slate-800 py-1 font-medium">
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    );
                  })()
                ) : (
                  <div>
                    <input
                      required={required}
                      type={type}
                      value={String(values[field] ?? "").slice(0, type === "date" ? 10 : undefined)}
                      onChange={(event) => setValue(field, type === "number" ? Number(event.target.value) : event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm opacity-90 outline-none transition focus:border-[#1a5d9c] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 shrink-0 rounded-b-3xl z-10">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button
            disabled={saving || Boolean(uploading)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a5d9c] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
          >
            {saving && <LoaderCircle size={16} className="animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <CloudinaryGalleryModal
        isOpen={Boolean(galleryPickerField)}
        onClose={() => setGalleryPickerField(null)}
        onSelectImage={(url) => {
          if (galleryPickerField) {
            if (Array.isArray(values[galleryPickerField])) {
              setValue(galleryPickerField, [...(values[galleryPickerField] as string[]), url]);
            } else {
              setValue(galleryPickerField, url);
            }
          }
        }}
      />
    </div>
  );
}

function LoginDialog({ onClose, onLoggedIn }: { onClose: () => void; onLoggedIn: (token: string) => void }) {
  const [email, setEmail] = useState("admin@indianpublicschool.in"); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setLoading(true); setError(""); try { const response = await axios.post(`${API_URL}/auth/login`, { email, password }); const payload = response.data?.data ?? response.data; if (!payload.accessToken) throw new Error("The API did not return an access token."); onLoggedIn(payload.accessToken); } catch (reason) { setError(axios.isAxiosError(reason) ? String(reason.response?.data?.message || "Sign in failed.") : "Sign in failed."); } finally { setLoading(false); } };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fdf3da] text-[#b7790a]"><ShieldCheck /></div><button type="button" onClick={onClose} className="text-slate-400"><X /></button></div><h2 className="mt-5 font-display text-2xl font-bold text-[#102a4c]">Administrator sign in</h2><p className="mt-1 text-sm text-slate-500">Sign in to publish or update school information.</p>{error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<label className="mt-5 block text-sm font-bold text-slate-600">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-[#1a5d9c]" /></label><label className="mt-4 block text-sm font-bold text-slate-600">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-[#1a5d9c]" /></label><button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5d9c] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading && <LoaderCircle size={16} className="animate-spin" />} Sign in securely</button></form></div>;
}

function ChangePasswordDialog({
  token,
  onClose,
}: {
  token: string;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and password confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const msg = response.data?.message || "Password updated successfully!";
      setSuccess(msg);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (reason) {
      if (axios.isAxiosError(reason)) {
        const msg =
          reason.response?.data?.message ||
          "Failed to change password. Please check your credentials.";
        setError(Array.isArray(msg) ? msg.join(", ") : String(msg));
      } else {
        setError("Failed to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-[#1a5d9c]">
            <KeyRound size={22} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold text-[#102a4c]">
          Change Password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Update your account password. Must be at least 6 characters.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 flex items-center gap-2">
            <span className="shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-800 flex items-center gap-2">
            <Check size={18} className="shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700">
              Current Password
            </label>
            <div className="relative mt-1.5">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#1a5d9c] focus:ring-2 focus:ring-[#1a5d9c]/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700">
              New Password
            </label>
            <div className="relative mt-1.5">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#1a5d9c] focus:ring-2 focus:ring-[#1a5d9c]/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700">
              Confirm New Password
            </label>
            <div className="relative mt-1.5">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#1a5d9c] focus:ring-2 focus:ring-[#1a5d9c]/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!success}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1a5d9c] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#154b7e] transition disabled:opacity-60"
            >
              {loading && <LoaderCircle size={16} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
