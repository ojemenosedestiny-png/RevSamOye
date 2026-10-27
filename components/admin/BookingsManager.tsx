"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { BOOKING_STATUSES, toCsv, type Booking, type BookingStatus } from "@/lib/admin-types";
import { api, downloadFile, fmtDate, fmtDateTime } from "./api";
import { EmptyState, Notice, PageHeader, Panel, Spinner, TableSkeleton, btnSmDanger, btnSmGold, btnSmLine } from "./ui";

const statusStyle: Record<BookingStatus, string> = {
  new: "bg-gold text-ink",
  contacted: "bg-sky-400/15 text-sky-300",
  scheduled: "bg-violet-400/15 text-violet-300",
  completed: "bg-emerald-400/15 text-emerald-300",
  archived: "bg-ivory/10 text-muted",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[status] ?? statusStyle.archived}`}>{status}</span>;
}

export function BookingsManager() {
  const openId = useSearchParams().get("open");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(openId);

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await api<{ bookings: Booking[] }>("/api/admin/bookings");
      setBookings(data.bookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load bookings.");
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings?.length ?? 0 };
    bookings?.forEach((b) => (c[b.status] = (c[b.status] ?? 0) + 1));
    return c;
  }, [bookings]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (bookings ?? []).filter(
      (b) =>
        (filter === "all" || b.status === filter) &&
        (!q || [b.full_name, b.email, b.phone, b.city, b.counseling_type].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [bookings, filter, query]);

  const current = bookings?.find((b) => b.id === selected) ?? null;

  const exportCsv = () =>
    downloadFile(
      `counseling-bookings-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(visible, ["created_at", "status", "full_name", "email", "phone", "country", "city", "counseling_type", "mode", "preferred_date", "preferred_time", "description", "notes"]),
    );

  const onSaved = (patch: Partial<Booking> & { id: string }) =>
    setBookings((list) => list?.map((b) => (b.id === patch.id ? { ...b, ...patch } : b)) ?? null);
  const onDeleted = (id: string) => {
    setBookings((list) => list?.filter((b) => b.id !== id) ?? null);
    setSelected(null);
  };

  return (
    <>
      <PageHeader
        title="Counseling bookings"
        intro="Every request submitted through the website. This information is confidential — please handle it with care."
        actions={
          <>
            <button onClick={load} className={btnSmLine}>
              Refresh
            </button>
            <button onClick={exportCsv} className={btnSmLine} disabled={!visible.length}>
              <Icon name="download" className="h-4 w-4" /> Export CSV
            </button>
          </>
        }
      />

      {error && (
        <div className="mb-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-full border border-ivory/10 p-1" role="tablist" aria-label="Filter by status">
          {(["all", ...BOOKING_STATUSES] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={filter === s}
              onClick={() => setFilter(s)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm capitalize transition-colors ${filter === s ? "bg-gold/15 text-gold-bright" : "text-muted hover:text-ivory"}`}
            >
              {s} <span className="opacity-60">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
        <label className="relative block lg:w-72">
          <span className="sr-only">Search bookings</span>
          <input className="field !py-2.5" placeholder="Search name, email, phone…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <div>
          {bookings === null ? (
            <TableSkeleton />
          ) : visible.length === 0 ? (
            <EmptyState title={bookings.length ? "No matching bookings" : "No bookings yet"}>
              {bookings.length ? "Try a different filter or search." : "Requests from the counseling form on the website will appear here."}
            </EmptyState>
          ) : (
            <ul className="space-y-2">
              {visible.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => setSelected(b.id)}
                    aria-pressed={selected === b.id}
                    className={`flex w-full flex-col gap-2 rounded-xl border px-4 py-3.5 text-left transition-colors sm:flex-row sm:items-center sm:justify-between ${
                      selected === b.id ? "border-gold/60 bg-gold/10" : "border-ivory/10 bg-navy/50 hover:border-ivory/25"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ivory">{b.full_name}</span>
                      <span className="block truncate text-sm text-muted">
                        {b.counseling_type} · {b.mode} · prefers {fmtDate(b.preferred_date)} {b.preferred_time}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted">{fmtDateTime(b.created_at)}</span>
                      <StatusBadge status={b.status} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="xl:sticky xl:top-8 xl:self-start">
          {current ? (
            <BookingDetail key={current.id} booking={current} onSaved={onSaved} onDeleted={onDeleted} onClose={() => setSelected(null)} />
          ) : (
            bookings?.length ? (
              <Panel className="hidden p-8 text-center text-muted xl:block">Select a booking to see the details.</Panel>
            ) : null
          )}
        </div>
      </div>
    </>
  );
}

function BookingDetail({
  booking: b,
  onSaved,
  onDeleted,
  onClose,
}: {
  booking: Booking;
  onSaved: (p: Partial<Booking> & { id: string }) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<BookingStatus>(b.status);
  const [notes, setNotes] = useState(b.notes ?? "");
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const dirty = status !== b.status || notes !== (b.notes ?? "");
  const digits = b.phone.replace(/[^\d]/g, "");

  const save = async () => {
    setBusy("save");
    setMsg(null);
    try {
      await api(`/api/admin/bookings/${b.id}`, { method: "PATCH", body: { status, notes } });
      onSaved({ id: b.id, status, notes });
      setMsg({ tone: "success", text: "Saved." });
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Couldn't save." });
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Permanently delete the booking from ${b.full_name}? This cannot be undone.`)) return;
    setBusy("delete");
    try {
      await api(`/api/admin/bookings/${b.id}`, { method: "DELETE" });
      onDeleted(b.id);
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Couldn't delete." });
      setBusy(null);
    }
  };

  return (
    <Panel className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl">{b.full_name}</h2>
          <p className="mt-1 text-sm text-muted">Received {fmtDateTime(b.created_at)}</p>
        </div>
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-ivory/15 text-muted hover:text-ivory" aria-label="Close details">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <a href={`mailto:${b.email}`} className={btnSmLine}>
          <Icon name="mail" className="h-4 w-4" /> Email
        </a>
        <a href={`tel:${b.phone.replace(/\s/g, "")}`} className={btnSmLine}>
          <Icon name="phone" className="h-4 w-4" /> Call
        </a>
        <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className={btnSmLine}>
          WhatsApp
        </a>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        {[
          ["Email", b.email],
          ["Phone", b.phone],
          ["Location", `${b.city}, ${b.country}`],
          ["Counseling type", b.counseling_type],
          ["Preferred mode", b.mode],
          ["Preferred time", `${fmtDate(b.preferred_date)} · ${b.preferred_time} WAT`],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-muted">{k}</dt>
            <dd className="mt-0.5 break-words text-ivory">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        <p className="text-sm text-muted">What they shared</p>
        <p className="mt-2 whitespace-pre-wrap rounded-xl border border-ivory/10 bg-ink/50 p-4 leading-relaxed text-ivory/90">{b.description}</p>
      </div>

      <div className="mt-6 grid gap-4">
        <div>
          <label htmlFor="b-status" className="label">
            Status
          </label>
          <select id="b-status" className="field capitalize" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="b-notes" className="label">
            Private notes <span className="font-normal text-muted">(only visible here)</span>
          </label>
          <textarea id="b-notes" className="field min-h-[110px]" maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Called on Monday, session booked for 3 Dec at 2pm." />
        </div>
      </div>

      {msg && (
        <div className="mt-4">
          <Notice tone={msg.tone}>{msg.text}</Notice>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button onClick={remove} className={btnSmDanger} disabled={busy !== null}>
          {busy === "delete" ? <Spinner /> : null} Delete
        </button>
        <button onClick={save} className={btnSmGold} disabled={!dirty || busy !== null}>
          {busy === "save" ? <Spinner /> : <Icon name="check" className="h-4 w-4" />} Save changes
        </button>
      </div>
    </Panel>
  );
}
