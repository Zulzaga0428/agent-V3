/**
 * The walking skeleton: seed a container, hand it to the agent, watch what
 * comes back.
 *
 *   npm run try -- "build a coffee shop site"
 *   npm run try -- --theme=midnight-tech "build a barbershop site"
 *   npm run try -- --empty "build a coffee shop site"
 *
 * `--empty` keeps the unseeded path so the starter's worth stays measurable
 * rather than assumed.
 */
import { SandClient } from "../src/sand/client.js";
import { runAgent } from "../src/agent.js";
import { compose, environmentNote, select } from "../src/templates/index.js";

const args = process.argv.slice(2);
const empty = args.includes("--empty");
const themeArg = args.find((a) => a.startsWith("--theme="))?.split("=")[1];
const structureArg = args.find((a) => a.startsWith("--structure="))?.split("=")[1];
const instruction =
  args.filter((a) => !a.startsWith("--")).join(" ") ||
  "Build a small coffee shop landing page with a hero, an about section and opening hours.";

const client = new SandClient();

const selection = select(structureArg ? `${structureArg} ${instruction}` : instruction, themeArg);
const seed = empty ? [] : compose(selection);

console.log(
  empty
    ? "Creating preview… (empty)"
    : `Creating preview… ${selection.structure.slug} + ${selection.theme.slug} (${seed.length} files)`,
);

const created = await client.createPreview(seed, "app", 20);

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
  ...(empty ? {} : { environment: environmentNote(selection) }),
  onEvent: (e) => {
    if (e.type === "tool") console.log(`  → ${e.name}`);
    else if (e.type === "text") console.log(`\n${e.text}\n`);
  },
});

const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log("─".repeat(60));
console.log(
  `${result.ok ? "done" : "FAILED"} · ${result.turns} turns · ${secs}s${result.costUsd ? ` · $${result.costUsd.toFixed(4)}` : ""}`,
);
console.log(`preview: ${created.url}`);
