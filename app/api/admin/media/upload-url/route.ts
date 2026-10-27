import { z } from "zod";
import { MAX_UPLOAD_MB, UPLOAD_TYPES } from "@/lib/admin-types";
import { publicUrl, signedUploadUrl } from "@/lib/server/db";
import { fail, guard, json, serverError } from "@/lib/server/admin";

export const runtime = "nodejs";

const allowed: readonly string[] = [...UPLOAD_TYPES.image, ...UPLOAD_TYPES.video, ...UPLOAD_TYPES.captions];
const ext: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "text/vtt": "vtt",
};

const schema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().refine((t) => allowed.includes(t), "This file type isn't supported."),
  size: z.number().positive().max(MAX_UPLOAD_MB * 1024 * 1024, `Files must be ${MAX_UPLOAD_MB} MB or smaller.`),
});

/** Issues a one-time direct-to-storage upload URL; the file never passes through this server. */
export async function POST(req: Request) {
  const refused = await guard(req);
  if (refused) return refused;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "Invalid file.");

  const { filename, contentType } = parsed.data;
  const stem = filename.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "file";
  const path = `uploads/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID().slice(0, 8)}-${stem}.${ext[contentType]}`;

  try {
    return json({ ok: true, uploadUrl: await signedUploadUrl(path), publicUrl: publicUrl(path) });
  } catch (err) {
    return serverError("media:sign", err);
  }
}
