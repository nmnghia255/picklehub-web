import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string; id: string }> }
) {
  const { groupId, id } = await params

  try {
    const axiosInstance = await getAuthenticatedAxios()
    const response = await axiosInstance.get(
      `/api/groups/${groupId}/court-bookings/${id}/cancel-eligibility`
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
