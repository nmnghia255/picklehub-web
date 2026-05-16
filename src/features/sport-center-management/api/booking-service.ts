"use server"

import type {
  Booking,
  BookingEnvelopeResponse,
  CreateBookingParams,
  ListCenterBookingsParams,
  ListCenterBookingsResult,
  PaginatedBookingResponse,
} from "@/features/sport-center-management/types"
import { getAuthenticatedAxios } from "@/lib/server-api"

// ============================================================================
// Booking Service - Server-side API client
// ============================================================================

/**
 * List all bookings for a specific sport center
 */
export async function listCenterBookings(
  centerId: string,
  params: ListCenterBookingsParams = {}
): Promise<ListCenterBookingsResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    | Booking[]
    | PaginatedBookingResponse
    | BookingEnvelopeResponse
    | {
        data: Booking[]
        pagination: { limit: number; offset: number; total: number }
      }
  >(`/api/sport-centers/${centerId}/bookings`, {
    params,
  })

  let data: Booking[] = []
  let pagination: { limit: number; offset: number; total: number } | undefined

  // Handle array response
  if (Array.isArray(response.data)) {
    data = response.data as Booking[]
  }
  // Handle object response with data property
  else if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data &&
    Array.isArray((response.data as { data: unknown }).data)
  ) {
    data = (response.data as { data: Booking[] }).data

    // Check for pagination in new format
    if ("pagination" in response.data) {
      pagination = (
        response.data as {
          pagination: { limit: number; offset: number; total: number }
        }
      ).pagination
    }
    // Check for meta in old format
    else if ("meta" in response.data) {
      const meta = (response.data as PaginatedBookingResponse).meta
      pagination = {
        limit: meta.limit,
        offset: meta.offset,
        total: meta.total,
      }
    }
  }

  return {
    data,
    pagination,
  }
}

/**
 * Get detailed information about a specific booking
 */
export async function getCenterBooking(
  centerId: string,
  bookingId: string
): Promise<Booking> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<Booking>(
    `/api/sport-centers/${centerId}/bookings/${bookingId}`
  )
  return response.data
}

/**
 * Confirm a booking (owner action)
 */
export async function confirmBookingByOwner(
  bookingId: string
): Promise<Booking> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<Booking>(
    `/api/bookings/${bookingId}/confirm`
  )
  return response.data
}

/**
 * Cancel a booking (owner action)
 */
export async function cancelBookingByOwner(
  bookingId: string
): Promise<Booking> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<Booking>(
    `/api/bookings/${bookingId}/cancel`
  )
  return response.data
}

/**
 * Complete a booking (owner action)
 */
export async function completeBookingByOwner(
  bookingId: string
): Promise<Booking> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<Booking>(
    `/api/bookings/${bookingId}/complete`
  )
  return response.data
}

/**
 * Create a booking for a specific court
 */
export async function createBookingForCourt(
  centerId: string,
  courtId: string,
  body: CreateBookingParams
): Promise<Booking> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<Booking>(
    `/api/sport-centers/${centerId}/courts/${courtId}/bookings`,
    body
  )
  return response.data
}

/**
 * Create a booking for a specific court by owner
 */
export async function createBookingForCourtByOwner(
  centerId: string,
  courtId: string,
  body: CreateBookingParams
): Promise<Booking> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<Booking>(
    `/api/sport-centers/${centerId}/courts/${courtId}/bookings/by-owner`,
    body
  )
  return response.data
}
