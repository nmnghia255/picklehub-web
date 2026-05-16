import type {
  Booking,
  BookingEnvelopeResponse,
  CreateBookingByOwnerParams,
  CreateBookingParams,
  ListCenterBookingsParams,
  ListCenterBookingsResult,
  PaginatedBookingResponse,
} from "@/features/sport-center-management/types"
import { apiClient } from "@/lib/api-client"

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
  const response = await apiClient.get<
    Booking[] | PaginatedBookingResponse | BookingEnvelopeResponse
  >(`/api/sport-centers/${centerId}/bookings`, {
    params,
  })

  let bookings: Booking[] = []

  if (Array.isArray(response.data)) {
    bookings = response.data as Booking[]
  } else if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data &&
    Array.isArray((response.data as { data: unknown }).data)
  ) {
    bookings = (response.data as { data: Booking[] }).data
  }

  if (
    response.data &&
    typeof response.data === "object" &&
    "meta" in response.data
  ) {
    return {
      bookings,
      meta: (response.data as PaginatedBookingResponse).meta,
    }
  }

  return { bookings }
}

/**
 * Get detailed information about a specific booking
 */
export async function getCenterBooking(
  centerId: string,
  bookingId: string
): Promise<Booking> {
  const response = await apiClient.get<Booking>(
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
  const response = await apiClient.patch<Booking>(
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
  const response = await apiClient.patch<Booking>(
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
  const response = await apiClient.patch<Booking>(
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
  const response = await apiClient.post<Booking>(
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
  body: CreateBookingByOwnerParams
): Promise<Booking> {
  const response = await apiClient.post<Booking>(
    `/api/sport-centers/${centerId}/courts/${courtId}/bookings/by-owner`,
    body
  )
  return response.data
}
