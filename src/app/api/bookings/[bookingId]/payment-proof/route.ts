import { NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

type RouteContext = {
  params: Promise<{ bookingId: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { bookingId } = await context.params
    const body = (await request.json().catch(() => ({}))) as {
      paymentProof?: string
    }

    const axios = await getAuthenticatedAxios()
    const response = await axios.post(
      `/api/bookings/${bookingId}/payment-proof`,
      {
        paymentProof: body.paymentProof,
      }
    )

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit payment proof"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
