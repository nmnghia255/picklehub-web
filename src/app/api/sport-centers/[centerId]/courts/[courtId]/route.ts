import { NextResponse } from "next/server"

import { CourtService } from "@/features/sport-center-management/api/court-service"
import { getSportCenterRouteError } from "@/features/sport-center-management/api/route-error"

type RouteContext = {
  params: Promise<{ centerId: string; courtId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { centerId, courtId } = await context.params
    const body = await request.json()
    const data = await CourtService.updateCourt(centerId, courtId, body)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to update court"
    )
    return NextResponse.json({ message }, { status })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { centerId, courtId } = await context.params
    const data = await CourtService.deleteCourt(centerId, courtId)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to archive court"
    )
    return NextResponse.json({ message }, { status })
  }
}
