import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { dbConfigured } from "./db";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export const fail = (status: number, message: string) => json({ ok: false, message }, status);

/**
 * Call at the top of every admin route handler. Returns a Response to send back
 * when the request must be refused, or null when it may proceed.
 */
export async function guard(req: Request, { needsDb = true } = {}): Promise<Response | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySession(token))) return fail(401, "Not signed in.");

  // Mutations must come from this site (defence against cross-site requests).
  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) return fail(403, "Cross-site request refused.");
  }
  if (needsDb && !dbConfigured()) return fail(503, "Database is not connected. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return null;
}

/** Map a thrown error to a 500 without leaking internals to the browser. */
export function serverError(scope: string, err: unknown) {
  console.error(`[admin:${scope}]`, err instanceof Error ? err.message : err);
  return fail(500, "Something went wrong. Please try again.");
}
