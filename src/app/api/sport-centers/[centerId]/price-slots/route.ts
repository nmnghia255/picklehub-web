import { NextResponse } from "next/server"

import { SportCenterOwnerService } from "@/features/sport-center-management/api/sport-center-service"

type RouteContext = {
  params: Promise<{ centerId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { centerId } = await context.params
    const data = await SportCenterOwnerService.listPriceSlots(centerId)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load price slots"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { centerId } = await context.params
    const body = await request.json()
    const data = await SportCenterOwnerService.createPriceSlot(centerId, body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create price slot"
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
    const data = await SportCenterOwnerService.updatePriceSlots(centerId, body)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update price slots"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
