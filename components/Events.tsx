"use client";

import { useEffect, useState } from "react";
import { upcomingEvents, type EventItem } from "@/lib/content";
import { eventDate, eventDay, eventMonth, eventTimeRange } from "@/lib/format";
import { downloadIcs } from "@/lib/ics";
import { Icon } from "./ui/Icon";
import { MagneticButton } from "./ui/MagneticButton";
import { Reveal, RevealGroup } from "./ui/Reveal";
import { PlaceholderTag, SectionHeading } from "./ui/SectionHeading";

function useCountdown(target: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(target).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

function Countdown({ target }: { target: string }) {
  const ms = useCountdown(target);
  const parts =
    ms === null
      ? null
      : [
          ["Days", Math.floor(ms / 86_400_000)],
          ["Hours", Math.floor(ms / 3_600_000) % 24],
          ["Mins", Math.floor(ms / 60_000) % 60],
          ["Secs", Math.floor(ms / 1000) % 60],
        ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-live="off" aria-label="Time until the event starts">
      {(parts ?? [["Days"], ["Hours"], ["Mins"], ["Secs"]]).map(([label, value]) => (
        <div key={label as string} className="rounded-2xl border border-ivory/10 bg-ink/60 px-2 py-4 text-center">
          {value === undefined ? (
            <span className="skeleton mx-auto block h-9 w-10 rounded-md" />
          ) : (
            <span className="block font-serif text-4xl tabular-nums text-ivory md:text-5xl">{String(value).padStart(2, "0")}</span>
          )}
          <span className="mt-1 block text-[0.7rem] uppercase tracking-[0.2em] text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Meta({ event }: { event: EventItem }) {
  return (
    <ul className="space-y-2 text-sm text-muted">
      <li className="flex items-center gap-2.5">
        <Icon name="clock" className="h-4 w-4 shrink-0 text-gold" />
        <span>
          <span className="sr-only">Date: </span>
          {eventDate(event.start)} · {eventTimeRange(event.start, event.end)}
        </span>
      </li>
      {event.venue && (
        <li className="flex items-center gap-2.5">
          <Icon name="pin" className="h-4 w-4 shrink-0 text-gold" />
          {event.venue}
        </li>
      )}
      {event.online && (
        <li className="flex items-center gap-2.5">
          <Icon name="globe" className="h-4 w-4 shrink-0 text-gold" />
          {event.onlineLabel ?? "Online"}
        </li>
      )}
      <li className="flex items-center gap-2.5">
        <Icon name="user" className="h-4 w-4 shrink-0 text-gold" />
        {event.speakers.join(", ")}
      </li>
    </ul>
  );
}

function Actions({ event, primary = false }: { event: EventItem; primary?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {event.registerUrl &&
        (primary ? (
          <MagneticButton href={event.registerUrl} external={event.registerUrl.startsWith("http")}>
            Register
            <Icon name="arrowRight" className="h-4 w-4" />
          </MagneticButton>
        ) : (
          <a href={event.registerUrl} className="btn-secondary !min-h-[44px] !px-5 text-sm">
            Register
          </a>
        ))}
      <button type="button" onClick={() => downloadIcs(event)} className="btn-ghost text-sm" aria-label={`Add ${event.title} to calendar`}>
        <Icon name="calendar" className="h-4 w-4" />
        Add to Calendar
      </button>
    </div>
  );
}

export function Events({ initial }: { initial: EventItem[] }) {
  // Server passes the list filtered at render time; re-filter in the browser so
  // events that ended since the page was cached disappear.
  const [list, setList] = useState(initial);
  useEffect(() => {
    const update = () => setList(upcomingEvents(initial));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [initial]);

  const [next, ...rest] = list;

  return (
    <section id="events" aria-labelledby="events-title" className="relative py-24 md:py-36">
      <div className="absolute inset-x-0 top-0 hairline" />
      <div className="container">
        <SectionHeading
          id="events-title"
          eyebrow="Upcoming Events"
          title={
            <>
              Gather, grow, <em className="text-gold-gradient">encounter</em>
            </>
          }
          intro="Join in person in Abuja or online from anywhere in the world."
        />

        {!next ? (
          <Reveal standalone className="card p-10 text-center">
            <Icon name="calendar" className="mx-auto h-10 w-10 text-gold" />
            <p className="mt-4 font-serif text-2xl">New events are coming soon</p>
            <p className="mt-2 text-muted">Subscribe below to hear first when they're announced.</p>
          </Reveal>
        ) : (
          <>
            <Reveal standalone>
              <article className="card grid gap-8 p-7 md:p-10 lg:grid-cols-2 lg:gap-14" aria-labelledby={`ev-${next.id}`}>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-on-gold">Next event</span>
                    {next.placeholder && <PlaceholderTag />}
                  </div>
                  <h3 id={`ev-${next.id}`} className="mt-6 text-4xl md:text-5xl">
                    {next.title}
                  </h3>
                  <p className="mt-4 max-w-prose leading-relaxed text-muted">{next.description}</p>
                  <div className="mt-6">
                    <Meta event={next} />
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-8">
                  <Countdown target={next.start} />
                  <Actions event={next} primary />
                </div>
              </article>
            </Reveal>

            {rest.length > 0 && (
              <RevealGroup as="ul" className="mt-6 grid gap-6 md:grid-cols-2">
                {rest.map((ev) => (
                  <Reveal as="li" key={ev.id}>
                    <article className="card flex h-full gap-6 p-6 md:p-8" aria-labelledby={`ev-${ev.id}`}>
                      <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-gold/30 bg-gold/10" aria-hidden="true">
                        <span className="text-xs font-bold tracking-[0.18em] text-gold">{eventMonth(ev.start)}</span>
                        <span className="font-serif text-3xl leading-none text-ivory">{eventDay(ev.start)}</span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 id={`ev-${ev.id}`} className="text-2xl">
                            {ev.title}
                          </h3>
                          {ev.placeholder && <PlaceholderTag />}
                        </div>
                        <p className="mt-2 line-clamp-2 text-muted">{ev.description}</p>
                        <div className="mt-4">
                          <Meta event={ev} />
                        </div>
                        <div className="mt-auto pt-5">
                          <Actions event={ev} />
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </RevealGroup>
            )}
          </>
        )}
      </div>
    </section>
  );
}
