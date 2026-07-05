"use server"

import axios from "axios"

import { BookingService } from "@/features/sport-center/api/booking-service"
import type {
  BookingResponse,
  CreateBookingRequest,
} from "@/features/sport-center/types/booking"
import type { Product } from "@/features/sport-center/types/product"
import type { Service } from "@/features/sport-center/types/service"
import { getSession } from "@/lib/session"

type SelectedCourts = Record<string, string[]>
type ServiceSelectionState = Record<string, boolean>
type ProductSelectionState = Record<string, number>

export type SubmitBookingPayload = {
  centerId: string
  selectedDate: Date | string | undefined
  selectedCourts: SelectedCourts
  selectedServices: ServiceSelectionState
  selectedProducts: ProductSelectionState
  note: string
  useCredit: boolean
  serviceItems: Service[]
  productItems: Product[]
}

export type SubmitBookingState = {
  success: boolean
  message?: string
  error?: string
  booking?: BookingResponse
}

async function buildBookingRequest(
  payload: SubmitBookingPayload
): Promise<CreateBookingRequest> {
  const serviceItems = payload.serviceItems
    .filter((service) => payload.selectedServices[service.id])
    .map((service) => ({ serviceId: service.id, quantity: 1 }))

  const productItems = payload.productItems
    .map((product) => ({
      productId: product.id,
      quantity: payload.selectedProducts[product.id] ?? 0,
    }))
    .filter((item) => item.quantity > 0)

  const session = await getSession()
  const sessionUser = session.user
  const playerName = sessionUser?.name ?? "Khách vãng lai"
  const phoneNumber = sessionUser?.phoneNumber ?? "0123456789"
  const selectedDate = payload.selectedDate
  let formattedDate = ""
  if (selectedDate) {
    const d =
      typeof selectedDate === "string" ? new Date(selectedDate) : selectedDate
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    formattedDate = formatter.format(d)
  }

  const courtItems = Object.entries(payload.selectedCourts).flatMap(
    ([courtId, slots]) =>
      slots.map((slot) => {
        const [startTime = "", endTime = ""] = slot.split(" - ")

        return {
          courtId: courtId.toString(),
          startTime,
          endTime,
        }
      })
  )

  return {
    bookings: [
      {
        date: formattedDate,
        note: payload.note.trim(),
        serviceItems,
        productItems,
        items: courtItems,
      },
    ],
    playerName: playerName,
    phoneNumber: phoneNumber,
    useCredit: payload.useCredit,
  }
}

export async function submitBookingsAction(
  payload: SubmitBookingPayload
): Promise<SubmitBookingState> {
  if (!payload.centerId) {
    return {
      success: false,
      error: "Không tìm thấy mã sân. Vui lòng tải lại trang và thử lại.",
    }
  }

  if (!payload.selectedDate) {
    return {
      success: false,
      error: "Vui lòng chọn ngày đặt sân.",
    }
  }

  const bookingRequest = await buildBookingRequest(payload)

  if (bookingRequest.bookings[0].items.length === 0) {
    return {
      success: false,
      error: "Vui lòng chọn ít nhất một sân và khung giờ.",
    }
  }

  try {
    const booking = await BookingService.createBookings(
      payload.centerId,
      bookingRequest
    )

    return {
      success: true,
      message: "Đã gửi yêu cầu đặt sân thành công.",
      booking,
    }
  } catch (error) {
    console.error("Error in submitBookingsAction:", error)
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data)
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Không thể gửi yêu cầu đặt sân.",
      }
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Không thể gửi yêu cầu đặt sân.",
    }
  }
}
