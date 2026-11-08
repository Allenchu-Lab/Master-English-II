import { deepseekModel, deepseekThinking } from "./deepseek-config";

type CompletionRequest = {
  temperature: number;
  messages: { role: "system" | "user"; content: string }[];
};

/** Transport only: callers own rubric validation, repair and retry policy.
 * Never automatically retry a paid generation after a network timeout. */
export function callDeepseek(body: CompletionRequest, signal: AbortSignal): Promise<Response> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("AI service is not configured");
  return fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    signal,
    body: JSON.stringify({ ...body, model: deepseekModel, thinking: deepseekThinking, response_format: { type: "json_object" } }),
  });
}
