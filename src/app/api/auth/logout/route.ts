import axios from "axios"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/session"

async function performLogout() {
  const session = await getSession()
  if (session.refreshToken) {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {
        refreshToken: session.refreshToken,
      })
    } catch {
      // Always clear the local session even if the backend revoke request fails.
    }
  }
  session.destroy()
}

export async function POST() {
  await performLogout()

  return NextResponse.json(
    { message: "Logged out successfully" },
    {
      status: 200,
      headers: {
        "Set-Cookie": `picklehub-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; SameSite=Lax`,
      },
    }
  )
}

export async function GET(request: Request) {
  await performLogout()

  const response = NextResponse.redirect(new URL("/login", request.url))
  response.headers.set(
    "Set-Cookie",
    `picklehub-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; SameSite=Lax`
  )
  return response
}
