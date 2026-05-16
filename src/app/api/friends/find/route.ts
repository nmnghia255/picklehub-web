import { NextResponse } from "next/server"

import { getFindUsers } from "@/features/friend/api/find-users"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const q = (url.searchParams.get("q") ?? "").trim()
    const page = Number(url.searchParams.get("page") ?? "1")
    const limit = Number(url.searchParams.get("limit") ?? "20")

    // friend-service requires q length >= 1. Use a safe default keyword for
    // browse-like behavior when the search box is empty.
    const effectiveQuery = q || "a"

    const result = await getFindUsers({
      q: effectiveQuery,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load users"
    return NextResponse.json({ message }, { status: 500 })
  }
}
