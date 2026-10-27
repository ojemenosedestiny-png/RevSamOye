import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { PageHeader, Panel } from "@/components/admin/ui";
import type { Booking } from "@/lib/admin-types";
import { countRows, dbConfigured, selectRows } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

async function loadStats() {
  if (!dbConfigured()) return null;
  try {
    const now = new Date().toISOString();
    const [newBookings, totalBookings, subscribers, upcoming, recent] = await Promise.all([
      countRows("counseling_requests", "status=eq.new"),
      countRows("counseling_requests"),
      countRows("newsletter_subscribers"),
      countRows("events", `end_at=gt.${encodeURIComponent(now)}&published=eq.true`),
      selectRows<Booking>("counseling_requests", "select=id,created_at,full_name,counseling_type,mode,status&order=created_at.desc&limit=5"),
    ]);
    return { newBookings, totalBookings, subscribers, upcoming, recent };
  } catch (err) {
    console.error("[admin:dashboard]", err instanceof Error ? err.message : err);
    return "error" as const;
  }
}

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(iso));

export default async function Dashboard() {
  const stats = await loadStats();
  const env = process.env;
  const checklist: [string, boolean, string][] = [
    ["Admin password", Boolean(env.ADMIN_PASSWORD), "ADMIN_PASSWORD"],
    ["Separate session secret", Boolean(env.ADMIN_SESSION_SECRET), "ADMIN_SESSION_SECRET (recommended)"],
    ["Database & file storage (Supabase)", dbConfigured(), "SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"],
    ["Booking emails (Resend)", Boolean(env.RESEND_API_KEY && env.EMAIL_FROM && env.MINISTRY_EMAIL), "RESEND_API_KEY, EMAIL_FROM, MINISTRY_EMAIL"],
    ["Spam protection (Turnstile)", Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY), "Optional — TURNSTILE keys"],
    ["Public site address", Boolean(env.NEXT_PUBLIC_SITE_URL), "NEXT_PUBLIC_SITE_URL"],
  ];

  const cards =
    stats && stats !== "error"
      ? [
          ["New bookings", stats.newBookings, "/admin/bookings", "calendar"],
          ["All bookings", stats.totalBookings, "/admin/bookings", "user"],
          ["Subscribers", stats.subscribers, "/admin/subscribers", "mail"],
          ["Upcoming events", stats.upcoming, "/admin/events", "clock"],
        ] as const
      : null;

  return (
    <>
      <PageHeader title="Welcome back" intro="Manage counseling bookings, the photos and video on the website, events and newsletter subscribers." />

      {!stats && (
        <Panel className="mb-8 p-6">
          <p className="font-semibold text-gold-bright">Connect the database to start</p>
          <p className="mt-2 text-muted">
            Bookings, uploads and events are stored in Supabase. Add <code className="text-ivory">SUPABASE_URL</code> and{" "}
            <code className="text-ivory">SUPABASE_SERVICE_ROLE_KEY</code> to the environment and run <code className="text-ivory">supabase/schema.sql</code>. See the README.
          </p>
        </Panel>
      )}
      {stats === "error" && (
        <Panel className="mb-8 p-6">
          <p className="font-semibold text-[#F4ADA6]">Couldn't reach the database</p>
          <p className="mt-2 text-muted">Check the Supabase keys and that supabase/schema.sql has been run.</p>
        </Panel>
      )}

      {cards && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, href, icon]) => (
            <li key={label}>
              <Link href={href} className="card block p-6 transition-colors hover:border-gold/40">
                <Icon name={icon} className="h-5 w-5 text-gold" />
                <p className="mt-4 font-serif text-5xl text-ivory">{value}</p>
                <p className="mt-1 text-sm text-muted">{label}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        {stats && stats !== "error" && (
          <Panel className="p-6 xl:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">Latest bookings</h2>
              <Link href="/admin/bookings" className="text-sm font-semibold text-gold hover:text-gold-bright">
                View all →
              </Link>
            </div>
            {stats.recent.length === 0 ? (
              <p className="mt-6 text-muted">No bookings yet. They'll appear here as soon as someone submits the counseling form.</p>
            ) : (
              <ul className="mt-4 divide-y divide-ivory/10">
                {stats.recent.map((b) => (
                  <li key={b.id}>
                    <Link href={`/admin/bookings?open=${b.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-gold-bright">
                      <span>
                        <span className="block font-medium text-ivory">{b.full_name}</span>
                        <span className="text-sm text-muted">
                          {b.counseling_type} · {b.mode} · {fmt(b.created_at)}
                        </span>
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${b.status === "new" ? "bg-gold text-ink" : "bg-ivory/10 text-muted"}`}>
                        {b.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}

        <Panel className="p-6 xl:col-span-2">
          <h2 className="text-2xl">Setup checklist</h2>
          <ul className="mt-4 space-y-3">
            {checklist.map(([label, ok, hint]) => (
              <li key={label} className="flex gap-3">
                <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${ok ? "bg-emerald-400/15 text-emerald-300" : "bg-ivory/10 text-muted"}`}>
                  <Icon name={ok ? "check" : "close"} className="h-3.5 w-3.5" />
                </span>
                <span>
                  <span className={`block text-sm font-medium ${ok ? "text-ivory" : "text-ivory/80"}`}>{label}</span>
                  {!ok && <span className="block text-xs text-muted">{hint}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
