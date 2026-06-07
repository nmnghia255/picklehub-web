import { NextResponse } from "next/server"

import { listTransactions } from "@/features/groups/api/finance-service"
import type { TransactionStatus } from "@/features/groups/types/finance"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params
  const url = new URL(request.url)

  const transactions = await listTransactions(groupId, {
    page: url.searchParams.get("page")
      ? Number(url.searchParams.get("page"))
      : undefined,
    limit: url.searchParams.get("limit")
      ? Number(url.searchParams.get("limit"))
      : undefined,
    status: (url.searchParams.get("status") as TransactionStatus) ?? undefined,
  })

  return NextResponse.json(transactions)
}
