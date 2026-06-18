"use server"

import { BookingService } from "@/features/sport-center/api/booking-service"
import type {
  BookingStatus,
  MyBookingsResponse,
} from "@/features/sport-center/types/booking"

export async function getMyBookingsAction(
  params: {
    status?: BookingStatus | ""
    courtId?: string
    centerId?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  } = {}
): Promise<MyBookingsResponse> {
  const response = await BookingService.getMyBookings(params)
  return response
}
