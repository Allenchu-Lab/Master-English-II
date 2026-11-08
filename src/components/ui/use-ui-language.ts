"use client";
import { useEffect, useState } from "react";

// Resolves the UI language from ?lang=, persists the choice, and restores the
// saved language on mount. Shared verbatim by every practice surface. The
// <html lang> sync stays per page because its dependencies differ between them.
export function useUiLanguage(initialLanguage: "zh" | "en") {
  const [uiLanguage, setUiLanguage] = useState<"zh" | "en">(initialLanguage);
  useEffect(() => {
    const urlLanguage = new URLSearchParams(window.location.search).get("lang");
    if (urlLanguage === "en" || urlLanguage === "zh") {
      window.localStorage.setItem("ui-language", urlLanguage);
      return;
    }
    const savedLanguage = window.localStorage.getItem("ui-language");
    if (savedLanguage !== "en" && savedLanguage !== "zh") return;
    const timer = window.setTimeout(() => setUiLanguage(savedLanguage), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return { uiLanguage, isEnglish: uiLanguage === "en" };
}
