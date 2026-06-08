import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import {
  deleteActivity,
  getActivity,
  updateActivity,
} from "@/features/group-activity-schedule/api/activities-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string; activityId: string }> }
) {
  try {
    const { groupId, activityId } = await params
    const activity = await getActivity(groupId, activityId)
    return NextResponse.json(activity)
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || error.message },
        { status: error.response?.status || 404 }
      )
    }
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to get activity",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; activityId: string }> }
) {
  try {
    const { groupId, activityId } = await params
    const body = await request.json()
    const activity = await updateActivity(groupId, activityId, body)
    return NextResponse.json(activity)
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
          error instanceof Error ? error.message : "Failed to update activity",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string; activityId: string }> }
) {
  try {
    const { groupId, activityId } = await params
    await deleteActivity(groupId, activityId)
    return NextResponse.json({ message: "Activity deleted successfully" })
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
          error instanceof Error ? error.message : "Failed to delete activity",
      },
      { status: 500 }
    )
  }
}
