import { NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  try {
    console.log("DEBUG: Fetching calendar data via getAuthenticatedAxios")
    const axios = await getAuthenticatedAxios()

    // Construct query parameters for the backend API
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    console.log("DEBUG: Requesting to backend with params:", params)
    const response = await axios.get("/api/users/me/calendar", { params })
    console.log("DEBUG: Backend response status:", response.status)
    return NextResponse.json(response.data)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch calendar data"
    console.error("DEBUG: Error fetching calendar:", message)
    return NextResponse.json(
      { message: "Failed to fetch calendar data", error: message },
      { status: 500 }
    )
  }
}
