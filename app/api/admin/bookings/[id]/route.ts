import { z } from "zod";
import { deleteRows, updateRows } from "@/lib/server/db";
import { fail, guard, json, serverError } from "@/lib/server/admin";
import { BOOKING_STATUSES } from "@/lib/admin-types";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  notes: z.string().max(5000).optional(),
});
const uuid = z.string().uuid();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refused = await guard(req);
  if (refused) return refused;
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!uuid.safeParse(id).success || !parsed.success) return fail(400, "Invalid update.");
  try {
    await updateRows("counseling_requests", `id=eq.${id}`, { ...parsed.data, updated_at: new Date().toISOString() });
    return json({ ok: true });
  } catch (err) {
    return serverError("bookings:update", err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const refused = await guard(req);
  if (refused) return refused;
  const { id } = await params;
  if (!uuid.safeParse(id).success) return fail(400, "Invalid id.");
  try {
    await deleteRows("counseling_requests", `id=eq.${id}`);
    return json({ ok: true });
  } catch (err) {
    return serverError("bookings:delete", err);
  }
}
