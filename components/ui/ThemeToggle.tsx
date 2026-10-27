"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

type Theme = "light" | "dark";

/** Sun/moon switch. The initial theme is set before paint by the inline script in app/layout.tsx. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.dataset.theme === "light" ? "light" : "dark");
    // Follow the device setting until the visitor makes a choice
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("theme");
      } catch {}
      if (saved) return;
      const next: Theme = mq.matches ? "light" : "dark";
      root.dataset.theme = next;
      setTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const flip = () => {
    const root = document.documentElement;
    const next: Theme = theme === "light" ? "dark" : "light";
    root.classList.add("theme-fade");
    root.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]:not([media])')?.setAttribute("content", next === "light" ? "#FAF7F0" : "#060914");
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
    window.setTimeout(() => root.classList.remove("theme-fade"), 400);
  };

  const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  return (
    <button
      type="button"
      onClick={flip}
      aria-label={label}
      title={label}
      className={`grid h-11 w-11 place-items-center rounded-full border border-ivory/15 text-ivory transition-colors hover:border-gold/60 hover:text-gold ${className}`}
    >
      {/* Both icons render on the server; CSS shows the right one, so there's no flicker before hydration */}
      <Icon name="sun" className="theme-icon-light h-[18px] w-[18px]" />
      <Icon name="moon" className="theme-icon-dark h-[18px] w-[18px]" />
    </button>
  );
}
