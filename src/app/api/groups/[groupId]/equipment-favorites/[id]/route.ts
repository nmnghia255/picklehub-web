import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import {
  deleteEquipmentFavorite,
  updateEquipmentFavorite,
} from "@/features/groups/api/equipment-service"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; id: string }> }
) {
  try {
    const { groupId, id } = await params
    const body = await request.json()
    const result = await updateEquipmentFavorite(groupId, id, body)
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
            : "Failed to update equipment favorite",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string; id: string }> }
) {
  try {
    const { groupId, id } = await params
    const result = await deleteEquipmentFavorite(groupId, id)
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
            : "Failed to delete equipment favorite",
      },
      { status: 500 }
    )
  }
}
