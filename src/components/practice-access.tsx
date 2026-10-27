import { Suspense, type ReactNode } from "react";
import { getSessionUser } from "@/lib/auth/session";
import { PracticeSignIn } from "@/components/practice-sign-in";

export async function PracticeAccess({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.isAnonymous) return <Suspense><PracticeSignIn /></Suspense>;
  return children;
}
