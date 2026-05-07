import { NextResponse } from "next/server"

import { cancelRequest } from "@/features/friend/api/friend-service"

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await context.params

    if (!requestId) {
      return NextResponse.json(
        { message: "Missing requestId" },
        { status: 400 }
      )
    }

    const result = await cancelRequest(requestId)
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel request"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500
    return NextResponse.json({ message }, { status })
  }
}
