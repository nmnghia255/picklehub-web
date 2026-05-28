import type { Booking } from "../types/booking"
import type { BookingStatus } from "../types/booking"

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
    throw new Error(payload.message || "Request failed")
  }

  return (payload.data ?? payload) as T
}

export async function listBookingListAction(
  centerId: string,
  status: BookingStatus | "",
  courtId: string,
  date: string,
  offset = 0,
  limit = 20
) {
  const searchParams = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  })

  if (status) searchParams.set("status", status)
  if (courtId) searchParams.set("courtId", courtId)
  if (date) searchParams.set("date", date)

  return apiRequest<Booking[]>(
    `/api/sport-centers/${centerId}/bookings?${searchParams.toString()}`
  )
}

export async function confirmBookingAction(bookingId: string) {
  return apiRequest<Booking>(`/api/bookings/${bookingId}/confirm`, {
    method: "POST",
  })
}

export async function cancelBookingAction(bookingId: string) {
  return apiRequest<Booking>(`/api/bookings/${bookingId}/cancel-by-owner`, {
    method: "POST",
  })
}
