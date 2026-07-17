import { NextResponse } from "next/server"

import { getFinanceSummary } from "@/features/groups/api/finance-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params
  const url = new URL(request.url)

  const summary = await getFinanceSummary(groupId, {
    fromDate: url.searchParams.get("fromDate") ?? undefined,
    toDate: url.searchParams.get("toDate") ?? undefined,
  })

  return NextResponse.json(summary)
}
