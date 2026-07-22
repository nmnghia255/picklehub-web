import { NextResponse } from "next/server"

import { getMyProfile } from "@/features/profile/api/profile-service"

export async function GET() {
  try {
    const profile = await getMyProfile()
    return NextResponse.json(profile, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load user profile"
    return NextResponse.json({ message }, { status: 500 })
  }
}
