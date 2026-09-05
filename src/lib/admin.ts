import "server-only";

import { getSessionUser } from "@/lib/auth/session";

function configuredAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function getAdminAccess() {
  const user = await getSessionUser();
  const configured = configuredAdminEmails();
  return {
    user,
    configured: configured.size > 0,
    allowed: Boolean(user?.email && configured.has(user.email.toLowerCase())),
  };
}
