import { NextResponse } from "next/server"

import { getSportCenterRouteError } from "@/features/sport-center-management/api/route-error"
import { SportCenterOwnerService } from "@/features/sport-center-management/api/sport-center-service"

export async function GET() {
  try {
    const data = await SportCenterOwnerService.listOwnerSportCenters()
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to load sport centers"
    )
    return NextResponse.json({ message }, { status })
  }
}
