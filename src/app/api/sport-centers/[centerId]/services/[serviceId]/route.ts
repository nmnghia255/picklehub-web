import { NextResponse } from "next/server"

import { getSportCenterRouteError } from "@/features/sport-center-management/api/route-error"
import { ServiceService } from "@/features/sport-center-management/api/service-service"

type RouteContext = {
  params: Promise<{ centerId: string; serviceId: string }>
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { centerId, serviceId } = await context.params
    const data = await ServiceService.updateService(
      centerId,
      serviceId,
      await request.json()
    )
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to update service"
    )
    return NextResponse.json({ message }, { status })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { centerId, serviceId } = await context.params
    const data = await ServiceService.deleteService(centerId, serviceId)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to delete service"
    )
    return NextResponse.json({ message }, { status })
  }
}
