import axios from "axios";
import type { ApiResponse, AuthResponse } from "../types/api";

const AUTH_STORAGE_KEY = "event-qr-attendance-auth";
const PENDING_INVITE_STORAGE_KEY = "event-qr-attendance-pending-invite";

function normalizeStoredAuth(value: unknown): AuthResponse | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<AuthResponse> & {
    user?: { id?: unknown; name?: unknown; email?: unknown };
  };

  if (
    typeof candidate.token !== "string" ||
    !candidate.user ||
    typeof candidate.user.id !== "string" ||
    typeof candidate.user.name !== "string" ||
    typeof candidate.user.email !== "string"
  ) {
    return null;
  }

  return {
    token: candidate.token,
    user: {
      id: candidate.user.id,
      name: candidate.user.name,
      email: candidate.user.email,
    },
    memberships: Array.isArray(candidate.memberships) ? candidate.memberships : [],
    activeOrganizationId:
      typeof candidate.activeOrganizationId === "string" ? candidate.activeOrganizationId : null,
  };
}

export function getStoredAuth() {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const normalized = normalizeStoredAuth(JSON.parse(raw));

    if (!normalized) {
      clearStoredAuth();
    }

    return normalized;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function setStoredAuth(value: unknown) {
  const normalized = normalizeStoredAuth(value);

  if (!normalized) {
    clearStoredAuth();
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getPendingInviteToken() {
  return window.localStorage.getItem(PENDING_INVITE_STORAGE_KEY);
}

export function setPendingInviteToken(token: string) {
  window.localStorage.setItem(PENDING_INVITE_STORAGE_KEY, token);
}

export function clearPendingInviteToken() {
  window.localStorage.removeItem(PENDING_INVITE_STORAGE_KEY);
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
});

api.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

export function unwrapResponse<T>(response: { data: ApiResponse<T> }) {
  return response.data.data;
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

export { AUTH_STORAGE_KEY, PENDING_INVITE_STORAGE_KEY };
