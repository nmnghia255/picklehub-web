import { NextResponse } from "next/server"

import { listCenterBookings } from "@/features/sport-center-management/api/booking-service.server"

export async function GET(
  _request: Request,
  context: { params: Promise<{ centerId: string }> }
) {
  try {
    const { centerId } = await context.params

    if (!centerId) {
      return NextResponse.json({ message: "Missing centerId" }, { status: 400 })
    }

    const url = new URL((_request as Request).url)
    const params: Record<string, string | number> = {}
    url.searchParams.forEach((v, k) => {
      if (v !== "") params[k] = v
    })

    const result = await listCenterBookings(centerId, params)
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list bookings"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500
    return NextResponse.json({ message }, { status })
  }
}
