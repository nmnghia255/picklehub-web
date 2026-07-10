import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getAuthenticatedAxios } from "@/lib/server-api"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    const axios = await getAuthenticatedAxios()
    const backendFormData = new FormData()
    backendFormData.append("file", file)

    const response = await axios.post("/api/media/images", backendFormData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    return NextResponse.json(response.data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ message }, { status: 500 })
  }
}
