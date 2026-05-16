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
  playerName: string
  note?: string
}

// ============================================================================
// Court Models
// ============================================================================

/**
 * Represents a court in a sport center
 */
export interface Court {
  id: string
  centerId: string
  name: string
  type: string
  status: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Pagination metadata for court list responses
 */
export interface CourtPaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Paginated court response from API
 */
export interface PaginatedCourtResponse {
  data: Court[]
  meta: CourtPaginationMeta
}

/**
 * Envelope response with court array
 */
export interface CourtEnvelopeResponse {
  data: Court[]
}

/**
 * List result for courts with optional pagination metadata
 */
export interface ListCenterCourtsResult {
  courts: Court[]
  meta?: CourtPaginationMeta
}

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

// ============================================================================
// Sport center Models
// ============================================================================

/**
 *  Represents a sport center in the system
 */
export interface SportCenter {
  id: string
  ownerId: string
  name: string
  address: string
  phone: string
  email: string
  openTime: string
  closeTime: string
  basePrice: number
  status: string
  amenities: string[]
  images: string[]
  rules: string[]
  description: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  _count?: {
    courts: number
  }
}
