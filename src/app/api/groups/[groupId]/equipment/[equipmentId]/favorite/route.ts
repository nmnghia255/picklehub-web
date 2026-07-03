import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import { toggleEquipmentFavorite } from "@/features/groups/api/equipment-service"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; equipmentId: string }> }
) {
  try {
    const { groupId, equipmentId } = await params
    const { isFavorite } = await request.json()
    const result = await toggleEquipmentFavorite(
      groupId,
      equipmentId,
      isFavorite
    )
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
            : "Failed to toggle favorite status",
      },
      { status: 500 }
    )
  }
}
