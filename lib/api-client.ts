import axios, { type AxiosInstance, type AxiosResponse } from "axios";

export type ApiRecord = Record<string, unknown>;

export interface ApiEnvelope<T> {
  statusCode: number;
  status?: number;
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown> | null;
  timestamp?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const API_URL = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const baseURL = API_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: { Accept: "application/json" },
});

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "ASC" | "DESC" | 1 | -1;
  filter?: string | Record<string, unknown>;
  [key: string]: unknown;
}

export function buildQueryParams(params?: PaginationParams | Record<string, unknown>): Record<string, string> {
  if (!params) return {};
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "object") {
      query[key] = JSON.stringify(value);
    } else {
      query[key] = String(value);
    }
  }
  return query;
}

export async function getApi<T>(
  path: string,
  params?: PaginationParams | Record<string, unknown>
): Promise<ApiEnvelope<T>> {
  const response = await apiClient.get<ApiEnvelope<T>>(path, {
    params: buildQueryParams(params),
  });
  return response.data;
}

export async function getOptionalApi<T>(
  path: string,
  params?: PaginationParams | Record<string, unknown>
): Promise<ApiEnvelope<T> | null> {
  try {
    return await getApi<T>(path, params);
  } catch {
    return null;
  }
}

export function unwrapSetting<T extends ApiRecord>(
  response: ApiEnvelope<T | { value?: T; _doc?: { value?: T } }>,
): T {
  const setting = response.data as ApiRecord;
  const directValue = setting.value;
  if (directValue && typeof directValue === "object") return directValue as T;

  const document = setting._doc;
  if (document && typeof document === "object") {
    const documentValue = (document as ApiRecord).value;
    if (documentValue && typeof documentValue === "object")
      return documentValue as T;
  }

  return setting as T;
}

export function unwrapCollection<T>(
  response: ApiEnvelope<T[] | PaginatedData<T>> | null,
): T[] {
  if (!response) return [];
  if (Array.isArray(response.data)) return response.data;

  return Array.isArray(response.data.items) ? response.data.items : [];
}

export type ApiResponse<T> = AxiosResponse<ApiEnvelope<T>>;
