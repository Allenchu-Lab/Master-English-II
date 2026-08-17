import { notFound } from "next/navigation";
import { PassagePendingGate } from "@/components/passage-pending-gate";
import { PracticeReader } from "@/components/practice-reader";
import { getPracticePassage } from "@/data/get-practice-passage";
import { isPassageGradable } from "@/data/passage-gradable";

export default async function PracticePage({ params }: { params: Promise<{ year: string; text: string }> }) {
  const { year: yearParam, text: textParam } = await params;
  const year = Number(yearParam);
  const text = Number(textParam);
  if (!Number.isInteger(year) || !Number.isInteger(text)) notFound();

  const passage = await getPracticePassage(year, text);
  if (!passage) notFound();

  // 答案未录入时不进入作答界面，避免用户答完一整篇后在提交环节才失败。
  if (!await isPassageGradable(passage.id)) return <PassagePendingGate year={year} number={text} />;

  return <PracticeReader passage={passage} />;
}
