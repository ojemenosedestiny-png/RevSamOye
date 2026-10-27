"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { site } from "@/lib/content";
import { Icon, type IconName } from "./ui/Icon";

const tiles: [string, IconName][] = [
  ["Teachings", "book"],
  ["Podcasts", "mic"],
  ["Live events", "play"],
  ["Masterclasses", "compass"],
  ["Sessions", "user"],
  ["Community", "globe"],
];

/** Illustrative app screen built in CSS — swap for a real screenshot when available. */
export function PhoneMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [8, -6]);
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <div ref={ref} className="relative mx-auto flex w-full max-w-sm justify-center [perspective:1400px]">
      <div className="absolute inset-10 rounded-full bg-gold/25 blur-[90px]" aria-hidden="true" />
      <motion.div
        style={{ rotateY: rotate, y }}
        className="relative w-[280px] rounded-[3rem] border border-ivory/15 bg-gradient-to-b from-navy-2 to-ink p-3 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)]"
        role="img"
        aria-label="Illustration of the Sam Oye Global app home screen"
      >
        <div className="relative overflow-hidden rounded-[2.4rem] bg-ink" aria-hidden="true">
          <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="bg-[radial-gradient(120%_70%_at_50%_0%,rgb(var(--c-navy-2)),rgb(var(--c-ink)))] px-5 pb-6 pt-12">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-gold">Welcome</p>
            <p className="mt-1 font-serif text-2xl text-ivory">{site.app.name}</p>
            <div className="mt-5 overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/30 to-gold-deep/10 p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5484D] px-2 py-0.5 text-[0.6rem] font-bold uppercase text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live
              </span>
              <p className="mt-3 font-serif text-lg leading-tight text-ivory">Today's teaching</p>
              <div className="mt-3 h-1 w-full rounded-full bg-ivory/15">
                <div className="h-1 w-2/5 rounded-full bg-gold" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {tiles.map(([label, icon]) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-ivory/10 bg-ivory/[0.04] py-3">
                  <Icon name={icon} className="h-4 w-4 text-gold-bright" />
                  <span className="text-[0.6rem] text-ivory/80">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2.5">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-ivory/[0.04] p-2.5">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-gold/40 to-navy-2" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 w-3/4 rounded bg-ivory/25" />
                    <div className="h-2 w-1/2 rounded bg-ivory/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      <span className="placeholder-tag absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">Illustrative — replace with app screenshot</span>
    </div>
  );
}
