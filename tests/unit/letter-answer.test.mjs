import test from "node:test";
import assert from "node:assert/strict";
import { composeLetterAnswer, parseLetterAnswer, emptyLetterDraft } from "../../src/lib/letter-answer.ts";

test("empty answer yields an empty draft", () => {
  assert.deepEqual(parseLetterAnswer(""), emptyLetterDraft);
});

test("parses a full letter into all four fields", () => {
  const draft = { salutation: "Dear Sir,", body: "I am writing to apply.", closing: "Yours sincerely,", signature: "Li Ming" };
  assert.deepEqual(parseLetterAnswer(composeLetterAnswer(draft)), draft);
});

test("round-trips a multi-paragraph body", () => {
  const draft = { salutation: "Dear Professor,", body: "First paragraph.\n\nSecond paragraph.", closing: "Best regards,", signature: "Zhang Wei" };
  assert.deepEqual(parseLetterAnswer(composeLetterAnswer(draft)), draft);
});

test("body-only answer has no salutation, closing or signature", () => {
  assert.deepEqual(parseLetterAnswer("Just the body text."), { salutation: "", body: "Just the body text.", closing: "", signature: "" });
});

test("recognises a salutation without a closing", () => {
  const parsed = parseLetterAnswer("Hello there,\nSome body content.");
  assert.equal(parsed.salutation, "Hello there,");
  assert.equal(parsed.body, "Some body content.");
  assert.equal(parsed.closing, "");
  assert.equal(parsed.signature, "");
});

test("recognises the 'To whom it may concern' salutation", () => {
  const parsed = parseLetterAnswer("To whom it may concern,\nBody line.");
  assert.equal(parsed.salutation, "To whom it may concern,");
  assert.equal(parsed.body, "Body line.");
});

test("uses the last closing line when several match", () => {
  const answer = "Dear Ann,\nYours sincerely is a phrase in the body.\nReal body.\nYours faithfully,\nAnn";
  const parsed = parseLetterAnswer(answer);
  assert.equal(parsed.closing, "Yours faithfully,");
  assert.equal(parsed.signature, "Ann");
  assert.equal(parsed.body, "Yours sincerely is a phrase in the body.\nReal body.");
});

test("trims surrounding blank lines and CRLF line endings", () => {
  const parsed = parseLetterAnswer("\r\n\r\nDear Bob,\r\nBody.\r\nYours,\r\nBob\r\n\r\n");
  assert.deepEqual(parsed, { salutation: "Dear Bob,", body: "Body.", closing: "Yours,", signature: "Bob" });
});

test("compose drops blank fields and joins the signoff with a single newline", () => {
  assert.equal(composeLetterAnswer({ salutation: "", body: "Body only.", closing: "", signature: "" }), "Body only.");
  assert.equal(composeLetterAnswer({ salutation: "Hi,", body: "B.", closing: "Thanks,", signature: "" }), "Hi,\n\nB.\n\nThanks,");
});

test("salutation matching is case-insensitive", () => {
  const parsed = parseLetterAnswer("DEAR SIR,\nBody.");
  assert.equal(parsed.salutation, "DEAR SIR,");
});
