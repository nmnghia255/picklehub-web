import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ groupId: string; id: string }> }
) {
  const { groupId, id } = await context.params

  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(
      `/api/groups/${groupId}/court-bookings/${id}`
    )
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load group court booking details"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errAny = error as any
    const status = errAny?.response?.status
    const data = errAny?.response?.data
    console.error(
      `[api] GET /api/groups/${groupId}/court-bookings/${id} error:`,
      {
        message,
        status,
        data,
      }
    )

    const statusCode = status ?? 500
    return NextResponse.json(
      { message, details: data ?? null },
      { status: statusCode }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ groupId: string; id: string }> }
) {
  const { groupId, id } = await context.params

  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete(
      `/api/groups/${groupId}/court-bookings/${id}`
    )
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete group court booking"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errAny = error as any
    const status = errAny?.response?.status
    const data = errAny?.response?.data
    console.error(
      `[api] DELETE /api/groups/${groupId}/court-bookings/${id} error:`,
      {
        message,
        status,
        data,
      }
    )

    const statusCode = status ?? 500
    return NextResponse.json(
      { message, details: data ?? null },
      { status: statusCode }
    )
  }
}
