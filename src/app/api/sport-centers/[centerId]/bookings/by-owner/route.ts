import { NextResponse } from "next/server"

import { BookingService } from "@/features/sport-center-management/api/booking-service"
import type { OwnerBooking } from "@/features/sport-center-management/types/booking"

type RouteContext = {
  params: Promise<{ centerId: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { centerId } = await context.params
    const body = (await request.json()) as OwnerBooking

    const booking = await BookingService.createBooking(centerId, body)

    return NextResponse.json({ data: booking }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create booking"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
