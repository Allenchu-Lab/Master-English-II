export type ReviewStage = 0 | 1 | 2 | 3 | 4;
export type ReportReviewProgress = (stage: ReviewStage) => void;

// Opt-in streaming keeps the JSON API compatible with existing clients.
export function reviewStream(request: Request, run: (report: ReportReviewProgress) => Promise<Response>): Promise<Response> | Response {
  if (request.headers.get("accept") !== "application/x-ndjson") return run(() => {});
  const encoder = new TextEncoder();
  let disconnected = false;
  let highest: ReviewStage = 0;
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => { if (!disconnected) controller.enqueue(encoder.encode(JSON.stringify(event) + "\n")); };
      try {
        const response = await run(stage => {
          highest = Math.max(highest, stage) as ReviewStage;
          send({ stage: highest });
        });
        const data: unknown = await response.json();
        if (response.ok) send({ stage: 4 });
        send({ ok: response.ok, data });
      } catch (error) {
        console.error("AI stream failed:", error instanceof Error ? error.name : "unknown");
        send({ ok: false, data: { error: "AI 请求未能完成，请重试。" } });
      } finally { if (!disconnected) controller.close(); }
    },
    cancel() { disconnected = true; },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
}
