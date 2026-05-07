import type { Booking } from "./CourtSchedule"

interface TimeSlotProps {
  booking?: Booking
  onClick: () => void
}

export function TimeSlot({ booking, onClick }: TimeSlotProps) {
  const getStatusLabel = () => {
    if (!booking) return ""

    switch (booking.status) {
      case "booked":
        return "Đã đặt"
      case "pending":
        return "Chờ xác nhận"
      case "cancelled":
        return "Đã hủy"
      default:
        return booking.status
    }
  }

  const getSlotStyle = () => {
    if (!booking) {
      return "bg-background dark:bg-surface hover:bg-accent/5 dark:hover:bg-accent/6 border-2 border-dashed border-border"
    }

    switch (booking.status) {
      case "booked":
        return "bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-700 dark:to-teal-700 border-2 border-emerald-300 dark:border-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500"
      case "pending":
        return "bg-linear-to-br from-amber-50 to-yellow-50 dark:from-amber-700 dark:to-yellow-700 border-2 border-amber-300 dark:border-amber-600 hover:border-amber-400 dark:hover:border-amber-500"
      case "cancelled":
        return "bg-linear-to-br from-red-50 to-rose-50 dark:from-red-700 dark:to-rose-700 border-2 border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500"
      default:
        return "bg-background dark:bg-surface hover:bg-accent/5 dark:hover:bg-accent/6"
    }
  }

  const getTextColor = () => {
    if (!booking) return "text-muted-foreground"

    switch (booking.status) {
      case "booked":
        return "text-emerald-700 dark:text-emerald-200"
      case "pending":
        return "text-amber-700 dark:text-amber-200"
      case "cancelled":
        return "text-red-700 dark:text-red-200"
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
