import type { SandFile } from "../sand/client.js";

/**
 * A finished business landing page, seeded into the container before the agent
 * sees it.
 *
 * This is not the component kit v2 measured and switched off. A kit hands the
 * model materials and leaves the assembly — it has to read each component,
 * learn its props, and compose a design, which measured at 20 turns against 13
 * without it. A template hands over a built page: the model reads it and
 * changes words, and the prompt already has a section telling it to do exactly
 * that rather than start over.
 *
 * The craft has to be in here, because whatever is not in here is something the
 * model invents per site: the type scale, the section rhythm, the restraint.
 * Anything generic enough to survive every business — a nav, a footer, a
 * two-column about — belongs here once instead of being re-derived every build.
 */

const GLOBALS = `@import "tailwindcss";

@theme {
  --color-ink: #16130f;
  --color-body: #4a423a;
  --color-muted: #8a7f74;
  --color-line: #e6dfd5;
  --color-surface: #fdfbf7;
  --color-raised: #f6f1e8;
  --color-accent: #9a5b34;
  --color-accent-soft: #f0e2d6;

  --font-display: Georgia, "Times New Roman", serif;
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;

  --radius-card: 14px;
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

const LAYOUT = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business name — tagline",
  description: "One sentence describing what this business does and for whom.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

const HEADER = `import Link from "next/link";

const links = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#visit", label: "Visit" },
];

export function SiteHeader({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg tracking-tight text-ink">
          {name}
        </Link>
        <nav className="hidden gap-8 text-sm text-body md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#visit"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface transition hover:bg-accent"
        >
          Get in touch
        </a>
      </div>
    </header>
  );
}
`;

const HERO = `export function Hero({
  eyebrow,
  title,
  tagline,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: string;
  tagline: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}) {
  return (
    <section className="relative overflow-hidden border-b border-line/70">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-30%] h-[70%] bg-[radial-gradient(60%_60%_at_50%_50%,var(--color-accent-soft),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-32">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
          <h1 className="mt-5 text-5xl leading-[1.05] md:text-6xl">{title}</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-body">{tagline}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={primary.href}
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition hover:bg-accent"
            >
              {primary.label}
            </a>
            <a
              href={secondary.href}
              className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
            >
              {secondary.label}
            </a>
          </div>
        </div>
        <div className="relative hidden aspect-[4/5] rounded-card border border-line bg-raised md:block">
          <div className="absolute inset-6 rounded-card border border-line/70" />
          <p className="absolute bottom-6 left-6 right-6 font-display text-2xl leading-snug text-ink/25">
            Replace this panel with a section that suits the business.
          </p>
        </div>
      </div>
    </section>
  );
}
`;

const ABOUT = `export function About({
  eyebrow,
  statement,
  paragraphs,
}: {
  eyebrow: string;
  statement: string;
  paragraphs: string[];
}) {
  return (
    <section id="about" className="border-b border-line/70">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
          <h2 className="mt-5 text-3xl leading-tight md:text-4xl">{statement}</h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

const CARDS = `export type Card = { title: string; body: string };

export function Cards({ eyebrow, heading, cards }: { eyebrow: string; heading: string; cards: Card[] }) {
  return (
    <section id="services" className="border-b border-line/70 bg-raised">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        <h2 className="mt-5 max-w-xl text-3xl leading-tight md:text-4xl">{heading}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => (
            <article key={c.title} className="rounded-card border border-line bg-surface p-7">
              <span className="font-display text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-xl">{c.title}</h3>
              <p className="mt-3 leading-relaxed text-body">{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

const VISIT = `export type Row = { label: string; value: string; muted?: boolean };

export function Visit({
  eyebrow,
  heading,
  contact,
  rows,
}: {
  eyebrow: string;
  heading: string;
  contact: { label: string; value: string }[];
  rows: Row[];
}) {
  return (
    <section id="visit" className="border-b border-line/70">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
          <h2 className="mt-5 text-3xl leading-tight md:text-4xl">{heading}</h2>
          <dl className="mt-8 space-y-4">
            {contact.map((c) => (
              <div key={c.label}>
                <dt className="text-xs uppercase tracking-[0.18em] text-muted">{c.label}</dt>
                <dd className="mt-1 text-lg text-ink">{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <dl className="divide-y divide-line/80">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-4 py-3.5">
              <dt className={r.muted ? "text-muted" : "text-ink"}>{r.label}</dt>
              <dd className={r.muted ? "text-muted" : "text-body"}>{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
`;

const FOOTER = `export function SiteFooter({ name, line }: { name: string; line: string }) {
  return (
    <footer className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <p className="font-display text-2xl text-ink">{name}</p>
        <p className="mt-3 max-w-sm leading-relaxed text-body">{line}</p>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <a
            href="https://kodu.live"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted transition hover:text-ink"
          >
            Powered by <span className="font-semibold">KoDu</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
`;

const PAGE = `import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Cards } from "@/components/cards";
import { Visit } from "@/components/visit";
import { SiteFooter } from "@/components/site-footer";

const NAME = "Business name";

export default function Page() {
  return (
    <>
      <SiteHeader name={NAME} />
      <main>
        <Hero
          eyebrow="Location · Est. year"
          title="A specific promise, not a category."
          tagline="One sentence a customer would repeat to a friend. Say who it is for and what changes for them."
          primary={{ href: "#visit", label: "Get in touch" }}
          secondary={{ href: "#about", label: "Our story" }}
        />
        <About
          eyebrow="About us"
          statement="The one sentence that explains why this exists."
          paragraphs={[
            "First paragraph: how it started and what has stayed true since.",
            "Second paragraph: what someone can expect when they arrive.",
          ]}
        />
        <Cards
          eyebrow="What we do"
          heading="Three things worth knowing before you come in."
          cards={[
            { title: "First", body: "One or two sentences. Concrete, not aspirational." },
            { title: "Second", body: "Something only this business could truthfully say." },
            { title: "Third", body: "The detail regulars would mention first." },
          ]}
        />
        <Visit
          eyebrow="Visit"
          heading="Where to find us."
          contact={[
            { label: "Address", value: "Street, city" },
            { label: "Phone", value: "Phone number" },
          ]}
          rows={[
            { label: "Monday — Friday", value: "9:00 — 18:00" },
            { label: "Saturday", value: "10:00 — 16:00" },
            { label: "Sunday", value: "Closed", muted: true },
          ]}
        />
      </main>
      <SiteFooter name={NAME} line="One closing line about the business." />
    </>
  );
}
`;

const KODU_MD = `# Business name

## What this is
A starter template, not yet adapted to a real business. Replace this section
with whose site it is, what it is for, and its tone as soon as you know.

Routes: \`/\` only.
Home page sections, in order: header, hero, about, cards, visit, footer.

Decisions that bind: the palette and type scale live as \`@theme\` tokens in
\`app/globals.css\` — change them there, not in the components.

## History
- Seeded from the business template. No changes yet.
`;

/**
 * The container is seeded with this before the agent's first turn, so the model
 * opens onto a designed page rather than an empty directory.
 */
export function businessTemplate(): SandFile[] {
  return [
    { path: "app/globals.css", content: GLOBALS },
    { path: "app/layout.tsx", content: LAYOUT },
    { path: "app/page.tsx", content: PAGE },
    { path: "components/site-header.tsx", content: HEADER },
    { path: "components/hero.tsx", content: HERO },
    { path: "components/about.tsx", content: ABOUT },
    { path: "components/cards.tsx", content: CARDS },
    { path: "components/visit.tsx", content: VISIT },
    { path: "components/site-footer.tsx", content: FOOTER },
    { path: "KODU.md", content: KODU_MD },
  ];
}
