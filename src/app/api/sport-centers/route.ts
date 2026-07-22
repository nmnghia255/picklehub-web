import { NextResponse } from "next/server"

import { SportCenterOwnerService } from "@/features/sport-center-management/api/sport-center-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await SportCenterOwnerService.createSportCenter(body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create sport center"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
