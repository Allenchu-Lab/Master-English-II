export type LetterDraft = { salutation: string; body: string; closing: string; signature: string };

export const emptyLetterDraft: LetterDraft = { salutation: "", body: "", closing: "", signature: "" };

// Joins the four letter fields back into one answer string, dropping blanks.
export function composeLetterAnswer(draft: LetterDraft) {
  const signoff = [draft.closing.trim(), draft.signature.trim()].filter(Boolean).join("\n");
  return [draft.salutation.trim(), draft.body.trim(), signoff].filter(Boolean).join("\n\n");
}

// Splits a composed letter answer back into its fields. Recognises an optional
// salutation on the first line and the last closing line; anything between is
// the body, anything after the closing is the signature.
export function parseLetterAnswer(answer: string): LetterDraft {
  const lines = answer.replace(/\r\n/g, "\n").split("\n");
  while (lines[0]?.trim() === "") lines.shift();
  while (lines.at(-1)?.trim() === "") lines.pop();

  const firstLine = lines[0]?.trim() ?? "";
  const hasSalutation = /^(dear\b|hello\b|hi\b|to whom\b)/i.test(firstLine);
  const closingIndex = lines.findLastIndex((line) => /^(yours\b|sincerely\b|best regards\b|kind regards\b|respectfully\b)/i.test(line.trim()));
  const bodyStart = hasSalutation ? 1 : 0;
  const bodyEnd = closingIndex >= bodyStart ? closingIndex : lines.length;

  return {
    salutation: hasSalutation ? firstLine : "",
    body: lines.slice(bodyStart, bodyEnd).join("\n").trim(),
    closing: closingIndex >= bodyStart ? lines[closingIndex].trim() : "",
    signature: closingIndex >= bodyStart ? lines.slice(closingIndex + 1).join("\n").trim() : "",
  };
}
