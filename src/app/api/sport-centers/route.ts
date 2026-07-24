import { NextResponse } from "next/server"

import { getSportCenterRouteError } from "@/features/sport-center-management/api/route-error"
import { SportCenterOwnerService } from "@/features/sport-center-management/api/sport-center-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await SportCenterOwnerService.createSportCenter(body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to create sport center"
    )

    return NextResponse.json({ message }, { status })
  }
}
