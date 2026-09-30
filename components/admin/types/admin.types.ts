export type RecordItem = Record<string, unknown>;

export type ResourceKey =
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
  | "careers"
  | "theme";

export type InputType =
  | "text"
  | "date"
  | "number"
  | "textarea"
  | "boolean"
  | "file"
  | "select"
  | "richtext";

export interface Resource {
  key: ResourceKey;
  label: string;
  description: string;
  icon: any;
  protected?: boolean;
  fields: string[];
  inputs: Record<string, InputType>;
  options?: Record<string, string[]>;
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

export interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  name?: string;
  allowedModules?: string[];
}
