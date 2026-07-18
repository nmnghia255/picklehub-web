import type { PriceSlot } from "./price-slot"
import type { Product } from "./product"
import type { Service } from "./service"

export type SportCenterStatus = "ACTIVE" | "INACTIVE"

export interface CreateSportCenterRequest {
  name: string
  address: string
  phone: string
  email?: string
  description?: string
  images?: string[]
  rules?: string[]
  openTime: string
  closeTime: string
  basePrice: number
  status: SportCenterStatus
  amenities?: string[]
  paymentAccountName: string
  paymentAccountNumber: string
  paymentBankName: string
  paymentQrUrl?: string
}

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

// ============================================
// Sport Center Request
// ============================================

export interface UpdateSportCenterRequest {
  name?: string
  address?: string
  phone?: string
  email?: string
  description?: string
  images?: string[]
  rules?: string[]
  openTime?: string
  closeTime?: string
  basePrice?: number
  status?: SportCenterStatus
  amenities?: string[]
  paymentAccountName?: string
  paymentAccountNumber?: string
  paymentBankName?: string
  paymentQrUrl?: string
}

export interface SimpleSportCenter {
  id: string
  ownerId: string
  name: string
}
