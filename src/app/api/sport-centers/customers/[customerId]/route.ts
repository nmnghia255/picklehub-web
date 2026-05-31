import { NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

type RouteContext = {
  params: Promise<{ customerId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { customerId } = await context.params
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(
      `/api/sport-centers/customers/${customerId}`
    )

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load customer detail"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
