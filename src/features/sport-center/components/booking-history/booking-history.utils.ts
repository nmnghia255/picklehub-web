import type { BookingResponse } from "@/features/sport-center/types/booking"

type BookingHistoryItem = {
  startTime: string
  endTime: string
  courtName?: string
}

export function getBookingHistoryItems(booking: BookingResponse) {
  const typedBooking = booking as BookingResponse & {
    items?: BookingHistoryItem[]
    bookingItems?: BookingHistoryItem[]
  }

  return typedBooking.items ?? typedBooking.bookingItems ?? []
}

export function sortBookingsByNewest(bookings: BookingResponse[]) {
  return [...bookings].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime()
    const rightTime = new Date(right.createdAt).getTime()

    return rightTime - leftTime
  })
}

export function formatBookingTimeSummary(booking: BookingResponse) {
  const items = getBookingHistoryItems(booking)

  if (items.length === 0) {
    return "Chưa có khung giờ"
  }

  const firstItem = items[0]
  const startTime = firstItem.startTime
  const endTime = firstItem.endTime

  if (items.length === 1) {
    return `${startTime} - ${endTime}`
  }

  return `${startTime} - ${endTime} + ${items.length - 1} khung giờ`
}

export function formatBookingCourtSummary(booking: BookingResponse) {
  const items = getBookingHistoryItems(booking)

  if (items.length === 0) {
    return "Không có thông tin sân"
  }

  const courtNames = items
    .map((item) => item.courtName)
    .filter((courtName): courtName is string => Boolean(courtName))

  if (courtNames.length === 1) {
    return courtNames[0]
  }

  return `${courtNames[0]} + ${courtNames.length - 1} sân khác`
}
