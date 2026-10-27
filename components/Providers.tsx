"use client";

import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * App-wide motion setup:
 *  - Framer Motion honours prefers-reduced-motion (reducedMotion="user")
 *  - Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
 *  - In-page anchor links scroll smoothly with an offset for the sticky nav
 */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // The admin panel uses native scrolling
    if (window.location.pathname.startsWith("/admin")) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const navOffset = () => -(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 76) + 1;

    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;

    if (!reduce) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const id = a.getAttribute("href")!;
      const target = id === "#" || id === "#top" ? document.body : document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target === document.body ? 0 : target, { offset: navOffset(), duration: 1.4 });
      else window.scrollTo({ top: target === document.body ? 0 : target.getBoundingClientRect().top + window.scrollY + navOffset() });
      history.replaceState(null, "", id === "#" ? " " : id);
      // Move focus for keyboard and screen-reader users
      if (target !== document.body) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Pause/resume smooth scroll while overlays (menu, modal) are open. */
export function setScrollLocked(locked: boolean) {
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) (locked ? lenis.stop() : lenis.start());
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
