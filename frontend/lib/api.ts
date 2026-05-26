import type { AuthUser } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_KEY = "inngrid_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(typeof body.detail === "string" ? body.detail : "Request failed");
  }
  return response.json();
}

export async function login(email: string, password: string) {
  const data = await apiFetch<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  setToken(data.access_token);
}

export async function registerTenant(payload: {
  organization_name: string;
  slug: string;
  business_type: string;
  contact_phone?: string;
  timezone: string;
  property_category?: string;
  city?: string;
  country?: string;
  preferred_currency: string;
  admin_full_name: string;
  admin_email: string;
  admin_password: string;
}) {
  const data = await apiFetch<{ access_token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  setToken(data.access_token);
}

export async function getCurrentUser() {
  return apiFetch<AuthUser>("/auth/me");
}
