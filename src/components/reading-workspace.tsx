"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, BookOpen, Ellipsis, RotateCcw } from "lucide-react";
import { paragraphNotes, paragraphs, questions } from "@/data/lesson";

type Mode = "study" | "test" | "review";
type Stage = "intro" | "learn" | "quiz" | "result";

const modeCopy: Record<Mode, { label: string; kicker: string; description: string }> = {
  study: { label: "逐段吃透", kicker: "推荐", description: "先理解词、句与段落，再用题目验证。" },
  test: { label: "限时挑战", kicker: "15 分钟", description: "先独立作答，提交后进入精读解析。" },
  review: { label: "快速复习", kicker: "薄弱项", description: "跳过已掌握内容，只看重点和错因。" },
};

export function ReadingWorkspace() {
  const [mode, setMode] = useState<Mode>("study");
  const [stage, setStage] = useState<Stage>("intro");
  const [activeParagraph, setActiveParagraph] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [summaries, setSummaries] = useState<Record<number, string>>({});

  useEffect(() => {
    const restoreDraft = window.setTimeout(() => {
      const saved = window.localStorage.getItem("chitou-reading-progress");
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers ?? {});
        setSummaries(parsed.summaries ?? {});
      } catch { /* Ignore invalid local drafts. */ }
    }, 0);

    return () => window.clearTimeout(restoreDraft);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("chitou-reading-progress", JSON.stringify({ answers, summaries }));
  }, [answers, summaries]);

  const score = useMemo(() => questions.filter((q) => answers[q.id] === q.answer).length, [answers]);
  const progress = stage === "intro" ? 8 : stage === "learn" ? 18 + activeParagraph * 10 : stage === "quiz" ? 76 : 100;

  function start() {
    if (mode === "test") setStage("quiz");
    else if (mode === "review") { setStage("learn"); setActiveParagraph(3); }
    else setStage("learn");
  }

  function submitQuiz() {
    setSubmitted(true);
    setStage("result");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="主导航">
        <div className="brand"><span className="brand-mark">吃</span><span>吃透阅读</span></div>
        <nav>
          <button className="nav-item active"><BookOpen />真题精读</button>
          <button className="nav-item"><RotateCcw />今日复习<span className="nav-count">3</span></button>
          <button className="nav-item"><BarChart3 />学习记录</button>
        </nav>
        <div className="year-block">
          <p className="eyebrow">真题年份</p>
          <button className="year active"><span>2023</span><small>1 / 4 篇</small></button>
          <button className="year"><span>2022</span><small>即将开放</small></button>
        </div>
        <div className="sidebar-foot"><span className="avatar">研</span><div><strong>备考同学</strong><small>本地学习档案</small></div></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><span>2023 英语二</span><i>/</i><strong>Text 1</strong></div>
          <div className="top-actions"><span className="saved">自动保存</span><button className="icon-button" aria-label="更多选项"><Ellipsis /></button></div>
        </header>
        <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>

        {stage === "intro" && (
          <div className="intro-page">
            <div className="intro-meta"><span>2023 · 阅读 A 节</span><span>约 396 词</span><span>5 道题</span></div>
            <h1>人造草坪，究竟<br />是不是一种环保选择？</h1>
            <p className="intro-lead">这篇文章通过 RHS、行业支持者与政府三方立场，讨论人造草坪带来的环境争议。</p>
            <div className="mode-label"><span>选择这次的学习方式</span><em>随时可以切换</em></div>
            <div className="mode-grid">
              {(Object.keys(modeCopy) as Mode[]).map((key) => (
                <button key={key} className={`mode-card ${mode === key ? "selected" : ""}`} onClick={() => setMode(key)}>
                  <span className="mode-kicker">{modeCopy[key].kicker}</span>
                  <strong>{modeCopy[key].label}</strong>
                  <p>{modeCopy[key].description}</p>
                  <span className="radio" aria-hidden="true" />
                </button>
              ))}
            </div>
            <button className="primary-button" onClick={start}>开始{modeCopy[mode].label}<ArrowRight /></button>
            <p className="intro-note">不论选择哪种模式，最后都会通过主动输出验证掌握程度。</p>
          </div>
        )}

        {stage === "learn" && (
          <div className="study-layout">
            <article className="reading-paper">
              <header><span>TEXT 1</span><h1>Plastic grass and the price of a perfect lawn</h1><p>点击段落，查看考点词、长难句与段落任务。</p></header>
              {paragraphs.map((text, index) => (
                <button key={index} className={`paragraph ${activeParagraph === index ? "active" : ""}`} onClick={() => setActiveParagraph(index)}>
                  <span className="paragraph-no">{String(index + 1).padStart(2, "0")}</span><span>{text}</span>
                </button>
              ))}
            </article>
            <aside className="insight-panel">
              <div className="panel-tabs"><button className="active">精读</button><button onClick={() => setStage("quiz")}>题目</button></div>
              <p className="panel-step">段落 {activeParagraph + 1} / 6</p>
              <h2>{paragraphNotes[activeParagraph].title}</h2>
              <div className="note-section"><h3>考点词</h3><div className="word-list">{paragraphNotes[activeParagraph].words.map((word) => <button key={word}>{word}<span>＋</span></button>)}</div></div>
              <div className="note-section"><h3>长难句</h3><p className="sentence">{paragraphNotes[activeParagraph].sentence}</p><p className="sentence-tip">先找主句，再识别 which / because / that 引导的从句关系。</p></div>
              <label className="summary-box"><span>用一句话概括本段</span><textarea value={summaries[activeParagraph] ?? ""} onChange={(e) => setSummaries({ ...summaries, [activeParagraph]: e.target.value })} placeholder="不要照抄原文，用自己的话写……" /></label>
              <div className="panel-actions"><button disabled={activeParagraph === 0} onClick={() => setActiveParagraph((p) => p - 1)}>上一段</button>{activeParagraph < 5 ? <button className="dark" onClick={() => setActiveParagraph((p) => p + 1)}>下一段</button> : <button className="dark" onClick={() => setStage("quiz")}>去做题</button>}</div>
            </aside>
          </div>
        )}

        {stage === "quiz" && (
          <div className="quiz-page">
            <header><span className="eyebrow">理解验证</span><h1>用题目证明你真的读懂了</h1><p>先选择答案，全部完成后统一查看原文依据。</p></header>
            <div className="quiz-grid">
              {questions.map((q) => <fieldset key={q.id}><legend><span>{q.id}</span>{q.text}</legend>{q.options.map((option, index) => <label key={option} className={answers[q.id] === index ? "chosen" : ""}><input type="radio" name={`q-${q.id}`} checked={answers[q.id] === index} onChange={() => setAnswers({ ...answers, [q.id]: index })} /><b>{String.fromCharCode(65 + index)}</b><span>{option}</span></label>)}</fieldset>)}
            </div>
            <div className="quiz-footer"><span>已完成 {Object.keys(answers).length} / 5</span><button className="primary-button" disabled={Object.keys(answers).length < 5} onClick={submitQuiz}>提交并查看解析<ArrowRight /></button></div>
          </div>
        )}

        {stage === "result" && (
          <div className="result-page">
            <header><span className="eyebrow">本次学习完成</span><h1>{score === 5 ? "这篇文章，你已经读得很扎实。" : "找到薄弱点，才算真正开始吃透。"}</h1><p>答对 {score} / 5 · 段落输出 {Object.values(summaries).filter(Boolean).length} / 6</p></header>
            <div className="score-strip"><div><strong>{score * 20}%</strong><span>题目正确率</span></div><div><strong>{Object.values(summaries).filter(Boolean).length}</strong><span>完成段落输出</span></div><div><strong>{5 - score}</strong><span>待复习考点</span></div></div>
            <div className="answer-review">{questions.map((q) => { const correct = answers[q.id] === q.answer; return <details key={q.id} open={!correct}><summary><span className={correct ? "correct" : "wrong"}>{correct ? "✓" : "×"}</span><strong>{q.id}. {String.fromCharCode(65 + q.answer)}</strong><span>{correct ? "回答正确" : `你的答案：${String.fromCharCode(65 + (answers[q.id] ?? 0))}`}</span><b>查看依据</b></summary><div><p><em>原文依据</em>{q.evidence}</p><p><em>命题逻辑</em>{q.note}</p></div></details>})}</div>
            <div className="result-actions"><button onClick={() => { setStage("learn"); setActiveParagraph(0); }}>回到逐段精读</button><button className="primary-button" onClick={() => { setStage("quiz"); setSubmitted(false); }}>重新验证<RotateCcw /></button></div>
            {submitted && <p className="review-reminder">建议 3 天后闭卷复测，届时再判断是否真正“已吃透”。</p>}
          </div>
        )}
      </section>
    </main>
  );
}
