import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ groupId: string; activityId: string }> }
) {
  try {
    const { groupId, activityId } = await context.params
    const axiosClient = await getAuthenticatedAxios()
    const response = await axiosClient.get(
      `/api/groups/${groupId}/activities/${activityId}/members`
    )
    return NextResponse.json(response.data)
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || error.message },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to get activity members",
      },
      { status: 500 }
    )
  }
}
