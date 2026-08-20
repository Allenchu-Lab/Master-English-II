import { LibraryComparison } from "@/components/library-comparison";
import { getExamPapers } from "@/data/get-exam-papers";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const { lang } = await searchParams;
  const papers = await getExamPapers();
  return <LibraryComparison papers={papers} initialLanguage={lang === "en" ? "en" : "zh"} />;
}
