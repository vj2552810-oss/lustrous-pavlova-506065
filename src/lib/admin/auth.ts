import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";

export const ADMIN_COOKIE = "pritivo_staff";
const SESSION_HOURS = 12;
const MIN_PASSCODE_LENGTH = 12;

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

import { envValue } from "@/lib/env";

export function adminConfigured() {
  const passcode = envValue("ADMIN_PASSCODE") ?? "";
  return passcode.length >= MIN_PASSCODE_LENGTH;
}

export function adminSetupMessage() {
  if (adminConfigured()) return null;
  return `Staff access is not configured. Set ADMIN_PASSCODE (at least ${MIN_PASSCODE_LENGTH} characters) in the server environment to enable the tour manager. Customers are unaffected — there are no customer accounts anywhere on this site.`;
}

function secureFromRequest(req?: Request) {
  const override = process.env.AUTH_COOKIE_SECURE;
  const proto = req?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const requestIsHttps = proto ? proto === "https" : (() => {
    try {
      return new URL(req?.url ?? "http://localhost").protocol === "https:";
    } catch {
      return false;
    }
  })();
  // A browser silently discards a `Secure` cookie received over plain HTTP, which
  // would lock staff out without any error. So: honour "false" always, and only
  // honour "true" when the request really is HTTPS.
  if (override === "false") return false;
  if (override === "true") {
    if (!requestIsHttps && req) {
      console.warn("[security] AUTH_COOKIE_SECURE=true but the request is plain HTTP — issuing a non-Secure cookie so the session is not dropped. Serve over HTTPS in production.");
      return false;
    }
    return true;
  }
  return requestIsHttps;
}

/** Constant-time passcode check. */
export function passcodeMatches(candidate: string) {
  const expected = envValue("ADMIN_PASSCODE") ?? "";
  if (!adminConfigured()) return false;
  const a = Buffer.from(sha256(candidate.slice(0, 200)));
  const b = Buffer.from(sha256(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createAdminSession(req?: Request) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  await db.insert(adminSessions).values({ tokenHash: sha256(token), expiresAt });
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureFromRequest(req),
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
  return { token, expiresAt };
}

export async function isAdminAuthenticated() {
  if (!adminConfigured()) return false;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const rows = await db
      .select({ id: adminSessions.id })
      .from(adminSessions)
      .where(and(eq(adminSessions.tokenHash, sha256(token)), gt(adminSessions.expiresAt, new Date())))
      .limit(1);
    return rows.length > 0;
  } catch (err) {
    console.error("Admin session check failed", err);
    return false;
  }
}

export async function destroyAdminSession(req?: Request) {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token) {
    try {
      await db.delete(adminSessions).where(eq(adminSessions.tokenHash, sha256(token)));
    } catch (err) {
      console.error("Admin session delete failed", err);
    }
  }
  jar.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: secureFromRequest(req),
    path: "/",
    maxAge: 0,
  });
}

export async function purgeExpiredAdminSessions() {
  try {
    await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  } catch (err) {
    console.error("Admin session purge failed", err);
  }
}
