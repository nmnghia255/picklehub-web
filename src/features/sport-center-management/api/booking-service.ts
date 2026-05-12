type UnknownPayload = unknown

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    credentials: "include",
    ...init,
  })

  const payload = (await response.json().catch(() => null)) as T | null

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload
        ? String((payload as { message?: unknown }).message ?? "Request failed")
        : "Request failed"

    throw new Error(message)
  }

  return payload as T
}

export async function listCenterBookings(
  centerId: string,
  params?: Record<string, string | number>
) {
  const searchParams = new URLSearchParams()

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(key, String(value))
    }
  }

  const query = searchParams.toString()
  const url = `/api/sport-centers/${encodeURIComponent(centerId)}/bookings${query ? `?${query}` : ""}`

  return requestJson<UnknownPayload>(url)
}

export async function getCenterBooking(centerId: string, bookingId: string) {
  return requestJson<UnknownPayload>(
    `/api/sport-centers/${encodeURIComponent(centerId)}/bookings/${encodeURIComponent(bookingId)}`
  )
}

export async function confirmBookingByOwner(bookingId: string) {
  return requestJson<UnknownPayload>(
    `/api/bookings/${encodeURIComponent(bookingId)}/confirm`,
    {
      method: "PATCH",
    }
  )
}

export async function cancelBookingByOwner(bookingId: string) {
  return requestJson<UnknownPayload>(
    `/api/bookings/${encodeURIComponent(bookingId)}/cancel-by-owner`,
    { method: "PATCH" }
  )
}

export async function completeBookingByOwner(bookingId: string) {
  return requestJson<UnknownPayload>(
    `/api/bookings/${encodeURIComponent(bookingId)}/complete`,
    {
      method: "PATCH",
    }
  )
}

export async function createBookingForCourt(
  centerId: string,
  courtId: string,
  body: { date: string; startTime: string; endTime: string; note?: string }
) {
  return requestJson<UnknownPayload>(
    `/api/sport-centers/${encodeURIComponent(centerId)}/courts/${encodeURIComponent(courtId)}/bookings`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
}
