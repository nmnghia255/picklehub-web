import { NextResponse } from "next/server"

import { getCenterBooking } from "@/features/sport-center-management/api/booking-service.server"

export async function GET(
  _request: Request,
  context: { params: Promise<{ centerId: string; bookingId: string }> }
) {
  try {
    const { centerId, bookingId } = await context.params

    if (!centerId || !bookingId) {
      return NextResponse.json(
        { message: "Missing parameters" },
        { status: 400 }
      )
    }

    const result = await getCenterBooking(centerId, bookingId)
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get booking"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500
    return NextResponse.json({ message }, { status })
  }
}
