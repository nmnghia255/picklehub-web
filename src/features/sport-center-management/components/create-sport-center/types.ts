import type {
  ProductType,
  ServiceType,
} from "../../services-products-management/types"
import type { CancellationTier } from "../../types/cancellation-policy"
import type { CourtLifecycleStatus, CourtType } from "../../types/court"

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

export type CenterDraft = {
  name: string
  address: string
  phone: string
  email: string
  description: string
  openTime: string
  closeTime: string
  basePrice: string
  paymentAccountName: string
  paymentAccountNumber: string
  paymentBankName: string
  paymentQrUrl: string
  images: string[]
  amenitiesText: string
  rulesText: string
}

export type PriceSlotDraft = {
  id: string
  serverId?: string
  startTime: string
  endTime: string
  pricePerHour: string
}

export type CourtDraft = {
  id: string
  name: string
  type: CourtType
  status: CourtLifecycleStatus
  serverId?: string
  error?: string
}

export type ServiceDraft = {
  id: string
  name: string
  type: ServiceType
  price: string
  unit: string
  description: string
  imageUrl: string
  serverId?: string
  error?: string
}

export type ProductDraft = {
  id: string
  name: string
  type: ProductType
  price: string
  unit: string
  stock: string
  description: string
  imageUrl: string
  serverId?: string
  error?: string
}

export type PolicyDraft = {
  allowCancellation: boolean
  tiers: Array<CancellationTier & { id: string }>
}

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

export function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

export function isValidHttpUrl(value: string) {
  if (!value.trim()) return true
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function draftCourtLabel(index: number) {
  return `Court ${index + 1}`
}

export function draftServiceLabel(index: number) {
  return `Service ${index + 1}`
}

export function draftProductLabel(index: number) {
  return `Product ${index + 1}`
}
