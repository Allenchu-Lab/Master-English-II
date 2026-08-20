import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IntensiveReader } from "@/components/intensive-reader";
import { getPracticePassage } from "@/data/get-practice-passage";

type Props = { params: Promise<{ year: string; text: string }>; searchParams: Promise<{ lang?: string | string[] }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ year, text }, { lang }] = await Promise.all([params, searchParams]);
  return { title: lang === "en" ? `ChiTouEN II · ${year} Text ${text} · Intensive Reading` : `吃透英语二 · ${year} Text ${text} · 精读` };
}

export default async function IntensiveReadingPage({ params, searchParams }: Props) {
  const [{ year: yearParam, text: textParam }, { lang }] = await Promise.all([params, searchParams]);
  const year = Number(yearParam);
  const text = Number(textParam);
  if (!Number.isInteger(year) || !Number.isInteger(text)) notFound();

  const passage = await getPracticePassage(year, text);
  if (!passage) notFound();

  return <IntensiveReader passage={passage} initialLanguage={lang === "en" ? "en" : "zh"} />;
}
