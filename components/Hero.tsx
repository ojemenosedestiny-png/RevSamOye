"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { bio } from "@/lib/content";
import { KineticHeadline } from "./hero/KineticHeadline";
import { Particles } from "./hero/Particles";
import { RotatingWords } from "./hero/RotatingWords";
import { Icon } from "./ui/Icon";
import { MagneticButton } from "./ui/MagneticButton";

const EASE = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: EASE, delay },
});

export function Hero({ portrait }: { portrait: { src: string; alt: string } }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section id="top" ref={ref} aria-label="Introduction" className="grain relative isolate flex min-h-[100svh] items-center overflow-hidden pb-16 pt-32 lg:pt-28">
      {/* Atmosphere */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_80%_0%,rgb(var(--c-navy-2))_0%,rgb(var(--c-ink))_60%)]" />
      <div className="light-rays absolute inset-0 -z-10" />
      <motion.div style={{ y: glowY }} className="absolute right-[5%] top-[12%] -z-10 h-[38rem] w-[38rem] rounded-full bg-gold/10 blur-[120px]" />
      <Particles />

      <div className="container grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <motion.div style={{ y: textY }} className="lg:col-span-7">
          <motion.p {...fadeUp(0.1)} className="eyebrow">
            {bio.role} · {bio.location}
          </motion.p>

          <KineticHeadline
            text="Raising Transformed Lives for Global Impact"
            accent={["Transformed"]}
            className="mt-7 text-display-xl"
          />

          <motion.p {...fadeUp(1.6)} className="mt-8 flex flex-wrap items-baseline gap-x-3 text-lg text-muted md:text-xl">
            <span>Teaching on</span>
            <RotatingWords words={["Leadership", "Relationships", "Faith", "Purpose", "Transformation"]} />
          </motion.p>

          <motion.p {...fadeUp(1.75)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Founder &amp; Lead Pastor of The Transforming Church, Abuja, and Convener of Prophetic Prayer Hour.
          </motion.p>

          <motion.div {...fadeUp(1.9)} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <MagneticButton href="#counseling">
              Book a Counseling Session
              <Icon name="arrowRight" className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton href="#watch" variant="secondary">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/15 text-gold-bright">
                <Icon name="play" className="h-3.5 w-3.5" />
              </span>
              Watch Message
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Portrait with parallax */}
        <motion.div
          className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none"
          initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.4 }}
        >
          <div className="absolute -inset-6 rounded-[2.5rem] bg-[conic-gradient(from_140deg,transparent,rgb(var(--c-gold)/0.35),transparent_40%)] blur-2xl" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-gold/25 shadow-glow">
            <motion.div style={{ y: portraitY }} className="absolute -inset-y-[10%] inset-x-0">
              <Image
                src={portrait.src}
                alt={portrait.alt}
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover object-[50%_20%]"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
            <div className="absolute inset-x-5 bottom-5">
              <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-bright">
                  <Icon name="prayer" />
                </span>
                <div className="text-sm leading-snug">
                  <p className="font-semibold text-ivory">Prophetic Prayer Hour</p>
                  <p className="text-muted">Online prayer with a global audience</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <a
        href="#about"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:text-gold md:flex"
        aria-label="Scroll to About"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-ivory/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-gold"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </a>
    </section>
  );
}
