import { NextResponse } from "next/server"

import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    return NextResponse.json(session, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load session"

    return NextResponse.json({ message }, { status: 500 })
  }
}
