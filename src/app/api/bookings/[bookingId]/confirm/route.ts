import { NextResponse } from "next/server"

import { BookingService } from "@/features/sport-center-management/api/booking-service"

type RouteContext = {
  params: Promise<{ bookingId: string }>
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { bookingId } = await context.params
    const booking = await BookingService.confirmBooking(bookingId)

    return NextResponse.json({ data: booking }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to confirm booking"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
