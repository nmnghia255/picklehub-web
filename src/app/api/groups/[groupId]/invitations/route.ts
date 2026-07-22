import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await context.params

  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(`/api/groups/${groupId}/invitations`)

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load invitations"
    const axiosError = error as {
      response?: { status?: number; data?: unknown }
    }
    const statusCode = axiosError.response?.status ?? 500
    const responseData = axiosError.response?.data

    return NextResponse.json(responseData ?? { message }, {
      status: statusCode,
    })
  }
}
