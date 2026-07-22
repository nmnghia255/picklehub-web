import type { SportCenter } from "./sport-center"

export type CourtType = "INDOOR" | "OUTDOOR"

export type CourtStatus = "ACTIVE" | "INACTIVE"
export type CourtLifecycleStatus = "ACTIVE" | "MAINTENANCE" | "ARCHIVED"

export interface Court {
  id: string
  centerId: string
  name: string
  type: CourtType
  status: CourtStatus | CourtLifecycleStatus
  createdAt: string
  updatedAt: string

  center: SportCenter
}

export interface CourtRequest {
  name: string
  type: CourtType
  status?: CourtLifecycleStatus
}

export interface CourtResponse {
  id: string
  centerId: string
  name: string
  type: CourtType
  status: CourtStatus | CourtLifecycleStatus
  createdAt: string
  updatedAt: string
}

export interface CreateCourtRequest {
  name: string
  type: CourtType
  status?: CourtLifecycleStatus
}

export interface UpdateCourtRequest {
  name?: string
  type?: CourtType
  status?: CourtLifecycleStatus
}

export interface CourtSlot {
  startTime: string
  endTime: string
  available: boolean
  pricePerHour: number
}

export interface CourtAvailabilityResponse {
  date: string
  courtId: string
  centerId: string
  slots: CourtSlot[]
}

export interface CourtAvailability {
  courtId: string
  courtName: string
  slots: CourtSlot[]
}

export interface BulkCourtAvailability {
  date: string
  centerId: string
  courtCount: number
  courts: CourtAvailability[]
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
