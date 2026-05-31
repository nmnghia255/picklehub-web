import { NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

function parseNumberOrNull(value: string | null) {
  if (value == null || value.trim() === "") return null

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)

    const keyword = url.searchParams.get("keyword")
    const name = url.searchParams.get("name")
    const phone = url.searchParams.get("phone")
    const email = url.searchParams.get("email")
    const lastVisitFrom = url.searchParams.get("lastVisitFrom")
    const lastVisitTo = url.searchParams.get("lastVisitTo")
    const minSpend = parseNumberOrNull(url.searchParams.get("minSpend"))
    const maxSpend = parseNumberOrNull(url.searchParams.get("maxSpend"))
    const limit = parseNumberOrNull(url.searchParams.get("limit")) ?? 20
    const offset = parseNumberOrNull(url.searchParams.get("offset")) ?? 0

    const axios = await getAuthenticatedAxios()
    const response = await axios.get("/api/sport-centers/customers/list", {
      params: {
        keyword,
        name,
        phone,
        email,
        lastVisitFrom,
        lastVisitTo,
        minSpend,
        maxSpend,
        limit,
        offset,
      },
    })

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load customers"
    const status =
      message === "Not authenticated" || message === "Session expired"
        ? 401
        : 500

    return NextResponse.json({ message }, { status })
  }
}
