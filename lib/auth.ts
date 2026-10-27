// Admin session tokens signed with HMAC-SHA256 via Web Crypto, so the same code
// runs in middleware (edge) and in route handlers (node).

export const SESSION_COOKIE = "ttc_admin";
export const SESSION_HOURS = 12;

const enc = new TextEncoder();

const secret = () => {
  const s = process.env.ADMIN_SESSION_SECRET || (process.env.ADMIN_PASSWORD ? `${process.env.ADMIN_PASSWORD}::session` : "");
  return s;
};

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function sign(data: string, key = secret()): Promise<string> {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", k, enc.encode(data)));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Compares via HMAC so timing does not leak the password. */
export async function passwordMatches(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !secret()) return false;
  return safeEqual(await sign(`pw:${input}`), await sign(`pw:${expected}`));
}

export async function createSession(): Promise<string> {
  const exp = Date.now() + SESSION_HOURS * 3_600_000;
  return `${exp}.${await sign(`session:${exp}`)}`;
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await sign(`session:${exp}`));
}
