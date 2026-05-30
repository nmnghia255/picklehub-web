import { NextResponse } from "next/server"

import { listExpenses } from "@/features/groups/api/finance-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params
  const url = new URL(request.url)

  const expenses = await listExpenses(groupId, {
    page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    search: url.searchParams.get("search") ?? undefined,
    userId: url.searchParams.get("userId") ?? undefined,
    sortBy:
      (url.searchParams.get("sortBy") as "deadline" | "amount" | null) ??
      undefined,
    order:
      (url.searchParams.get("order") as "asc" | "desc" | null) ?? undefined,
  })

  return NextResponse.json(expenses)
}