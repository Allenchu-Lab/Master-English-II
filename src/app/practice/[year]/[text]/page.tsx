import { notFound } from "next/navigation";
import { PassagePendingGate } from "@/components/passage-pending-gate";
import { PracticeReader } from "@/components/practice-reader";
import { getPracticePassage } from "@/data/get-practice-passage";
import { isPassageGradable } from "@/data/passage-gradable";

type Props = {
  params: Promise<{ year: string; text: string }>;
  searchParams: Promise<{ redo?: string | string[]; lang?: string | string[] }>;
};

export default async function PracticePage({ params, searchParams }: Props) {
  const [{ year: yearParam, text: textParam }, { redo, lang }] = await Promise.all([params, searchParams]);
  const year = Number(yearParam);
  const text = Number(textParam);
  if (!Number.isInteger(year) || !Number.isInteger(text)) notFound();

  const passage = await getPracticePassage(year, text);
  if (!passage) notFound();

  // 答案未录入时不进入作答界面，避免用户答完一整篇后在提交环节才失败。
  if (!await isPassageGradable(passage.id)) return <PassagePendingGate year={year} number={text} initialLanguage={lang === "en" ? "en" : "zh"} />;

  return <PracticeReader passage={passage} startFresh={redo === "1"} initialLanguage={lang === "en" ? "en" : "zh"} />;
}
