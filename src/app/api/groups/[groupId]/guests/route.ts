import { type NextRequest, NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await context.params
  const { searchParams } = new URL(request.url)

  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(`/api/groups/${groupId}/guests`, {
      params: Object.fromEntries(searchParams),
    })
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const errAny = error as {
      response?: { status?: number; data?: unknown }
      message?: string
    }
    const status = errAny?.response?.status ?? 500
    const data = errAny?.response?.data ?? null
    return NextResponse.json(
      { message: errAny?.message ?? "Failed to load guests", details: data },
      { status }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await context.params
  const body = await request.json()

  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(`/api/groups/${groupId}/guests`, body)
    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    const errAny = error as {
      response?: { status?: number; data?: unknown }
      message?: string
    }
    const status = errAny?.response?.status ?? 500
    const data = errAny?.response?.data ?? null
    return NextResponse.json(
      { message: errAny?.message ?? "Failed to create guest", details: data },
      { status }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await context.params
  const body = await request.json()

  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch(
      `/api/groups/${groupId}/guests/approve`,
      body
    )
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    const errAny = error as {
      response?: { status?: number; data?: unknown }
      message?: string
    }
    const status = errAny?.response?.status ?? 500
    const data = errAny?.response?.data ?? null
    return NextResponse.json(
      { message: errAny?.message ?? "Failed to approve guests", details: data },
      { status }
    )
  }
}
