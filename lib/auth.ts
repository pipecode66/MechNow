import "server-only"

import bcrypt from "bcryptjs"
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

export const ADMIN_SESSION_COOKIE = "admin_session"
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60

export interface AdminSession {
  email: string
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_MAX_AGE_SECONDS,
  path: "/admin",
}

function getSessionSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET
  return secret ? new TextEncoder().encode(secret) : null
}

export function isSessionConfigured(): boolean {
  return Boolean(process.env.SESSION_SECRET)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}

export async function createSessionToken(session: AdminSession): Promise<string> {
  const secret = getSessionSecret()
  if (!secret) {
    throw new Error("SESSION_SECRET is required for admin sessions")
  }

  return new SignJWT({ email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret)
}

export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  const secret = getSessionSecret()
  if (!secret) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    if (typeof payload.email !== "string") return null
    return { email: payload.email }
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null

  return verifySessionToken(token)
}
