import { getAuthenticatedAxios } from "@/lib/server-api"

type UnknownPayload = unknown

async function requestWithAuth<T>(
  path: string,
  params?: Record<string, string | number>
) {
  const client = await getAuthenticatedAxios()
  const response = await client.get<T>(path, { params })
  return response.data
}

async function mutateWithAuth(
  method: "post" | "patch" | "delete",
  path: string,
  body?: unknown
) {
  const client = await getAuthenticatedAxios()
  const response = await client.request({ method, url: path, data: body })
  return response.data
}

export async function listCenterBookings(
  centerId: string,
  params?: Record<string, string | number>
) {
  return requestWithAuth<UnknownPayload>(
    `/api/sport-centers/${encodeURIComponent(centerId)}/bookings`,
    params
  )
}

export async function getCenterBooking(centerId: string, bookingId: string) {
  return requestWithAuth<UnknownPayload>(
    `/api/sport-centers/${encodeURIComponent(centerId)}/bookings/${encodeURIComponent(bookingId)}`
  )
}

export async function confirmBookingByOwner(bookingId: string) {
  return mutateWithAuth(
    "patch",
    `/api/bookings/${encodeURIComponent(bookingId)}/confirm`,
    {}
  )
}

export async function cancelBookingByOwner(bookingId: string) {
  return mutateWithAuth(
    "patch",
    `/api/bookings/${encodeURIComponent(bookingId)}/cancel-by-owner`,
    {}
  )
}

export async function completeBookingByOwner(bookingId: string) {
  return mutateWithAuth(
    "patch",
    `/api/bookings/${encodeURIComponent(bookingId)}/complete`,
    {}
  )
}

export async function createBookingForCourt(
  centerId: string,
  courtId: string,
  body: { date: string; startTime: string; endTime: string; note?: string }
) {
  return mutateWithAuth(
    "post",
    `/api/sport-centers/${encodeURIComponent(centerId)}/courts/${encodeURIComponent(courtId)}/bookings`,
    body
  )
}
