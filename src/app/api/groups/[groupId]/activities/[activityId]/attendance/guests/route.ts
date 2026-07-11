import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; activityId: string }> }
) {
  const { groupId, activityId } = await params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  try {
    const axiosInstance = await getAuthenticatedAxios()
    const response = await axiosInstance.get(
      `/api/groups/${groupId}/activities/${activityId}/attendance/guests`,
      { params: status ? { status } : undefined }
    )
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Guests API backend error:",
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; activityId: string }> }
) {
  const { groupId, activityId } = await params

  try {
    const body = await request.json()
    const axiosInstance = await getAuthenticatedAxios()
    const response = await axiosInstance.post(
      `/api/groups/${groupId}/activities/${activityId}/attendance/guests`,
      body
    )
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Guests API backend error:",
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
