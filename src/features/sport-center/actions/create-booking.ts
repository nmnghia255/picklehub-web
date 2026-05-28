"use server"

import { createBooking } from "@/features/sport-center/api/sport-center-service"
import type { BookingRequest } from "@/features/sport-center/types/booking"

export type CreateSportCenterBookingsPayload = {
  centerId: string
  bookings: Array<{
    courtId: string
    bookingRequest: BookingRequest
  }>
}

export type CreateSportCenterBookingsState = {
  success: boolean
  message?: string
  error?: string
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

  if (!payload.bookings.length) {
    return {
      success: false,
      error: "Vui lòng chọn ít nhất một sân và khung giờ để đặt.",
    }
  }

  try {
    await Promise.all(
      payload.bookings.map(({ courtId, bookingRequest }) =>
        createBooking(payload.centerId, courtId, bookingRequest)
      )
    )

    return {
      success: true,
      message: `Đã gửi ${payload.bookings.length} lượt đặt sân thành công.`,
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
