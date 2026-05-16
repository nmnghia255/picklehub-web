// ============================================================================
// Booking Status Types
// ============================================================================

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

// ============================================================================
// Booking Models
// ============================================================================

/**
 * Represents a booking in the system
 */
export interface Booking {
  id: string
  playerName: string
  contact: string
  status: BookingStatus
  time: string
  court: string
}

// ============================================================================
// Pagination & Response Types
// ============================================================================

/**
 * Pagination metadata for list responses
 */
export interface BookingPaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Paginated booking response from API
 */
export interface PaginatedBookingResponse {
  data: Booking[]
  meta: BookingPaginationMeta
}

/**
 * Envelope response with booking array
 */
export interface BookingEnvelopeResponse {
  data: Booking[]
}

/**
 * List result for bookings with optional pagination metadata
 */
export interface ListCenterBookingsResult {
  bookings: Booking[]
  meta?: BookingPaginationMeta
}

// ============================================================================
// Booking Request DTOs
// ============================================================================

/**
 * Parameters for creating a booking
 */
export interface CreateBookingParams {
  date: string
  startTime: string
  endTime: string
  note?: string
}

/**
 * Parameters for creating a booking by owner
 */
export interface CreateBookingByOwnerParams extends CreateBookingParams {
  playerName: string
  playerPhone?: string
}

// ============================================================================
// List Parameters
// ============================================================================

/**
 * Parameters for listing center bookings
 */
export interface ListCenterBookingsParams {
  page?: number
  limit?: number
  status?: BookingStatus
  date?: string
  from?: string
  to?: string
}
