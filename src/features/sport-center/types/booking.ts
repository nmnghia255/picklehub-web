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

export interface BookingCourtItem {
  courtId: string
  startTime: string
  endTime: string
}

export interface CreateBookingRequest {
  date: string
  note: string
  phoneNumber: string
  useCredit: boolean
  serviceItems: ServiceItem[]
  productItems: ProductItem[]
  items: BookingCourtItem[]
}

export interface PreviewBookingRequest {
  date: string
  courtItems: BookingCourtItem[]
  serviceItems: ServiceItem[]
  productItems: ProductItem[]
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

export interface BookingResponse {
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

  note: string

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

export interface MyBookingsResponse {
  data: BookingResponse[]
  pagination: {
    limit: number
    offset: number
    total: number
  }
}
