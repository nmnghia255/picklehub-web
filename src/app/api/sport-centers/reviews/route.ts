import { NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

type ReviewRequestBody = {
  centerId?: string
  rating?: number
  comment?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReviewRequestBody

    if (!body.centerId || typeof body.rating !== "number") {
      return NextResponse.json(
        { message: "Missing review data" },
        { status: 400 }
      )
    }

    const client = await getAuthenticatedAxios()
    const response = await client.post(`/api/sport-centers/reviews`, {
      centerId: body.centerId,
      rating: body.rating,
      comment: body.comment ?? "",
    })

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create review"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
