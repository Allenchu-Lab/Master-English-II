import { createObjectiveAttemptRoute } from "@/lib/objective-attempt-route";
import { gradeCloze, validClozeAnswers, type ClozeContent, type ClozeKey } from "@/lib/cloze";

const route = createObjectiveAttemptRoute<ClozeContent, ClozeKey>({
  table: "cloze_attempts",
  taskTable: "cloze_tasks",
  keysTable: "private.cloze_keys",
  prefix: "cloze",
  expectedKeys: 20,
  validate: validClozeAnswers,
  grade: gradeCloze,
});

export const GET = route.GET;
export const POST = route.POST;
