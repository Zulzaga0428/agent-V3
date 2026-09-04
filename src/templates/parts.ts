/**
 * The pieces every template shares, so a new structure is a new composition
 * rather than a new stylesheet. Each reads theme tokens and never a literal
 * colour.
 */

/**
 * The answer to a site that has no photographs yet.
 *
 * A bare grey box reads as broken, and an owner seeing it sees failure. A
 * panel that names the picture that belongs in it reads as a site waiting for
 * photographs — the difference is a caption, and it decides whether the first
 * impression is promise or defeat. It is also an instruction: it tells the
 * owner exactly which photo to send.
 *
 * Swapping one for a real image is a two-line change, which is the point.
 */
export const IMAGE_SLOT = `/**
 * A labelled place for a photograph that has not been supplied yet.
 *
 * Replace with <img src="..." alt={label} className="h-full w-full object-cover" />
 * once a real photograph exists. Keep the wrapper: it holds the aspect ratio.
 */
export function ImageSlot({
  label,
  hint,
  ratio = "4/3",
  className = "",
}: {
  label: string;
  hint?: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <figure
      className={\`relative overflow-hidden rounded-card border border-line bg-raised \${className}\`}
      style={{ aspectRatio: ratio }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,var(--color-accent-soft),transparent_60%)] opacity-70"
      />
      <figcaption className="absolute inset-0 flex flex-col justify-end gap-1 p-5">
        <span className="text-xs uppercase tracking-[0.18em] text-accent">Photo</span>
        <span className="font-display text-lg leading-snug text-ink">{label}</span>
        {hint ? <span className="text-sm text-muted">{hint}</span> : null}
      </figcaption>
    </figure>
  );
}
`;

export const SECTION = `export function Section({
  id,
  children,
  raised = false,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  raised?: boolean;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={\`border-b border-line/70 \${raised ? "bg-raised" : ""} \${className}\`}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.22em] text-accent">{children}</p>;
}
`;

export const HEADER = `import Link from "next/link";

export function SiteHeader({
  name,
  links,
  cta,
}: {
  name: string;
  links: { href: string; label: string }[];
  cta: { href: string; label: string };
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg tracking-tight text-ink">
          {name}
        </Link>
        <nav className="hidden gap-8 text-sm md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href={cta.href}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-on-accent transition hover:opacity-90"
        >
          {cta.label}
        </a>
      </div>
    </header>
  );
}
`;

/**
 * The KoDu mark lives here rather than in each template, so it cannot be
 * forgotten in a new one. Its colours are tokens, which is what stops it from
 * turning invisible on a dark theme the way a hard-coded muted grey would.
 */
export const FOOTER = `export function SiteFooter({
  name,
  line,
  columns,
}: {
  name: string;
  line: string;
  columns?: { heading: string; items: string[] }[];
}) {
  return (
    <footer className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl text-ink">{name}</p>
            <p className="mt-3 max-w-sm leading-relaxed">{line}</p>
          </div>
          {(columns ?? []).map((c) => (
            <div key={c.heading}>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">{c.heading}</p>
              <ul className="mt-3 space-y-1.5">
                {c.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
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

export const LAYOUT = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TITLE_PLACEHOLDER",
  description: "DESCRIPTION_PLACEHOLDER",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

/** Files every template gets, whatever its structure. */
export function sharedFiles(): { path: string; content: string }[] {
  return [
    { path: "components/section.tsx", content: SECTION },
    { path: "components/image-slot.tsx", content: IMAGE_SLOT },
    { path: "components/site-header.tsx", content: HEADER },
    { path: "components/site-footer.tsx", content: FOOTER },
  ];
}
