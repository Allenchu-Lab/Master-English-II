import type { Metadata } from "next";
import { LibraryComparison } from "@/components/library-comparison";
import type { ExamSectionType } from "@/data/exam-types";
import { getExamPapers } from "@/data/get-exam-papers";
import { localContentPreviewEnabled } from "@/lib/content-preview";

export const dynamic = "force-dynamic";

type SearchParams = { lang?: string | string[]; type?: string | string[]; year?: string | string[] };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const { lang } = await searchParams;
  return { title: lang === "en" ? "ChiTouEN II" : "吃透英语二" };
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { lang, type, year } = await searchParams;
  const papers = await getExamPapers();
  const initialType: ExamSectionType = typeof type === "string" && ["writing", "translation", "cloze", "reading_b"].includes(type) ? type as ExamSectionType : "reading_a";
  return <LibraryComparison papers={papers} allowPreview={localContentPreviewEnabled()} initialLanguage={lang === "en" ? "en" : "zh"} initialType={initialType} initialYear={typeof year === "string" ? Number(year) : undefined} />;
}
