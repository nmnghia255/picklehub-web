import { NextResponse } from "next/server"

import { removeFriend } from "@/features/friend/api/friend-service"

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ friendId: string }> }
) {
  try {
    const { friendId } = await context.params

    if (!friendId) {
      return NextResponse.json({ message: "Missing friendId" }, { status: 400 })
    }

    const result = await removeFriend(friendId)
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove friend"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500
    return NextResponse.json({ message }, { status })
  }
}
