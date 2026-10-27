import { NextResponse } from "next/server";
import { counselingSchema, fieldErrors } from "@/lib/validation";
import { dbConfigured, insertRow } from "@/lib/server/db";
import { emailConfigured, sendCounselingEmails } from "@/lib/server/email";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { verifyTurnstile } from "@/lib/server/turnstile";

export const runtime = "nodejs";

const fail = (status: number, message: string, errors?: Record<string, string>) =>
  NextResponse.json({ ok: false, message, errors }, { status });

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`counsel:${ip}`, 5, 10 * 60_000)) {
    return fail(429, "Too many requests. Please wait a few minutes and try again.");
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail(400, "Invalid request.");

  // Bots: honeypot filled, or submitted faster than a person could. Pretend success.
  const tooFast = typeof body.startedAt === "number" && Date.now() - body.startedAt < 4000;
  if (body.website || tooFast) return NextResponse.json({ ok: true });

  const parsed = counselingSchema.safeParse(body);
  if (!parsed.success) return fail(400, "Please check the highlighted fields.", fieldErrors(parsed.error));
  const data = parsed.data;

  if (!(await verifyTurnstile(data.turnstileToken, ip))) {
    return fail(400, "Verification failed. Please complete the security check and try again.");
  }

  if (!dbConfigured() && !emailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[counseling] Neither database nor email is configured — request not stored.");
      return fail(503, "Bookings are temporarily unavailable. Please try again later.");
    }
    // Local development: accept without storing. Contents are never logged (confidential).
    console.info("[counseling] dev mode: request accepted (configure SUPABASE_* / RESEND_* to store and email).");
    return NextResponse.json({ ok: true });
  }

  if (dbConfigured()) {
    try {
      await insertRow("counseling_requests", {
        full_name: data.fullName,
        email: data.email,
        phone: `${data.phoneCode} ${data.phone}`,
        country: data.country,
        city: data.city,
        counseling_type: data.type,
        mode: data.mode,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
        description: data.description,
        consent: data.consent,
      });
    } catch (err) {
      console.error("[counseling]", err instanceof Error ? err.message : err);
      return fail(500, "We couldn't save your request. Please try again shortly.");
    }
  }

  // Email failure should not lose a request that has been saved.
  if (emailConfigured()) await sendCounselingEmails(data);

  return NextResponse.json({ ok: true });
}
