import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ groupId: string; guestId: string }> }
) {
  const { groupId, guestId } = await context.params

  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch(
      `/api/groups/${groupId}/guests/${guestId}/cancel`
    )
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const errAny = error as {
      response?: { status?: number; data?: unknown }
      message?: string
    }
    const status = errAny?.response?.status ?? 500
    const data = errAny?.response?.data ?? null
    return NextResponse.json(
      {
        message: errAny?.message ?? "Failed to cancel guest request",
        details: data,
      },
      { status }
    )
  }
}
