import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_HOURS, adminConfigured, createSession, passwordMatches } from "@/lib/auth";
import { fail, json } from "@/lib/server/admin";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminConfigured()) return fail(503, "Admin is not set up. Add ADMIN_PASSWORD to the environment.");
  if (!rateLimit(`login:${clientIp(req)}`, 5, 15 * 60_000)) return fail(429, "Too many attempts. Try again in 15 minutes.");

  const body = await req.json().catch(() => ({}));
  if (typeof body.password !== "string" || !(await passwordMatches(body.password))) {
    return fail(401, "Incorrect password.");
  }

  (await cookies()).set(SESSION_COOKIE, await createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  return json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(SESSION_COOKIE);
  return json({ ok: true });
}
