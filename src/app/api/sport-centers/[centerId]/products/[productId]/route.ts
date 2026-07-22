import { NextResponse } from "next/server"

import { ProductService } from "@/features/sport-center-management/api/product-service"
import { getSportCenterRouteError } from "@/features/sport-center-management/api/route-error"

type RouteContext = {
  params: Promise<{ centerId: string; productId: string }>
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { centerId, productId } = await context.params
    const data = await ProductService.updateProduct(
      centerId,
      productId,
      await request.json()
    )
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to update product"
    )
    return NextResponse.json({ message }, { status })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { centerId, productId } = await context.params
    const data = await ProductService.deleteProduct(centerId, productId)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    const { message, status } = getSportCenterRouteError(
      error,
      "Failed to delete product"
    )
    return NextResponse.json({ message }, { status })
  }
}
