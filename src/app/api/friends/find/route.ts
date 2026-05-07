import { NextResponse } from "next/server"

import { getFindUsers } from "@/features/friend/api/find-users"

export async function GET() {
  try {
    const users = await getFindUsers()
    return NextResponse.json({ data: users }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load users"
    return NextResponse.json({ message }, { status: 500 })
  }
}
