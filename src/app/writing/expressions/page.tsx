import type { Metadata } from "next";
import { WritingExpressionsLibrary } from "@/components/writing-expressions-library";

type Props = { searchParams: Promise<{ lang?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang } = await searchParams;
  return { title: lang === "en" ? "ChiTouEN II · My Expressions" : "吃透英语二 · 我的表达" };
}

export default async function WritingExpressionsPage({ searchParams }: Props) {
  const { lang } = await searchParams;
  return <WritingExpressionsLibrary initialLanguage={lang === "en" ? "en" : "zh"} />;
}
