// Shared between admin pages (browser) and admin API routes (server).

export const BOOKING_STATUSES = ["new", "contacted", "scheduled", "completed", "archived"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type Booking = {
  id: string;
  created_at: string;
  updated_at: string | null;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  counseling_type: string;
  mode: string;
  preferred_date: string;
  preferred_time: string;
  description: string;
  consent: boolean;
  status: BookingStatus;
  notes: string | null;
};

export type Subscriber = { id: string; created_at: string; email: string };

export type AdminEvent = {
  id: string;
  slug: string | null;
  title: string;
  start_at: string;
  end_at: string;
  venue: string | null;
  online: boolean;
  online_label: string | null;
  description: string;
  speakers: string[];
  register_url: string | null;
  published: boolean;
};

/** File types the media uploader accepts, by slot kind. */
export const UPLOAD_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  video: ["video/mp4", "video/webm"],
  captions: ["text/vtt"],
} as const;

export const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 50);

/** "2026-11-28T17:00" (WAT, from <input type="datetime-local">) → ISO string with +01:00. */
export const watInputToIso = (v: string) => `${v}:00+01:00`;

/** ISO timestamp → "2026-11-28T17:00" in West Africa Time, for datetime-local inputs. */
export function isoToWatInput(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const cell = (v: unknown) => {
    const s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
    // Quote, and neutralise spreadsheet formula injection
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return [columns.join(","), ...rows.map((r) => columns.map((c) => cell(r[c])).join(","))].join("\r\n");
}
