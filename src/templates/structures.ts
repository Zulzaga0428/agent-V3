/**
 * The structures. Each is a different shape, not the same page with its
 * sections reordered — a clinic leads with reassurance, a studio leads with
 * the work, a shop leads with the product. Reordering one page produces sites
 * that feel identical; these should not.
 *
 * Colours are tokens throughout. A structure that writes `bg-white` is a page
 * that ignores the theme, and forty-eight combinations collapse back to eight.
 */

export type Structure = {
  slug: string;
  name: string;
  categories: string[];
  /** Sections in order, for the design direction handed to the model. */
  sections: string[];
  tone: string;
  /** Theme slug used when the caller does not choose one. */
  defaultTheme: string;
  files: { path: string; content: string }[];
};

const HOSPITALITY_PAGE = `import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Section, Eyebrow } from "@/components/section";
import { ImageSlot } from "@/components/image-slot";

const NAME = "Business name";

const values = [
  { title: "First value", body: "One concrete sentence. What a regular would say first." },
  { title: "Second value", body: "Something only this place could truthfully claim." },
  { title: "Third value", body: "The detail that makes someone come back." },
];

const menu = [
  { name: "Item", note: "Short description", price: "0.00" },
  { name: "Item", note: "Short description", price: "0.00" },
  { name: "Item", note: "Short description", price: "0.00" },
  { name: "Item", note: "Short description", price: "0.00" },
];

const hours = [
  { day: "Monday — Friday", time: "7:00 — 18:00" },
  { day: "Saturday", time: "8:00 — 17:00" },
  { day: "Sunday", time: "Closed", closed: true },
];

export default function Page() {
  return (
    <>
      <SiteHeader
        name={NAME}
        links={[
          { href: "#story", label: "Story" },
          { href: "#menu", label: "Menu" },
          { href: "#visit", label: "Visit" },
        ]}
        cta={{ href: "#visit", label: "Find us" }}
      />
      <main>
        {/* Hero: image-led. Hospitality sells the room before it sells the product. */}
        <section className="border-b border-line/70">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
            <div>
              <Eyebrow>Neighbourhood · Est. year</Eyebrow>
              <h1 className="mt-5 text-5xl leading-[1.05] md:text-6xl">
                A specific promise, not a category.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed">
                One sentence a customer would repeat to a friend.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#menu" className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition hover:opacity-90">
                  See the menu
                </a>
                <a href="#visit" className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink">
                  Opening hours
                </a>
              </div>
            </div>
            <ImageSlot label="The room, mid-morning" hint="Wide shot from the door. Natural light, people in it." ratio="4/5" />
          </div>
        </section>

        <Section raised>
          <div className="grid gap-10 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title}>
                <h3 className="text-xl">{v.title}</h3>
                <p className="mt-3 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="menu">
          <Eyebrow>Menu</Eyebrow>
          <h2 className="mt-5 max-w-xl text-3xl leading-tight md:text-4xl">What we serve.</h2>
          <dl className="mt-12 grid gap-x-14 gap-y-1 md:grid-cols-2">
            {menu.map((m, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4 border-b border-line/70 py-4">
                <div>
                  <dt className="text-ink">{m.name}</dt>
                  <dd className="text-sm text-muted">{m.note}</dd>
                </div>
                <span className="font-display text-ink">{m.price}</span>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="story" raised>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <ImageSlot label="Whoever makes it, making it" hint="Hands, close in. No posing." ratio="1/1" />
            <div>
              <Eyebrow>Our story</Eyebrow>
              <h2 className="mt-5 text-3xl leading-tight md:text-4xl">Why this exists.</h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed">
                <p>How it started, and what has stayed true since.</p>
                <p>What someone can expect when they walk in.</p>
              </div>
            </div>
          </div>
        </Section>

        <Section id="visit">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <Eyebrow>Visit</Eyebrow>
              <h2 className="mt-5 text-3xl leading-tight md:text-4xl">Where to find us.</h2>
              <dl className="mt-8 space-y-4">
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted">Address</dt>
                  <dd className="mt-1 text-lg text-ink">Street, city</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted">Phone</dt>
                  <dd className="mt-1 text-lg text-ink">Phone number</dd>
                </div>
              </dl>
            </div>
            <dl className="divide-y divide-line/80">
              {hours.map((h) => (
                <div key={h.day} className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className={h.closed ? "text-muted" : "text-ink"}>{h.day}</dt>
                  <dd className={h.closed ? "text-muted" : ""}>{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>
      </main>
      <SiteFooter
        name={NAME}
        line="One closing line about the place."
        columns={[
          { heading: "Visit", items: ["Street, city", "Phone number"] },
          { heading: "Hours", items: ["Mon–Fri 7:00–18:00", "Sat 8:00–17:00"] },
        ]}
      />
    </>
  );
}
`;

const CLINIC_PAGE = `import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Section, Eyebrow } from "@/components/section";
import { ImageSlot } from "@/components/image-slot";

const NAME = "Practice name";

const services = [
  { title: "Service", body: "What it is, in plain words. Who it is for." },
  { title: "Service", body: "What it is, in plain words. Who it is for." },
  { title: "Service", body: "What it is, in plain words. Who it is for." },
  { title: "Service", body: "What it is, in plain words. Who it is for." },
];

const steps = [
  { n: "01", title: "Get in touch", body: "Call or send the form. We answer the same day." },
  { n: "02", title: "First visit", body: "What happens, how long it takes, what to bring." },
  { n: "03", title: "Aftercare", body: "What follows, and how to reach us if anything changes." },
];

export default function Page() {
  return (
    <>
      <SiteHeader
        name={NAME}
        links={[
          { href: "#services", label: "Services" },
          { href: "#how", label: "How it works" },
          { href: "#contact", label: "Contact" },
        ]}
        cta={{ href: "#contact", label: "Book a visit" }}
      />
      <main>
        {/* Hero: reassurance first. A clinic is chosen on trust, not on features. */}
        <section className="border-b border-line/70">
          <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
            <Eyebrow>Speciality · City</Eyebrow>
            <h1 className="mt-5 text-4xl leading-[1.1] md:text-5xl">
              The reassurance someone needs before they call.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed">
              One sentence about who is cared for here and what changes for them.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a href="#contact" className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition hover:opacity-90">
                Book a visit
              </a>
              <a href="tel:+0000000000" className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink">
                Call us
              </a>
            </div>
          </div>
        </section>

        <Section id="services" raised>
          <Eyebrow>Services</Eyebrow>
          <h2 className="mt-5 max-w-xl text-3xl leading-tight md:text-4xl">What we treat.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {services.map((s, i) => (
              <article key={i} className="rounded-card border border-line bg-surface p-7">
                <h3 className="text-xl">{s.title}</h3>
                <p className="mt-3 leading-relaxed">{s.body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="how">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 max-w-xl text-3xl leading-tight md:text-4xl">Three steps, no surprises.</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n}>
                <span className="font-mono text-sm text-accent">{s.n}</span>
                <h3 className="mt-3 text-xl">{s.title}</h3>
                <p className="mt-2 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section raised>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <ImageSlot label="The team, or the room" hint="Faces build trust faster than any sentence." ratio="4/3" />
            <div>
              <Eyebrow>Who you will see</Eyebrow>
              <h2 className="mt-5 text-3xl leading-tight md:text-4xl">The people here.</h2>
              <p className="mt-6 text-lg leading-relaxed">
                Names, qualifications and years of practice. Only what is true — do not
                invent credentials.
              </p>
            </div>
          </div>
        </Section>

        <Section id="contact">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <Eyebrow>Contact</Eyebrow>
              <h2 className="mt-5 text-3xl leading-tight md:text-4xl">Book a visit.</h2>
              <dl className="mt-8 space-y-4">
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted">Address</dt>
                  <dd className="mt-1 text-lg text-ink">Street, city</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted">Phone</dt>
                  <dd className="mt-1 text-lg text-ink">Phone number</dd>
                </div>
              </dl>
            </div>
            {/* This form does not submit anywhere yet. Do not claim it does. */}
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm text-ink">Name</label>
                <input id="name" name="name" required className="mt-1.5 w-full rounded-card border border-line bg-surface px-4 py-2.5 outline-none focus:border-accent" />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm text-ink">Phone</label>
                <input id="phone" name="phone" type="tel" required className="mt-1.5 w-full rounded-card border border-line bg-surface px-4 py-2.5 outline-none focus:border-accent" />
              </div>
              <div>
                <label htmlFor="message" className="text-sm text-ink">What do you need?</label>
                <textarea id="message" name="message" rows={4} className="mt-1.5 w-full rounded-card border border-line bg-surface px-4 py-2.5 outline-none focus:border-accent" />
              </div>
              <button type="submit" className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition hover:opacity-90">
                Request an appointment
              </button>
            </form>
          </div>
        </Section>
      </main>
      <SiteFooter
        name={NAME}
        line="One closing line about the practice."
        columns={[
          { heading: "Contact", items: ["Street, city", "Phone number"] },
          { heading: "Hours", items: ["Mon–Fri 9:00–18:00", "Sat by appointment"] },
        ]}
      />
    </>
  );
}
`;

const STUDIO_PAGE = `import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Section, Eyebrow } from "@/components/section";
import { ImageSlot } from "@/components/image-slot";

const NAME = "Studio name";

const work = [
  { title: "Project", client: "Client", year: "2026", ratio: "4/3" },
  { title: "Project", client: "Client", year: "2025", ratio: "3/4" },
  { title: "Project", client: "Client", year: "2025", ratio: "3/4" },
  { title: "Project", client: "Client", year: "2024", ratio: "4/3" },
];

export default function Page() {
  return (
    <>
      <SiteHeader
        name={NAME}
        links={[
          { href: "#work", label: "Work" },
          { href: "#about", label: "About" },
          { href: "#contact", label: "Contact" },
        ]}
        cta={{ href: "#contact", label: "Start a project" }}
      />
      <main>
        {/* Hero: minimal by design. On a studio site the work is the argument. */}
        <section className="border-b border-line/70">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <h1 className="max-w-3xl text-5xl leading-[1.05] md:text-7xl">
              What this studio does, in one line.
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed">
              Who it is for, and the kind of problem it takes on.
            </p>
          </div>
        </section>

        {/* Work grid: deliberately uneven, so it reads as a portfolio rather than a table. */}
        <Section id="work">
          <div className="flex items-baseline justify-between gap-4">
            <Eyebrow>Selected work</Eyebrow>
            <span className="font-mono text-xs text-muted">{work.length} projects</span>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {work.map((w, i) => (
              <article key={i} className={i % 3 === 0 ? "md:col-span-2" : ""}>
                <ImageSlot
                  label={\`\${w.title} — \${w.client}\`}
                  hint="One strong frame from the project."
                  ratio={i % 3 === 0 ? "16/9" : w.ratio}
                />
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="text-xl">{w.title}</h3>
                  <span className="font-mono text-xs text-muted">{w.year}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{w.client}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="about" raised>
          <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
            <div>
              <Eyebrow>About</Eyebrow>
              <h2 className="mt-5 text-3xl leading-tight md:text-4xl">How we work.</h2>
            </div>
            <div className="space-y-5 text-lg leading-relaxed">
              <p>What the studio believes, and how that shows up in the work.</p>
              <p>Who is here, and what each of them does.</p>
            </div>
          </div>
        </Section>

        <Section id="contact">
          <h2 className="max-w-2xl text-3xl leading-tight md:text-4xl">
            Have something in mind?
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed">
            Say what it is and roughly when. We answer within two days.
          </p>
          <a
            href="mailto:hello@example.com"
            className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition hover:opacity-90"
          >
            hello@example.com
          </a>
        </Section>
      </main>
      <SiteFooter
        name={NAME}
        line="One closing line about the studio."
        columns={[{ heading: "Elsewhere", items: ["Instagram", "LinkedIn"] }]}
      />
    </>
  );
}
`;

const SHOP_PAGE = `import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Section, Eyebrow } from "@/components/section";
import { ImageSlot } from "@/components/image-slot";

const NAME = "Shop name";

const products = [
  { name: "Product", price: "0.00", note: "Short line" },
  { name: "Product", price: "0.00", note: "Short line" },
  { name: "Product", price: "0.00", note: "Short line" },
  { name: "Product", price: "0.00", note: "Short line" },
  { name: "Product", price: "0.00", note: "Short line" },
  { name: "Product", price: "0.00", note: "Short line" },
];

export default function Page() {
  return (
    <>
      <SiteHeader
        name={NAME}
        links={[
          { href: "#shop", label: "Shop" },
          { href: "#about", label: "About" },
          { href: "#delivery", label: "Delivery" },
        ]}
        cta={{ href: "#shop", label: "Shop now" }}
      />
      <main>
        {/* Hero: the product, large. A shop is browsed before it is read. */}
        <section className="border-b border-line/70 bg-raised">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[1fr_1.1fr] md:py-20">
            <div>
              <Eyebrow>New this season</Eyebrow>
              <h1 className="mt-5 text-4xl leading-[1.08] md:text-5xl">
                The product, and why it is worth having.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed">
                One sentence about what makes it different from the cheaper one.
              </p>
              <a href="#shop" className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition hover:opacity-90">
                Shop the range
              </a>
            </div>
            <ImageSlot label="The hero product" hint="On a plain ground, lit from one side." ratio="4/3" />
          </div>
        </section>

        <Section id="shop">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <Eyebrow>Shop</Eyebrow>
              <h2 className="mt-5 text-3xl leading-tight md:text-4xl">Everything we make.</h2>
            </div>
          </div>
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {products.map((p, i) => (
              <article key={i}>
                <ImageSlot label={p.name} ratio="1/1" />
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h3 className="text-lg">{p.name}</h3>
                  <span className="font-display text-ink">{p.price}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{p.note}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="about" raised>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>About</Eyebrow>
              <h2 className="mt-5 text-3xl leading-tight md:text-4xl">Who makes this.</h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed">
                <p>Where it is made, and by whom.</p>
                <p>What the materials are and why they were chosen.</p>
              </div>
            </div>
            <ImageSlot label="The workshop, or the maker" hint="Process, not a posed portrait." ratio="4/3" />
          </div>
        </Section>

        <Section id="delivery">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-xl">Delivery</h3>
              <p className="mt-3 leading-relaxed">How long it takes and what it costs.</p>
            </div>
            <div>
              <h3 className="text-xl">Returns</h3>
              <p className="mt-3 leading-relaxed">The window, and how to start one.</p>
            </div>
            <div>
              <h3 className="text-xl">Contact</h3>
              <p className="mt-3 leading-relaxed">Phone number and email.</p>
            </div>
          </div>
        </Section>
      </main>
      <SiteFooter
        name={NAME}
        line="One closing line about the shop."
        columns={[
          { heading: "Help", items: ["Delivery", "Returns", "Contact"] },
          { heading: "Elsewhere", items: ["Instagram", "Facebook"] },
        ]}
      />
    </>
  );
}
`;

const GENERIC_PAGE = `import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Section, Eyebrow } from "@/components/section";
import { ImageSlot } from "@/components/image-slot";

const NAME = "Business name";

const offerings = [
  { title: "First", body: "One or two sentences. Concrete, not aspirational." },
  { title: "Second", body: "Something only this business could truthfully say." },
  { title: "Third", body: "The detail a regular would mention first." },
];

export default function Page() {
  return (
    <>
      <SiteHeader
        name={NAME}
        links={[
          { href: "#about", label: "About" },
          { href: "#offer", label: "What we do" },
          { href: "#contact", label: "Contact" },
        ]}
        cta={{ href: "#contact", label: "Get in touch" }}
      />
      <main>
        <section className="relative overflow-hidden border-b border-line/70">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[-30%] h-[70%] bg-[radial-gradient(60%_60%_at_50%_50%,var(--color-accent-soft),transparent_70%)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-[1.15fr_0.85fr] md:py-32">
            <div>
              <Eyebrow>Location · Est. year</Eyebrow>
              <h1 className="mt-5 text-5xl leading-[1.05] md:text-6xl">
                A specific promise, not a category.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed">
                One sentence a customer would repeat to a friend. Say who it is for
                and what changes for them.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#contact" className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition hover:opacity-90">
                  Get in touch
                </a>
                <a href="#about" className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink">
                  Our story
                </a>
              </div>
            </div>
            <ImageSlot label="The place, or the work" hint="One frame that shows what this is." ratio="4/5" />
          </div>
        </section>

        <Section id="about">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <Eyebrow>About us</Eyebrow>
              <h2 className="mt-5 text-3xl leading-tight md:text-4xl">
                The one sentence that explains why this exists.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-relaxed">
              <p>How it started and what has stayed true since.</p>
              <p>What someone can expect when they arrive.</p>
            </div>
          </div>
        </Section>

        <Section id="offer" raised>
          <Eyebrow>What we do</Eyebrow>
          <h2 className="mt-5 max-w-xl text-3xl leading-tight md:text-4xl">
            Three things worth knowing.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {offerings.map((o, i) => (
              <article key={o.title} className="rounded-card border border-line bg-surface p-7">
                <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-xl">{o.title}</h3>
                <p className="mt-3 leading-relaxed">{o.body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="contact">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <Eyebrow>Contact</Eyebrow>
              <h2 className="mt-5 text-3xl leading-tight md:text-4xl">Get in touch.</h2>
              <dl className="mt-8 space-y-4">
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted">Address</dt>
                  <dd className="mt-1 text-lg text-ink">Street, city</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted">Phone</dt>
                  <dd className="mt-1 text-lg text-ink">Phone number</dd>
                </div>
              </dl>
            </div>
            <dl className="divide-y divide-line/80">
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-ink">Monday — Friday</dt>
                <dd>9:00 — 18:00</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-ink">Saturday</dt>
                <dd>10:00 — 16:00</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-muted">Sunday</dt>
                <dd className="text-muted">Closed</dd>
              </div>
            </dl>
          </div>
        </Section>
      </main>
      <SiteFooter
        name={NAME}
        line="One closing line about the business."
        columns={[{ heading: "Contact", items: ["Street, city", "Phone number"] }]}
      />
    </>
  );
}
`;

export const STRUCTURES: Structure[] = [
  {
    slug: "generic",
    name: "General business",
    categories: [],
    sections: ["header", "hero", "about", "offerings", "contact", "footer"],
    tone: "clear, grounded, specific",
    defaultTheme: "clean-minimal",
    files: [{ path: "app/page.tsx", content: GENERIC_PAGE }],
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    categories: [
      "cafe", "coffee", "coffee shop", "restaurant", "bakery", "bar", "food",
      "hospitality", "hotel", "pub", "bistro", "canteen",
      // KoDu's users write in Mongolian. English-only keywords sent almost
      // every real request to the generic fallback.
      "кофе", "кафе", "ресторан", "хоолны газар", "хоолны", "зоогийн газар",
      "талх", "нарийн боов", "бууз", "зочид буудал", "баар", "кофешоп",
    ],
    sections: ["header", "hero-image", "values", "menu", "story", "visit", "footer"],
    tone: "warm, unhurried, hand-made",
    defaultTheme: "warm-editorial",
    files: [{ path: "app/page.tsx", content: HOSPITALITY_PAGE }],
  },
  {
    slug: "clinic",
    name: "Clinic and practice",
    categories: [
      "clinic", "healthcare", "health", "dental", "dentist", "doctor", "medical",
      "wellness", "therapy", "legal", "law", "lawyer", "attorney", "law firm",
      "accounting", "accountant", "consulting", "consultancy", "insurance", "service",
      "barber", "barbershop", "salon", "spa", "hairdresser", "veterinary", "vet",
      "эмнэлэг", "шүдний", "эмч", "эрүүл мэнд", "гоо сайхан", "гоо сайхны",
      "салон", "үсчин", "рашаан", "хуулийн", "өмгөөлөгч", "нягтлан",
      "зөвлөх", "даатгал", "мал эмнэлэг",
    ],
    sections: ["header", "hero-centred", "services", "how-it-works", "team", "contact-form", "footer"],
    tone: "calm, plain-spoken, trustworthy",
    defaultTheme: "deep-green",
    files: [{ path: "app/page.tsx", content: CLINIC_PAGE }],
  },
  {
    slug: "studio",
    name: "Studio and portfolio",
    categories: [
      "portfolio", "studio", "agency", "photography", "design", "architecture",
      "creative", "photographer",
      "портфолио", "студи", "агентлаг", "гэрэл зураг", "зураглаач",
      "дизайн", "архитектур", "бүтээл",
    ],
    sections: ["header", "hero-type", "work-grid", "about", "contact", "footer"],
    tone: "restrained, confident, work-led",
    defaultTheme: "quiet-mono",
    files: [{ path: "app/page.tsx", content: STUDIO_PAGE }],
  },
  {
    slug: "shop",
    name: "Shop",
    categories: [
      "shop", "store", "ecommerce", "e-commerce", "retail", "product", "products",
      "craft", "boutique", "topup", "top-up", "top up", "gaming", "game", "voucher",
      "дэлгүүр", "худалдаа", "онлайн дэлгүүр", "бүтээгдэхүүн", "топап",
      "цэнэглэх", "тоглоом", "ваучер", "захиалга",
    ],
    sections: ["header", "hero-product", "product-grid", "about", "delivery", "footer"],
    tone: "clean, product-led, practical",
    defaultTheme: "clean-minimal",
    files: [{ path: "app/page.tsx", content: SHOP_PAGE }],
  },
];

/**
 * The fallback has to be neutral. When it was `hospitality`, a request that
 * matched nothing — "law firm site" — was handed a page with a menu section.
 * An unmatched request should get a plain business page, not a café.
 */
export const DEFAULT_STRUCTURE = "generic";
