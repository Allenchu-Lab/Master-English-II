"use client";

import { useSearchParams } from "next/navigation";

export default function PracticeLoading() {
  const isEnglish = useSearchParams().get("lang") === "en";

  return (
    <main className="route-loading" aria-live="polite" aria-busy="true">
      <div className="route-loading-mark" />
      <strong>{isEnglish ? "Opening practice" : "正在打开练习"}</strong>
      <span>{isEnglish ? "Preparing the passage and questions…" : "正在准备文章和题目……"}</span>
    </main>
  );
}
