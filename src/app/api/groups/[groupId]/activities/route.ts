import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import {
  createActivity,
  listActivities,
} from "@/features/group-activity-schedule/api/activities-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    const type = searchParams.get("type") as "upcoming" | "past" | null

    const activities = await listActivities(groupId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      type: type || undefined,
    })

    return NextResponse.json(activities)
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
          error instanceof Error ? error.message : "Failed to list activities",
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const body = await request.json()
    const activity = await createActivity(groupId, body)
    return NextResponse.json(activity, { status: 201 })
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message
      return NextResponse.json(
        { message: errorMessage },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create activity",
      },
      { status: 500 }
    )
  }
}
