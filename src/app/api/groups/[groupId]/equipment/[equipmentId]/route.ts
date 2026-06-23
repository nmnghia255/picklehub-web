import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import {
  deleteEquipment,
  getEquipment,
  updateEquipment,
} from "@/features/groups/api/equipment-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string; equipmentId: string }> }
) {
  try {
    const { groupId, equipmentId } = await params
    const result = await getEquipment(groupId, equipmentId)
    return NextResponse.json(result)
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
          error instanceof Error ? error.message : "Failed to get equipment",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; equipmentId: string }> }
) {
  try {
    const { groupId, equipmentId } = await params
    const body = await request.json()
    const result = await updateEquipment(groupId, equipmentId, body)
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
          error instanceof Error ? error.message : "Failed to update equipment",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string; equipmentId: string }> }
) {
  try {
    const { groupId, equipmentId } = await params
    const result = await deleteEquipment(groupId, equipmentId)
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
          error instanceof Error ? error.message : "Failed to delete equipment",
      },
      { status: 500 }
    )
  }
}
