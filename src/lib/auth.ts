// Custom JWT auth — no public registration. Admin creates users.
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";

const COOKIE_NAME = "ff_session";
const SESSION_DAYS = 14;

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET not set");
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  uid: number;
  username: string;
  role: "admin" | "manager" | "designer";
  fullName: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function readSessionFromCookie(): Promise<SessionPayload | null> {
  const c = cookies().get(COOKIE_NAME);
  if (!c) return null;
  try {
    const { payload } = await jwtVerify(c.value, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// For middleware (Edge runtime — no Prisma)
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionPayload> {
  const u = await readSessionFromCookie();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}

export async function requireRole(roles: SessionPayload["role"][]): Promise<SessionPayload> {
  const u = await requireUser();
  if (!roles.includes(u.role)) throw new Error("FORBIDDEN");
  return u;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
