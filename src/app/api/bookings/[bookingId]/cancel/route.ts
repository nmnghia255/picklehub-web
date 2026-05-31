import { NextResponse } from "next/server"

import { BookingService } from "@/features/sport-center/api/booking-service"

type RouteContext = {
  params: Promise<{ bookingId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { bookingId } = await context.params
    const body = (await request.json().catch(() => ({}))) as {
      reason?: string
    }

    const booking = await BookingService.cancelBooking(
      bookingId,
      body.reason ?? ""
    )

    return NextResponse.json({ data: booking }, { status: 200 })
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
