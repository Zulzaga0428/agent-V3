# Brief: replace v2's hand-rolled loop with the Claude Agent SDK

For whoever works in `Kodu-Agent`. Written by the session that built
`agent-V3` (`github.com/Zulzaga0428/agent-V3`) on 2026-09-03/04, from
measurements rather than opinion. Everything here was verified by running it;
where something is unverified it says so.

## The goal, in one line

Delete `src/agent/loop.ts`, `history.ts` and `focus.ts`. Put the SDK's `query()`
in their place. Change nothing else.

## Why this specific surgery

Every expensive bug in v2 lives in that layer and nowhere else:

- `estimateInputTokens` in `claude.ts` returns `Buffer.byteLength(...)` as a
  token count. Bytes are not tokens — roughly 4× off on English and code, worse
  on Mongolian Cyrillic at 2 bytes per character. The inflated count reaches
  `planBudget`, which returns `maxOutputTokens: 0`, and `loop.ts` calls
  `finish("max_cost")` **before the model is invoked**. That is the
  second-turn-returns-nothing bug: 62% of projects had exactly one request.
- `THINKING_HEADROOM = 32_000` is subtracted from every budget. Measured actual
  output was ~650 tokens per turn — the reserve overshoots by about 50×.
- There was no partial-edit tool, so every change rewrote a whole file.
  Measured: removing one section cost 20 turns / 11.3 min / $1.91, about the
  same as building the site.

The SDK owns token accounting, context compaction, cache alignment and a
diff-based edit tool. Those three bugs cannot be reintroduced through code that
no longer exists.

## Do not touch

These were never the problem, and rebuilding them elsewhere costs weeks:

```
src/agent/site-assets.ts     812 lines. 17 licensed Unsplash images across 13
                             categories, term matching, licence URLs, and a
                             Mongolian-aware image-replacement detector.
src/eval/                    The only way to show v3 beats v2. Losing it means
                             arguing about quality instead of measuring it.
src/agent/journal.ts         Traces. Without them a failure is a guess.
src/browser/, screenshot.ts  The only thing that sees a blank render.
src/catalog/, src/kit/       Catalog schema and the builtin snapshot.
src/agent/prompt.ts          Two months of tuning. Adapt, do not rewrite.
src/server.ts + sessions     The contract kodu.live already speaks.
src/sand/client.ts           Frozen contract, working, measured.
```

## Verified SDK facts

Checked against `@anthropic-ai/claude-agent-sdk@0.2.141` type definitions and a
run, because the published docs were wrong on the first point.

- **Package:** `@anthropic-ai/claude-agent-sdk`. Requires **zod v4**, not v3.
  npm refuses to install against zod 3.
- **`mcpServers` takes the server object directly:**
  `mcpServers: { sand: server }`. The docs show
  `{ type: "stdio", command: server }` — that is **wrong**.
- **`tools: []` disables all built-in tools.** Required here: the built-in
  Read/Write/Bash act on the server's own disk, and the project lives in the
  user's SAND container.
  ⚠️ It also removes the built-in **Edit** tool. Disabling built-ins without
  supplying your own edit tool recreates v2's whole-file-rewrite bug exactly.
  `agent-V3/src/tools/sand.ts` has a working `edit_file` — exact, unique
  replacement, refuses a match that appears twice rather than guessing.
- **Tool names are `mcp__<server>__<tool>`** in `allowedTools`.
- **Signatures:** `tool(name, description, zodRawShape, handler)` and
  `createSdkMcpServer({ name, version, tools, alwaysLoad })`.
- **`permissionMode: "bypassPermissions"`** for a headless server; nobody is
  there to approve a prompt.
- v2's tools are `AgentTool` (`def` + `run`); the SDK's are `tool()` closures.
  Adapting them is the bulk of this work. It is mechanical.

## Traps found by measurement

- **Call `keepAlive`.** SAND's TTL counts from the last touch, and a build can
  think for minutes between writes. v2 shipped `keepAlivePreview()` and never
  called it; containers died at fifteen minutes. A run in agent-V3 was already
  down to 295 seconds of TTL while still working. Ping every 5 minutes for the
  life of the run, and clear the interval in a `finally`.
- **SAND `exec` takes seconds, not milliseconds:**
  `exec(id, command, timeoutSec?)`. There is no `cwd` parameter.
- **404 from SAND means the preview expired** — create a new one. It is not an
  error. 503 means capacity; wait and retry. Collapsing them into one failure
  path is a known bug that hangs the user.
- **Keyword matching must handle Mongolian.** KoDu's users write Mongolian.
  English-only category keywords sent almost every real request to the fallback
  in agent-V3 before this was tested.
- **Match on word boundaries.** A substring test routes "barbershop" to the
  retail structure because "shop" is inside it.
- **A neutral fallback matters.** With `hospitality` as the default, "law firm
  site" was handed a page with a menu section.

## Port from agent-V3

New work, not present in v2. Copy the files; they have no v3-specific
dependencies beyond `SandFile`.

```
src/templates/themes.ts       6 palettes as @theme token sets, fonts included.
                              Four are v2's catalog themes ported unchanged.
src/templates/structures.ts   5 page structures — generic, hospitality, clinic,
                              studio, shop. Different shapes, not one page
                              reordered.
src/templates/parts.ts        Shared header, footer, Section, and ImageSlot.
src/templates/index.ts        select() — keyword match run before the agent
                              starts, so the catalogue can grow without the
                              agent paying to choose. compose() and
                              environmentNote().
src/tools/sand.ts             edit_file (see above).
```

⚠️ `ImageSlot` was written because agent-V3 has no image inventory. **v2 has
one.** In v2 the right behaviour is: use a real `<img>` from
`resolveStarterAssets` when a starter image matches, and fall back to a
labelled `ImageSlot` only when nothing does. A labelled slot reads as a site
waiting for a photograph; an empty box reads as broken.

## Measured baseline to beat

Same task, `agent-V3`, one landing page:

| | turns | wall | cost |
|---|---|---|---|
| empty container | 19 | 114s | $0.13 |
| + ported prompt | 40 | 281s | $0.46 |
| + seeded template | 32 | 146s | $0.23 |

A four-page Mongolian salon site, seeded: **32 turns / 541s / $0.62**.

v2's complaint was ~15 min and ~$5 per site, and ~$1.91 for a single edit.

⚠️ These are single runs, not distributions, and the tasks differ. Use
`src/eval/` for a comparison that means anything.

## Definition of done

Not "it runs". All of these:

1. `npm run typecheck` clean.
2. A build produces a site whose routes all return 200, with the requested
   content present in the fetched HTML — not just the status code.
3. The emitted stylesheet contains the theme utilities the page relies on.
   Tailwind v4 silently emits nothing for a token it did not compile, and the
   page renders unstyled with no error anywhere. This caught a real bug in
   agent-V3: `rounded-[--radius-card]` produced invalid CSS.
4. **A second message on the same session changes something.** This is the bug
   that mattered most; a build that works followed by a request that returns
   nothing is the failure this whole migration exists to end.
5. `npm run eval` run against both, with the numbers written down.
6. Nothing in the "do not touch" list changed.

## Open, not decided

- **Speed.** 9 minutes for four pages is better than 15 but not good. The pages
  do not depend on each other; building them with parallel subagents is the
  lever, and it is untried.
- **The catalog is not connected.** `createCatalogFromEnv` falls back to
  `BuiltinCatalog` because `NEON_DATABASE_URL` is not set anywhere. The schema
  declares 8 approved templates; `src/kit/templates/` contains 2. Six point at
  files that do not exist.
- **Railway deploy of agent-V3 is unresolved** and does not block any of this.
