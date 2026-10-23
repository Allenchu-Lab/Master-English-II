"use client";

import Image from "next/image";
import Link from "next/link";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { BarChart3, BookMarked, BookOpen, Check, ChevronRight, FileText, Languages, LoaderCircle, PenLine, TextCursorInput } from "lucide-react";
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

export function LibraryComparison({ papers, initialLanguage = "zh", initialType = "reading_a", initialYear, allowPreview = false }: { papers: ExamPaperMap; initialLanguage?: "zh" | "en"; initialType?: ExamSectionType; initialYear?: number; allowPreview?: boolean }) {
  const pageRef = useRef<HTMLElement>(null);
  const sketchRef = useRef<HTMLDivElement>(null);
  const years = useMemo(() => Object.values(papers).map((paper) => paper.year).sort((a, b) => b - a), [papers]);
  const [year, setYear] = useState(() => initialYear && years.includes(initialYear) ? initialYear : years[0] ?? 0);
  const [activeType, setActiveType] = useState(() => Math.max(sectionOrder.indexOf(initialType), 0));
  const [uiLanguage, setUiLanguage] = useState<"zh" | "en">(initialLanguage);
  const [completionTimes,setCompletionTimes]=useState<Record<string,string|null>>({});
  function completionLabel(id:string) {
    const value=completionTimes[id];
    if(!value)return '';
    return (isEnglish?'Completed ':'完成于 ')+new Intl.DateTimeFormat(isEnglish?'en-GB':'zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(value));
  }
  const [readingScores,setReadingScores]=useState<Record<string,number|null>>({});
  const [writingScores,setWritingScores]=useState<Record<string,{score:number|null;submitted:boolean}>>({});
  const [translationScores,setTranslationScores]=useState<Record<number,number|null>>({});
  const [attempts, setAttempts] = useState<Record<string, "draft" | "submitted">>({});
  const [writingAttempts, setWritingAttempts] = useState<Record<string, "draft" | "submitted" | "redo">>({});
  const [translationAttempts,setTranslationAttempts] = useState<Record<number,boolean>>({});
  const [translationRedo,setTranslationRedo]=useState<Record<number,boolean>>({});
  const [translationDrafts,setTranslationDrafts] = useState<Record<number,boolean>>({});
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [authRevision, setAuthRevision] = useState(0);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isEnglish = uiLanguage === "en";
  const selectedPaper = papers[String(year)];

  const typeItems = useMemo(() => sectionOrder.map((type) => {
    let total = 0;
    let available = false;
    for (const paper of Object.values(papers)) {
      for (const section of paper.sections) {
        if (section.type !== type) continue;
        if (section.available) {
          total += section.itemCount;
          available = true;
        }
      }
    }
    let done = 0;
    if (type === "reading_a") {
      for (const paper of Object.values(papers)) {
        done += paper.readingA.filter((article) => attempts[article.id] === "submitted").length;
      }
    }
    if (type === "translation") done = Object.values(translationAttempts).filter(Boolean).length;
    if (type === "writing") {
      for (const paper of Object.values(papers)) {
        done += paper.writing.filter((task) => writingAttempts[task.id] === "submitted").length;
      }
    }
    return { type, ...sectionMeta[type], total, available, done };
  }), [papers, attempts, writingAttempts, translationAttempts]);

  const selectedType = typeItems[activeType];
  const articles = selectedType?.type === "reading_a" && selectedPaper ? selectedPaper.readingA : [];
  const writingTasks = selectedType?.type === "writing" && selectedPaper ? selectedPaper.writing : [];

  const yearStats = (yearValue: number) => {
    if (!progressLoaded) return null;
    const paper = papers[String(yearValue)];
    if (!paper) return null;
    if (selectedType?.type === "translation") return { done: translationAttempts[yearValue] ? 1 : 0, total: paper.sections.find((section) => section.type === "translation")?.itemCount ?? 0 };
    if (selectedType?.type === "writing") {
      return { done: paper.writing.filter((task) => writingAttempts[task.id] === "submitted").length, total: paper.writing.length };
    }
    const done = paper.readingA.filter((article) => attempts[article.id] === "submitted").length;
    return { done, total: paper.readingA.length };
  };

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

  useEffect(() => {
    document.documentElement.lang = isEnglish ? "en" : "zh-CN";
  }, [isEnglish]);

  const switchLanguage = () => {
    const nextLanguage = isEnglish ? "zh" : "en";
    document.title = nextLanguage === "en" ? "ChiTouEN II" : "吃透英语二";
    document.documentElement.lang = nextLanguage === "en" ? "en" : "zh-CN";
    setUiLanguage(nextLanguage);
    window.localStorage.setItem("ui-language", nextLanguage);
    const url = new URL(window.location.href);
    if (nextLanguage === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const languageHref = (path: string) => isEnglish ? `${path}${path.includes("?") ? "&" : "?"}lang=en` : path;

  const selectType = (index: number, type: ExamSectionType) => {
    setActiveType(index);
    const url = new URL(window.location.href);
    if (type === "reading_a") url.searchParams.delete("type");
    else url.searchParams.set("type", type);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const selectYear = (value: number) => {
    setYear(value);
    const url = new URL(window.location.href);
    url.searchParams.set("year", String(value));
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const beginNavigation = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (pendingHref) {
      event.preventDefault();
      return;
    }
    setPendingHref(href);
  };

  useEffect(() => {
    if (!pendingHref) return;
    const reset = () => setPendingHref(null);
    const timer = window.setTimeout(reset, 10000);
    window.addEventListener("pageshow", reset);
    window.addEventListener("popstate", reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", reset);
      window.removeEventListener("popstate", reset);
    };
  }, [pendingHref]);

  useEffect(() => {
    let cancelled = false;
    async function loadAttempts() {
      try {
        const [response, writingResponse, translationResponse] = await Promise.all([fetch("/api/attempts"), fetch("/api/writing-attempts"), fetch("/api/translation-attempts")]);
        if (translationResponse.ok && !cancelled) { const data = await translationResponse.json() as {attempts: {year:number;submitted:boolean;has_draft:boolean;has_redo:boolean;latest_score:number|null;completed_at:string|null}[]}; setCompletionTimes(previous=>({...previous,...Object.fromEntries(data.attempts.map(item=>[`translation-${item.year}`,item.completed_at]))})); setTranslationScores(Object.fromEntries(data.attempts.map(item=>[item.year,item.latest_score]))); setTranslationAttempts(Object.fromEntries(data.attempts.map(item=>[item.year,item.submitted]))); setTranslationRedo(Object.fromEntries(data.attempts.map(item=>[item.year,item.has_redo]))); setTranslationDrafts(Object.fromEntries(data.attempts.map(item=>[item.year,item.has_draft]))); }
        if (!response.ok || cancelled) return;
        // 接口已按文章聚合，每篇一条结论，无需再依赖返回顺序累积推断。
        const { attempts: data } = await response.json() as { attempts: { passage_id: string; submitted: boolean; correct_count:number|null;completed_at:string|null }[] };
        setCompletionTimes(previous=>({...previous,...Object.fromEntries(data.map(item=>[item.passage_id,item.completed_at]))}));
        setReadingScores(Object.fromEntries(data.map(item=>[item.passage_id,item.correct_count])));
        setAttempts(Object.fromEntries(data.map((attempt) => [attempt.passage_id, attempt.submitted ? "submitted" : "draft"] as const)));
        if (writingResponse.ok) {
          const { attempts: writingData } = await writingResponse.json() as { attempts: { task_id: string; submitted: boolean; has_draft: boolean;latest_score:number|null;has_submission:boolean;completed_at:string|null }[] };
          setCompletionTimes(previous=>({...previous,...Object.fromEntries(writingData.map(item=>[item.task_id,item.completed_at]))}));
          setWritingScores(Object.fromEntries(writingData.map(item=>[item.task_id,{score:item.latest_score,submitted:item.submitted}])));
          setWritingAttempts(Object.fromEntries(writingData.filter((item) => item.submitted || item.has_draft || item.has_submission).map((item) => [item.task_id, item.submitted ? "submitted" : item.has_draft ? "draft" : "redo"] as const)));
        }
      } catch { /* The library remains usable when account setup is unavailable. */ }
      finally {
        if (!cancelled) setProgressLoaded(true);
      }
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
        .from(".type-progress b", {
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

  return (
    <main className="comparison" ref={pageRef}>
      <title>{isEnglish ? "ChiTouEN II" : "吃透英语二"}</title>
      <div className="product-shell">
        <aside className="product-nav">
          <div className={`product-brand ${isEnglish ? "is-english" : "is-chinese"}`}><Image src="/favicon.svg" width={22} height={22} alt="" aria-hidden="true" /><strong>{isEnglish ? "ChiTouEN II" : "吃透英语二"}</strong></div>
          <nav>
            <button className="active" aria-current="page"><BookOpen /><span>{isEnglish ? "Practice" : "刷题"}</span></button>
            {/* 统计页尚未实现。保持可见以交代产品结构，但明确标为不可用，
                而不是留一个点下去毫无反应的按钮。 */}
            <button disabled aria-disabled="true" title={isEnglish ? "Coming soon" : "即将上线"}><BarChart3 /><span>{isEnglish ? "Statistics" : "统计"}</span><small>{isEnglish ? "Soon" : "即将上线"}</small></button>
          </nav>
          <div className="sidebar-tools"><button className="language-switch" onClick={switchLanguage} aria-label={isEnglish ? "Switch to Chinese" : "切换到英文"} aria-pressed={isEnglish}><Languages /><span>{isEnglish ? "中文" : "English"}</span></button></div>
        </aside>

        <div className="product-main">
          <header className="content-header">
            <nav className="breadcrumb" aria-label={isEnglish ? "Breadcrumb" : "面包屑导航"}><BookOpen /><span aria-current="page">{isEnglish ? "Practice" : "刷题"}</span></nav>
            <EmailAuth isEnglish={isEnglish} onAuthChange={() => { setProgressLoaded(false); setAuthRevision((value) => value + 1); }} />
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
              <div className="type-tabs">{typeItems.map(({ type, zh, en, done, total, available, zhUnit, enUnit, icon: Icon }, index) => <button className={activeType === index ? "active" : ""} key={type} onClick={() => selectType(index, type)} aria-pressed={activeType === index}><span className="type-label"><Icon /><span>{isEnglish ? en : zh}</span></span><small className="type-total">{available ? (isEnglish ? `${total} ${enUnit} in past papers` : `历年真题共 ${total} ${zhUnit}`) : (isEnglish ? "Not open yet" : "尚未开放")}</small><span className="type-progress-copy"><span>{available ? (!progressLoaded ? (isEnglish ? "Loading progress" : "正在读取进度") : (isEnglish ? "Completed" : "已累计完成")) : (isEnglish ? "Not open yet" : "尚未开放")}</span><strong>{available && progressLoaded ? `${done} / ${total}` : "—"}</strong></span><i className="type-progress"><b style={{ width: available && progressLoaded && total ? `${(done / total) * 100}%` : "0%" }} /></i></button>)}</div>
            </section>

            {selectedType?.type === "writing" && <Link className={`writing-library-entry ${pendingHref === languageHref("/writing/expressions") ? "is-pending" : ""}`} href={languageHref("/writing/expressions")} onClick={(event) => beginNavigation(event, languageHref("/writing/expressions"))} aria-busy={pendingHref === languageHref("/writing/expressions")}><span><BookMarked /><span><strong>{isEnglish ? "My expressions" : "我的表达"}</strong><small>{isEnglish ? "Review language saved from your feedback" : "回看批改后保存的提分表达"}</small></span></span>{pendingHref === languageHref("/writing/expressions") ? <LoaderCircle className="is-spinning" /> : <ChevronRight />}</Link>}

            <section className="year-library">
              <div className="paper-browser">
                <aside className="year-list" aria-label={isEnglish ? "Select year" : "选择年份"}>{years.map((value) => {
                  const stats = yearStats(value);
                  const complete = Boolean(stats && stats.total > 0 && stats.done === stats.total);
                  return <button key={value} className={`${year === value ? "active" : ""}${complete ? " is-complete" : ""}`} onClick={() => selectYear(value)} aria-pressed={year === value}>
                    <strong>{value}{complete && <Check className="year-complete" size={16} aria-label={isEnglish ? "All completed" : "全部完成"} role="img" />}</strong><small>{stats ? `${stats.done}/${stats.total}` : "—"}</small>
                  </button>;
                })}</aside>
                <div className="article-group">
                  {selectedType?.type === "translation" && selectedType.available && <article className={`article-row ${translationDrafts[year] ? "status-review" : translationAttempts[year] ? "status-ready" : "status-new"}`}><div className="article-name"><h4>{isEnglish ? "Translation" : "英译中"}</h4><p>{isEnglish ? "15 points" : "满分 15 分"}</p></div><div className="article-review"><div className="article-status"><span><i />{!progressLoaded ? (isEnglish ? "Loading…" : "正在读取…") : translationRedo[year] ? (isEnglish ? "Ready to redo" : "待重写") : translationDrafts[year] ? (isEnglish ? "In progress" : "进行中") : translationAttempts[year] ? (isEnglish ? "Completed" : "已完成") : (isEnglish ? "Not started" : "未开始")}</span>{progressLoaded&&translationAttempts[year]?<div className="article-result">{typeof translationScores[year]==='number'?<><strong>{translationScores[year]}<small> / 15</small></strong><small>{completionLabel(`translation-${year}`)}</small></>:<small>{isEnglish?'Review not complete':'批阅未完成'}</small>}</div>:null}</div><Link className="article-action" href={languageHref(`/translation/${year}`)}>{translationDrafts[year] ? (isEnglish ? "Continue" : "继续翻译") : translationAttempts[year] ? (isEnglish ? "View response" : "查看译文") : (isEnglish ? "Start translation" : "开始翻译")}<ChevronRight /></Link></div></article>}
                  <div className="article-list">{selectedType?.type === "translation" ? null : !progressLoaded ? <div className="article-empty"><p>{isEnglish ? "Loading your learning progress…" : "正在读取学习进度…"}</p></div> : writingTasks.length ? writingTasks.map((task) => {
                    const state = writingAttempts[task.id];
                    const status = state === "redo" ? (isEnglish ? "Ready to rewrite" : "待重写") : state === "submitted" ? (isEnglish ? "Completed" : "已完成") : state === "draft" ? (isEnglish ? "In progress" : "进行中") : (isEnglish ? "Not started" : "未开始");
                    const href = languageHref(`/writing/${year}?part=${task.part}`);
                    const isPending = pendingHref === href;
                    return <article key={task.id} className={`article-row ${state === "submitted" ? "status-ready" : state === "draft" ? "status-review" : "status-new"}`}><div className="article-name"><h4>Part {task.part}</h4><p>{isEnglish ? `${task.targetWords} words · ${task.points} points` : `约 ${task.targetWords} 词 · ${task.points} 分`}</p></div><div className="article-review"><div className="article-status"><span><i />{status}</span>{writingScores[task.id]?.submitted?<div className="article-result">{typeof writingScores[task.id].score==='number'?<><strong>{writingScores[task.id].score}<small> / {task.points}</small></strong><small>{completionLabel(task.id)}</small></>:<small>{isEnglish?'Review not complete':'批阅未完成'}</small>}</div>:null}</div><Link className={`article-action ${isPending ? "is-pending" : ""}`} href={href} onClick={(event) => beginNavigation(event, href)} aria-busy={isPending}>{isPending ? (isEnglish ? "Opening…" : "正在打开…") : state === "draft" ? (isEnglish ? "Continue" : "继续写作") : state === "submitted" ? (isEnglish ? "View response" : "查看答案") : (isEnglish ? "Start writing" : "开始写作")}{isPending ? <LoaderCircle className="is-spinning" /> : <ChevronRight />}</Link></div></article>;
                  }) : articles.length ? articles.map((article) => {
                    const state = attempts[article.id];
                    // 答案未录入的篇目提交时无法判分，直接标记为待开放而不是引导作答。
                    if (!article.gradable) {
                      return <article key={article.number} className="article-row status-wait"><div className="article-name"><h4>Text {article.number}</h4><p>{isEnglish ? `${article.wordCount} words · ${article.questionCount} questions` : `${article.wordCount} 词 · ${article.questionCount} 题`}</p></div><div className="article-review"><div className="article-status"><span><i />{isEnglish ? "Answer key pending" : "答案待录入"}</span><small>{allowPreview ? (isEnglish ? "Local preview only · Grading disabled" : "仅本地预览 · 暂不判分") : (isEnglish ? "Practice opens once the answer key is imported." : "答案与解析录入后开放练习。")}</small></div>{allowPreview ? <Link className="article-action" href={languageHref(`/practice/${year}/${article.number}`)}>{isEnglish ? "Preview" : "预览题目"}<ChevronRight /></Link> : <span className="article-action is-disabled">{isEnglish ? "Not open yet" : "暂未开放"}</span>}</div></article>;
                    }
                    const status = state === "submitted" ? (isEnglish ? "Submitted" : "已完成") : state === "draft" ? (isEnglish ? "In progress" : "进行中") : (isEnglish ? "Not started" : "未开始");
                    const action = state === "draft" ? (isEnglish ? "Continue" : "继续练习") : (isEnglish ? "Start practice" : "开始练习");
                    const href = languageHref(`/practice/${year}/${article.number}`);
                    const isPending = pendingHref === href;
                    const redoHref = languageHref(`/practice/${year}/${article.number}?redo=1`);
                    const intensiveHref = languageHref(`/intensive/${year}/${article.number}`);
                    return <article key={article.number} className={`article-row ${state === "submitted" ? "status-ready" : state === "draft" ? "status-review" : "status-new"}`}><div className="article-name"><h4>Text {article.number}</h4><p>{isEnglish ? `${article.wordCount} words · ${article.questionCount} questions` : `${article.wordCount} 词 · ${article.questionCount} 题`}</p></div><div className="article-review"><div className="article-status"><span><i />{status}</span>{state==='submitted'?<div className="article-result">{typeof readingScores[article.id]==='number'?<><strong>{readingScores[article.id]!*2}<small> / {article.questionCount*2}</small></strong></>:<small>{isEnglish?'Score unavailable':'暂无成绩'}</small>}</div>:null}<small>{state === "submitted" ? completionLabel(article.id) : (isEnglish ? `Source: pages ${article.sourcePages.join("–")}` : `来源：PDF 第 ${article.sourcePages.join("–")} 页`)}</small></div>{state === "submitted" ? <div className="article-actions"><Link className={`article-action secondary ${pendingHref === redoHref ? "is-pending" : ""}`} href={redoHref} onClick={(event) => beginNavigation(event, redoHref)} aria-busy={pendingHref === redoHref}>{pendingHref === redoHref ? (isEnglish ? "Opening…" : "正在打开…") : (isEnglish ? "Redo" : "重新练习")}{pendingHref === redoHref ? <LoaderCircle className="is-spinning" /> : null}</Link><Link className={`article-action primary ${pendingHref === intensiveHref ? "is-pending" : ""}`} href={intensiveHref} onClick={(event) => beginNavigation(event, intensiveHref)} aria-busy={pendingHref === intensiveHref}>{pendingHref === intensiveHref ? (isEnglish ? "Opening…" : "正在打开…") : (isEnglish ? "Study deeply" : "进入精读")}{pendingHref === intensiveHref ? <LoaderCircle className="is-spinning" /> : <ChevronRight />}</Link></div> : <Link className={`article-action ${isPending ? "is-pending" : ""}`} href={href} onClick={(event) => beginNavigation(event, href)} aria-busy={isPending}>{isPending ? (isEnglish ? "Opening…" : "正在打开…") : action}{isPending ? <LoaderCircle className="is-spinning" /> : <ChevronRight />}</Link>}</div></article>;
                  }) : <div className="article-empty"><p>{!selectedPaper ? (isEnglish ? "No paper has been imported yet." : "题库尚未导入任何真题。") : selectedType?.available ? (isEnglish ? "This section is registered from the source PDF and will be connected to its practice view next." : "该题型已按原卷登记，练习内容将在对应页面接入。") : (isEnglish ? "This section is not open yet." : "该题型尚未开放。")}</p></div>}</div>
                </div>
              </div>
            </section>
            <footer className="site-footer">
              <span>© 2026 {isEnglish ? "ChiTouEN II" : "吃透英语二"}</span>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">沪ICP备2026043148号-1</a>
              <a href="https://beian.mps.gov.cn/#/query/webSearch?code=31011202023308" target="_blank" rel="noreferrer">沪公网安备31011202023308号</a>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
}
