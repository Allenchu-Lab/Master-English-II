import { notFound } from "next/navigation";
import { IntensiveReader } from "@/components/intensive-reader";
import { getPracticePassage } from "@/data/get-practice-passage";

export default async function IntensiveReadingPage({ params }: { params: Promise<{ year: string; text: string }> }) {
  const { year: yearParam, text: textParam } = await params;
  const year = Number(yearParam);
  const text = Number(textParam);
  if (!Number.isInteger(year) || !Number.isInteger(text)) notFound();

  const passage = await getPracticePassage(year, text);
  if (!passage) notFound();

  return <IntensiveReader passage={passage} />;
}
