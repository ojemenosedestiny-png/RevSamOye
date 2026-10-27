"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { toCsv, type Subscriber } from "@/lib/admin-types";
import { api, downloadFile, fmtDateTime } from "./api";
import { EmptyState, Notice, PageHeader, TableSkeleton, btnSmLine } from "./ui";

export function SubscribersManager() {
  const [subs, setSubs] = useState<Subscriber[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setSubs((await api<{ subscribers: Subscriber[] }>("/api/admin/subscribers")).subscribers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load subscribers.");
      setSubs([]);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => (subs ?? []).filter((s) => s.email.includes(query.trim().toLowerCase())), [subs, query]);

  const remove = async (s: Subscriber) => {
    if (!window.confirm(`Remove ${s.email} from the list?`)) return;
    try {
      await api(`/api/admin/subscribers?id=${s.id}`, { method: "DELETE" });
      setSubs((list) => list?.filter((x) => x.id !== s.id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove.");
    }
  };

  return (
    <>
      <PageHeader
        title="Newsletter subscribers"
        intro="People who signed up for messages and event updates. Export the list to import into your email tool (e.g. Mailchimp)."
        actions={
          <button
            onClick={() => downloadFile(`subscribers-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(visible, ["email", "created_at"]))}
            className={btnSmLine}
            disabled={!visible.length}
          >
            <Icon name="download" className="h-4 w-4" /> Export CSV
          </button>
        }
      />
      {error && (
        <div className="mb-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-muted">
          <span className="font-serif text-3xl text-ivory">{subs?.length ?? "—"}</span> total
        </p>
        <input className="field !py-2.5 sm:max-w-xs" placeholder="Search email…" aria-label="Search subscribers" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {subs === null ? (
        <TableSkeleton />
      ) : visible.length === 0 ? (
        <EmptyState title={subs.length ? "No matches" : "No subscribers yet"}>{subs.length ? null : "Sign-ups from the website's newsletter form will appear here."}</EmptyState>
      ) : (
        <ul className="divide-y divide-ivory/10 rounded-2xl border border-ivory/10 bg-navy/50">
          {visible.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="min-w-0">
                <a href={`mailto:${s.email}`} className="block truncate text-ivory hover:text-gold-bright">
                  {s.email}
                </a>
                <span className="text-xs text-muted">Joined {fmtDateTime(s.created_at)}</span>
              </span>
              <button onClick={() => remove(s)} className="rounded-full px-3 py-2 text-sm text-muted hover:text-[#F4ADA6]" aria-label={`Remove ${s.email}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
