import type { Booking } from "../../types/booking"

interface TimeSlotProps {
  booking?: Booking
  onClick: () => void
}

export function TimeSlot({ booking, onClick }: TimeSlotProps) {
  const getStatusLabel = () => {
    if (!booking) return ""

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

  const getSlotStyle = () => {
    if (!booking) {
      return "bg-background dark:bg-surface hover:bg-accent/5 dark:hover:bg-accent/6 border-2 border-dashed border-border"
    }

    switch (booking.status) {
      case "CONFIRMED":
        return "bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-700 dark:to-teal-700 border-2 border-emerald-300 dark:border-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500"
      case "PENDING":
        return "bg-linear-to-br from-amber-50 to-yellow-50 dark:from-amber-700 dark:to-yellow-700 border-2 border-amber-300 dark:border-amber-600 hover:border-amber-400 dark:hover:border-amber-500"
      case "CANCELLED":
        return "bg-linear-to-br from-red-50 to-rose-50 dark:from-red-700 dark:to-rose-700 border-2 border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500"
      case "COMPLETED":
        return "bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-700 dark:to-cyan-700 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500"
      default:
        return "bg-background dark:bg-surface hover:bg-accent/5 dark:hover:bg-accent/6"
    }
  }

  const getTextColor = () => {
    if (!booking) return "text-muted-foreground"

    switch (booking.status) {
      case "CONFIRMED":
        return "text-emerald-700 dark:text-emerald-200"
      case "PENDING":
        return "text-amber-700 dark:text-amber-200"
      case "CANCELLED":
        return "text-red-700 dark:text-red-200"
      case "COMPLETED":
        return "text-blue-700 dark:text-blue-200"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <button
      onClick={onClick}
      className={`flex min-h-25 flex-col items-start justify-center gap-1 rounded-lg p-4 transition-all ${getSlotStyle()}`}
    >
      {booking ? (
        <>
          <span className={`text-sm ${getTextColor()}`}>
            {booking.playerName}
          </span>
          <span className="text-xs text-muted-foreground">
            {getStatusLabel()}
          </span>
        </>
      ) : (
        <span className="text-xs text-muted-foreground">Còn trống</span>
      )}
    </button>
  )
}
