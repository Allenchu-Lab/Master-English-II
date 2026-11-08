import { createObjectiveAttemptRoute } from "@/lib/objective-attempt-route";
import { gradeReadingB, validReadingBAnswers, type ReadingBContent, type ReadingBKey } from "@/lib/reading-b";

const route = createObjectiveAttemptRoute<ReadingBContent, ReadingBKey>({
  table: "reading_b_attempts",
  taskTable: "reading_b_tasks",
  keysTable: "private.reading_b_keys",
  prefix: "reading-b",
  expectedKeys: 5,
  validate: validReadingBAnswers,
  grade: gradeReadingB,
});

export const GET = route.GET;
export const POST = route.POST;
