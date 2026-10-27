import "server-only";
import { bio, events as fileEvents, upcomingEvents, video as fileVideo, type EventItem } from "@/lib/content";
import { dbConfigured, selectRows } from "./db";

// Content managed from the admin panel lives in Supabase and overrides the
// defaults in /data. If the database isn't connected, the JSON files are used.

export const SITE_TAG = "site-content";

export type Photo = { src: string; alt: string };
export type VideoSettings = {
  src: string;
  poster: string;
  captions: string;
  youtubeUrl: string;
  preferYouTube: boolean;
  title: string;
  description: string;
  eyebrow: string;
};
export type SiteMedia = { heroPortrait: Photo; aboutPortrait: Photo; video: VideoSettings };
export type MediaOverrides = { heroPortrait?: Partial<Photo>; aboutPortrait?: Partial<Photo>; video?: Partial<VideoSettings> };

export type EventRow = {
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

export const defaultMedia = (): SiteMedia => ({
  heroPortrait: { src: bio.heroPortrait.src, alt: bio.heroPortrait.alt },
  aboutPortrait: { src: bio.aboutPortrait.src || bio.heroPortrait.src, alt: bio.aboutPortrait.alt },
  video: {
    src: fileVideo.src,
    poster: fileVideo.poster,
    captions: fileVideo.captions,
    youtubeUrl: fileVideo.youtubeUrl,
    preferYouTube: fileVideo.preferYouTube,
    title: fileVideo.title,
    description: fileVideo.description,
    eyebrow: fileVideo.eyebrow,
  },
});

/** Overlay non-empty override values on top of defaults. */
function merge<T extends object>(base: T, over?: Partial<T>): T {
  const out = { ...base };
  for (const [k, v] of Object.entries(over ?? {})) {
    if (v !== undefined && v !== null && v !== "") (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export async function readMediaOverrides(fresh = false): Promise<MediaOverrides> {
  if (!dbConfigured()) return {};
  try {
    const rows = await selectRows<{ value: MediaOverrides }>("site_settings", "select=value&key=eq.media", fresh ? undefined : { tags: [SITE_TAG] });
    return rows[0]?.value ?? {};
  } catch (err) {
    console.error("[site-content] media settings:", err instanceof Error ? err.message : err);
    return {};
  }
}

export async function getSiteMedia(): Promise<SiteMedia> {
  const d = defaultMedia();
  const o = await readMediaOverrides();
  return {
    heroPortrait: merge(d.heroPortrait, o.heroPortrait),
    aboutPortrait: merge(d.aboutPortrait, o.aboutPortrait),
    video: merge(d.video, o.video),
  };
}

export const rowToEvent = (r: EventRow): EventItem => ({
  id: r.slug || r.id,
  title: r.title,
  start: r.start_at,
  end: r.end_at,
  venue: r.venue ?? "",
  online: r.online,
  onlineLabel: r.online_label ?? undefined,
  description: r.description,
  speakers: r.speakers ?? [],
  registerUrl: r.register_url ?? undefined,
  placeholder: false,
});

/**
 * Upcoming events: from the admin panel when any have been added there,
 * otherwise from data/events.json.
 */
export async function getUpcomingEvents(): Promise<EventItem[]> {
  if (dbConfigured()) {
    try {
      const rows = await selectRows<EventRow>("events", "select=*&published=eq.true&order=start_at.asc", { tags: [SITE_TAG] });
      if (rows.length) return upcomingEvents(rows.map(rowToEvent));
    } catch (err) {
      console.error("[site-content] events:", err instanceof Error ? err.message : err);
    }
  }
  return upcomingEvents(fileEvents);
}
