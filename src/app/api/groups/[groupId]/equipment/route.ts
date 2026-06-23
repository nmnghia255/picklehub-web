import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import {
  createEquipment,
  listEquipment,
} from "@/features/groups/api/equipment-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    const condition = searchParams.get("condition")
    const search = searchParams.get("search")
    const includeDeleted = searchParams.get("includeDeleted")

    const result = await listEquipment(groupId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      condition: condition || undefined,
      search: search || undefined,
      includeDeleted: includeDeleted === "true" ? true : undefined,
    })

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
          error instanceof Error ? error.message : "Failed to list equipment",
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
    const result = await createEquipment(groupId, body)
    return NextResponse.json(result, { status: 201 })
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
          error instanceof Error ? error.message : "Failed to create equipment",
      },
      { status: 500 }
    )
  }
}
