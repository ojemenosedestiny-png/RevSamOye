import type { ReactNode } from "react";
import { Reveal, RevealGroup } from "./Reveal";

type Props = {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  id?: string;
  aside?: ReactNode;
};

export function SectionHeading({ eyebrow, title, intro, align = "left", id, aside }: Props) {
  const center = align === "center";
  return (
    <RevealGroup as="header" className={`mb-12 md:mb-16 ${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      <Reveal>
        <p className={`eyebrow ${center ? "justify-center" : ""}`}>{eyebrow}</p>
      </Reveal>
      <Reveal>
        <h2 id={id} className="mt-5 text-display-lg">
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal>
          <p className={`mt-5 text-lg leading-relaxed text-muted ${center ? "mx-auto" : ""} max-w-prose`}>{intro}</p>
        </Reveal>
      )}
      {aside && <Reveal className="mt-5">{aside}</Reveal>}
    </RevealGroup>
  );
}

export function PlaceholderTag({ children = "Placeholder" }: { children?: ReactNode }) {
  return <span className="placeholder-tag">{children}</span>;
}

/** Tasteful stand-in for a photo that hasn't been supplied yet. */
export function ImagePlaceholder({ file, label, className = "" }: { file: string; label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} (photo to be supplied)`}
      className={`relative flex items-end overflow-hidden bg-gradient-to-br from-navy-2 via-navy to-ink ${className}`}
    >
      <div className="absolute inset-0 opacity-60 [background:radial-gradient(60%_50%_at_50%_30%,rgb(var(--c-gold)/0.18),transparent)]" />
      <svg viewBox="0 0 200 240" className="absolute inset-x-0 bottom-0 mx-auto h-4/5 w-auto text-ivory/[0.06]" aria-hidden="true">
        <circle cx="100" cy="80" r="44" fill="currentColor" />
        <path d="M20 240c0-50 36-90 80-90s80 40 80 90Z" fill="currentColor" />
      </svg>
      <div className="relative m-4 flex flex-col gap-1 rounded-xl border border-dashed border-gold/50 bg-ink/70 px-3 py-2 text-xs backdrop-blur">
        <span className="font-semibold uppercase tracking-[0.18em] text-gold-bright">Replace photo</span>
        <span className="font-mono text-muted">/public{file}</span>
      </div>
    </div>
  );
}
