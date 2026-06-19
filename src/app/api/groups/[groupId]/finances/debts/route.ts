import axios from "axios"
import { NextResponse } from "next/server"

import { listGroupDebts } from "@/features/groups/api/finance-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params
  const url = new URL(request.url)

  try {
    const result = await listGroupDebts(groupId, {
      page: url.searchParams.get("page")
        ? Number(url.searchParams.get("page"))
        : undefined,
      limit: url.searchParams.get("limit")
        ? Number(url.searchParams.get("limit"))
        : undefined,
      search: url.searchParams.get("search") ?? undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      })
    }

    console.error("Group debts route error", error)
    return NextResponse.json(
      { message: "Không thể tải danh sách nợ thành viên." },
      { status: 500 }
    )
  }
}
