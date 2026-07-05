"use server"

import { BookingService } from "@/features/sport-center/api/booking-service"
import type {
  BookingResponse,
  CreateBookingRequest,
} from "@/features/sport-center/types/booking"

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

export async function createSportCenterBookingsAction(
  payload: CreateSportCenterBookingsPayload
): Promise<CreateSportCenterBookingsState> {
  if (!payload.centerId) {
    return {
      success: false,
      error: "Không tìm thấy mã sân. Vui lòng tải lại trang và thử lại.",
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
      error: "Vui lòng chọn ít nhất một sân và khung giờ để đặt.",
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
      message: "Đã gửi yêu cầu đặt sân thành công.",
      booking,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Không thể gửi yêu cầu đặt sân.",
    }
  }
}
