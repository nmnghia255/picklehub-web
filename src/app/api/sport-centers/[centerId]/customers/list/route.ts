import { NextResponse } from "next/server"

import { CustomerService } from "@/features/sport-center-management/api/customer-service"

type RouteContext = {
  params: Promise<{ centerId: string }>
}

function parseNumberOrNull(value: string | null) {
  if (value == null || value.trim() === "") return null

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { centerId } = await context.params
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

    const response = await CustomerService.listCustomers(
      centerId,
      keyword,
      name,
      phone,
      email,
      lastVisitFrom,
      lastVisitTo,
      minSpend,
      maxSpend,
      limit,
      offset
    )

    return NextResponse.json(response, { status: 200 })
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
