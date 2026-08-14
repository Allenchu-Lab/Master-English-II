import { examPapers } from "@/data/exam-papers";
import type { ExamPaperMap } from "@/data/exam-types";
import { createPublicSupabaseClient } from "@/lib/supabase/server";

type DatabaseOption = { option_index: number; body: string };

export async function getExamPapers(): Promise<ExamPaperMap> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return examPapers as unknown as ExamPaperMap;

  const { data, error } = await supabase
    .from("exam_papers")
    .select(`
      year, title, source_file,
      exam_sections!inner(
        type, item_count,
        passages(
          id, passage_number, body, word_count, source_page_start, source_page_end,
          questions(question_number, prompt, question_options(option_index, body))
        )
      )
    `)
    .eq("status", "published")
    .eq("exam_sections.status", "published")
    .order("year", { ascending: true });

  if (error) throw new Error(`Failed to load exam papers: ${error.message}`);

  return Object.fromEntries(data.map((paper) => {
    const reading = paper.exam_sections.find((section) => section.type === "reading_a");
    return [String(paper.year), {
      year: paper.year,
      title: paper.title,
      sourceFile: paper.source_file,
      sections: { cloze: 1, readingA: reading?.item_count ?? 0, readingB: 1, translation: 1, writing: 2 },
      readingA: (reading?.passages ?? []).sort((a, b) => a.passage_number - b.passage_number).map((passage) => ({
        id: passage.id,
        number: passage.passage_number,
        passage: passage.body,
        wordCount: passage.word_count,
        sourcePages: [passage.source_page_start, passage.source_page_end],
        questions: passage.questions.sort((a, b) => a.question_number - b.question_number).map((question) => ({
          number: question.question_number,
          prompt: question.prompt,
          options: (question.question_options as DatabaseOption[]).sort((a, b) => a.option_index - b.option_index).map((option) => option.body),
        })),
      })),
    }];
  }));
}
