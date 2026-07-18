import { NextResponse } from "next/server"

import { getSportCenterRouteError } from "@/features/sport-center-management/api/route-error"
import { SportCenterOwnerService } from "@/features/sport-center-management/api/sport-center-service"

type RouteContext = {
  params: Promise<{ centerId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { centerId } = await context.params
    const data = await SportCenterOwnerService.listProducts(centerId)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to load products"
    )

    return NextResponse.json({ message }, { status })
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { centerId } = await context.params
    const body = await request.json()
    const data = await SportCenterOwnerService.createProduct(centerId, body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to create product"
    )

    return NextResponse.json({ message }, { status })
  }
}
