"use client";

import { useSearchParams } from "next/navigation";

export default function WritingLoading() {
  const isEnglish = useSearchParams().get("lang") === "en";

  return (
    <main className="route-loading" aria-live="polite" aria-busy="true">
      <div className="route-loading-mark" />
      <strong>{isEnglish ? "Opening writing" : "正在打开写作"}</strong>
      <span>{isEnglish ? "Preparing the prompt and your draft…" : "正在准备题目和写作草稿……"}</span>
    </main>
  );
}
