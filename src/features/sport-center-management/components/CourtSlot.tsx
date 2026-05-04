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
      return "bg-white hover:bg-gray-50 border-2 border-dashed border-gray-200"
    }

    switch (booking.status) {
      case "booked":
        return "bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 hover:border-emerald-400"
      case "pending":
        return "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 hover:border-amber-400"
      case "cancelled":
        return "bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 hover:border-red-400"
      default:
        return "bg-white hover:bg-gray-50"
    }
  }

  const getTextColor = () => {
    if (!booking) return "text-gray-400"

    switch (booking.status) {
      case "booked":
        return "text-emerald-700"
      case "pending":
        return "text-amber-700"
      case "cancelled":
        return "text-red-700"
      default:
        return "text-gray-600"
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
        <span className="text-xs text-gray-400">Còn trống</span>
      )}
    </button>
  )
}
