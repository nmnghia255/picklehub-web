export function normalizeStatus(status: string): string {
  switch (status) {
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
