"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { testimonies } from "@/lib/content";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { PlaceholderTag, SectionHeading } from "./ui/SectionHeading";

export function Testimonies() {
  const items = testimonies.items;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (paused || reduce || items.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % items.length), 7000);
    return () => clearInterval(id);
  }, [paused, reduce, items.length]);

  if (!items.length) return null;
  const go = (d: number) => setI((n) => (n + d + items.length) % items.length);
  const t = items[i];

  return (
    <section aria-labelledby="testimonies-title" className="relative py-24 md:py-36">
      <div className="absolute inset-x-0 top-0 hairline" />
      <div className="container">
        <SectionHeading
          id="testimonies-title"
          eyebrow="Testimonies"
          title={
            <>
              Lives <em className="text-gold-gradient">transformed</em>
            </>
          }
          align="center"
          aside={testimonies.placeholder ? <div className="flex justify-center"><PlaceholderTag>Placeholder testimonies — replace</PlaceholderTag></div> : null}
        />

        <Reveal standalone>
          <div
            className="relative mx-auto max-w-4xl text-center"
            role="region"
            aria-roledescription="carousel"
            aria-label="Testimonies"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <Icon name="quote" className="mx-auto h-12 w-12 text-gold/60" />
            <div className="relative mt-6 grid min-h-[220px] place-items-center" aria-live={paused ? "polite" : "off"}>
              <AnimatePresence mode="wait">
                <motion.figure
                  key={i}
                  data-reveal=""
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${items.length}`}
                >
                  <blockquote className="font-serif text-2xl leading-snug text-ivory md:text-4xl">“{t.quote}”</blockquote>
                  <figcaption className="mt-8">
                    <span className="font-semibold text-ivory">{t.name}</span>
                    <span className="mt-1 block text-sm text-muted">{t.context}</span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6">
              <button type="button" onClick={() => go(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-ivory/15 text-ivory transition-colors hover:border-gold hover:text-gold" aria-label="Previous testimony">
                <Icon name="arrowLeft" className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                {items.map((_, n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setI(n)}
                    aria-label={`Show testimony ${n + 1}`}
                    aria-current={n === i}
                    className="grid h-6 w-6 place-items-center"
                  >
                    <span className={`block h-1.5 rounded-full transition-all duration-500 ${n === i ? "w-6 bg-gold" : "w-1.5 bg-ivory/30"}`} />
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => go(1)} className="grid h-12 w-12 place-items-center rounded-full border border-ivory/15 text-ivory transition-colors hover:border-gold hover:text-gold" aria-label="Next testimony">
                <Icon name="arrowRight" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
