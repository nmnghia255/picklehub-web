import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  BookingResponse,
  BookingStatus,
  CreateBookingRequest,
  MyBookingsResponse,
  PreviewBookingRequest,
} from "../types/booking"
import type { Credit } from "../types/credit"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const BookingService = {
  createBookings: async (
    centerId: string,
    bookingRequest: CreateBookingRequest
  ): Promise<BookingResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/sport-centers/${centerId}/bookings`,
      bookingRequest
    )
    return unwrapApiResponse(response.data)
  },

  getBookingById: async (bookingId: string): Promise<BookingResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(`/api/bookings/${bookingId}`)
    return unwrapApiResponse(response.data)
  },

  getMyBookings: async ({
    status,
    courtId,
    centerId,
    date,
    limit = 20,
    offset = 0,
  }: {
    status?: BookingStatus | ""
    courtId?: string
    centerId?: string
    date?: string
    limit?: number
    offset?: number
  } = {}): Promise<MyBookingsResponse> => {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()

    if (status) searchParams.set("status", status)
    if (courtId) searchParams.set("courtId", courtId)
    if (centerId) searchParams.set("centerId", centerId)
    if (date) searchParams.set("date", date)

    searchParams.set("limit", String(limit))
    searchParams.set("offset", String(offset))

    const response = await axios.get(
      `/api/bookings/me?${searchParams.toString()}`
    )
    return unwrapApiResponse(response.data)
  },

  cancelBooking: async (
    bookingId: string,
    cancelReason: string
  ): Promise<BookingResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch(
      `/api/bookings/${bookingId}/cancel?cancel_reason=${encodeURIComponent(cancelReason)}`
    )
    return unwrapApiResponse(response.data)
  },

  submitPaymentProof: async (
    bookingId: string,
    paymentProofUrl: string
  ): Promise<BookingResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch(
      `/api/bookings/${bookingId}/payment-proof`,
      { paymentProofUrl }
    )
    return unwrapApiResponse(response.data)
  },

  previewBooking: async (
    centerId: string,
    bookingRequest: PreviewBookingRequest
  ): Promise<BookingResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/sport-centers/${centerId}/bookings/preview`,
      bookingRequest
    )
    return unwrapApiResponse(response.data)
  },

  getCreditBalance: async (): Promise<Credit> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(`/api/bookings/credits`)
    return unwrapApiResponse(response.data)
  },
}
