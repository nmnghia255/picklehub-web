import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ groupId: string; activityId: string; memberId: string }>
  }
) {
  const { groupId, activityId, memberId } = await params

  try {
    const body = await request.json()
    const axiosInstance = await getAuthenticatedAxios()
    const response = await axiosInstance.post(
      `/api/groups/${groupId}/activities/${activityId}/attendance/${memberId}/guest-status`,
      body
    )
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || error.message },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    )
  }
}
