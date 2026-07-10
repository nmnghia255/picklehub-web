import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { promisify } from "util"
import { brotliDecompress, gunzip, inflate } from "zlib"

import { getSession } from "@/lib/session"

const API_BASE =
  process.env.API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

const gunzipAsync = promisify(gunzip)
const inflateAsync = promisify(inflate)
const brotliDecompressAsync = promisify(brotliDecompress)

async function decodeBody(res: Response): Promise<string> {
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length === 0) return ""

  // Try each decompression in order; if none matches, return raw UTF-8.
  // We do NOT check Content-Encoding because Node's fetch may have already
  // auto-decompressed while leaving the header present, which would cause
  // double-decompression.
  try {
    return (await gunzipAsync(buf)).toString("utf-8")
  } catch {
    // not gzip
  }

  try {
    return (await brotliDecompressAsync(buf)).toString("utf-8")
  } catch {
    // not brotli
  }

  try {
    return (await inflateAsync(buf)).toString("utf-8")
  } catch {
    // not deflate
  }

  return buf.toString("utf-8")
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/")
  const url = `${API_BASE.replace(/\/$/, "")}/api/${path}${request.nextUrl.search}`
  const session = await getSession()

  const headers: Record<string, string> = {}
  for (const [k, v] of request.headers.entries()) {
    if (k.toLowerCase() === "host") continue
    headers[k] = v
  }

  // Prefer uncompressed from backend (fast path).  Safety net in decodeBody
  // handles any compression the backend still sends.
  delete headers["accept-encoding"]
  delete headers["Accept-Encoding"]

  if (request.headers.get("cookie")) {
    headers["cookie"] = request.headers.get("cookie") as string
  }

  if (session.accessToken) {
    headers["authorization"] = `Bearer ${session.accessToken}`
  }

  const init: RequestInit & { duplex?: string } = {
    method: request.method,
    headers,
    body: request.body ?? undefined,
    redirect: "manual",
    ...(request.body ? { duplex: "half" } : {}),
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204 })
  }

  const res = await fetch(url, init)

  // Decode body by detecting compression magic bytes (NOT by content-encoding header)
  const bodyText = await decodeBody(res)

  // Forward relevant response headers, stripping encoding/transport/length
  const respHeaders = new Headers()
  for (const [k, v] of res.headers.entries()) {
    const lk = k.toLowerCase()
    if (
      lk === "content-encoding" ||
      lk === "transfer-encoding" ||
      lk === "content-length" ||
      lk === "host" ||
      lk === "connection" ||
      lk === "keep-alive" ||
      lk === "proxy-authenticate" ||
      lk === "proxy-authorization" ||
      lk === "te" ||
      lk === "trailer" ||
      lk === "upgrade"
    ) {
      continue
    }
    respHeaders.set(k, v)
  }

  // Try JSON, fallback to raw text
  try {
    const data = JSON.parse(bodyText)
    return NextResponse.json(data, {
      status: res.status,
      headers: respHeaders,
    })
  } catch {
    return new NextResponse(bodyText, {
      status: res.status,
      headers: respHeaders,
    })
  }
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
  _request: NextRequest,
  _context: { params: Promise<{ path: string[] }> }
) {
  return new NextResponse(null, { status: 204 })
}
