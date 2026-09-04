import { query } from "@anthropic-ai/claude-agent-sdk";
import { SandClient } from "./sand/client.js";
import { SYSTEM_PROMPT, withEnvironment } from "./prompt.js";
import { SAND_SERVER_NAME, SAND_TOOL_NAMES, sandServer } from "./tools/sand.js";

/**
 * The loop, such as it is. Everything that used to live in v2's loop.ts —
 * token budgets, history trimming, context pressure — is the SDK's problem
 * now. What is left here is the part that was never broken: which tools the
 * model gets, and what it is being asked to do.
 *
 * The built-in Read/Write/Bash tools are disabled deliberately. They would act
 * on this server's disk; the project lives in the user's container, and the
 * only way in is SAND.
 */

export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: string; input: unknown }
  | { type: "result"; ok: boolean; turns: number; costUsd?: number; text?: string };

export type RunOptions = {
  prompt: string;
  previewId: string;
  client?: SandClient;
  model?: string;
  maxTurns?: number;
  /** What the caller seeded this container with — it is the only party that knows. */
  environment?: string;
  onEvent?: (e: AgentEvent) => void;
};

/**
 * The container's TTL counts from the last time anyone touched it, and a build
 * can think for minutes between writes. v2 shipped a keepalive it never called
 * and preview containers died mid-run at fifteen minutes; the tools were then
 * answering GONE for a container the run had done nothing wrong to.
 *
 * Five minutes against SAND's TTL leaves room for one ping to fail.
 */
const KEEPALIVE_MS = 5 * 60_000;

export async function runAgent(opts: RunOptions): Promise<AgentEvent & { type: "result" }> {
  const client = opts.client ?? new SandClient();
  const emit = opts.onEvent ?? (() => {});
  const server = sandServer({ client, previewId: opts.previewId });

  let turns = 0;
  let lastText = "";

  const keepAlive = setInterval(() => {
    void client.keepAlive(opts.previewId).catch(() => {});
  }, KEEPALIVE_MS);

  try {
    return await drive();
  } finally {
    clearInterval(keepAlive);
  }

  async function drive(): Promise<AgentEvent & { type: "result" }> {
  for await (const msg of query({
    prompt: opts.prompt,
    options: {
      systemPrompt: withEnvironment(SYSTEM_PROMPT, opts.environment),
      // No local filesystem or shell. SAND is the only way to touch the project.
      tools: [],
      mcpServers: { [SAND_SERVER_NAME]: server },
      allowedTools: SAND_TOOL_NAMES,
      permissionMode: "bypassPermissions",
      model: opts.model ?? process.env.AGENT_MODEL ?? "claude-opus-5",
      ...(opts.maxTurns !== undefined ? { maxTurns: opts.maxTurns } : {}),
    },
  })) {
    if (msg.type === "assistant") {
      turns++;
      for (const block of msg.message.content) {
        if (block.type === "text" && block.text.trim()) {
          lastText = block.text;
          emit({ type: "text", text: block.text });
        } else if (block.type === "tool_use") {
          emit({ type: "tool", name: block.name, input: block.input });
        }
      }
    } else if (msg.type === "result") {
      const result = {
        type: "result" as const,
        ok: msg.subtype === "success",
        turns,
        ...(typeof msg.total_cost_usd === "number" ? { costUsd: msg.total_cost_usd } : {}),
        ...(lastText ? { text: lastText } : {}),
      };
      emit(result);
      return result;
    }
  }

  const result = { type: "result" as const, ok: false, turns, ...(lastText ? { text: lastText } : {}) };
  emit(result);
  return result;
  }
}
