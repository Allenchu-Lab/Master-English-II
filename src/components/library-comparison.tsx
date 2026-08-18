"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { BarChart3, BookOpen, ChevronRight, FileText, Languages, PenLine, TextCursorInput } from "lucide-react";
import type { ExamPaperMap, ExamSectionType } from "@/data/exam-types";
import { EmailAuth } from "@/components/email-auth";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

// 题型的展示文案与图标属于界面表现，数量与可用状态一律来自数据库。
const sectionMeta: Record<ExamSectionType, { zh: string; en: string; zhUnit: string; enUnit: string; icon: typeof BookOpen }> = {
  reading_a: { zh: "阅读理解 Part A", en: "Reading Part A", zhUnit: "篇", enUnit: "passages", icon: BookOpen },
  reading_b: { zh: "阅读理解 Part B", en: "Reading Part B", zhUnit: "篇", enUnit: "passages", icon: FileText },
  cloze: { zh: "完形填空", en: "Cloze", zhUnit: "篇", enUnit: "passages", icon: TextCursorInput },
  translation: { zh: "翻译", en: "Translation", zhUnit: "篇", enUnit: "passages", icon: Languages },
  writing: { zh: "写作", en: "Writing", zhUnit: "题", enUnit: "tasks", icon: PenLine },
};

const sectionOrder: ExamSectionType[] = ["reading_a", "reading_b", "cloze", "translation", "writing"];

export function LibraryComparison({ papers }: { papers: ExamPaperMap }) {
  const pageRef = useRef<HTMLElement>(null);
  const sketchRef = useRef<HTMLDivElement>(null);
  const firstContentRender = useRef(true);
  const years = useMemo(() => Object.values(papers).map((paper) => paper.year).sort((a, b) => b - a), [papers]);
  const [year, setYear] = useState(() => years[0] ?? 0);
  const [activeType, setActiveType] = useState(0);
  const [uiLanguage, setUiLanguage] = useState<"zh" | "en">("zh");
  const [attempts, setAttempts] = useState<Record<string, "draft" | "submitted">>({});
  const [authRevision, setAuthRevision] = useState(0);
  const isEnglish = uiLanguage === "en";
  const selectedPaper = papers[String(year)];

  const typeItems = useMemo(() => sectionOrder.map((type) => {
    let total = 0;
    let available = false;
    for (const paper of Object.values(papers)) {
      for (const section of paper.sections) {
        if (section.type !== type) continue;
        total += section.itemCount;
        if (section.available) available = true;
      }
    }
    let done = 0;
    if (type === "reading_a") {
      for (const paper of Object.values(papers)) {
        done += paper.readingA.filter((article) => attempts[article.id] === "submitted").length;
      }
    }
    return { type, ...sectionMeta[type], total, available, done };
  }), [papers, attempts]);

  const selectedType = typeItems[activeType];
  const articles = selectedType?.type === "reading_a" && selectedPaper ? selectedPaper.readingA : [];

  const yearStats = (yearValue: number) => {
    const paper = papers[String(yearValue)];
    if (!paper) return null;
    const done = paper.readingA.filter((article) => attempts[article.id] === "submitted").length;
    return { done, total: paper.readingA.length };
  };

  const articleDone = articles.filter((article) => attempts[article.id] === "submitted").length;
  const sectionItemCount = selectedPaper?.sections.find((section) => section.type === selectedType?.type)?.itemCount ?? 0;
  const articleTotal = articles.length || sectionItemCount;

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("ui-language");
    if (savedLanguage !== "en" && savedLanguage !== "zh") return;
    const timer = window.setTimeout(() => setUiLanguage(savedLanguage), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const switchLanguage = () => {
    const nextLanguage = isEnglish ? "zh" : "en";
    setUiLanguage(nextLanguage);
    window.localStorage.setItem("ui-language", nextLanguage);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadAttempts() {
      try {
        const response = await fetch("/api/attempts");
        if (!response.ok || cancelled) return;
        const { attempts: data } = await response.json() as { attempts: { passage_id: string; submitted_at: string | null }[] };
        setAttempts(data.reduce<Record<string, "draft" | "submitted">>((result, attempt) => {
          result[attempt.passage_id] = attempt.submitted_at || result[attempt.passage_id] === "submitted" ? "submitted" : "draft";
          return result;
        }, {}));
      } catch { /* The library remains usable when account setup is unavailable. */ }
    }
    loadAttempts();
    return () => { cancelled = true; };
  }, [authRevision]);

  const playSketchInteraction = () => {
    if (!sketchRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = sketchRef.current.querySelector(".sketch-tracer");
    const image = sketchRef.current.querySelector(".learning-sketch");
    gsap.killTweensOf([dot, image]);
    gsap.timeline()
      .set(dot, { autoAlpha: 1 })
      .fromTo(dot, {
        motionPath: { path: "#sketch-motion-path", align: "#sketch-motion-path", alignOrigin: [0.5, 0.5], start: 0, end: 0 },
      }, {
        motionPath: { path: "#sketch-motion-path", align: "#sketch-motion-path", alignOrigin: [0.5, 0.5], start: 0, end: 1 },
        duration: 0.72,
        ease: "power1.inOut",
      })
      .to(dot, { autoAlpha: 0, scale: 1.5, duration: 0.14, ease: "power2.out" })
      .to(image, { y: -3, rotation: 1, duration: 0.16, ease: "power2.out" }, "<")
      .to(image, { y: 0, rotation: 0, duration: 0.24, ease: "power2.out" });
  };

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({ defaults: { duration: 0.22, ease: "power2.out" } });

      timeline
        .from([".learning-intro", ".question-types"], { autoAlpha: 0, y: 6 }, 0)
        .from(".year-library", { autoAlpha: 0 }, 0.04)
        .from(".type-progress b, .article-group-head i b", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.24,
        }, 0)
        .to(".learning-sketch", {
          keyframes: [
            { y: 2, rotation: -1.5, duration: 0.1 },
            { y: -5, rotation: 1.5, duration: 0.2, ease: "power2.out" },
            { y: 0, rotation: 0, duration: 0.28, ease: "power2.out" },
          ],
          transformOrigin: "30% 78%",
        }, 0.12);
    });

    return () => media.revert();
  }, { scope: pageRef });

  useGSAP(() => {
    if (firstContentRender.current) {
      firstContentRender.current = false;
      return;
    }

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ".article-group",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.16, ease: "power2.out", overwrite: "auto" },
      );
    });

    return () => media.revert();
  }, { dependencies: [year, activeType], scope: pageRef, revertOnUpdate: true });

  return (
    <main className="comparison" ref={pageRef}>
      <div className="product-shell">
        <aside className="product-nav">
          <div className={`product-brand ${isEnglish ? "is-english" : "is-chinese"}`}><Image src="/favicon.svg" width={22} height={22} alt="" aria-hidden="true" /><strong>{isEnglish ? "Master English II" : "吃透英语二"}</strong></div>
          <nav>
            <button className="active"><BookOpen /><span>{isEnglish ? "Practice" : "刷题"}</span></button>
            <button><BarChart3 /><span>{isEnglish ? "Statistics" : "统计"}</span></button>
          </nav>
          <div className="sidebar-tools"><button className="language-switch" onClick={switchLanguage} aria-label={isEnglish ? "Switch to Chinese" : "切换到英文"} aria-pressed={isEnglish}><Languages /><span>{isEnglish ? "中文" : "English"}</span></button></div>
        </aside>

        <div className="product-main">
          <header className="content-header">
            <nav className="breadcrumb" aria-label={isEnglish ? "Breadcrumb" : "面包屑导航"}><BookOpen /><span aria-current="page">{isEnglish ? "Practice" : "刷题"}</span></nav>
            <EmailAuth isEnglish={isEnglish} onAuthChange={() => setAuthRevision((value) => value + 1)} />
          </header>

          <section className="library">
            <header className={`learning-intro ${isEnglish ? "is-english" : ""}`}>
              <div>
                <h1>{isEnglish ? "Read it. Solve it." : "读懂真题，把题做对。"}</h1>
                <p>{isEnglish ? "One passage at a time." : "一次练一篇，读懂再继续。"}</p>
              </div>
              <div className="sketch-scene" ref={sketchRef} onPointerEnter={playSketchInteraction} aria-hidden="true">
                <Image className="learning-sketch" src="/reading-path-sketch.png" alt="" width={178} height={112} loading="eager" />
                <svg className="sketch-track" viewBox="0 0 144 91" focusable="false">
                  <path id="sketch-motion-path" d="M35 68 C48 55 61 59 66 47 C70 37 58 30 67 24 C77 17 86 29 81 40 C78 51 101 60 116 43" />
                  <circle className="sketch-tracer" r="2.6" />
                </svg>
              </div>
            </header>
            <section className="question-types">
              <div className="type-tabs">{typeItems.map(({ type, zh, en, done, total, available, zhUnit, enUnit, icon: Icon }, index) => <button className={activeType === index ? "active" : ""} key={type} onClick={() => setActiveType(index)} aria-pressed={activeType === index}><span className="type-label"><Icon /><span>{isEnglish ? en : zh}</span></span><small className="type-total">{isEnglish ? `${total} ${enUnit} in past papers` : `历年真题共 ${total} ${zhUnit}`}</small><span className="type-progress-copy"><span>{available ? (isEnglish ? "Completed" : "已累计完成") : (isEnglish ? "Not open yet" : "尚未开放")}</span><strong>{available ? `${done} / ${total}` : "—"}</strong></span><i className="type-progress"><b style={{ width: available && total ? `${(done / total) * 100}%` : "0%" }} /></i></button>)}</div>
            </section>

            <section className="year-library">
              <div className="paper-browser">
                <aside className="year-list" aria-label={isEnglish ? "Select year" : "选择年份"}>{years.map((value) => { const stats = yearStats(value); return <button key={value} className={year === value ? "active" : ""} onClick={() => setYear(value)} aria-pressed={year === value}><strong>{value}</strong><small>{stats ? `${stats.done}/${stats.total}` : "—"}</small></button>})}</aside>
                <div className="article-group">
                  <div className="article-group-head"><div><h3>{isEnglish ? `${year} Paper` : `${year} 年真题`}</h3><span>{isEnglish ? selectedType.en : selectedType.zh}</span></div><div><span>{isEnglish ? "Completed" : "完成"} {articleDone} / {articleTotal}</span><i><b style={{ width: `${articleTotal ? (articleDone / articleTotal) * 100 : 0}%` }} /></i></div></div>
                  <div className="article-list">{articles.length ? articles.map((article) => {
                    const state = attempts[article.id];
                    // 答案未录入的篇目提交时无法判分，直接标记为待开放而不是引导作答。
                    if (!article.gradable) {
                      return <article key={article.number} className="article-row status-wait"><div className="article-name"><h4>Text {article.number}</h4><p>{isEnglish ? `${article.wordCount} words · ${article.questionCount} questions` : `${article.wordCount} 词 · ${article.questionCount} 题`}</p></div><div className="article-review"><div className="article-status"><span><i />{isEnglish ? "Answer key pending" : "答案待录入"}</span><small>{isEnglish ? "Practice opens once the answer key is imported." : "答案与解析录入后开放练习。"}</small></div><span className="article-action is-disabled">{isEnglish ? "Not open yet" : "暂未开放"}</span></div></article>;
                    }
                    const status = state === "submitted" ? (isEnglish ? "Submitted" : "已完成") : state === "draft" ? (isEnglish ? "In progress" : "进行中") : (isEnglish ? "Not started" : "未开始");
                    const action = state === "draft" ? (isEnglish ? "Continue" : "继续练习") : (isEnglish ? "Start practice" : "开始练习");
                    return <article key={article.number} className={`article-row ${state === "submitted" ? "status-ready" : state === "draft" ? "status-review" : "status-new"}`}><div className="article-name"><h4>Text {article.number}</h4><p>{isEnglish ? `${article.wordCount} words · ${article.questionCount} questions` : `${article.wordCount} 词 · ${article.questionCount} 题`}</p></div><div className="article-review"><div className="article-status"><span><i />{status}</span><small>{state === "submitted" ? (isEnglish ? "Intensive reading unlocked" : "已解锁精读") : (isEnglish ? `Source: pages ${article.sourcePages.join("–")}` : `来源：PDF 第 ${article.sourcePages.join("–")} 页`)}</small></div>{state === "submitted" ? <div className="article-actions"><a className="article-action secondary" href={`/practice/${year}/${article.number}`}>{isEnglish ? "Redo" : "重新练习"}</a><a className="article-action primary" href={`/intensive/${year}/${article.number}`}>{isEnglish ? "Study deeply" : "进入精读"}<ChevronRight /></a></div> : <a className="article-action" href={`/practice/${year}/${article.number}`}>{action}<ChevronRight /></a>}</div></article>;
                  }) : <div className="article-empty"><p>{!selectedPaper ? (isEnglish ? "No paper has been imported yet." : "题库尚未导入任何真题。") : selectedType?.available ? (isEnglish ? "This section is registered from the source PDF and will be connected to its practice view next." : "该题型已按原卷登记，练习内容将在对应页面接入。") : (isEnglish ? "This section is not open yet." : "该题型尚未开放。")}</p></div>}</div>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
