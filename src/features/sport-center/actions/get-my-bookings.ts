"use server"

import { BookingService } from "@/features/sport-center/api/booking-service"
import type { MyBookingsResponse } from "@/features/sport-center/types/booking"

export async function getMyBookingsAction(
  params: {
    status?: "CONFIRMED"
    courtId?: string
    centerId?: string
    date?: string
    limit?: number
    offset?: number
  } = {}
): Promise<MyBookingsResponse> {
  const response = await BookingService.getMyBookings(params)
  return response
}
