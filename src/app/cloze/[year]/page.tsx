import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import type { ClozeContent } from '@/lib/cloze';
import { ClozePractice } from '@/components/cloze-practice';

export default async function Page({ params, searchParams }: {
  params: Promise<{ year: string }>; searchParams: Promise<{ lang?: string }>;
}) {
  const [{ year }, { lang }] = await Promise.all([params, searchParams]);
  if (!/^20\d{2}$/.test(year)) notFound();
  const result = await query<{ id: string; content: ClozeContent }>(`
    select t.id, t.content from cloze_tasks t
    join exam_sections s on s.id=t.section_id
    join exam_papers p on p.id=s.paper_id
    join private.cloze_keys k on k.task_id=t.id
    where p.year=$1 and p.status='published' and s.status='published' and t.status='published'
  `, [Number(year)]);
  const task = result.rows[0];
  if (!task) notFound();
  return <ClozePractice task={task} isEnglish={lang === 'en'} />;
}
