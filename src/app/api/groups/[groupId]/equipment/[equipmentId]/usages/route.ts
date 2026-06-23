import axios from "axios"
import { type NextRequest, NextResponse } from "next/server"

import {
  listEquipmentUsages,
  logEquipmentUsage,
} from "@/features/groups/api/equipment-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; equipmentId: string }> }
) {
  try {
    const { groupId, equipmentId } = await params
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    const fromDate = searchParams.get("fromDate")
    const toDate = searchParams.get("toDate")
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | null

    const result = await listEquipmentUsages(groupId, equipmentId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      sortOrder: sortOrder || undefined,
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
          error instanceof Error ? error.message : "Failed to list usage logs",
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; equipmentId: string }> }
) {
  try {
    const { groupId, equipmentId } = await params
    const body = await request.json()
    const result = await logEquipmentUsage(groupId, equipmentId, body)
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
          error instanceof Error
            ? error.message
            : "Failed to log equipment usage",
      },
      { status: 500 }
    )
  }
}
