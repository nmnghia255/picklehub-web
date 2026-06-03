import type { Booking } from "./types/booking"

export const getStatusLabel = (booking: Booking) => {
  switch (booking.status) {
    case "CONFIRMED":
      return "Đã đặt"
    case "PENDING":
      return "Chờ xác nhận"
    case "CANCELLED":
      return "Đã hủy"
    case "COMPLETED":
      return "Hoàn thành"
    default:
      return booking.status
  }
}

export const getStatusColor = (booking: Booking) => {
  switch (booking.status) {
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
    case "PENDING":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
    case "CANCELLED":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
    case "COMPLETED":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200"
  }
}

export const formatPhoneNumber = (phone: string) => {
  // Simple formatting: +84123456789 -> 012-345-6789
  if (phone.startsWith("+84")) {
    phone = "0" + phone.slice(3)
  }
  phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
  return phone
}
