import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import { listEquipmentFavorites } from "@/features/groups/api/equipment-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const result = await listEquipmentFavorites(groupId)
    return NextResponse.json(result)
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
            : "Failed to list equipment favorites",
      },
      { status: 500 }
    )
  }
}
