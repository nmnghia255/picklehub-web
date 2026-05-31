"use server"

import { getAuthenticatedAxios } from "@/lib/server-api"

interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
}

export async function uploadImageAction(
  file: globalThis.File
): Promise<string> {
  if (!file) throw new Error("Missing file")

  const formData = new FormData()
  formData.append("file", file, file.name ?? "file")

  const axios = await getAuthenticatedAxios()

  const response = await axios.post(`/api/media/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })

  const body = response.data as ApiResponse<{ url?: string }> | { url?: string }

  let url: string | undefined

  if (body && typeof body === "object" && "data" in body) {
    url = (body as ApiResponse<{ url?: string }>).data?.url
  } else if (body && typeof body === "object" && "url" in body) {
    const maybe = (body as { url?: unknown }).url
    if (typeof maybe === "string") url = maybe
  }

  if (!url) throw new Error("Upload response missing url")

  return url
}
