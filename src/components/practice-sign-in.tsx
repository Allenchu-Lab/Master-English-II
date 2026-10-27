"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmailAuth } from "@/components/email-auth";

export function PracticeSignIn() {
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();
  const isEnglish = search.get("lang") === "en";
  const request = useMemo(() => ({ href: `${pathname}${search.size ? `?${search}` : ""}` }), [pathname, search]);
  const [module, year] = pathname.split("/").slice(1);
  const type = module === "practice" || module === "intensive" ? "reading_a" : module === "reading-b" ? "reading_b" : module;
  const home = `/?type=${type}&year=${year}${isEnglish ? "&lang=en" : ""}`;
  return <main className="library-page"><p>{isEnglish ? "Sign in to start practicing" : "登录后开始练习"}</p><EmailAuth isEnglish={isEnglish} loginRequest={request} onAuthChange={() => {}} onCancel={() => router.replace(home)} /></main>;
}
