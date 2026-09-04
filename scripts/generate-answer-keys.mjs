import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) throw new Error("DEEPSEEK_API_KEY is required");

const startYear = Number(process.env.START_YEAR ?? 2010);
const endYear = Number(process.env.END_YEAR ?? 2024);
const letters = ["A", "B", "C", "D"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateText(year, text, answers) {
  const expectedNumbers = text.questions.map((question) => question.number);
  const payload = {
    year,
    passage: text.passage,
    questions: text.questions.map((question) => ({
      number: question.number,
      prompt: question.prompt,
      options: question.options,
      correctAnswer: answers[String(question.number)],
    })),
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(120_000),
        body: JSON.stringify({
          model: "deepseek-chat",
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "你是严谨的考研英语二阅读解析老师。只依据给出的文章、题目、选项和指定正确答案生成中文内容，不得修改正确答案，不得补造原文之外的事实。返回 JSON 对象，唯一顶层字段为 questions；questions 必须为数组，每题包含 number、promptZh、optionsZh、explanation。promptZh 是准确自然的题干翻译；optionsZh 必须是按 A-D 顺序排列的四条准确翻译；explanation 要结合原文说明正确项依据，并简洁说明主要干扰项为什么不成立。不得使用 Markdown。",
            },
            { role: "user", content: JSON.stringify(payload) },
          ],
        }),
      });
      if (!response.ok) throw new Error(`DeepSeek returned ${response.status}`);
      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed.questions) || parsed.questions.length !== text.questions.length) throw new Error("question count mismatch");
      parsed.questions.sort((left, right) => left.number - right.number);
      if (JSON.stringify(parsed.questions.map((question) => question.number)) !== JSON.stringify(expectedNumbers)) throw new Error("question numbers mismatch");
      for (const question of parsed.questions) {
        if (typeof question.promptZh !== "string" || !question.promptZh.trim()) throw new Error("missing promptZh");
        if (!Array.isArray(question.optionsZh) || question.optionsZh.length !== 4 || question.optionsZh.some((option) => typeof option !== "string" || !option.trim())) throw new Error("invalid optionsZh");
        if (typeof question.explanation !== "string" || !question.explanation.trim()) throw new Error("missing explanation");
      }
      return parsed.questions;
    } catch (error) {
      if (attempt === 3) throw new Error(`${year} Text ${text.number}: ${error.message}`);
      await sleep(attempt * 1500);
    }
  }
}

mkdirSync("content/answer-keys", { recursive: true });
for (let year = startYear; year <= endYear; year++) {
  const paper = JSON.parse(readFileSync(`content/reading-a/${year}.json`, "utf8"));
  const pending = JSON.parse(readFileSync(`content/answer-keys-pending/${year}.json`, "utf8"));
  const texts = await Promise.all(paper.readingA.map(async (text) => {
    const generated = await generateText(year, text, pending.answers);
    const result = {
      number: text.number,
      questions: generated.map((question) => ({
        number: question.number,
        answer: pending.answers[String(question.number)],
        promptZh: question.promptZh.trim(),
        optionsZh: question.optionsZh.map((option) => option.trim()),
        explanation: question.explanation.trim(),
      })),
    };
    console.log(`${year} Text ${text.number} generated`);
    return result;
  }));
  texts.sort((left, right) => left.number - right.number);
  if (texts.flatMap((text) => text.questions).some((question) => !letters.includes(question.answer))) throw new Error(`${year}: invalid answer letter`);
  writeFileSync(`content/answer-keys/${year}.json`, `${JSON.stringify({ year, section: "reading_a", source: "AI-generated explanations; answer letters from user-provided source images", texts }, null, 2)}\n`);
}
