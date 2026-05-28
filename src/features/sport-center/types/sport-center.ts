import type { Product } from "./product"
import type { Service } from "./service"

export type SportCenterStatus = "ACTIVE" | "INACTIVE"

export interface SportCenterResponse {
  id: string
  ownerId: string
  name: string
  address: string
  phone: string
  email: string
  openTime: string
  closeTime: string
  basePrice: number
  status: SportCenterStatus
  amenities: string[]
  images: string[]
  rules: string[]
  description: string
  paymentAccountName: string
  paymentAccountNumber: string
  paymentBankName: string
  paymentQrUrl: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// ============================================
// Sport Center Price Slot
// ============================================

export interface PriceSlot {
  id: string
  centerId: string
  startTime: string
  endTime: string
  pricePerHour: number
  createdAt: string
  updatedAt: string
}

export interface SportCenterCount {
  courts: number
}

// ============================================
// Sport Center
// ============================================

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
  status: SportCenterStatus

  amenities: string[]
  images: string[]
  rules: string[]

  description: string

  paymentAccountName: string
  paymentAccountNumber: string
  paymentBankName: string
  paymentQrUrl: string

  createdAt: string
  updatedAt: string
  deletedAt: string | null

  priceSlots: PriceSlot[]
  services: Service[]
  products: Product[]

  _count: SportCenterCount

  averageRating: number
  reviewCount: number
  isFavourite: boolean
}

// ============================================
// Sport Center Favorite
// ============================================

export interface SportCenterFavorite {
  id: string
  centerId: string
  userId: string
  createdAt: string
}
