import { NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

type RouteContext = {
  params: Promise<{ centerId: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { centerId } = await context.params
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const client = await getAuthenticatedAxios()

    const response = await client.get(`/api/sport-centers/${centerId}/courts`, {
      params: queryParams,
    })

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load courts"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
