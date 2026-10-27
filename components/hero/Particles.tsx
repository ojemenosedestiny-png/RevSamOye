"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; phase: number };

/** Slow drifting points of gold light. Pauses off-screen; disabled for reduced motion. */
export function Particles({ count = 70 }: { count?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0, visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const n = window.innerWidth < 768 ? Math.round(count * 0.5) : count;

    const resize = () => {
      w = c.offsetWidth;
      h = c.offsetHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (anywhere: boolean): P => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(Math.random() * 0.25 + 0.06),
      a: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
    });

    resize();
    const ps: P[] = Array.from({ length: n }, () => spawn(true));

    // One pre-rendered glow sprite, tinted with the theme's gold, instead of a new gradient per dot per frame
    const sprite = document.createElement("canvas");
    const paintSprite = () => {
      const rgb = getComputedStyle(document.documentElement).getPropertyValue("--c-gold-bright").trim().split(/\s+/).join(",");
      sprite.width = sprite.height = 64;
      const sx = sprite.getContext("2d")!;
      const g = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, `rgba(${rgb},1)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      sx.fillStyle = g;
      sx.fillRect(0, 0, 64, 64);
    };
    paintSprite();
    const themeWatch = new MutationObserver(paintSprite);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.vx + Math.sin(t / 3000 + p.phase) * 0.08;
        p.y += p.vy;
        if (p.y < -10) Object.assign(p, spawn(false));
        ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(t / 900 + p.phase));
        const d = p.r * 12;
        ctx.drawImage(sprite, p.x - d / 2, p.y - d / 2, d, d);
      }
      if (visible) raf = requestAnimationFrame(draw);
    };
    // Start once the page is idle so the particles never compete with first paint
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
    let started = false;
    const start = () => {
      started = true;
      if (visible) raf = requestAnimationFrame(draw);
    };
    const idleId = idle(start, { timeout: 1500 });

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && started) raf = requestAnimationFrame(draw);
    });
    io.observe(c);
    window.addEventListener("resize", resize);

    return () => {
      (window.cancelIdleCallback ?? window.clearTimeout)(idleId);
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={canvas} className="hero-particles pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
