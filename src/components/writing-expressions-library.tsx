"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BookMarked, Check, LoaderCircle } from "lucide-react";

type SavedExpression = {
  id: string;
  original: string;
  rewrite: string;
  pattern: string;
  use_cases: string[];
  status: string;
  created_at: string;
  year: number;
  part: "A" | "B";
};

export function WritingExpressionsLibrary({ initialLanguage }: { initialLanguage: "zh" | "en" }) {
  const [expressions, setExpressions] = useState<SavedExpression[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isEnglish = initialLanguage === "en";
  const homeHref = isEnglish ? "/?type=writing&lang=en" : "/?type=writing";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/writing-expressions")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ expressions: SavedExpression[] }>;
      })
      .then((data) => { if (!cancelled) setExpressions(data.expressions); })
      .catch(() => { if (!cancelled) setError(isEnglish ? "Could not load your expressions." : "暂时无法加载已保存的表达。"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isEnglish]);

  const remove = async (id: string) => {
    if (removing) return;
    setRemoving(id);
    setError(null);
    try {
      const response = await fetch("/api/writing-expressions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expressionId: id }),
      });
      if (!response.ok) throw new Error();
      setExpressions((current) => current.filter((item) => item.id !== id));
    } catch {
      setError(isEnglish ? "Could not remove this expression." : "暂时无法取消保存，请重试。");
    } finally {
      setRemoving(null);
    }
  };

  return <main className="expressions-page">
    <title>{isEnglish ? "ChiTouEN II · My Expressions" : "吃透英语二 · 我的表达"}</title>
    <header className="expressions-header">
      <Link href={homeHref} aria-label={isEnglish ? "Back to writing" : "返回写作"}><ArrowLeft /></Link>
      <nav><BookMarked /><strong>{isEnglish ? "My Expressions" : "我的表达"}</strong></nav>
      <span>{expressions.length} {isEnglish ? "saved" : "条已保存"}</span>
    </header>
    <section className="expressions-content">
      <header>
        <span>{isEnglish ? "WRITING LIBRARY" : "写作语料库"}</span>
        <h1>{isEnglish ? "Keep useful language close." : "把提分表达，变成自己的写法。"}</h1>
        <p>{isEnglish ? "Review the expressions you saved after writing. They will never appear during an active exam simulation." : "这里汇总批改后保存的表达；模拟写作过程中不会展示，避免干扰真实作答。"}</p>
      </header>
      {error && <p className="expressions-error" role="alert">{error}</p>}
      {loading ? <div className="expressions-loading"><LoaderCircle className="spin" />{isEnglish ? "Loading expressions…" : "正在加载表达…"}</div>
        : expressions.length ? <div className="expressions-list">{expressions.map((item) => <article key={item.id}>
          <header><span>{item.year} · Part {item.part}</span><button className="is-saved" onClick={() => void remove(item.id)} disabled={removing === item.id} title={isEnglish ? "Remove from saved expressions" : "取消保存"}><Check />{isEnglish ? "Saved" : "已保存"}</button></header>
          <div className="expression-change"><del>{item.original}</del><strong>{item.rewrite}</strong></div>
          <blockquote>{item.pattern}</blockquote>
          <ul>{item.use_cases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul>
        </article>)}</div>
          : <div className="expressions-empty"><BookMarked /><h2>{isEnglish ? "No saved expressions yet" : "还没有保存表达"}</h2><p>{isEnglish ? "Complete a writing task, review the feedback and save an expression worth reusing." : "完成一次写作，在批改结果中保存值得复用的表达，它会出现在这里。"}</p><Link href={homeHref}>{isEnglish ? "Go to writing" : "去练习写作"}</Link></div>}
    </section>
  </main>;
}
