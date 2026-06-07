import axios from "axios"
import { NextResponse } from "next/server"

import { listCreditBalances } from "@/features/groups/api/finance-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params
  const url = new URL(request.url)

  try {
    const result = await listCreditBalances(groupId, {
      page: url.searchParams.get("page")
        ? Number(url.searchParams.get("page"))
        : undefined,
      limit: url.searchParams.get("limit")
        ? Number(url.searchParams.get("limit"))
        : undefined,
      minCredit: url.searchParams.get("minCredit")
        ? Number(url.searchParams.get("minCredit"))
        : undefined,
      userId: url.searchParams.get("userId") ?? undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      })
    }

    console.error("Credit balance route error", error)
    return NextResponse.json(
      { message: "Không thể tải số dư thành viên." },
      { status: 500 }
    )
  }
}
