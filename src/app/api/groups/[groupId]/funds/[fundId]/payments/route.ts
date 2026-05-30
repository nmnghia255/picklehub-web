import { NextResponse } from "next/server"

import { listFundPayments } from "@/features/groups/api/finance-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string; fundId: string }> }
) {
  const { groupId, fundId } = await params
  const url = new URL(request.url)

  const payments = await listFundPayments(groupId, fundId, {
    page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    sortBy:
      (url.searchParams.get("sortBy") as "amount" | "paidAt" | null) ??
      undefined,
    order:
      (url.searchParams.get("order") as "asc" | "desc" | null) ?? undefined,
  })

  return NextResponse.json(payments)
}