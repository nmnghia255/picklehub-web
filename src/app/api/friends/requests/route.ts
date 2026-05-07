import { NextResponse } from "next/server"

import { sendFriendRequest } from "@/features/friend/api/friend-service"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      receiverId?: string
      userId?: string
      message?: string
    }

    // Support both 'receiverId' (backend) and 'userId' (legacy) for flexibility
    const receiverId = body.receiverId || body.userId

    if (!receiverId) {
      return NextResponse.json(
        { message: "Missing receiverId" },
        { status: 400 }
      )
    }

    console.log("[POST /api/friends/requests] Sending friend request:", {
      receiverId,
      message: body.message,
    })

    const result = await sendFriendRequest({
      receiverId,
      message: body.message,
    })

    console.log("[POST /api/friends/requests] Success:", result)
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error(
      "[POST /api/friends/requests] Error:",
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error
    )
    const message =
      error instanceof Error ? error.message : "Failed to send friend request"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500
    return NextResponse.json({ message }, { status })
  }
}
