import { createPublicSupabaseClient } from "@/lib/supabase/server";

export type PracticeQuestion = {
  id: string;
  number: number;
  prompt: string;
  options: { index: number; body: string }[];
};

export type PracticePassage = {
  id: string;
  year: number;
  number: number;
  body: string;
  paragraphs: string[];
  wordCount: number;
  questions: PracticeQuestion[];
};

export async function getPracticePassage(year: number, number: number): Promise<PracticePassage | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("passages")
    .select(`
      id, passage_number, body, paragraphs, word_count,
      exam_sections!inner(type, exam_papers!inner(year, status)),
      questions!inner(id, question_number, prompt, status, question_options(option_index, body))
    `)
    .eq("status", "published")
    .eq("exam_sections.type", "reading_a")
    .eq("exam_sections.exam_papers.year", year)
    .eq("exam_sections.exam_papers.status", "published")
    .eq("passage_number", number)
    .eq("questions.status", "published")
    .maybeSingle();

  if (error) throw new Error(`Failed to load practice passage: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    year,
    number: data.passage_number,
    body: data.body,
    paragraphs: Array.isArray(data.paragraphs) && data.paragraphs.every((paragraph): paragraph is string => typeof paragraph === "string") ? data.paragraphs : [],
    wordCount: data.word_count,
    questions: data.questions
      .sort((a, b) => a.question_number - b.question_number)
      .map((question) => ({
        id: question.id,
        number: question.question_number,
        prompt: question.prompt,
        options: question.question_options
          .sort((a, b) => a.option_index - b.option_index)
          .map((option) => ({ index: option.option_index, body: option.body })),
      })),
  };
}
