import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/session"

const API_BASE = process.env.API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/")
  const url = `${API_BASE.replace(/\/$/, "")}/api/${path}${request.nextUrl.search}`
  const session = await getSession()

  const headers: Record<string, string> = {}
  // Forward common headers and cookies
  for (const [k, v] of request.headers.entries()) {
    if (k.toLowerCase() === "host") continue
    headers[k] = v
  }

  // Server -> server request: include cookie header so the backend can read session
  if (request.headers.get("cookie")) {
    headers["cookie"] = request.headers.get("cookie") as string
  }

  if (session.accessToken) {
    headers["authorization"] = `Bearer ${session.accessToken}`
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    body: request.body ?? undefined,
    redirect: "manual",
  }

  // Handle preflight quickly
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204 })
  }

  const res = await fetch(url, init)

  // Build response headers
  const respHeaders = new Headers()
  const contentType = res.headers.get("content-type")
  if (contentType) respHeaders.set("content-type", contentType)

  // Copy any Set-Cookie headers through to the client
  const setCookie = res.headers.get("set-cookie")
  if (setCookie) respHeaders.set("set-cookie", setCookie)

  const body = await res.arrayBuffer()
  return new NextResponse(Buffer.from(body), {
    status: res.status,
    headers: respHeaders,
  })
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path = [] } = await context.params
  return proxyRequest(request, path)
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path = [] } = await context.params
  return proxyRequest(request, path)
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path = [] } = await context.params
  return proxyRequest(request, path)
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path = [] } = await context.params
  return proxyRequest(request, path)
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path = [] } = await context.params
  return proxyRequest(request, path)
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return new NextResponse(null, { status: 204 })
}
