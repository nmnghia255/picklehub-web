type FetchJsonError = Error & {
  status?: number
  data?: unknown
  url?: string
}

export async function fetchGroupJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const payloadMessage = (() => {
      if (!payload || typeof payload !== "object") return null

      const message = (payload as { message?: unknown }).message
      if (typeof message === "string") return message

      if (Array.isArray(message)) {
        return message
          .map((item) => (typeof item === "string" ? item : null))
          .filter(Boolean)
          .join(", ")
      }

      return null
    })()

    const error = new Error(
      payloadMessage || "Đã có lỗi xảy ra."
    ) as FetchJsonError
    error.status = response.status
    error.data = payload
    error.url = url
    throw error
  }

  return (await response.json()) as T
}
