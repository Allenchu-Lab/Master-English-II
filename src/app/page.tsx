import { LibraryComparison } from "@/components/library-comparison";
import { getExamPapers } from "@/data/get-exam-papers";

export default async function Home() {
  const papers = await getExamPapers();
  return <LibraryComparison papers={papers} />;
}
