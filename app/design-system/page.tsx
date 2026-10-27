import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { PlaceholderTag } from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "Design System", robots: { index: false, follow: false } };

const colors = [
  ["Ink", "--c-ink", "#060914", "Page background"],
  ["Navy", "--c-navy", "#0C142A", "Raised surfaces"],
  ["Navy 2", "--c-navy-2", "#162242", "Highest surface"],
  ["Gold", "--c-gold", "#C9A55A", "Primary accent"],
  ["Gold bright", "--c-gold-bright", "#E8CC8C", "Highlights"],
  ["Gold deep", "--c-gold-deep", "#967534", "Shadows / pressed"],
  ["Ivory", "--c-ivory", "#F6F0E4", "Primary text"],
  ["Muted", "--c-muted", "#BEB8AC", "Secondary text"],
];

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-t border-ivory/10 py-14">
    <p className="eyebrow">{title}</p>
    <div className="mt-8">{children}</div>
  </section>
);

export default function DesignSystem() {
  return (
    <main id="main" className="container py-20">
      <a href="/" className="btn-ghost">
        <Icon name="arrowLeft" className="h-4 w-4" /> Back to site
      </a>
      <h1 className="mt-6 text-display-lg">Design System</h1>
      <p className="mt-4 max-w-prose text-lg text-muted">
        Tokens live in <code className="text-gold-bright">app/globals.css</code> as CSS variables and are mapped to Tailwind in{" "}
        <code className="text-gold-bright">tailwind.config.ts</code>.
      </p>

      <Block title="Colour">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {colors.map(([name, v, hex, use]) => (
            <li key={v} className="overflow-hidden rounded-2xl border border-ivory/10">
              <div className="h-28" style={{ background: `rgb(var(${v}))` }} />
              <div className="p-4 text-sm">
                <p className="font-semibold text-ivory">{name}</p>
                <p className="font-mono text-muted">{hex}</p>
                <p className="mt-1 text-muted">{use}</p>
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Typography">
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Display XL · Cormorant Garamond</p>
            <p className="font-serif text-display-xl">Transformed Lives</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Display LG</p>
            <p className="font-serif text-display-lg">
              One mandate, <em className="text-gold-gradient">many expressions</em>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Display MD</p>
            <p className="font-serif text-display-md">Get messages and event updates</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Body · Manrope</p>
            <p className="max-w-prose text-lg leading-relaxed text-muted">
              Body copy is set in Manrope at 18px with a relaxed line height and a 62-character measure for comfortable reading on every screen.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Signature · Pinyon Script</p>
            <p className="font-script text-6xl text-gold-gradient">Sam Oye</p>
          </div>
          <p className="eyebrow">Eyebrow label</p>
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <button className="btn-primary">
            Book a Counseling Session <Icon name="arrowRight" className="h-4 w-4" />
          </button>
          <button className="btn-secondary">
            <Icon name="play" className="h-4 w-4" /> Watch Message
          </button>
          <button className="btn-ghost">
            Learn more <Icon name="arrowRight" className="h-4 w-4" />
          </button>
          <button className="btn-primary" disabled>
            Disabled
          </button>
        </div>
      </Block>

      <Block title="Cards & surfaces">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="card card-spotlight p-8">
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold-bright">
              <Icon name="church" className="h-7 w-7" />
            </span>
            <h3 className="mt-6 text-2xl">Glass card</h3>
            <p className="mt-2 text-muted">Blurred navy glass, hairline border, soft shadow, 20px radius.</p>
          </div>
          <div className="rounded-card border border-gold/25 bg-gradient-to-br from-navy-2/80 via-navy to-ink p-8">
            <h3 className="text-2xl">Feature panel</h3>
            <p className="mt-2 text-muted">Gold-edged gradient used for calls to action.</p>
          </div>
          <div className="space-y-4 rounded-card border border-ivory/10 p-8">
            <label className="label" htmlFor="ds-field">
              Form field
            </label>
            <input id="ds-field" className="field" placeholder="you@example.com" />
            <PlaceholderTag />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
        </div>
        <div className="hairline mt-10" />
      </Block>
    </main>
  );
}
