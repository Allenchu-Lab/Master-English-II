"use client";

export type AuthUser = { email: string | null; isAnonymous: boolean };

export class AuthApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = "AuthApiError"; }
}

async function api<T>(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new AuthApiError(response.status, body.error ?? "Request failed");
  return body;
}

export function isEmailUser(user: AuthUser | null) {
  return Boolean(user?.email && !user.isAnonymous);
}

export async function getAuthUser() {
  return api<{ user: AuthUser | null; signInEnabled: boolean; localMail: boolean }>("/api/auth/session");
}

export async function requestEmailOtp(email: string) {
  return api<{ ok: true }>("/api/auth/request-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
}

export async function verifyEmailOtp(email: string, code: string) {
  return api<{ user: AuthUser; recordsMigrated: boolean }>("/api/auth/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
}

export async function signOut() {
  return api<{ ok: true }>("/api/auth/logout", { method: "POST" });
}
