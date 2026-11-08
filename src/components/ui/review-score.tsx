import { PracticeBadge } from "@/components/ui/practice-badge";

export function ReviewScore({ score, total, band, english, summary, nextBandGap }: {
  score: number; total: number; band: number; english: boolean; summary: string; nextBandGap?: string;
}) {
  return <section className="review-score-card">
    <div className="review-score-heading"><div><span>{english ? "AI PRACTICE SCORE" : "AI 练习估分"}</span><div className="review-score-value"><strong>{score}</strong><span>/ {total}</span></div></div><PracticeBadge>{english ? `Band ${band}` : `第 ${band} 档`}</PracticeBadge></div>
    <p>{summary}</p>
    {nextBandGap && <dl><dt><PracticeBadge className="review-improvement-label">{english ? "Improvement advice" : "升档建议"}</PracticeBadge></dt><dd>{nextBandGap}</dd></dl>}
  </section>;
}
