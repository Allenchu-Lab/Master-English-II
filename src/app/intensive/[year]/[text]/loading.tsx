"use client";

import { useSearchParams } from "next/navigation";

export default function IntensiveLoading() {
  const isEnglish = useSearchParams().get("lang") === "en";

  return (
    <main className="route-loading" aria-live="polite" aria-busy="true">
      <div className="route-loading-mark" />
      <strong>{isEnglish ? "Opening intensive reading" : "正在打开精读"}</strong>
      <span>{isEnglish ? "Preparing the passage and your study progress…" : "正在准备文章和学习记录……"}</span>
    </main>
  );
}
