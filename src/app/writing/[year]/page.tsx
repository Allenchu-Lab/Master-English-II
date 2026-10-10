import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WritingPractice } from "@/components/writing-practice";
import { getWritingPaper } from "@/data/get-writing-paper";

type Props = {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ lang?: string | string[]; part?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ year }, { lang }] = await Promise.all([params, searchParams]);
  return { title: lang === "en" ? `ChiTouEN II · ${year} Writing` : `吃透英语二 · ${year} 写作` };
}

export default async function WritingPage({ params, searchParams }: Props) {
  const [{ year: yearParam }, { lang, part }] = await Promise.all([params, searchParams]);
  const year = Number(yearParam);
  if (!Number.isInteger(year)) notFound();
  const tasks = await getWritingPaper(year);
  if (!tasks.length) notFound();
  return <WritingPractice tasks={tasks} initialLanguage={lang === "en" ? "en" : "zh"} initialPart={part === "B" ? "B" : "A"} />;
}
