import { NextResponse } from "next/server"

import { getSportCenterRouteError } from "@/features/sport-center-management/api/route-error"
import { SportCenterOwnerService } from "@/features/sport-center-management/api/sport-center-service"

type RouteContext = {
  params: Promise<{ centerId: string; slotId: string }>
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { centerId, slotId } = await context.params
    const data = await SportCenterOwnerService.deletePriceSlot(centerId, slotId)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to delete price slot"
    )

    return NextResponse.json({ message }, { status })
  }
}
