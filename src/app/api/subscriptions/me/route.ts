import axios from "axios"
import { NextResponse } from "next/server"

import { SubscriptionService } from "@/features/subscriptions/api/subscriptions-service"

export async function GET() {
  try {
    const data = await SubscriptionService.getMySubscriptions()
    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || error.message },
        { status: error.response?.status || 500 }
      )
    }
    const message =
      error instanceof Error ? error.message : "Failed to load subscriptions"
    const statusCode =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status: statusCode })
  }
}
