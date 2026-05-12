import { NextResponse } from "next/server"

import { createBookingForCourt } from "@/features/sport-center-management/api/booking-service.server"

export async function POST(
  request: Request,
  context: { params: Promise<{ centerId: string; courtId: string }> }
) {
  try {
    const { centerId, courtId } = await context.params

    if (!centerId || !courtId) {
      return NextResponse.json(
        { message: "Missing parameters" },
        { status: 400 }
      )
    }

    const body = (await request.json()) as {
      date?: string
      startTime?: string
      endTime?: string
      note?: string
    }

    if (!body.date || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { message: "Missing booking time fields" },
        { status: 400 }
      )
    }

    const result = await createBookingForCourt(centerId, courtId, {
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      note: body.note,
    })

    return NextResponse.json({ data: result }, { status: 201 })
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
