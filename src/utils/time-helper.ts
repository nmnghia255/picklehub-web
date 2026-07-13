const STATUS_LABEL_KEYS: Record<string, string> = {
  PUBLISHED: "common.labels.scheduled",
  IN_PROGRESS: "common.labels.inProgress",
  COMPLETED: "common.labels.completed",
  CANCELLED: "common.labels.cancelled",
}

export function normalizeStatus(
  status: string,
  translate?: (key: string) => string
) {
  const key = STATUS_LABEL_KEYS[status]
  return key && translate ? translate(key) : status
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
