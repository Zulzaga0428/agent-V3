/**
 * The walking skeleton: create a container, hand it to the agent, watch what
 * comes back. Run with `npm run try -- "your instruction"`.
 */
import { SandClient } from "../src/sand/client.js";
import { runAgent } from "../src/agent.js";

const instruction =
  process.argv.slice(2).join(" ") ||
  "Change the home page heading to 'It works' and make sure the page still builds.";

const client = new SandClient();

console.log("Creating preview…");
const created = await client.createPreview([], "app", 20);

if (!created.ok) {
  console.error(
    created.kind === "capacity"
      ? `SAND is full — retry in ${created.retryAfterSec}s`
      : `Could not create preview: ${created.status} ${created.message}`,
  );
  process.exit(1);
}

console.log(`  id=${created.id}`);
console.log(`  url=${created.url}  (warm=${created.warm})`);
console.log(`\nAsking: ${instruction}\n`);

const started = Date.now();

const result = await runAgent({
  prompt: instruction,
  previewId: created.id,
  client,
  onEvent: (e) => {
    if (e.type === "tool") console.log(`  → ${e.name}`);
    else if (e.type === "text") console.log(`\n${e.text}\n`);
  },
});

const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log("─".repeat(60));
console.log(`${result.ok ? "done" : "FAILED"} · ${result.turns} turns · ${secs}s${result.costUsd ? ` · $${result.costUsd.toFixed(4)}` : ""}`);
console.log(`preview: ${created.url}`);
