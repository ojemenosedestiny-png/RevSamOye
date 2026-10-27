import "server-only";
import type { CounselingInput } from "@/lib/validation";

// Sends through Resend's HTTP API. To use SMTP/Nodemailer instead, replace sendEmail() — see README.

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html, reply_to: replyTo }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Email send failed: ${res.status}`);
}

const shell = (body: string) => `
<div style="background:#060914;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#F6F0E4">
  <div style="max-width:560px;margin:0 auto;background:#0C142A;border:1px solid #2a3558;border-radius:16px;padding:32px">
    <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:20px;color:#E8CC8C">Rev. Dr. Sam Oye</p>
    ${body}
  </div>
</div>`;

export async function sendCounselingEmails(d: CounselingInput) {
  const rows: [string, string][] = [
    ["Name", d.fullName],
    ["Email", d.email],
    ["Phone", `${d.phoneCode} ${d.phone}`],
    ["Location", `${d.city}, ${d.country}`],
    ["Type", d.type],
    ["Mode", d.mode],
    ["Preferred", `${d.preferredDate} at ${d.preferredTime}`],
  ];
  const table = rows
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#BEB8AC;vertical-align:top">${k}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`)
    .join("");

  const ministry = shell(`
    <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:0 0 16px">New counseling request</h1>
    <p style="color:#BEB8AC;margin:0 0 16px">Confidential — handle with care.</p>
    <table style="font-size:15px;border-collapse:collapse">${table}</table>
    <p style="margin:20px 0 6px;color:#BEB8AC">Description</p>
    <p style="margin:0;white-space:pre-wrap;line-height:1.6">${escapeHtml(d.description)}</p>`);

  const confirmation = shell(`
    <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:0 0 16px">We've received your request</h1>
    <p style="line-height:1.7">Dear ${escapeHtml(d.fullName.split(" ")[0])},</p>
    <p style="line-height:1.7">Thank you for reaching out. Your request for <strong>${escapeHtml(d.type.toLowerCase())}</strong> counseling has been received and will be treated with complete confidentiality. A member of our team will contact you to confirm a time.</p>
    <p style="line-height:1.7;color:#BEB8AC">If you did not make this request, you can ignore this email.</p>`);

  const to = process.env.MINISTRY_EMAIL;
  const jobs: Promise<unknown>[] = [sendEmail(d.email, "Your counseling request has been received", confirmation)];
  if (to) jobs.push(sendEmail(to, `Counseling request — ${d.type}`, ministry, d.email));
  const results = await Promise.allSettled(jobs);
  results.forEach((r) => r.status === "rejected" && console.error("[counseling] email error:", r.reason));
}
