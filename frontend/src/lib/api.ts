import type { Category } from "./constants";
import type { ListMeta, Requirement, Stats } from "./types";
import type { RequirementPayload } from "./schemas";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(
  /\/+$/,
  "",
);

export class ApiClientError extends Error {
  readonly status: number;
  readonly details?: Array<{ path: string; message: string }>;

  constructor(message: string, status: number, details?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: ListMeta;
  error?: {
    code: string;
    message: string;
    details?: Array<{ path: string; message: string }>;
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<{ data: T; meta?: ListMeta }> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiClientError(
      "Could not reach the API. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.",
      0,
    );
  }

  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !body) {
    throw new ApiClientError(
      body?.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      body?.error?.details,
    );
  }

  return { data: body.data, meta: body.meta };
}

export async function createRequirement(payload: RequirementPayload): Promise<Requirement> {
  const { data } = await request<Requirement>("/api/requirements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function fetchRequirements(params: {
  category?: Category;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Requirement[]; meta: ListMeta }> {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));

  const query = search.toString();
  const result = await request<Requirement[]>(`/api/requirements${query ? `?${query}` : ""}`);

  return {
    data: result.data,
    meta: result.meta ?? { page: 1, limit: 12, total: result.data.length, totalPages: 1 },
  };
}

export async function fetchRequirement(id: string): Promise<Requirement> {
  const { data } = await request<Requirement>(`/api/requirements/${id}`);
  return data;
}

export async function fetchStats(): Promise<Stats> {
  const { data } = await request<Stats>("/api/requirements/stats");
  return data;
}
