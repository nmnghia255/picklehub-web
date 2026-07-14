export function isValidDateString(value: string | null | undefined): boolean {
  if (!value) return false
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp)
}

export function parseDateOrNull(value: string | null | undefined): Date | null {
  if (!isValidDateString(value)) return null
  return new Date(value as string)
}

export function formatChatTime(
  value: string | null | undefined,
  locale: "vi" | "en"
) {
  const date = parseDateOrNull(value)
  if (!date) return ""

  return date.toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatChatDateTime(
  value: string | null | undefined,
  locale: "vi" | "en"
) {
  const date = parseDateOrNull(value)
  if (!date) return ""

  return date.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelativeChatTime(
  value: string | null | undefined,
  locale: "vi" | "en"
) {
  const date = parseDateOrNull(value)
  if (!date) return ""

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) {
    return locale === "vi" ? "Vừa xong" : "Just now"
  }

  if (diffMinutes < 60) {
    return locale === "vi"
      ? `${diffMinutes} phút trước`
      : `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`
  }

  if (diffHours < 24) {
    return locale === "vi"
      ? `${diffHours} giờ trước`
      : `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  }

  if (diffDays === 1) {
    return locale === "vi" ? "Hôm qua" : "Yesterday"
  }

  if (diffDays < 7) {
    return locale === "vi"
      ? `${diffDays} ngày trước`
      : `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  }

  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
  })
}
