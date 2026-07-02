interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
}

export const CoachMediaService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/coach/media/images", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Upload failed: ${response.status} ${text}`)
    }

    const body: ApiResponse<{ url: string }> | { url: string } =
      await response.json()
    let url: string | undefined

    if ("data" in body && body.data?.url) {
      url = body.data.url
    } else if (
      "url" in body &&
      typeof (body as { url: unknown }).url === "string"
    ) {
      url = (body as { url: string }).url
    }

    if (!url) throw new Error("Upload response missing url")

    return url
  },
}
