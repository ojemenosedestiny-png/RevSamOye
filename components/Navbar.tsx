"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/content";
import { setScrollLocked } from "./Providers";
import { Icon } from "./ui/Icon";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const firstLink = useRef<HTMLAnchorElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view
  useEffect(() => {
    const sections = site.nav.map((n) => document.querySelector(n.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setScrollLocked(open);
    if (open) firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out ${
          scrolled ? "glass border-x-0 border-t-0 !border-b-ivory/10 py-3" : "border-b border-transparent py-5"
        }`}
      >
        <nav className="container flex items-center justify-between gap-6" aria-label="Main">
          <a href="#top" className="group flex items-center gap-3" aria-label={`${site.name} — back to top`}>
            <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 font-serif text-lg italic text-gold-bright transition-colors group-hover:bg-gold/10">
              SO
            </span>
            <span className="font-serif text-xl tracking-wide text-ivory">{site.name}</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={active === item.href ? "true" : undefined}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-ivory ${
                    active === item.href ? "text-ivory" : "text-muted"
                  }`}
                >
                  {item.label}
                  {active === item.href && (
                    <motion.span layoutId="nav-dot" className="absolute inset-x-4 -bottom-0.5 h-px bg-gold" />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a href="#app" className="btn-primary hidden !min-h-[42px] !px-5 text-sm sm:inline-flex">
              <Icon name="download" className="h-4 w-4" />
              Download the App
            </a>
            <button
              ref={toggle}
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-ivory/15 text-ivory lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            className="fixed inset-0 z-40 flex flex-col gap-8 overflow-y-auto bg-ink/95 px-6 pb-10 pt-28 backdrop-blur-xl lg:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 light-rays opacity-60" />
            <motion.ul
              className="relative flex flex-col gap-2"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
            >
              {site.nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
                >
                  <a
                    ref={i === 0 ? firstLink : undefined}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-ivory/10 py-4 font-serif text-4xl text-ivory"
                  >
                    <span className="font-sans text-xs tracking-widest text-gold">0{i + 1}</span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
            <a href="#app" onClick={() => setOpen(false)} className="btn-primary relative mt-auto">
              <Icon name="download" className="h-4 w-4" />
              Download the App
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
