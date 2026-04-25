import { NextRequest } from "next/server";
import { simulateLife } from "@/lib/simulation/engine";
import { ScenarioType } from "@/lib/simulation/types";

export const maxDuration = 300; // 5 minutes for long simulation

export async function POST(request: NextRequest) {
  const body = await request.json();
  const scenario = (body.scenario ?? "baseline") as ScenarioType;

  if (!["baseline", "positive", "warning"].includes(scenario)) {
    return new Response(JSON.stringify({ error: "Invalid scenario" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const yearResult of simulateLife(scenario)) {
          const chunk =
            JSON.stringify({ type: "year", data: yearResult }) + "\n";
          controller.enqueue(encoder.encode(chunk));
        }
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "done" }) + "\n")
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "error", data: { error: message } }) + "\n"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
