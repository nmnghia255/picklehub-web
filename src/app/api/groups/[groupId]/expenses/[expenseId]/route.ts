import { NextResponse } from "next/server"

import { getExpenseById } from "@/features/groups/api/finance-service"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ groupId?: string; expenseId?: string }> }
) {
  // Next.js may provide params as a Promise in some runtimes — unwrap safely.
  const resolvedParams = await params
  const groupId = resolvedParams?.groupId
  const expenseId = resolvedParams?.expenseId

  if (!groupId || !expenseId) {
    return NextResponse.json(
      { message: "Thiếu groupId hoặc expenseId." },
      { status: 400 }
    )
  }

  try {
    const data = await getExpenseById(groupId, expenseId)
    return NextResponse.json({ data })
  } catch (error: unknown) {
    console.error("Error proxying expense detail:", error)
    const errorWithResponse = error as {
      response?: { status?: number; data?: { message?: string } }
      message?: string
    }
    const status = errorWithResponse.response?.status ?? 500
    const message =
      errorWithResponse.response?.data?.message ??
      errorWithResponse.message ??
      "Internal server error"
    return NextResponse.json({ message }, { status })
  }
}
