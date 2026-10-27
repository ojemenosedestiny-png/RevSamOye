import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { dbConfigured, upsertRow } from "@/lib/server/db";
import { fail, guard, json, serverError } from "@/lib/server/admin";
import { SITE_TAG, defaultMedia, readMediaOverrides } from "@/lib/server/site-content";

export const runtime = "nodejs";

// Only site-relative paths or https URLs may be stored as media sources.
const src = z
  .string()
  .max(1000)
  .refine((s) => s === "" || s.startsWith("/") || s.startsWith("https://"), "Must be a site path or https URL");
const photo = z.object({ src, alt: z.string().max(300) }).partial();

const schema = z.object({
  heroPortrait: photo.optional(),
  aboutPortrait: photo.optional(),
  video: z
    .object({
      src,
      poster: src,
      captions: src,
      youtubeUrl: z.string().max(300).refine((s) => s === "" || /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(s), "Must be a YouTube link"),
      preferYouTube: z.boolean(),
      title: z.string().max(140),
      description: z.string().max(400),
      eyebrow: z.string().max(40),
    })
    .partial()
    .optional(),
});

export async function GET(req: Request) {
  const refused = await guard(req, { needsDb: false });
  if (refused) return refused;
  return json({ ok: true, dbReady: dbConfigured(), defaults: defaultMedia(), overrides: await readMediaOverrides(true) });
}

export async function PUT(req: Request) {
  const refused = await guard(req);
  if (refused) return refused;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "Invalid settings.");
  try {
    await upsertRow("site_settings", { key: "media", value: parsed.data, updated_at: new Date().toISOString() });
    revalidateTag(SITE_TAG);
    revalidatePath("/");
    return json({ ok: true });
  } catch (err) {
    serverError("media:save", err);
    const m = err instanceof Error ? err.message : "";
    if (/site_settings|PGRST205|42P01|does not exist|schema cache/i.test(m))
      return fail(502, "The database tables haven't been created yet. In Supabase, open SQL Editor, paste all of supabase/schema.sql and press Run, then try again.");
    if (/(401|403)|Invalid API key|JWS|JWT/i.test(m))
      return fail(502, "Supabase refused the key. In Render → Environment, set SUPABASE_SERVICE_ROLE_KEY to the service_role key (Supabase → Project Settings → API).");
    return fail(500, "Couldn't save. Check the Render logs for the line starting [admin:media:save].");
  }
}
