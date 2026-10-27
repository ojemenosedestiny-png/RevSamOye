import "server-only";

// Minimal Supabase REST + Storage client — no SDK needed. Tables live in supabase/schema.sql.
// Uses the service-role key, so this must only ever run on the server.

/**
 * Accepts SUPABASE_URL as the full URL, a URL without https://, a pasted API URL
 * (".../rest/v1"), or just the 20-character project ref. Returns null if unusable.
 */
function supabaseOrigin(): string | null {
  let raw = (process.env.SUPABASE_URL ?? "").trim();
  if (!raw) return null;
  if (/^[a-z0-9]{20}$/i.test(raw)) raw = `https://${raw}.supabase.co`;
  else if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

let warned = false;
export const dbConfigured = () => {
  const ok = Boolean(supabaseOrigin() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  if (!ok && process.env.SUPABASE_URL && !warned) {
    warned = true;
    console.warn("[db] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is invalid — expected e.g. https://abcd1234.supabase.co");
  }
  return ok;
};

const base = () => supabaseOrigin()!;
const headers = (extra: Record<string, string> = {}) => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...extra };
};

type FetchOpts = { tags?: string[] };
// Public pages pass tags so results are cached and refreshed on admin save; admin reads are always fresh.
// Every call times out so a slow or misconfigured database can't stall a page or a build.
const cacheOpts = (o?: FetchOpts): RequestInit => ({
  signal: AbortSignal.timeout(15_000),
  ...(o?.tags ? { next: { revalidate: 3600, tags: o.tags } } : { cache: "no-store" }),
});
const noStore = (): RequestInit => ({ cache: "no-store", signal: AbortSignal.timeout(15_000) });

async function check(res: Response, what: string) {
  if (!res.ok) throw new Error(`Supabase ${what} failed: ${res.status} ${await res.text().catch(() => "")}`.trim());
  return res;
}

/** GET rows. `query` is a PostgREST query string, e.g. "select=*&order=created_at.desc". */
export async function selectRows<T>(table: string, query = "select=*", opts?: FetchOpts): Promise<T[]> {
  const res = await fetch(`${base()}/rest/v1/${table}?${query}`, { headers: headers(), ...cacheOpts(opts) });
  return (await check(res, `select ${table}`)).json();
}

export async function countRows(table: string, filter = ""): Promise<number> {
  const res = await fetch(`${base()}/rest/v1/${table}?select=id${filter ? `&${filter}` : ""}`, {
    method: "HEAD",
    headers: headers({ Prefer: "count=exact", Range: "0-0" }),
    ...noStore(),
  });
  await check(res, `count ${table}`);
  return Number(res.headers.get("content-range")?.split("/")[1] ?? 0);
}

export async function insertRow(table: string, row: Record<string, unknown>, opts: { ignoreDuplicates?: boolean } = {}) {
  const res = await fetch(`${base()}/rest/v1/${table}`, {
    method: "POST",
    headers: headers({ Prefer: opts.ignoreDuplicates ? "return=minimal,resolution=ignore-duplicates" : "return=minimal" }),
    body: JSON.stringify(row),
    ...noStore(),
  });
  await check(res, `insert ${table}`);
}

export async function upsertRow(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${base()}/rest/v1/${table}`, {
    method: "POST",
    headers: headers({ Prefer: "return=minimal,resolution=merge-duplicates" }),
    body: JSON.stringify(row),
    ...noStore(),
  });
  await check(res, `upsert ${table}`);
}

/** PATCH rows matching `filter` (e.g. "id=eq.123"). */
export async function updateRows(table: string, filter: string, patch: Record<string, unknown>) {
  const res = await fetch(`${base()}/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify(patch),
    ...noStore(),
  });
  await check(res, `update ${table}`);
}

export async function deleteRows(table: string, filter: string) {
  const res = await fetch(`${base()}/rest/v1/${table}?${filter}`, { method: "DELETE", headers: headers(), ...noStore() });
  await check(res, `delete ${table}`);
}

// ── Storage (public "media" bucket) ──

export const MEDIA_BUCKET = "media";

export const publicUrl = (path: string) => `${base()}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;

/** Returns a one-time URL the browser can PUT a file to directly (bypasses server upload limits). */
export async function signedUploadUrl(path: string): Promise<string> {
  const res = await fetch(`${base()}/storage/v1/object/upload/sign/${MEDIA_BUCKET}/${path}`, {
    method: "POST",
    headers: headers(),
    ...noStore(),
  });
  const { url } = (await (await check(res, "sign upload")).json()) as { url: string };
  return `${base()}/storage/v1${url}`;
}
