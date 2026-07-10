import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string; activityId: string }> }
) {
  const { groupId, activityId } = await params

  try {
    const axiosInstance = await getAuthenticatedAxios()
    const response = await axiosInstance.post(
      `/api/groups/${groupId}/activities/${activityId}/attendance/absence`
    )
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Absence POST backend error:",
        error.response?.status,
        error.response?.data
      )
      return NextResponse.json(
        error.response?.data || { message: error.message },
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string; activityId: string }> }
) {
  const { groupId, activityId } = await params

  try {
    const axiosInstance = await getAuthenticatedAxios()
    const response = await axiosInstance.delete(
      `/api/groups/${groupId}/activities/${activityId}/attendance/absence`
    )
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Absence POST backend error:",
        error.response?.status,
        error.response?.data
      )
      return NextResponse.json(
        error.response?.data || { message: error.message },
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
