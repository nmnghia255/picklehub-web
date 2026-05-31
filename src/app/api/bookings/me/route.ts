import { NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get("status") ?? ""
    const courtId = url.searchParams.get("courtId") ?? ""
    const centerId = url.searchParams.get("centerId") ?? ""
    const date = url.searchParams.get("date") ?? ""
    const offset = url.searchParams.get("offset") ?? "0"
    const limit = url.searchParams.get("limit") ?? "20"

    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()

    if (status) searchParams.set("status", status)
    if (courtId) searchParams.set("courtId", courtId)
    if (centerId) searchParams.set("centerId", centerId)
    if (date) searchParams.set("date", date)

    searchParams.set("offset", offset)
    searchParams.set("limit", limit)

    const response = await axios.get(
      `/api/bookings/me?${searchParams.toString()}`
    )

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load bookings"
    const statusCode =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status: statusCode })
  }
}
