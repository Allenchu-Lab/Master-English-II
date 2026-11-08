// One server-side model setting for all interactive AI features.
export const deepseekModel = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-flash";
export const deepseekThinking = { type: "disabled" } as const;
