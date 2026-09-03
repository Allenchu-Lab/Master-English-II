import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { emailLoginEnabled, localMailEnabled } from "@/lib/auth/config";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user: user ? { email: user.email, isAnonymous: user.isAnonymous } : null,
    signInEnabled: emailLoginEnabled(), localMail: localMailEnabled() }, { headers: { "Cache-Control": "no-store" } });
}
