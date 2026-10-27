"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";

type Props = {
  text: string;
  /** Words rendered in gold italic; the first one receives the hand-drawn underline. */
  accent?: string[];
  className?: string;
};

// useLayoutEffect warns during SSR; this component only animates in the browser.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : () => {};

/**
 * Letters fly in from scattered positions, sharpen from a blur and lock into place,
 * then a gold underline draws itself beneath the accent word.
 */
export function KineticHeadline({ text, accent = [], className = "" }: Props) {
  const root = useRef<HTMLHeadingElement>(null);
  const words = text.split(" ");
  const underlineWord = accent[0];

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>(".kinetic-char");
    const line = el.querySelector<SVGPathElement>(".kinetic-underline");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(chars, { opacity: 1 });
        return;
      }
      const r = gsap.utils.random;
      const tl = gsap.timeline({ delay: 0.25 });
      tl.fromTo(
        chars,
        {
          opacity: 0,
          x: () => r(-260, 260),
          y: () => r(-180, 180),
          rotate: () => r(-75, 75),
          scale: () => r(0.3, 1.8),
          filter: "blur(14px)",
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.5,
          ease: "expo.out",
          stagger: { each: 0.022, from: "random" },
          clearProps: "filter,transform",
        },
      );
      if (line) {
        const len = line.getTotalLength();
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(line, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, "-=0.35");
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <h1 ref={root} className={className} aria-label={text}>
      {words.map((word, wi) => {
        const isAccent = accent.includes(word);
        return (
          <span key={wi} aria-hidden="true" className="inline-block whitespace-nowrap">
            <span className={`relative inline-block ${isAccent ? "font-semibold italic text-gold-bright" : ""}`}>
              {Array.from(word).map((ch, ci) => (
                <span key={ci} className="kinetic-char inline-block will-change-transform">
                  {ch}
                </span>
              ))}
              {word === underlineWord && (
                <svg
                  className="pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.3em] w-full overflow-visible text-gold"
                  viewBox="0 0 300 20"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    className="kinetic-underline"
                    d="M3 14C60 6 140 3 297 9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
            {wi < words.length - 1 && " "}
          </span>
        );
      })}
    </h1>
  );
}
