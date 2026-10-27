import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { deleteRows, insertRow, selectRows, updateRows } from "@/lib/server/db";
import { fail, guard, json, serverError } from "@/lib/server/admin";
import { SITE_TAG } from "@/lib/server/site-content";

export const runtime = "nodejs";

const iso = z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");
const eventSchema = z
  .object({
    title: z.string().trim().min(2, "Add a title").max(160),
    start_at: iso,
    end_at: iso,
    venue: z.string().trim().max(200).nullable(),
    online: z.boolean(),
    online_label: z.string().trim().max(120).nullable(),
    description: z.string().trim().max(1000),
    speakers: z.array(z.string().trim().min(1).max(120)).max(12),
    register_url: z
      .string()
      .trim()
      .max(500)
      .refine((s) => s === "" || /^https?:\/\//.test(s) || s.startsWith("#"), "Registration link must start with https://")
      .nullable(),
    published: z.boolean(),
  })
  .refine((e) => Date.parse(e.end_at) > Date.parse(e.start_at), { message: "End time must be after the start time", path: ["end_at"] })
  .refine((e) => e.online || (e.venue ?? "") !== "", { message: "Add a venue or mark the event as online", path: ["venue"] });

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const refresh = () => {
  revalidateTag(SITE_TAG);
  revalidatePath("/");
};
const uuid = z.string().uuid();

export async function GET(req: Request) {
  const refused = await guard(req);
  if (refused) return refused;
  try {
    return json({ ok: true, events: await selectRows("events", "select=*&order=start_at.desc") });
  } catch (err) {
    return serverError("events", err);
  }
}

export async function POST(req: Request) {
  const refused = await guard(req);
  if (refused) return refused;
  const parsed = eventSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "Invalid event.");
  try {
    const slug = `${slugify(parsed.data.title)}-${parsed.data.start_at.slice(0, 10)}-${crypto.randomUUID().slice(0, 4)}`;
    await insertRow("events", { ...parsed.data, slug });
    refresh();
    return json({ ok: true });
  } catch (err) {
    return serverError("events:create", err);
  }
}

export async function PATCH(req: Request) {
  const refused = await guard(req);
  if (refused) return refused;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const parsed = eventSchema.safeParse(await req.json().catch(() => null));
  if (!uuid.safeParse(id).success) return fail(400, "Invalid id.");
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "Invalid event.");
  try {
    await updateRows("events", `id=eq.${id}`, parsed.data);
    refresh();
    return json({ ok: true });
  } catch (err) {
    return serverError("events:update", err);
  }
}

export async function DELETE(req: Request) {
  const refused = await guard(req);
  if (refused) return refused;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!uuid.safeParse(id).success) return fail(400, "Invalid id.");
  try {
    await deleteRows("events", `id=eq.${id}`);
    refresh();
    return json({ ok: true });
  } catch (err) {
    return serverError("events:delete", err);
  }
}
