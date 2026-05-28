import type { SportCenter } from "./sport-center"

export type CourtType = "INDOOR" | "OUTDOOR"

export type CourtStatus = "ACTIVE" | "INACTIVE"

export interface Court {
  id: string
  centerId: string
  name: string
  type: CourtType
  status: CourtStatus
  createdAt: string
  updatedAt: string

  center: SportCenter
}

export interface CourtRequest {
  name: string
  type: CourtType
  status: CourtStatus
}

export interface CourtResponse {
  id: string
  centerId: string
  name: string
  type: CourtType
  status: CourtStatus
  createdAt: string
  updatedAt: string
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
