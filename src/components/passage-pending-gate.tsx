"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileClock } from "lucide-react";

/**
 * 答案未录入时的作答拦截页。由服务端判定后渲染，直接访问网址同样会被拦下。
 */
export function PassagePendingGate({ year, number }: { year: number; number: number }) {
  const [uiLanguage, setUiLanguage] = useState<"zh" | "en">("zh");
  const isEnglish = uiLanguage === "en";

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("ui-language");
    if (savedLanguage !== "en" && savedLanguage !== "zh") return;
    const timer = window.setTimeout(() => setUiLanguage(savedLanguage), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return <main className="intensive-gate">
    <div><FileClock /></div>
    <h1>{isEnglish ? "This passage is not open yet" : "这篇暂未开放练习"}</h1>
    <p>{isEnglish
      ? `${year} Text ${number} is available to read, but its answer key and explanations have not been imported, so an attempt could not be graded. Practice opens as soon as the key is in place.`
      : `${year} 年 Text ${number} 的原文已经导入，但答案与解析还没有录入，现在作答无法判分。答案录入后会自动开放练习。`}</p>
    <div className="intensive-gate-actions">
      <Link href="/">{isEnglish ? "Back to library" : "返回首页"}</Link>
    </div>
  </main>;
}
