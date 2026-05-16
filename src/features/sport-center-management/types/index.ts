// ============================================================================
// Booking Status Types
// ============================================================================

import { offsetPositive } from "recharts/types/util/ChartUtils"

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

// ============================================================================
// Booking Models
// ============================================================================

/**
 * Represents a booking in the system
 */
export interface Booking {
  id: string
  courtId: string
  playerId: string
  playerName: string
  date: string
  startTime: string
  endTime: string
  status: BookingStatus
  totalPrice?: number
  note?: string
  createdAt?: string
  updatedAt?: string
  cancelledAt?: string
  cancelReason?: string
  court: {
    id: string
    name: string
  }
  player: {
    id: string
    name: string
  }
}

// ============================================================================
// Pagination & Response Types
// ============================================================================

/**
 * Pagination metadata for list responses
 */
export interface BookingPaginationMeta {
  limit: number
  offset: number
  total: number
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
  data: Booking[]
  pagination?: BookingPaginationMeta
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
  centerId?: string
  status?: BookingStatus
  courtId?: string
  date?: string
  limit?: number
  offset?: number
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
