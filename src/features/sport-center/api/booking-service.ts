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
  if (payload && typeof payload === "object" && "data" in payload) {
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

  getMyBookings: async (
    status: BookingStatus,
    courtId: string,
    centerId: string,
    date: string,
    limit: number,
    offset: number
  ): Promise<MyBookingsResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(
      `/api/bookings/me?status=${status}&courtId=${courtId}&centerId=${centerId}&date=${date}&limit=${limit}&offset=${offset}`
    )
    return unwrapApiResponse(response.data)
  },

  cancelBooking: async (
    bookingId: string,
    cancelReason: string
  ): Promise<BookingResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put(
      `/api/bookings/${bookingId}/cancel?cancel_reason=${cancelReason}`
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
