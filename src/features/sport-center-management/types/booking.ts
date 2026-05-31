import type { Court, CourtStatus, CourtType } from "./court"
import type { Player } from "./player"
import type { Product } from "./product"
import type { Service } from "./service"
import type { SimpleSportCenter, SportCenter } from "./sport-center"

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"

// ============================================
// Booking
// ============================================

export interface BookingItem {
  id: string
  bookingId: string

  courtId: string

  startTime: string
  endTime: string

  itemPrice: number

  createdAt: string

  court: Court
}

export interface BookingService {
  id: string
  bookingId: string
  serviceId: string

  quantity: number
  price: number

  createdAt: string

  service: Service
}

export interface BookingProduct {
  id: string
  bookingId: string
  productId: string

  quantity: number
  price: number

  createdAt: string

  product: Product
}

export interface BookingPriceBreakdown {
  startTime: string
  endTime: string
  pricePerHour: number
}

export interface BookingScheduleItem {
  courtId: string
  courtName: string

  startTime: string
  endTime: string

  durationHours: number

  breakdown: BookingPriceBreakdown[]

  courtPrice: number
}

export interface BookingServiceSummary {
  id: string

  name: string

  price: number
  unit: string

  quantity: number

  lineTotal: number
}

export interface BookingProductSummary {
  id: string

  name: string

  price: number
  unit: string

  stock: number

  quantity: number

  lineTotal: number
}

export interface Booking {
  id: string

  centerId: string

  playerId: string
  playerName: string
  phoneNumber: string

  date: string

  status: BookingStatus

  totalPrice: number

  creditApplied: number
  paymentRemaining: number

  note: string | null

  playSessionId: string | null

  paymentProofUrl: string | null
  paymentProofUploadedAt: string | null

  createdAt: string
  updatedAt: string

  cancelledAt: string | null
  cancelReason: string | null

  center: SportCenter

  bookingItems: BookingItem[]

  bookingServices: BookingService[]
  bookingProducts: BookingProduct[]

  items: BookingScheduleItem[]

  bookingCount: number

  totalCourtPrice: number
  totalServicePrice: number
  totalProductPrice: number

  services: BookingServiceSummary[]
  products: BookingProductSummary[]

  servicePricePerItem: number
  productPricePerItem: number
}

// ============================================
// Booking Details
// ============================================

export interface CourtWithCenter {
  id: string
  centerId: string

  name: string

  type: CourtType
  status: CourtStatus

  createdAt: string
  updatedAt: string

  center: SimpleSportCenter
}

export interface BookingDetail extends Booking {
  court: CourtWithCenter
  player: Player
}

// ============================================
// Sport Center Owner Booking
// ============================================

interface OwnerBookingItem {
  courtId: string
  startTime: string
  endTime: string
}

interface OwnerBookingServiceItem {
  serviceId: string
  quantity: number
}

interface OwnerBookingProductItem {
  productId: string
  quantity: number
}

export interface OwnerBooking {
  date: string
  items: OwnerBookingItem[]
  playerName: string
  phoneNumber: string
  serviceItems: OwnerBookingServiceItem[]
  productItems: OwnerBookingProductItem[]
  note?: string
}
