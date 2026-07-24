import type { SportCenter } from "../../types/sport-center"

export const managementDetailQueryKey = (centerId: string) => [
  "sport-center-management",
  "detail",
  centerId,
]

export const editDetailQueryKey = (centerId: string) => [
  "sport-center-management",
  "edit-detail",
  centerId,
]

export type EditFormState = {
  name: string
  address: string
  phone: string
  email: string
  description: string
  openTime: string
  closeTime: string
  basePrice: string
  images: string[]
  rules: string[]
  amenities: string[]
  paymentAccountName: string
  paymentAccountNumber: string
  paymentBankName: string
  paymentQrUrl: string
}

export type PendingEditRemoval = {
  kind: "rule" | "amenity"
  index: number
  label: string
}

export function getEditForm(center: SportCenter): EditFormState {
  return {
    name: center.name,
    address: center.address,
    phone: center.phone,
    email: center.email ?? "",
    description: center.description ?? "",
    openTime: center.openTime,
    closeTime: center.closeTime,
    basePrice: String(center.basePrice),
    images: [...(center.images ?? [])],
    rules: [...(center.rules ?? [])],
    amenities: [...(center.amenities ?? [])],
    paymentAccountName: center.paymentAccountName ?? "",
    paymentAccountNumber: center.paymentAccountNumber ?? "",
    paymentBankName: center.paymentBankName ?? "",
    paymentQrUrl: center.paymentQrUrl ?? "",
  }
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value))
}
