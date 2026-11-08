import "server-only";
import { NextResponse } from "next/server";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";

export async function requireUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user || user.isAnonymous) return NextResponse.json({ error: "Please sign in to practice." }, { status: 401 });
  return user;
}

export async function optionalUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user && !user.isAnonymous ? user : null;
}