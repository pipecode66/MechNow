import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { getSessionSecretValue } from "@/lib/demo-mode"

const ADMIN_SESSION_COOKIE = "admin_session"

function getSessionSecret(): Uint8Array | null {
  const secret = getSessionSecretValue()
  return secret ? new TextEncoder().encode(secret) : null
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const secret = getSessionSecret()
  if (!token || !secret) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }
}

export const config = {
  matcher: ["/admin/:path*"],
}
