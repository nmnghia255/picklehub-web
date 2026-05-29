import type { BookingResponse } from "../types/booking"

type ApiResponse<T> = {
  data: T
  message?: string
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }

  return payload as T
}

async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | T
    | null

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as ApiResponse<T>).message ?? "")
        : "Request failed"

    throw new Error(message || "Request failed")
  }

  if (payload === null) {
    throw new Error("Request failed")
  }

  return unwrapApiResponse(payload)
}

export const BookingBrowserService = {
  getBookingById: async (bookingId: string): Promise<BookingResponse> => {
    return await requestJson<BookingResponse>(`/api/bookings/${bookingId}`)
  },

  submitPaymentProof: async (
    bookingId: string,
    paymentProof: string
  ): Promise<BookingResponse> => {
    return await requestJson<BookingResponse>(
      `/api/bookings/${bookingId}/payment-proof`,
      {
        method: "POST",
        body: JSON.stringify({ paymentProof }),
      }
    )
  },
}
