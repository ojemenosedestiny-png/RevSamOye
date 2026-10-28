"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Trigger once the top edge is a little way into the screen. A fraction of the element's own
// height ("amount: 0.2") never triggers for long stacked lists on phones, leaving them blank.
const VIEWPORT = { once: true, amount: "some", margin: "0px 0px -12% 0px" } as const;

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

type Props = { children: ReactNode; className?: string; as?: "div" | "ul" | "li" | "header" | "article" };

/** Fades and rises its children in sequence when scrolled into view. */
export function RevealGroup({ children, className, as = "div" }: Props) {
  const M = motion[as];
  return (
    <M data-reveal="" className={className} variants={group} initial="hidden" whileInView="show" viewport={VIEWPORT}>
      {children}
    </M>
  );
}

/** A child of RevealGroup — or standalone, in which case it reveals itself. */
export function Reveal({ children, className, as = "div", standalone = false }: Props & { standalone?: boolean }) {
  const M = motion[as];
  const own = standalone ? { initial: "hidden", whileInView: "show", viewport: VIEWPORT } : {};
  return (
    <M data-reveal="" className={className} variants={item} {...own}>
      {children}
    </M>
  );
}
