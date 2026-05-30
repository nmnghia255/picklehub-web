import { NextResponse } from "next/server"

import { BookingService as SportCenterBookingService } from "@/features/sport-center/api/booking-service"
import type { CreateBookingRequest } from "@/features/sport-center/types/booking"
import { BookingService } from "@/features/sport-center-management/api/booking-service"
import type { BookingStatus } from "@/features/sport-center-management/types/booking"

type RouteContext = {
  params: Promise<{ centerId: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { centerId } = await context.params
    const url = new URL(request.url)
    const status = (url.searchParams.get("status") ?? "") as BookingStatus | ""
    const courtId =
      url.searchParams.get("courtId") ?? url.searchParams.get("courts") ?? ""
    const date = url.searchParams.get("date") ?? ""
    const offset = Number(url.searchParams.get("offset") ?? "0")
    const limit = Number(url.searchParams.get("limit") ?? "20")

    const bookings = await BookingService.listBookings(
      centerId,
      status,
      courtId,
      date,
      offset,
      limit
    )

    return NextResponse.json(
      { data: bookings.data, pagination: bookings.pagination },
      { status: 200 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load bookings"
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
    const body = (await request.json()) as CreateBookingRequest

    const booking = await SportCenterBookingService.createBookings(
      centerId,
      body
    )

    return NextResponse.json(booking, { status: 200 })
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
