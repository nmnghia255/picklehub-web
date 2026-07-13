import { type NextRequest, NextResponse } from "next/server"
import { ur } from "zod/v4/locales"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await context.params
  const url = new URL(request.url)
  const page = url.searchParams.get("page") ?? ""
  const limit = url.searchParams.get("limit") ?? ""
  const fromDate = url.searchParams.get("fromDate") ?? ""
  const toDate = url.searchParams.get("toDate") ?? ""
  const linked = url.searchParams.get("linked")
  const excludePast = url.searchParams.get("excludePast")

  try {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    if (page) searchParams.set("page", page)
    if (limit) searchParams.set("limit", limit)
    if (fromDate) searchParams.set("fromDate", fromDate)
    if (toDate) searchParams.set("toDate", toDate)

    if (linked !== null) searchParams.set("linked", linked)

    if (excludePast !== null) searchParams.set("excludePast", excludePast)

    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
    const response = await axios.get(
      `/api/groups/${groupId}/court-bookings${suffix}`
    )
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load group court bookings"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errAny = error as any
    const status = errAny?.response?.status
    const data = errAny?.response?.data
    console.error(`[api] GET /api/groups/${groupId}/court-bookings error:`, {
      message,
      status,
      data,
    })

    const statusCode = status ?? 500
    return NextResponse.json(
      { message, details: data ?? null },
      { status: statusCode }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await context.params

  try {
    const body = await request.json()
    const { title, note, bookingId } = body

    const axios = await getAuthenticatedAxios()
    const response = await axios.post(`/api/groups/${groupId}/court-bookings`, {
      title,
      note,
      bookingId,
    })
    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to link group court booking"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errAny = error as any
    const status = errAny?.response?.status
    const data = errAny?.response?.data
    console.error(`[api] POST /api/groups/${groupId}/court-bookings error:`, {
      message,
      status,
      data,
    })

    const statusCode = status ?? 500
    return NextResponse.json(
      { message, details: data ?? null },
      { status: statusCode }
    )
  }
}
