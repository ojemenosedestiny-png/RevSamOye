import { z } from "zod";
import { deleteRows, selectRows } from "@/lib/server/db";
import { fail, guard, json, serverError } from "@/lib/server/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const refused = await guard(req);
  if (refused) return refused;
  try {
    const rows = await selectRows("newsletter_subscribers", "select=*&order=created_at.desc&limit=10000");
    return json({ ok: true, subscribers: rows });
  } catch (err) {
    return serverError("subscribers", err);
  }
}

export async function DELETE(req: Request) {
  const refused = await guard(req);
  if (refused) return refused;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!z.string().uuid().safeParse(id).success) return fail(400, "Invalid id.");
  try {
    await deleteRows("newsletter_subscribers", `id=eq.${id}`);
    return json({ ok: true });
  } catch (err) {
    return serverError("subscribers:delete", err);
  }
}
