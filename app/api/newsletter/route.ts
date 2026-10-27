import { NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validation";
import { dbConfigured, insertRow } from "@/lib/server/db";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(`news:${clientIp(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ ok: false, message: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (body?.website) return NextResponse.json({ ok: true }); // honeypot

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues[0].message }, { status: 400 });
  }

  if (!dbConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: false, message: "Sign-ups are temporarily unavailable." }, { status: 503 });
    }
    console.info("[newsletter] dev mode: sign-up accepted (configure SUPABASE_* to store).");
    return NextResponse.json({ ok: true });
  }

  try {
    await insertRow("newsletter_subscribers", { email: parsed.data.email.toLowerCase() }, { ignoreDuplicates: true });
  } catch (err) {
    console.error("[newsletter]", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, message: "Could not subscribe right now. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
