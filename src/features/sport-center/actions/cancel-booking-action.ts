import type { BookingResponse } from "../types/booking"

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

export async function cancelBookingAction(
  bookingId: string,
  reason?: string
): Promise<BookingResponse> {
  return apiRequest<BookingResponse>(`/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  })
}
