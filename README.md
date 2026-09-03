# agent-V3

The site-building agent, rebuilt on the Claude Agent SDK.

## Why this exists

v2 hand-rolled the agent loop on the raw Messages API. The bugs that cost the
most were all in that hand-rolled layer:

- input tokens estimated from `Buffer.byteLength`, so a long history reported a
  budget it had already blown, and the second turn died before the model was
  called
- a fixed 32k thinking reserve subtracted from every budget
- no partial-edit tool, so every change rewrote whole files — a three-line edit
  cost about as much as building the site

The SDK owns that layer instead: token accounting, context compaction, cache
alignment, and a diff-based edit tool that refuses to touch a file the model has
not read.

What did **not** move: SAND, the database, the templates, the eval harness.
Those were never the problem.

## Shape

```
prompt ──▶ query()  (Claude Agent SDK — loop, context, budget)
              │
              └─▶ mcp__sand__*  ──▶ SAND container
                                     files + exec + logs + preview URL
```

The SDK's built-in `Read`/`Write`/`Bash` tools are **disabled** (`tools: []`).
They would act on this server's disk. The project lives in the user's
container, and SAND is the only way in.

## Running it

```bash
cp .env.example .env    # fill in SAND_KEY and ANTHROPIC_API_KEY
npm install
npm run try -- "Change the heading to 'It works'"
```

`npm run try` creates a real preview, runs one task against it, and prints the
turn count, wall time, cost, and the preview URL.

## Status

| | |
|---|---|
| SAND client | ported from v2 unchanged |
| Tools (read/write/delete/exec/logs) | written, typechecked |
| Agent loop | written, typechecked |
| **End-to-end run** | **not yet verified** |
| HTTP server for Railway | not started |
| Templates, catalog, eval | not ported |
