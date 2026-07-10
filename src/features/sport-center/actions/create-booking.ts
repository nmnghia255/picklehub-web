"use server"

import { headers } from "next/headers"

import { BookingService } from "@/features/sport-center/api/booking-service"
import type {
  BookingResponse,
  CreateBookingRequest,
} from "@/features/sport-center/types/booking"
import enSportCenter from "@/i18n/locales/en/sport-center.json"
import viSportCenter from "@/i18n/locales/vi/sport-center.json"

export type CreateSportCenterBookingsPayload = {
  centerId: string
  bookingRequest: CreateBookingRequest
}

export type CreateSportCenterBookingsState = {
  success: boolean
  message?: string
  error?: string
  booking?: BookingResponse
}

async function getSportCenterLocale() {
  const acceptLanguage = (await headers()).get("accept-language") ?? ""
  return acceptLanguage.toLowerCase().startsWith("vi")
    ? viSportCenter
    : enSportCenter
}

export async function createSportCenterBookingsAction(
  payload: CreateSportCenterBookingsPayload
): Promise<CreateSportCenterBookingsState> {
  const sportCenter = await getSportCenterLocale()

  if (!payload.centerId) {
    return {
      success: false,
      error: sportCenter.booking.confirmation.errorNoCenterId,
    }
  }

  const totalItems =
    payload.bookingRequest.bookings?.reduce(
      (acc, b) => acc + (b.items?.length ?? 0),
      0
    ) ?? 0

  if (totalItems === 0) {
    return {
      success: false,
      error: sportCenter.booking.confirmation.errorSelectCourts,
    }
  }

  try {
    console.log("Submitting booking request for centerId:", payload.centerId)
    console.log("Booking Request:", payload.bookingRequest)

    const booking = await BookingService.createBookings(
      payload.centerId,
      payload.bookingRequest
    )

    return {
      success: true,
      message: sportCenter.booking.confirmation.successSubmit,
      booking,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : sportCenter.booking.confirmation.errorCreateBooking,
    }
  }
}
