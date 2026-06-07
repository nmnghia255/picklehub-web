import { NextResponse } from "next/server"

import { getMyDebt } from "@/features/groups/api/finance-service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params
  const debt = await getMyDebt(groupId)
  return NextResponse.json(debt)
}
