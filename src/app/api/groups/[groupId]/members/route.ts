import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await context.params

  try {
    const { searchParams } = new URL(_request.url)
    const activityId = searchParams.get("activityId")
    const url = activityId
      ? `/api/groups/${groupId}/members?activityId=${activityId}`
      : `/api/groups/${groupId}/members`

    const axios = await getAuthenticatedAxios()
    const response = await axios.get(url)
    console.log(`[api] GET ${url} -> ${response.status}`)
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load members"
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
    return NextResponse.json(
      { message, details: data ?? null },
      { status: statusCode }
    )
  }
}
