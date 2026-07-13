import enManagement from "@/i18n/locales/en/sport-center-management.json"
import viManagement from "@/i18n/locales/vi/sport-center-management.json"

import type { Booking } from "../types/booking"

function getManagementLocale() {
  const language =
    typeof navigator !== "undefined" ? (navigator.language ?? "") : ""
  return language.toLowerCase().startsWith("vi") ? viManagement : enManagement
}

async function apiRequest<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string
    data?: T
  }

  if (!response.ok) {
    const management = getManagementLocale()
    throw new Error(
      payload.message || management.bookingList.errors.confirmFailed
    )
  }

  return (payload.data ?? payload) as T
}

export async function confirmBookingAction(bookingId: string) {
  return apiRequest<Booking>(`/api/bookings/${bookingId}/confirm`, {
    method: "PATCH",
  })
}
