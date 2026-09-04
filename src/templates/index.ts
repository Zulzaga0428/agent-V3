import type { SandFile } from "../sand/client.js";
import { LAYOUT, sharedFiles } from "./parts.js";
import { DEFAULT_STRUCTURE, STRUCTURES, type Structure } from "./structures.js";
import { findTheme, THEMES, themeCss, type Theme } from "./themes.js";

/**
 * Structure × theme, composed into the files a container is seeded with.
 *
 * Selection happens here, before the agent's first turn, and it is a keyword
 * match rather than a model call. The catalogue can hold any number of
 * structures because the agent never sees the catalogue — it opens onto one
 * built page. Handing it a library to choose from would put the cost of
 * variety back into every run, which is what made v2's component kit not pay.
 */

export type Selection = { structure: Structure; theme: Theme };

/**
 * Longest match wins, so "coffee shop" beats "shop".
 *
 * Word boundaries matter more than they look: a plain substring test sends
 * "barbershop" to the retail structure, because "shop" is inside it. A
 * barbershop is a service business and wants the booking page, not a product
 * grid.
 */
function scoreCategories(categories: string[], text: string): number {
  let best = 0;
  for (const c of categories) {
    const pattern = new RegExp(`(^|[^a-z])${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z])`);
    if (pattern.test(text) && c.length > best) best = c.length;
  }
  return best;
}

export function select(request: string, themeSlug?: string): Selection {
  const text = ` ${request.toLowerCase()} `;

  let structure = STRUCTURES.find((s) => s.slug === DEFAULT_STRUCTURE)!;
  let bestScore = 0;
  for (const candidate of STRUCTURES) {
    const score = scoreCategories(candidate.categories, text);
    if (score > bestScore) {
      bestScore = score;
      structure = candidate;
    }
  }

  // An explicit theme wins; otherwise the structure's default, unless the
  // request names a palette's own category more specifically.
  if (themeSlug) return { structure, theme: findTheme(themeSlug) };

  let theme = findTheme(structure.defaultTheme);
  let themeScore = 0;
  for (const candidate of THEMES) {
    const score = scoreCategories(candidate.categories, text);
    if (score > themeScore) {
      themeScore = score;
      theme = candidate;
    }
  }
  return { structure, theme };
}

function koduMd(structure: Structure, theme: Theme): string {
  return `# Business name

## What this is
A starter, not yet adapted to a real business. Replace this section with whose
site it is, what it is for, and its tone as soon as you know.

Seeded from the **${structure.name}** structure on the **${theme.name}** theme.
Tone to hold: ${structure.tone}.

Routes: \`/\` only.
Home page sections, in order: ${structure.sections.join(" → ")}.

Decisions that bind:
- Every colour is a token in \`app/globals.css\`. Change them there, never as a
  literal in a component — that is what keeps "make it darker" a one-line edit.
- \`ImageSlot\` marks where photographs belong and names the shot needed. Replace
  one with a real \`<img>\` when a photograph exists; do not delete it and leave
  the space empty.

## History
- Seeded from the ${structure.slug} structure. No changes yet.
`;
}

/** The files a container is seeded with, before the agent's first turn. */
export function compose(selection: Selection): SandFile[] {
  const { structure, theme } = selection;
  return [
    { path: "app/globals.css", content: themeCss(theme) },
    { path: "app/layout.tsx", content: LAYOUT },
    ...structure.files,
    ...sharedFiles(),
    { path: "KODU.md", content: koduMd(structure, theme) },
  ];
}

/**
 * What the caller knows and the agent cannot see. Appended to the system
 * prompt so the model is told what it is opening onto rather than having to
 * infer it from the files.
 */
export function environmentNote(selection: Selection): string {
  const { structure, theme } = selection;
  return [
    `This container was seeded with the **${structure.name}** starter on the **${theme.name}** theme.`,
    ``,
    `Sections already in place, in order: ${structure.sections.join(" → ")}.`,
    `Tone to hold: ${structure.tone}.`,
    ``,
    `Adapt it. The words, names, numbers and images are placeholders and are meant`,
    `to be replaced; the structure, spacing and type scale are the design and are`,
    `meant to be kept. Rebuild only if the request cannot be reached by editing.`,
    ``,
    `Every colour is a token in \`app/globals.css\`. Change the tokens, not the`,
    `components — one edit repaints the whole site, and a literal colour written`,
    `into a component is a bug.`,
    ``,
    `\`components/image-slot.tsx\` renders a labelled place for a photograph that`,
    `does not exist yet. There is no image inventory here, so keep the slots and`,
    `write the label to name the photograph the owner should send. A slot that`,
    `says what belongs in it reads as a site waiting for photographs; an empty`,
    `box reads as a broken one.`,
  ].join("\n");
}

export { STRUCTURES, THEMES };
