import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CancelBookingResponse,
  CreateTournamentBookingResponse,
  TournamentBooking,
  TournamentBookingRequest,
} from "../types/booking"

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

export const TournamentBookingService = {
  // Books one or more court/time slots at a selected center via the player flow (starts PENDING).
  // Returns the local mirror plus sport-center payment info.
  createBookings: async (
    tournamentId: number,
    request: TournamentBookingRequest
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<
      ApiResponse<CreateTournamentBookingResponse>
    >(`/api/tournaments/${tournamentId}/bookings`, request)
    return unwrapApiResponse(response.data)
  },

  getBookings: async (tournamentId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<TournamentBooking[]>>(
      `/api/tournaments/${tournamentId}/bookings`
    )
    return unwrapApiResponse(response.data)
  },

  // Refreshes each mirror status from sport-center (PENDING → CONFIRMED / EXPIRED / CANCELLED).
  syncBookingStatus: async (tournamentId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<void>>(
      `/api/tournaments/${tournamentId}/bookings/sync`
    )
    return unwrapApiResponse(response.data)
  },

  // Cancels the booking in sport-center and unlinks any fixtures using it.
  cancelBooking: async (tournamentId: number, bookingId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<CancelBookingResponse>>(
      `/api/tournaments/${tournamentId}/bookings/${bookingId}`
    )
    return unwrapApiResponse(response.data)
  },
}
