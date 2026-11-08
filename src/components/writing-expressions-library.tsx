"use client";

import { Card } from "@heroui/react/card";
import { buttonVariants } from "@heroui/styles";
import { PracticeBadge } from "@/components/ui/practice-badge";
import { PracticeNotice } from "@/components/ui/practice-notice";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookMarked, BookmarkMinus, LoaderCircle } from "lucide-react";

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
  const removalLock = useRef(false);
  const [loadRevision, setLoadRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isEnglish = initialLanguage === "en";
  const homeHref = isEnglish ? "/?type=writing&lang=en" : "/?type=writing";

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetch("/api/writing-expressions", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ expressions: SavedExpression[] }>;
      })
      .then((data) => { if (!cancelled) setExpressions(data.expressions); })
      .catch(() => { if (!cancelled) setError(isEnglish ? "Could not load your expressions." : "暂时无法加载已保存的表达。"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [isEnglish, loadRevision]);

  const remove = async (id: string) => {
    if (removalLock.current) return;
    removalLock.current = true;
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
      removalLock.current = false;
      setRemoving(null);
    }
  };

  const retry = () => {
    setError(null);
    setLoading(true);
    setLoadRevision(value => value + 1);
  };

  return <main className="expressions-page">
    <title>{isEnglish ? "ChiTouEN II · My Expressions" : "吃透英语二 · 我的表达"}</title>
    <header className="expressions-header">
      <Link className={buttonVariants({ variant: "ghost" })} href={homeHref}><ArrowLeft aria-hidden="true" />{isEnglish ? "Back to writing" : "返回写作"}</Link>
      {!loading && !error && <PracticeBadge>{expressions.length} {isEnglish ? "saved" : "条已保存"}</PracticeBadge>}
    </header>
    <section className="expressions-content" aria-labelledby="expressions-title" aria-busy={loading}>
      <header>
        <h1 id="expressions-title">{isEnglish ? "My expressions" : "我的表达"}</h1>
        <p>{isEnglish ? "Revisit useful language from your feedback, and make it your own." : "回顾批阅中收藏的好表达，积累自己的写作方式。"}</p>
      </header>
      {error && <div className="expressions-error"><PracticeNotice>{error}</PracticeNotice>{!expressions.length && <Button variant="secondary" onClick={retry}>{isEnglish ? "Try again" : "重新加载"}</Button>}</div>}
      {loading ? <Card className="expressions-state" role="status"><LoaderCircle className="spin" aria-hidden="true" /><Card.Description>{isEnglish ? "Loading expressions…" : "正在加载表达…"}</Card.Description></Card>
        : expressions.length ? <div className="expressions-list">{expressions.map((item) => <Card role="article" key={item.id} className="expression-card" aria-label={`${item.year} · Part ${item.part}`}>
          <Card.Header className="expression-card-header">
            <PracticeBadge>{item.year} · Part {item.part}</PracticeBadge>
            <Button variant="secondary" size="sm" onClick={() => void remove(item.id)} disabled={removing !== null} aria-busy={removing === item.id} aria-label={isEnglish ? `Remove saved expression: ${item.rewrite}` : `取消保存：${item.rewrite}`}>
              {removing === item.id ? <LoaderCircle className="spin" aria-hidden="true" /> : <BookmarkMinus aria-hidden="true" />}{isEnglish ? "Remove" : "取消保存"}
            </Button>
          </Card.Header>
          <Card.Content className="expression-card-content">
            <div className="expression-comparison">
              <div><h2>{isEnglish ? "Original" : "原表达"}</h2><p>{item.original}</p></div>
              <div className="expression-rewrite"><h2>{isEnglish ? "Improved expression" : "优化表达"}</h2><p>{item.rewrite}</p></div>
            </div>
            <section className="expression-pattern" aria-label={isEnglish ? "Reusable pattern" : "可迁移句型"}>
              <h2>{isEnglish ? "Reusable pattern" : "可迁移句型"}</h2>
              <blockquote>{item.pattern}</blockquote>
            </section>
          </Card.Content>
          {item.use_cases.length > 0 && <Card.Footer className="expression-card-footer">
            <span>{isEnglish ? "Use it for" : "适用场景"}</span>
            <ul>{item.use_cases.map((useCase, index) => <li key={`${useCase}-${index}`}><PracticeBadge>{useCase}</PracticeBadge></li>)}</ul>
          </Card.Footer>}
        </Card>)}</div>
          : !error && <Card className="expressions-state">
            <BookMarked aria-hidden="true" />
            <Card.Title>{isEnglish ? "No saved expressions yet" : "还没有保存表达"}</Card.Title>
            <Card.Description>{isEnglish ? "Complete a writing task, then save useful language from your review. Your collection stays out of exam practice." : "完成一次写作，在批阅中保存值得复用的表达。模拟作答时不会展示收藏内容。"}</Card.Description>
            <Link className={buttonVariants({ variant: "primary" })} href={homeHref}>{isEnglish ? "Go to writing" : "去练习写作"}<ArrowRight aria-hidden="true" /></Link>
          </Card>}
    </section>
  </main>;
}
