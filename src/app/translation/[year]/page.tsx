import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { TranslationPractice } from '@/components/translation-practice';

export default async function Page({ params, searchParams }: { params: Promise<{year: string}>; searchParams: Promise<{lang?: string}> }) {
  const [{year}, {lang}] = await Promise.all([params, searchParams]);
  if (!/^20\d{2}$/.test(year)) notFound();
  const result = await query<{id: string; passage: string}>(`select t.id,t.passage from translation_tasks t join exam_sections s on s.id=t.section_id join exam_papers p on p.id=s.paper_id where p.year=$1 and t.status='published' and s.status='published' and p.status='published'`, [Number(year)]);
  if (!result.rows[0]) notFound();
  return <TranslationPractice task={result.rows[0]} year={Number(year)} isEnglish={lang==='en'} />;
}
