import { NextResponse } from "next/server"

import { getSession } from "@/lib/session"

export async function POST() {
  const session = await getSession()
  session.destroy()

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
