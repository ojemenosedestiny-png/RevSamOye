"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "sparkle" },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar" },
  { href: "/admin/media", label: "Photos & video", icon: "play" },
  { href: "/admin/events", label: "Events", icon: "clock" },
  { href: "/admin/subscribers", label: "Subscribers", icon: "mail" },
];

export function AdminNav() {
  const path = usePathname();
  const signOut = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  return (
    <aside className="sticky top-0 z-30 border-b border-ivory/10 bg-ink/90 backdrop-blur-xl lg:h-[100svh] lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-4 px-5 py-4 lg:flex-col lg:items-stretch lg:px-6 lg:py-8">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 font-serif text-lg italic text-gold-bright">SO</span>
          <span className="leading-tight">
            <span className="block font-serif text-lg text-ivory">Sam Oye</span>
            <span className="block text-xs uppercase tracking-[0.2em] text-gold">Admin</span>
          </span>
        </Link>
        <button onClick={signOut} className="text-sm font-semibold text-muted hover:text-gold lg:hidden">
          Sign out
        </button>
      </div>

      <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:px-4 lg:pb-0">
        <ul className="flex gap-1 lg:flex-col">
          {links.map((l) => {
            const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[44px] items-center gap-3 whitespace-nowrap rounded-xl px-4 text-sm font-medium transition-colors ${
                    active ? "bg-gold/15 text-gold-bright" : "text-muted hover:bg-ivory/5 hover:text-ivory"
                  }`}
                >
                  <Icon name={l.icon} className="h-4 w-4" />
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden space-y-1 px-4 lg:absolute lg:inset-x-0 lg:bottom-6 lg:block">
        <a href="/" target="_blank" rel="noopener" className="flex min-h-[44px] items-center gap-3 rounded-xl px-4 text-sm text-muted hover:bg-ivory/5 hover:text-ivory">
          <Icon name="globe" className="h-4 w-4" />
          View website
        </a>
        <button onClick={signOut} className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-4 text-sm text-muted hover:bg-ivory/5 hover:text-ivory">
          <Icon name="arrowLeft" className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
