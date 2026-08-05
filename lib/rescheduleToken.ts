import { createHmac, timingSafeEqual } from "crypto";
import type { BookingPayload } from "@/lib/email";

const SECRET = process.env.RESCHEDULE_SECRET;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 180; // 180 days — generous, this is a low-stakes link

function base64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function sign(data: string): string {
  if (!SECRET) throw new Error("RESCHEDULE_SECRET is not set.");
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

/** Encodes a booking into a signed, URL-safe token. No database needed. */
export function createRescheduleToken(payload: BookingPayload): string {
  const body = base64url(JSON.stringify({ payload, iat: Date.now() }));
  const sig = sign(body);
  return `${body}.${sig}`;
}

export type DecodedReschedule =
  | { ok: true; payload: BookingPayload; issuedAt: number }
  | { ok: false; reason: "invalid" | "expired" | "not-configured" };

/** Verifies signature + expiry, then returns the original booking payload. */
export function verifyRescheduleToken(token: string): DecodedReschedule {
  if (!SECRET) return { ok: false, reason: "not-configured" };

  const [body, sig] = token.split(".");
  if (!body || !sig) return { ok: false, reason: "invalid" };

  let expectedSig: string;
  try {
    expectedSig = sign(body);
  } catch {
    return { ok: false, reason: "not-configured" };
  }

  const a = Uint8Array.from(Buffer.from(sig, "utf8"));
  const b = Uint8Array.from(Buffer.from(expectedSig, "utf8"));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "invalid" };
  }

  try {
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (Date.now() - decoded.iat > MAX_AGE_MS) {
      return { ok: false, reason: "expired" };
    }
    return { ok: true, payload: decoded.payload, issuedAt: decoded.iat };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

/**
 * Full, absolute reschedule link to drop into a confirmation email.
 * Pass the request's own origin (e.g. `req.nextUrl.origin`) so this
 * automatically resolves to whichever host actually served the request —
 * http://localhost:3000 while developing, https://demo.soundhous.com once
 * deployed there, etc. No env var needs to change between environments.
 * Falls back to APP_BASE_URL only if no origin is available.
 */
export function buildRescheduleUrl(payload: BookingPayload, origin?: string): string | null {
  const base = origin ?? process.env.APP_BASE_URL;
  if (!base || !process.env.RESCHEDULE_SECRET) return null;
  const token = createRescheduleToken(payload);
  return `${base.replace(/\/$/, "")}/reschedule?token=${encodeURIComponent(token)}`;
}