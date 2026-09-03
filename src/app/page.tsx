import type { Metadata } from "next";
import { LibraryComparison } from "@/components/library-comparison";
import { getExamPapers } from "@/data/get-exam-papers";
import { localContentPreviewEnabled } from "@/lib/content-preview";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }): Promise<Metadata> {
  const { lang } = await searchParams;
  return { title: lang === "en" ? "ChiTouEN II" : "吃透英语二" };
}

export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const { lang } = await searchParams;
  const papers = await getExamPapers();
  return <LibraryComparison papers={papers} allowPreview={localContentPreviewEnabled()} initialLanguage={lang === "en" ? "en" : "zh"} />;
}
