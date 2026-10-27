import { selectRows } from "@/lib/server/db";
import { guard, json, serverError } from "@/lib/server/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const refused = await guard(req);
  if (refused) return refused;
  try {
    const rows = await selectRows("counseling_requests", "select=*&order=created_at.desc&limit=1000");
    return json({ ok: true, bookings: rows });
  } catch (err) {
    return serverError("bookings", err);
  }
}
