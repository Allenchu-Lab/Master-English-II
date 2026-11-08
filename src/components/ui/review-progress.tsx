"use client";

import { ProgressBar } from "@heroui/react/progress-bar";
import type { ReviewStage } from "@/lib/review-stream";

export function ReviewProgress({ english, kind, stage }: { english: boolean; kind: "writing" | "translation" | "intensive"; stage: ReviewStage }) {
  const intensive = kind === "intensive";
  const title = intensive ? (english ? "Analyzing this paragraph" : "正在解析本段") : english
    ? (kind === "writing" ? "Reviewing your response" : "Reviewing your translation")
    : (kind === "writing" ? "正在批阅你的作文" : "正在批阅你的译文");
  const stages = english
    ? (intensive ? ["Reading the paragraph", "AI is analyzing the paragraph", "Validating the analysis", "Preparing the analysis", "Analysis complete"] : ["Reading your response", "AI is analyzing your response", "Validating the review", "Saving your review", "Review complete"])
    : (intensive ? ["读取段落", "AI 正在分析段落", "校验解析内容", "整理解析结果", "解析完成"] : ["读取作答", "AI 正在分析作答", "校验批阅结果", "保存批阅结果", "批阅完成"]);
  return <div className="review-progress" aria-busy={stage < 4}>
    <strong>{title}</strong>
    <ProgressBar className="practice-progress-component" aria-label={title} value={stage} maxValue={4} aria-valuetext={stages[stage]}>
      <ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track>
    </ProgressBar>
    <p role="status">{stages[stage]}</p>
    <p>{english ? "Your results will appear here when ready." : "分析完成后将在这里展示结果。"}</p>
  </div>;
}
