"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { isoToWatInput, watInputToIso, type AdminEvent } from "@/lib/admin-types";
import { api, fmtDateTime } from "./api";
import { EmptyState, Notice, PageHeader, Panel, Spinner, TableSkeleton, btnSmDanger, btnSmGold, btnSmLine } from "./ui";

type Draft = {
  title: string;
  start: string;
  end: string;
  venue: string;
  online: boolean;
  online_label: string;
  description: string;
  speakers: string;
  register_url: string;
  published: boolean;
};

const blank: Draft = {
  title: "",
  start: "",
  end: "",
  venue: "",
  online: false,
  online_label: "",
  description: "",
  speakers: "Rev. Dr. Sam Oye",
  register_url: "",
  published: true,
};

const toDraft = (e: AdminEvent): Draft => ({
  title: e.title,
  start: isoToWatInput(e.start_at),
  end: isoToWatInput(e.end_at),
  venue: e.venue ?? "",
  online: e.online,
  online_label: e.online_label ?? "",
  description: e.description,
  speakers: e.speakers.join(", "),
  register_url: e.register_url ?? "",
  published: e.published,
});

export function EventsManager() {
  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AdminEvent | "new" | null>(null);

  const load = useCallback(async () => {
    try {
      setError("");
      setEvents((await api<{ events: AdminEvent[] }>("/api/admin/events")).events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load events.");
      setEvents([]);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const now = Date.now();
  const upcoming = (events ?? []).filter((e) => Date.parse(e.end_at) > now).reverse();
  const past = (events ?? []).filter((e) => Date.parse(e.end_at) <= now);

  return (
    <>
      <PageHeader
        title="Events"
        intro="Events you add here replace the sample events on the website. Past events drop off the site automatically."
        actions={
          <button onClick={() => setEditing("new")} className={btnSmGold} disabled={Boolean(error)}>
            <Icon name="calendar" className="h-4 w-4" /> Add event
          </button>
        }
      />
      {error && (
        <div className="mb-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {editing && (
        <EventForm
          key={editing === "new" ? "new" : editing.id}
          event={editing === "new" ? null : editing}
          onDone={() => {
            setEditing(null);
            load();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {events === null ? (
        <TableSkeleton rows={3} />
      ) : events.length === 0 && !error ? (
        <EmptyState title="No events yet">Add your first event — it will appear on the website straight away, with a countdown if it's the next one.</EmptyState>
      ) : (
        <div className="space-y-10">
          <EventList title="Upcoming" items={upcoming} onEdit={setEditing} />
          {past.length > 0 && <EventList title="Past" items={past} onEdit={setEditing} muted />}
        </div>
      )}
    </>
  );
}

function EventList({ title, items, onEdit, muted }: { title: string; items: AdminEvent[]; onEdit: (e: AdminEvent) => void; muted?: boolean }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        {title} <span className="text-muted">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="text-muted">None.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((e) => (
            <li key={e.id} className={`flex flex-col gap-3 rounded-xl border border-ivory/10 bg-navy/50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${muted ? "opacity-70" : ""}`}>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-medium text-ivory">
                  {e.title}
                  {!e.published && <span className="rounded-full bg-ivory/10 px-2 py-0.5 text-xs text-muted">Hidden</span>}
                </p>
                <p className="text-sm text-muted">
                  {fmtDateTime(e.start_at)} WAT · {[e.venue, e.online ? e.online_label || "Online" : ""].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button onClick={() => onEdit(e)} className={btnSmLine}>
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EventForm({ event, onDone, onCancel }: { event: AdminEvent | null; onDone: () => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(event ? toDraft(event) : blank);
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [error, setError] = useState("");
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!d.start || !d.end) return setError("Add a start and end time.");
    setBusy("save");
    setError("");
    const body = {
      title: d.title,
      start_at: watInputToIso(d.start),
      end_at: watInputToIso(d.end),
      venue: d.venue.trim() || null,
      online: d.online,
      online_label: d.online ? d.online_label.trim() || null : null,
      description: d.description,
      speakers: d.speakers.split(",").map((s) => s.trim()).filter(Boolean),
      register_url: d.register_url.trim() || null,
      published: d.published,
    };
    try {
      await api(event ? `/api/admin/events?id=${event.id}` : "/api/admin/events", { method: event ? "PATCH" : "POST", body });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!event || !window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setBusy("delete");
    try {
      await api(`/api/admin/events?id=${event.id}`, { method: "DELETE" });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete.");
      setBusy(null);
    }
  };

  return (
    <Panel className="mb-8 p-6">
      <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
        <h2 className="text-2xl md:col-span-2">{event ? "Edit event" : "New event"}</h2>
        <label className="md:col-span-2">
          <span className="label">Title</span>
          <input className="field" required maxLength={160} value={d.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label>
          <span className="label">Starts (West Africa Time)</span>
          <input className="field [color-scheme:dark]" type="datetime-local" required value={d.start} onChange={(e) => set("start", e.target.value)} />
        </label>
        <label>
          <span className="label">Ends (West Africa Time)</span>
          <input className="field [color-scheme:dark]" type="datetime-local" required min={d.start || undefined} value={d.end} onChange={(e) => set("end", e.target.value)} />
        </label>
        <label>
          <span className="label">Venue</span>
          <input className="field" maxLength={200} placeholder="e.g. The Transforming Church, Abuja" value={d.venue} onChange={(e) => set("venue", e.target.value)} />
        </label>
        <div>
          <label className="flex min-h-[48px] items-center gap-3 text-sm text-ivory/90 md:mt-7">
            <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--c-gold))]" checked={d.online} onChange={(e) => set("online", e.target.checked)} />
            Also online / streaming
          </label>
          {d.online && (
            <input className="field mt-2" maxLength={120} placeholder="e.g. Live on YouTube & the Sam Oye Global app" value={d.online_label} onChange={(e) => set("online_label", e.target.value)} aria-label="Where to watch online" />
          )}
        </div>
        <label className="md:col-span-2">
          <span className="label">Short description</span>
          <textarea className="field min-h-[90px]" maxLength={1000} value={d.description} onChange={(e) => set("description", e.target.value)} />
        </label>
        <label>
          <span className="label">Speakers (separate with commas)</span>
          <input className="field" value={d.speakers} onChange={(e) => set("speakers", e.target.value)} />
        </label>
        <label>
          <span className="label">Registration link (optional)</span>
          <input className="field" type="url" inputMode="url" placeholder="https://…" value={d.register_url} onChange={(e) => set("register_url", e.target.value)} />
        </label>
        <label className="flex items-center gap-3 text-sm text-ivory/90 md:col-span-2">
          <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--c-gold))]" checked={d.published} onChange={(e) => set("published", e.target.checked)} />
          Show on the website
        </label>

        {error && (
          <div className="md:col-span-2">
            <Notice tone="error">{error}</Notice>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ivory/10 pt-5 md:col-span-2">
          {event ? (
            <button type="button" onClick={remove} className={btnSmDanger} disabled={busy !== null}>
              {busy === "delete" && <Spinner />} Delete event
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className={btnSmLine}>
              Cancel
            </button>
            <button type="submit" className={btnSmGold} disabled={busy !== null}>
              {busy === "save" ? <Spinner /> : <Icon name="check" className="h-4 w-4" />} {event ? "Save changes" : "Add event"}
            </button>
          </div>
        </div>
      </form>
    </Panel>
  );
}
