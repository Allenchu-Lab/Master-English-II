"use client";

import { EmailAuth } from "@/components/email-auth";

export function AdminLogin() {
  return <EmailAuth isEnglish={false} onAuthChange={() => window.location.reload()} />;
}
