"use client";

import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

/**
 * App-wide motion setup:
 *  - Framer Motion honours prefers-reduced-motion (reducedMotion="user")
 *  - Lenis smooth scroll (its own requestAnimationFrame loop)
 *  - In-page anchor links scroll smoothly with an offset for the sticky nav
 */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Scripts are running, so the CSS fallback for scroll reveals is no longer needed
    document.documentElement.classList.add("hydrated");
    // The admin panel uses native scrolling
    if (window.location.pathname.startsWith("/admin")) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const navOffset = () => -(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 76) + 1;

    let lenis: Lenis | null = null;

    if (!reduce) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, autoRaf: true });
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
