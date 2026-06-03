import type { Booking, BookingSlot } from "../types/booking"

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

export async function createBookingAction(
  centerId: string,
  bookingDate: string,
  playerName: string,
  contact: string,
  note: string,
  bookingSlot: BookingSlot
) {
  const body = {
    date: bookingDate,
    items: [bookingSlot],
    playerName,
    phoneNumber: contact,
    serviceItems: [],
    productItems: [],
    note,
  }

  const response = await apiRequest<Booking>(
    `/api/sport-centers/${centerId}/bookings/by-owner`,
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(body),
    }
  )

  return response
}
