import enSportCenter from "@/i18n/locales/en/sport-center.json"
import viSportCenter from "@/i18n/locales/vi/sport-center.json"

import type { BookingResponse } from "../types/booking"

function getSportCenterLocale() {
  const language =
    typeof navigator !== "undefined" ? (navigator.language ?? "") : ""
  return language.toLowerCase().startsWith("vi") ? viSportCenter : enSportCenter
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
    const sportCenter = getSportCenterLocale()
    throw new Error(
      payload.message || sportCenter.booking.history.cancelErrorDesc
    )
  }

  return (payload.data ?? payload) as T
}

export async function cancelBookingAction(
  bookingId: string,
  reason?: string
): Promise<BookingResponse> {
  return apiRequest<BookingResponse>(`/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  })
}
