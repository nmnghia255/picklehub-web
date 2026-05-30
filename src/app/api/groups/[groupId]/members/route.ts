import { NextResponse, type NextRequest } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await context.params

  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(`/api/groups/${groupId}/members`)
    console.log(`[api] GET /api/groups/${groupId}/members -> ${response.status}`)
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load members"
    // log HTTP response details when available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errAny = error as any
    const status = errAny?.response?.status
    const data = errAny?.response?.data
    console.error(`[api] GET /api/groups/${groupId}/members error:`, {
      message,
      status,
      data,
    })

    const statusCode = status ?? 500
    return NextResponse.json({ message, details: data ?? null }, { status: statusCode })
  }
}
