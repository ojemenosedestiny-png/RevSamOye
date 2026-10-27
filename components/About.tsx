"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { bio } from "@/lib/content";
import { Icon } from "./ui/Icon";
import { Reveal, RevealGroup } from "./ui/Reveal";
import { ImagePlaceholder, PlaceholderTag } from "./ui/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

export function About({ portrait: photo }: { portrait: { src: string; alt: string } }) {
  const portraitWrap = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const { scrollYProgress } = useScroll({ target: portraitWrap, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  // Pull-quote words light up as the reader scrolls through it
  useEffect(() => {
    const el = quoteRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll(".q-word"),
        { opacity: 0.18 },
        { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" aria-labelledby="about-title" className="relative py-24 md:py-36">
      <div className="container grid gap-14 lg:grid-cols-12 lg:gap-20">
        <div ref={portraitWrap} className="lg:col-span-5">
          <Reveal standalone className="relative lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-ivory/10">
              {photo.src ? (
                <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
                  <Image src={photo.src} alt={photo.alt} fill quality={90} sizes="(min-width: 1024px) 35vw, 90vw" className="object-cover object-[45%_10%]" />
                </motion.div>
              ) : (
                <ImagePlaceholder file={bio.aboutPortrait.replaceWith} label={bio.aboutPortrait.alt} className="h-full w-full" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden rotate-[-4deg] rounded-2xl border border-gold/30 bg-ink/90 px-6 py-4 backdrop-blur md:block">
              <p className="font-script text-5xl leading-none text-gold-gradient">{bio.signature}</p>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <RevealGroup>
            <Reveal>
              <p className="eyebrow">About the Pastor</p>
            </Reveal>
            <Reveal>
              <h2 id="about-title" className="mt-5 text-display-lg">
                {bio.name}
              </h2>
            </Reveal>
            <Reveal>
              <p className="mt-3 text-lg text-gold">
                {bio.role} · {bio.location}
              </p>
            </Reveal>
            {bio.paragraphs.map((p) => (
              <Reveal key={p}>
                <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted">{p}</p>
              </Reveal>
            ))}
          </RevealGroup>

          <RevealGroup as="ul" className="mt-10 grid gap-3 sm:grid-cols-2">
            {bio.highlights.map((h) => (
              <Reveal as="li" key={h} className="glass flex gap-3 rounded-2xl p-4">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-bright">
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
                <span className="text-[0.95rem] leading-relaxed text-ivory/90">{h}</span>
              </Reveal>
            ))}
          </RevealGroup>

          <a href="#biography" className="mt-8 inline-flex items-center gap-2 font-semibold text-gold hover:text-gold-bright">
            Read the full biography
            <Icon name="arrowDown" className="h-4 w-4" />
          </a>

          <figure className="relative mt-16 border-l border-gold/40 pl-8">
            <Icon name="quote" className="absolute -left-4 -top-2 h-8 w-8 bg-ink text-gold" />
            <blockquote ref={quoteRef} className="font-serif text-display-md italic leading-snug text-ivory">
              {bio.quote.text.split(" ").map((w, i) => (
                <span key={i} className="q-word">
                  {w}{" "}
                </span>
              ))}
            </blockquote>
            <figcaption className="mt-6 flex flex-wrap items-center gap-4">
              <span className="font-script text-4xl text-gold-gradient">{bio.signature}</span>
              {bio.quote.placeholder && <PlaceholderTag>Placeholder quote — replace</PlaceholderTag>}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
