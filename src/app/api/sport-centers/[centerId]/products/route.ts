import { NextResponse } from "next/server"

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
    const message =
      error instanceof Error ? error.message : "Failed to load products"
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
    const data = await SportCenterOwnerService.createProduct(centerId, body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
