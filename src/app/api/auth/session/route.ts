import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user: user ? { email: user.email, isAnonymous: user.isAnonymous } : null });
}
