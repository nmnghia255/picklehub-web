import { NextResponse } from "next/server"

import { cancelBookingByOwner } from "@/features/sport-center-management/api/booking-service.server"

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await context.params

    if (!bookingId) {
      return NextResponse.json(
        { message: "Missing bookingId" },
        { status: 400 }
      )
    }

    const result = await cancelBookingByOwner(bookingId)
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel booking"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500
    return NextResponse.json({ message }, { status })
  }
}
