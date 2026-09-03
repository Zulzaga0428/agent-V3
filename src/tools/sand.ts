import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { SandClient, type SandFile } from "../sand/client.js";

/**
 * The agent's hands and eyes, pointed at the same container the user is
 * watching. The model edits where the code runs and reads back what actually
 * happened, instead of writing into a database and hoping.
 *
 * Ported from the v2 agent, whose tool descriptions encode measurements rather
 * than guesses — the batching note below cost a 37-minute run to learn.
 */

const GONE =
  "The preview container has expired. Nothing was changed. Report this and stop — " +
  "a new container has to be started before you can continue.";

/** More than this in one call is a sign of a runaway, not a batch. */
const MAX_WRITE_BATCH = 24;

type Ctx = { client: SandClient; previewId: string };

const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] });
const fail = (s: string) => ({ content: [{ type: "text" as const, text: s }], isError: true });

function readFile(ctx: Ctx) {
  return tool(
    "read_file",
    "Read one file from the running project. Call this before editing any file, " +
      "so you change what is actually there rather than what you assume. " +
      "Absolute paths work too, e.g. /tmp/next-dev.log.",
    { path: z.string().describe("Project-relative path (app/page.tsx) or absolute path") },
    async ({ path }) => {
      const res = await ctx.client.readFiles(ctx.previewId, [path]);
      if (!res.ok) {
        return res.kind === "gone" ? fail(GONE) : fail(`Could not read ${path}: ${res.status} ${res.message}`);
      }
      const file = res.files[0];
      if (!file || file.content === undefined) {
        return fail(`No such file: ${path}${file?.error ? ` (${file.error})` : ""}`);
      }
      return text(file.content);
    },
  );
}

function writeFiles(ctx: Ctx) {
  return tool(
    "write_files",
    "Write or replace whole files, any number at once. Prefer one call with " +
      "every file a change needs — a component and the route that imports it " +
      "belong in the same call. Writing them one at a time costs a round trip, " +
      "a typecheck, and a whole model turn each; on a measured four-route build " +
      "that was most of the run. The sandbox merges: files you do not name are " +
      "left alone.",
    {
      files: z
        .array(z.object({ path: z.string(), content: z.string() }))
        .min(1)
        .max(MAX_WRITE_BATCH)
        .describe("Files to write, each {path, content}"),
    },
    async ({ files }) => {
      const res = await ctx.client.writeFiles(ctx.previewId, files as SandFile[]);
      if (!res.ok) {
        return res.kind === "gone" ? fail(GONE) : fail(`Write failed: ${res.status} ${res.message}`);
      }
      const wrote = `Wrote ${files.length} file${files.length === 1 ? "" : "s"}: ${files.map((f) => f.path).join(", ")}`;
      // The sandbox is the only side that sees both the incoming file and what
      // it replaces. A next.config that drops the host allowance kills hot
      // reload silently — the write succeeds and the preview just stops
      // updating. Surface the warning where the model will read it.
      return text(res.warnings?.length ? `${wrote}\n\nWarnings:\n- ${res.warnings.join("\n- ")}` : wrote);
    },
  );
}

function deleteFiles(ctx: Ctx) {
  return tool(
    "delete_files",
    "Remove files or directories from the project. Idempotent — a path that is " +
      "already gone is not an error.",
    { paths: z.array(z.string()).min(1).describe("Paths to remove") },
    async ({ paths }) => {
      const res = await ctx.client.deleteFiles(ctx.previewId, paths);
      if (!res.ok) {
        return res.kind === "gone" ? fail(GONE) : fail(`Delete failed: ${res.status} ${res.message}`);
      }
      const lines = res.results.map((r) => `${r.path}: ${r.deleted ? "deleted" : (r.error ?? "not found")}`);
      return text(lines.join("\n"));
    },
  );
}

function runCommand(ctx: Ctx) {
  return tool(
    "run_command",
    "Run a shell command inside the project container and read back its output. " +
      "Use it to verify — a build, a typecheck, a test run. A command that exits " +
      "non-zero is a result you read, not a failure of the tool.",
    {
      command: z.string().describe("Shell command, e.g. npx tsc --noEmit"),
      timeoutSec: z.number().int().positive().optional().describe("Seconds; the sandbox default applies when omitted"),
    },
    async ({ command, timeoutSec }) => {
      const res = await ctx.client.exec(ctx.previewId, command, timeoutSec);
      if (!res.ok) {
        return res.kind === "gone" ? fail(GONE) : fail(`Could not run command: ${res.status} ${res.message}`);
      }
      const parts = [`exit ${res.exitCode}${res.timedOut ? " (timed out)" : ""}`];
      if (res.stdout.trim()) parts.push(`stdout:\n${res.stdout}`);
      if (res.stderr.trim()) parts.push(`stderr:\n${res.stderr}`);
      return text(parts.join("\n\n"));
    },
  );
}

function readLogs(ctx: Ctx) {
  return tool(
    "read_logs",
    "Read the dev server's recent output. This is where a page that renders " +
      "blank explains itself — read it before guessing at the cause.",
    { tail: z.number().int().positive().optional().describe("Lines from the end, default 200") },
    async ({ tail }) => {
      const res = await ctx.client.logs(ctx.previewId, tail ?? 200);
      if (!res.ok) {
        return res.kind === "gone" ? fail(GONE) : fail(`Could not read logs: ${res.status} ${res.message}`);
      }
      const parts: string[] = [];
      if (res.stdout.trim()) parts.push(`stdout:\n${res.stdout}`);
      if (res.stderr.trim()) parts.push(`stderr:\n${res.stderr}`);
      return text(parts.length ? parts.join("\n\n") : "(no output yet)");
    },
  );
}

export const SAND_SERVER_NAME = "sand";

/** Fully-qualified names, for `allowedTools`. */
export const SAND_TOOL_NAMES = [
  "read_file",
  "write_files",
  "delete_files",
  "run_command",
  "read_logs",
].map((n) => `mcp__${SAND_SERVER_NAME}__${n}`);

export function sandServer(ctx: Ctx) {
  return createSdkMcpServer({
    name: SAND_SERVER_NAME,
    version: "0.1.0",
    tools: [readFile(ctx), writeFiles(ctx), deleteFiles(ctx), runCommand(ctx), readLogs(ctx)],
    alwaysLoad: true,
  });
}
