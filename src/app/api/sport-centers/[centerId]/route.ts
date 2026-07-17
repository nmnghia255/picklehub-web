import { NextResponse } from "next/server"

import { SportCenterOwnerService } from "@/features/sport-center-management/api/sport-center-service"

type RouteContext = {
  params: Promise<{ centerId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { centerId } = await context.params
    const data = await SportCenterOwnerService.getSportCenterDetails(centerId)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load sport center"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { centerId } = await context.params
    const body = await request.json()
    const data = await SportCenterOwnerService.updateSportCenter(centerId, body)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load sport center"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
