"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Cloudflare Turnstile widget. Renders nothing when no site key is configured. */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !el.current) return;
    let id: string | undefined;
    const render = () => {
      if (!window.turnstile || !el.current) return;
      id = window.turnstile.render(el.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: onToken,
        "expired-callback": () => onToken(""),
      });
    };
    if (window.turnstile) render();
    else {
      let s = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
      if (!s) {
        s = document.createElement("script");
        s.src = SRC;
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", render);
    }
    return () => {
      if (id) window.turnstile?.remove(id);
    };
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={el} className="min-h-[65px]" />;
}
