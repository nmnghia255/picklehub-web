export interface BookingItemSnapshot {
  courtName: string
  startTime: string
  endTime: string
}

export interface GroupCourtBooking {
  id: string
  groupId: string
  bookingId: string
  title: string
  note: string | null
  createdAt: string
  updatedAt: string
  creatorId?: string
  creator?: {
    id: string
    name: string
    avatarUrl?: string | null
  }
  centerName: string
  totalBookingCost: number
  date: string
  startTime: string
  endTime: string
  bookingItemsSnapshot: BookingItemSnapshot[]
}

export interface ListGroupCourtBookingsResult {
  data: GroupCourtBooking[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}
