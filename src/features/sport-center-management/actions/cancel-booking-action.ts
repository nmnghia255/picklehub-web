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
      payload.message || management.bookingList.errors.cancelFailed
    )
  }

  return (payload.data ?? payload) as T
}

export async function cancelBookingAction(bookingId: string, reason?: string) {
  const response = await apiRequest<Booking>(
    `/api/bookings/${bookingId}/cancel-by-owner?cancel_reason=${encodeURIComponent(reason || "")}`,
    {
      method: "PATCH",
    }
  )
  return response
}
