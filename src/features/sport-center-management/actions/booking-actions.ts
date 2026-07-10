import enManagement from "@/i18n/locales/en/sport-center-management.json"
import viManagement from "@/i18n/locales/vi/sport-center-management.json"

import type { Booking } from "../types/booking"
import type { BookingStatus } from "../types/booking"

export { cancelBookingAction } from "./cancel-booking-action"
export { confirmBookingAction } from "./confirm-booking-action"

export type Pagination = {
  total: number
  offset: number
  limit: number
}

export type ListBookingsResult = {
  data: Booking[]
  pagination?: Pagination
}

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
    throw new Error(payload.message || management.bookingList.errors.loadFailed)
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
