export function normalizeStatus(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "Lên lịch"
    case "SCHEDULED":
      return "Lên lịch"
    case "IN_PROGRESS":
      return "Đang diễn ra"
    case "COMPLETED":
      return "Hoàn thành"
    case "CANCELLED":
      return "Đã hủy"
    default:
      return status
  }
}

export function formatDateTime(dateTimeStr: string) {
  const date = new Date(dateTimeStr)
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getDateOnly(dateTimeStr: string) {
  const date = new Date(dateTimeStr)
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
