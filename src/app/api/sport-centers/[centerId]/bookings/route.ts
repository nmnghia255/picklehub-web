import { NextResponse } from "next/server"

import {
  buildBookingRequest,
  type SubmitBookingPayload,
} from "@/features/sport-center/actions/submit-booking-action"
import { BookingService as SportCenterBookingService } from "@/features/sport-center/api/booking-service"
import type { CreateBookingRequest } from "@/features/sport-center/types/booking"
import { BookingService } from "@/features/sport-center-management/api/booking-service"
import type { BookingStatus } from "@/features/sport-center-management/types/booking"

type RouteContext = {
  params: Promise<{ centerId: string }>
}

type ClientBookingPayload = Omit<SubmitBookingPayload, "centerId">

function isClientBookingPayload(value: unknown): value is ClientBookingPayload {
  if (!value || typeof value !== "object") return false

  const record = value as Record<string, unknown>
  return (
    "selectedDate" in record &&
    "selectedCourts" in record &&
    "selectedServices" in record &&
    "selectedProducts" in record &&
    "note" in record &&
    "useCredit" in record &&
    "serviceItems" in record &&
    "productItems" in record
  )
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
    const body = (await request.json()) as
      | CreateBookingRequest
      | ClientBookingPayload

    const bookingRequest = isClientBookingPayload(body)
      ? await buildBookingRequest({
          ...body,
          centerId,
        })
      : body

    const booking = await SportCenterBookingService.createBookings(
      centerId,
      bookingRequest
    )

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 200 }
    )
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
