import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { runAgent, type AgentEvent } from "./agent.js";

/**
 * HTTP surface. v2 exposes a session API (`POST /sessions`, then
 * `/sessions/:id/messages` as SSE); this reaches parity with that shape in
 * steps. What is here now is the single-shot form — enough to prove the chain
 * from request to container end to end, and enough for Railway to stay up.
 *
 * `/__contract` reports what is actually implemented, so the caller can check
 * rather than assume.
 */

const startedAt = Date.now();
const PORT = Number(process.env.PORT ?? 8080);

const IMPLEMENTED = ["GET /__health", "GET /__contract", "POST /run"] as const;
const PLANNED = [
  "POST /sessions",
  "GET /sessions/:id",
  "DELETE /sessions/:id",
  "POST /sessions/:id/messages",
  "POST /sessions/:id/interrupt",
  "POST /sessions/:id/undo",
] as const;

function send(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(text),
  });
  res.end(text);
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

/**
 * One task, streamed. A long build sends nothing for minutes otherwise, and a
 * silent channel is the thing proxies kill first — hence the keepalive ping.
 */
async function run(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let body: Record<string, unknown>;
  try {
    body = await readJson(req);
  } catch {
    return send(res, 400, { error: "body is not valid JSON" });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const previewId = typeof body.previewId === "string" ? body.previewId.trim() : "";
  if (!prompt) return send(res, 400, { error: "prompt is required" });
  if (!previewId) return send(res, 400, { error: "previewId is required" });

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const ping = setInterval(() => res.write(": ping\n\n"), 15_000);
  const write = (event: AgentEvent) => res.write(`data: ${JSON.stringify(event)}\n\n`);

  try {
    await runAgent({
      prompt,
      previewId,
      ...(typeof body.model === "string" ? { model: body.model } : {}),
      ...(typeof body.maxTurns === "number" ? { maxTurns: body.maxTurns } : {}),
      onEvent: write,
    });
  } catch (err) {
    write({ type: "result", ok: false, turns: 0, text: err instanceof Error ? err.message : String(err) });
  } finally {
    clearInterval(ping);
    res.end();
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = req.method ?? "GET";

  if (path === "/__health" && method === "GET") {
    return send(res, 200, {
      ok: true,
      uptimeSec: Math.round((Date.now() - startedAt) / 1000),
      sand: Boolean(process.env.SAND_URL && process.env.SAND_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    });
  }

  if (path === "/__contract" && method === "GET") {
    return send(res, 200, {
      name: "agent-V3",
      runtime: "claude-agent-sdk",
      model: process.env.AGENT_MODEL ?? "claude-opus-5",
      implemented: IMPLEMENTED,
      planned: PLANNED,
    });
  }

  if (path === "/run" && method === "POST") {
    void run(req, res);
    return;
  }

  send(res, 404, { error: `no route for ${method} ${path}` });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`agent-V3 listening on :${PORT}`);
  // Say plainly what is missing rather than failing on the first request.
  if (!process.env.SAND_URL || !process.env.SAND_KEY) console.warn("  SAND_URL / SAND_KEY not set — /run will fail");
  if (!process.env.ANTHROPIC_API_KEY) console.warn("  ANTHROPIC_API_KEY not set — /run will fail");
});
