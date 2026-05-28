import type { Booking } from "../types/booking"
import type { BookingStatus } from "../types/booking"

export type Pagination = {
  total: number
  offset: number
  limit: number
}

export type ListBookingsResult = {
  data: Booking[]
  pagination?: Pagination
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
    throw new Error(payload.message || "Request failed")
  }

  return (payload.data ?? payload) as T
}

function normalizeListBookingsPayload(payload: unknown): ListBookingsResult {
  if (Array.isArray(payload)) {
    return { data: payload as Booking[] }
  }

  if (!payload || typeof payload !== "object") {
    return { data: [] }
  }

  const value = payload as {
    data?: unknown
    bookings?: unknown
    pagination?: Pagination
  }

  if (Array.isArray(value.data)) {
    return {
      data: value.data as Booking[],
      pagination: value.pagination,
    }
  }

  if (Array.isArray(value.bookings)) {
    return {
      data: value.bookings as Booking[],
      pagination: value.pagination,
    }
  }

  if (value.data && typeof value.data === "object") {
    const nested = value.data as {
      data?: unknown
      bookings?: unknown
      pagination?: Pagination
    }

    if (Array.isArray(nested.data)) {
      return {
        data: nested.data as Booking[],
        pagination: nested.pagination ?? value.pagination,
      }
    }

    if (Array.isArray(nested.bookings)) {
      return {
        data: nested.bookings as Booking[],
        pagination: nested.pagination ?? value.pagination,
      }
    }
  }

  return {
    data: [],
    pagination: value.pagination,
  }
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

  return normalizeListBookingsPayload(
    await apiRequest<unknown>(
      `/api/sport-centers/${centerId}/bookings?${searchParams.toString()}`
    )
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
