import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  Booking,
  BookingDetail,
  BookingStatus,
  OwnerBooking,
} from "../types/booking"
import type { CreditTransaction, MyCredit } from "../types/credit"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: {
    total: number
    offset: number
    limit: number
  }
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const BookingService = {
  listBookings: async function listBookings(
    centerId: string,
    status: BookingStatus,
    courtId: string,
    date: string,
    offset = 0,
    limit = 20
  ): Promise<Booking[]> {
    const axios = await getAuthenticatedAxios()
    let stringBuilder = `/api/sport-centers/${centerId}/bookings?offset=${offset}&limit=${limit}`
    if (courtId) {
      stringBuilder += `&courts=${courtId}`
    }
    if (date) {
      stringBuilder += `&date=${date}`
    }
    if (status) {
      stringBuilder += `&status=${status}`
    }
    const response = await axios.get<Booking[]>(stringBuilder)
    console.log("Fetched bookings:", response.data)
    return unwrapApiResponse(response.data)
  },

  getBookingDetail: async function getBookingDetail(
    centerId: string,
    bookingId: string
  ): Promise<BookingDetail> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<BookingDetail>(
      `/api/sport-centers/${centerId}/bookings/${bookingId}`
    )
    return unwrapApiResponse(response.data)
  },

  // listBookingDetails: async function listBookingDetails(bookingId: string): Promise<BookingDetail> {
  //   const axios = await getAuthenticatedAxios()
  //   const response = await axios.get<BookingDetail>(`/api/bookings/${bookingId}`)
  //   return unwrapApiResponse(response.data)
  // },

  cancelBooking: async function cancelBookingByOwner(
    bookingId: string,
    cancelReason?: string
  ): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<Booking>(
      `/api/bookings/${bookingId}/cancel-by-owner`,
      { reason: cancelReason }
    )
    return unwrapApiResponse(response.data)
  },

  createBooking: async function createBooking(
    centerId: string,
    bookingData: OwnerBooking
  ): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<Booking>(
      `/api/sport-centers/${centerId}/bookings`,
      bookingData
    )
    return unwrapApiResponse(response.data)
  },

  confirmBooking: async function confirmBooking(
    bookingId: string
  ): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<Booking>(
      `/api/bookings/${bookingId}/confirm`
    )
    return unwrapApiResponse(response.data)
  },

  completeBooking: async function completeBooking(
    bookingId: string
  ): Promise<Booking> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<Booking>(
      `/api/bookings/${bookingId}/complete`
    )
    return unwrapApiResponse(response.data)
  },

  getMyPreservationsCreditWallets: async function getMyReservations(): Promise<
    MyCredit[]
  > {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<MyCredit[]>(`/api/bookings/credits`)
    return unwrapApiResponse(response.data)
  },

  getPreservationCreditTransactionHistory:
    async function getPreservationCreditTransactionHistory(
      centerId: string,
      limit = 20,
      offset = 0
    ): Promise<CreditTransaction[]> {
      const axios = await getAuthenticatedAxios()
      const response = await axios.get<CreditTransaction[]>(
        `/api/bookings/credits/${centerId}/transactions?limit=${limit}&offset=${offset}`
      )
      return unwrapApiResponse(response.data)
    },
}
