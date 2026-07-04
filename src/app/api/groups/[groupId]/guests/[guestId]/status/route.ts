import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ groupId: string; guestId: string }> }
) {
  const { groupId, guestId } = await context.params
  const body = await request.json()

  console.log("PATCH status/route.ts triggered:", { groupId, guestId, body })

  try {
    const axios = await getAuthenticatedAxios()
    const targetUrl = `/api/groups/${groupId}/guests/${guestId}/status`
    console.log("PATCH status/route.ts sending axios to:", targetUrl)
    const response = await axios.patch(targetUrl, body)
    console.log("PATCH status/route.ts success response:", response.data)
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const errAny = error as {
      response?: { status?: number; data?: unknown }
      message?: string
    }
    console.error("PATCH status/route.ts error occurred:", {
      message: errAny?.message,
      status: errAny?.response?.status,
      data: errAny?.response?.data,
    })
    const status = errAny?.response?.status ?? 500
    const data = errAny?.response?.data ?? null
    return NextResponse.json(
      {
        message: errAny?.message ?? "Failed to update guest status",
        details: data,
      },
      { status }
    )
  }
}
