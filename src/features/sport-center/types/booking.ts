import type { Court } from "./court"
import type { Product, ProductItem } from "./product"
import type { Service, ServiceItem } from "./service"
import type { SportCenter } from "./sport-center"

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"

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

export interface BookingRequest {
  date: string
  startTime: string
  endTime: string
  serviceItems: ServiceItem[]
  productItems: ProductItem[]
  note: string
}

export interface Booking {
  id: string
  courtId: string
  playerId: string
  playerName: string

  date: string
  startTime: string
  endTime: string

  status: BookingStatus
  totalPrice: number
  note: string | null

  playSessionId: string | null

  paymentProofUrl: string | null
  paymentProofUploadedAt: string | null

  createdAt: string
  updatedAt: string

  cancelledAt: string | null
  cancelReason: string | null

  court: Court

  bookingServices: BookingService[]
  bookingProducts: BookingProduct[]
}
