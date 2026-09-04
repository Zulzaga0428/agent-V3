/**
 * Palettes, separated from structure so the two multiply instead of being
 * rewritten together. Eight structures and six themes are forty-eight looks
 * from fourteen pieces of work — which is the only way "every site should not
 * look the same" is affordable.
 *
 * The four with v2 slugs are ported from its catalog unchanged, so a category
 * that already had a chosen palette keeps it.
 *
 * Fonts are part of a theme, not a template. Two sites with the same sections
 * and different type read as different sites; two sites with the same type and
 * different sections read as the same site with the blocks moved around.
 */

export type Theme = {
  slug: string;
  name: string;
  /** Business categories this palette suits, for selection before the agent runs. */
  categories: string[];
  description: string;
  tokens: {
    ink: string;
    body: string;
    muted: string;
    line: string;
    surface: string;
    raised: string;
    accent: string;
    accentSoft: string;
    onAccent: string;
    display: string;
    sans: string;
    radius: string;
  };
};

const SERIF = `Georgia, "Times New Roman", serif`;
const SYSTEM = `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
const GEOMETRIC = `"Avenir Next", "Century Gothic", ui-sans-serif, system-ui, sans-serif`;
const MONO = `ui-monospace, "SF Mono", "Cascadia Mono", Menlo, monospace`;

export const THEMES: Theme[] = [
  {
    slug: "clean-minimal",
    name: "Clean minimal",
    categories: ["saas", "healthcare", "education", "portfolio", "technology"],
    description: "Light surfaces, generous whitespace, restrained ink, one confident accent.",
    tokens: {
      ink: "#0f172a",
      body: "#3f4a5c",
      muted: "#64748b",
      line: "#e2e8f0",
      surface: "#ffffff",
      raised: "#f8fafc",
      accent: "#2563eb",
      accentSoft: "#dbeafe",
      onAccent: "#ffffff",
      display: SYSTEM,
      sans: SYSTEM,
      radius: "0.875rem",
    },
  },
  {
    slug: "warm-editorial",
    name: "Warm editorial",
    categories: ["restaurant", "cafe", "coffee", "food", "hospitality", "bakery", "ecommerce"],
    description: "Warm neutrals, tactile cards, expressive display type, a product-led hero.",
    tokens: {
      ink: "#3f281d",
      body: "#5c4839",
      muted: "#806d61",
      line: "#e8dbcd",
      surface: "#fffaf5",
      raised: "#f7eadf",
      accent: "#c76b36",
      accentSoft: "#f5e0d1",
      onAccent: "#fffaf5",
      display: SERIF,
      sans: SYSTEM,
      radius: "1rem",
    },
  },
  {
    slug: "midnight-tech",
    name: "Midnight tech",
    categories: ["technology", "startup", "automotive", "saas", "gaming"],
    description: "Dark depth, electric accent, crisp borders, restrained glow.",
    tokens: {
      ink: "#f8fafc",
      body: "#c7d3e3",
      muted: "#8fa3bd",
      line: "#1e2f47",
      surface: "#08111f",
      raised: "#101d31",
      accent: "#38bdf8",
      accentSoft: "#12304a",
      onAccent: "#08111f",
      display: GEOMETRIC,
      sans: SYSTEM,
      radius: "0.75rem",
    },
  },
  {
    slug: "friendly-color",
    name: "Friendly color",
    categories: ["education", "healthcare", "portfolio", "startup", "kids"],
    description: "Approachable surfaces, soft colour blocks, rounded controls, optimistic emphasis.",
    tokens: {
      ink: "#25324a",
      body: "#4a5568",
      muted: "#6e7790",
      line: "#e4e0f7",
      surface: "#fbfaff",
      raised: "#f2efff",
      accent: "#7c3aed",
      accentSoft: "#ede4ff",
      onAccent: "#ffffff",
      display: GEOMETRIC,
      sans: SYSTEM,
      radius: "1.25rem",
    },
  },
  {
    slug: "quiet-mono",
    name: "Quiet mono",
    categories: ["portfolio", "studio", "agency", "technology", "photography"],
    description: "Near-monochrome, hairline rules, monospaced labels, the work carrying the page.",
    tokens: {
      ink: "#111111",
      body: "#404040",
      muted: "#8a8a8a",
      line: "#e5e5e5",
      surface: "#fcfcfc",
      raised: "#f2f2f2",
      accent: "#111111",
      accentSoft: "#e9e9e9",
      onAccent: "#fcfcfc",
      display: SYSTEM,
      sans: SYSTEM,
      radius: "0.25rem",
    },
  },
  {
    slug: "deep-green",
    name: "Deep green",
    categories: ["clinic", "wellness", "legal", "finance", "real estate", "healthcare"],
    description: "Forest ground, brass accent, serif authority — trust without stiffness.",
    tokens: {
      ink: "#10231c",
      body: "#3c4f47",
      muted: "#6f8279",
      line: "#dae3dd",
      surface: "#f9fbf9",
      raised: "#eef3ef",
      accent: "#1f6f52",
      accentSoft: "#d8ece2",
      onAccent: "#f9fbf9",
      display: SERIF,
      sans: SYSTEM,
      radius: "0.5rem",
    },
  },
];

export const DEFAULT_THEME = "clean-minimal";

export function findTheme(slug: string | undefined): Theme {
  return THEMES.find((t) => t.slug === slug) ?? THEMES.find((t) => t.slug === DEFAULT_THEME)!;
}

/**
 * The theme is the whole stylesheet. Every colour a template uses is a token
 * defined here and nothing is a literal, so "make it darker" or "use green" is
 * one edit to this file rather than a repaint of every component.
 */
export function themeCss(theme: Theme): string {
  const t = theme.tokens;
  return `@import "tailwindcss";

/* Theme: ${theme.name} — ${theme.description}
   Every colour on this site is a token below. Change them here; the components
   follow. Do not write literal colours into components. */
@theme {
  --color-ink: ${t.ink};
  --color-body: ${t.body};
  --color-muted: ${t.muted};
  --color-line: ${t.line};
  --color-surface: ${t.surface};
  --color-raised: ${t.raised};
  --color-accent: ${t.accent};
  --color-accent-soft: ${t.accentSoft};
  --color-on-accent: ${t.onAccent};

  --font-display: ${t.display};
  --font-sans: ${t.sans};
  --font-mono: ${MONO};

  --radius-card: ${t.radius};
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--color-surface);
  color: var(--color-body);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display);
  color: var(--color-ink);
  letter-spacing: -0.015em;
}
`;
}
