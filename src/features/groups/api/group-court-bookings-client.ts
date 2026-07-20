import type { MyBookingsResponse } from "@/features/sport-center/types/booking"

import type { GroupCourtBooking, ListGroupCourtBookingsResult } from "../types"
import { fetchGroupJson } from "./group-fetch-client"

type CourtBookingParams = {
  page?: number
  limit?: number
  fromDate?: string
  toDate?: string
  linked?: boolean
  excludePast?: boolean
}

function toSearchParams(params?: Record<string, unknown>) {
  const searchParams = new URLSearchParams()

  if (!params) return searchParams

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    searchParams.set(key, String(value))
  }

  return searchParams
}

export async function listGroupCourtBookingsClient(
  groupId: string,
  params: CourtBookingParams = {}
): Promise<ListGroupCourtBookingsResult> {
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  return fetchGroupJson<ListGroupCourtBookingsResult>(
    `/api/groups/${groupId}/court-bookings${suffix}`
  )
}

export async function getGroupCourtBookingClient(
  groupId: string,
  id: string
): Promise<GroupCourtBooking> {
  return fetchGroupJson<GroupCourtBooking>(
    `/api/groups/${groupId}/court-bookings/${id}`
  )
}

export async function linkGroupCourtBookingClient(
  groupId: string,
  body: { title: string; note: string; bookingId: string }
): Promise<GroupCourtBooking> {
  const response = await fetch(`/api/groups/${groupId}/court-bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || "Không thể liên kết lịch đặt sân.")
  }

  return response.json()
}

export async function unlinkGroupCourtBookingClient(
  groupId: string,
  id: string
): Promise<{ message: string }> {
  const response = await fetch(`/api/groups/${groupId}/court-bookings/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || "Không thể xóa liên kết lịch đặt sân.")
  }

  return response.json()
}

export async function getMyBookingsClient(
  params: { limit?: number; status?: string } = {}
): Promise<MyBookingsResponse> {
  const searchParams = toSearchParams(params)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const response = await fetch(`/api/bookings/me${suffix}`)
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || "Không thể tải danh sách lịch đặt sân.")
  }
  return response.json()
}

export async function checkCancelEligibilityClient(
  groupId: string,
  bookingId: string
): Promise<{ eligibleForRefund: boolean; warningMessage: string }> {
  const response = await fetch(
    `/api/groups/${groupId}/court-bookings/${bookingId}/cancel-eligibility`
  )
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(
      payload.message || "Không thể kiểm tra chính sách hủy đặt sân."
    )
  }
  return response.json()
}

export async function cancelCourtBookingClient(
  groupId: string,
  bookingId: string
): Promise<{ message: string }> {
  const response = await fetch(
    `/api/groups/${groupId}/court-bookings/${bookingId}/cancel`,
    { method: "POST" }
  )
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || "Không thể thực hiện hủy đặt sân.")
  }
  return response.json()
}
