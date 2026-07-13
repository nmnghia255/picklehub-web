import enManagement from "@/i18n/locales/en/sport-center-management.json"
import viManagement from "@/i18n/locales/vi/sport-center-management.json"

import type { Booking, BookingSlot } from "../types/booking"

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
      payload.message || management.courts.quickBooking.errorCreateBooking
    )
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
