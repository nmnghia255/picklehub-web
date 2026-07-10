export interface BookingItemSnapshot {
  courtName: string
  startTime: string
  endTime: string
}

/** Thông tin activity đang liên kết với court booking */
export interface LinkedActivitySnapshot {
  id: string
  title: string
  status: string
  startAt: string
  endAt: string
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
  /** true nếu booking đã được liên kết với một buổi hoạt động */
  isLinked?: boolean
  /** Thông tin buổi hoạt động đang liên kết, null nếu chưa liên kết */
  linkedActivity?: LinkedActivitySnapshot | null
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
