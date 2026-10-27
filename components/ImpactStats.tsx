"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { stats } from "@/lib/content";
import { formatNumber } from "@/lib/format";
import { Reveal, RevealGroup } from "./ui/Reveal";
import { PlaceholderTag } from "./ui/SectionHeading";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) return setN(value);
    const controls = animate(0, value, { duration: 2.2, ease: [0.16, 1, 0.3, 1], onUpdate: setN });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(n)}
      <span className="text-gold">{suffix}</span>
    </span>
  );
}

export function ImpactStats() {
  return (
    <section aria-labelledby="impact-title" className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_50%,rgb(var(--c-navy-2)/0.7),transparent)]" />
      <div className="container">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <h2 id="impact-title" className="eyebrow">
            Impact
          </h2>
          {stats.placeholder && <PlaceholderTag>Placeholder figures — confirm before launch</PlaceholderTag>}
        </div>
        <RevealGroup as="ul" className="grid grid-cols-1 gap-px overflow-hidden rounded-card border border-ivory/10 bg-ivory/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.items.map((s) => (
            <Reveal as="li" key={s.label} className="bg-ink p-8 md:p-10">
              <p className="font-serif text-5xl text-ivory md:text-6xl">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-sm uppercase tracking-[0.16em] text-muted">{s.label}</p>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
