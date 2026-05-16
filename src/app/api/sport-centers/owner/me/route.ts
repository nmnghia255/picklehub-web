import { NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function GET() {
  try {
    const client = await getAuthenticatedAxios()
    const response = await client.get(`/api/sport-centers/owner/me`)
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load sport centers"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500
    return NextResponse.json({ message }, { status })
  }
}
