import type { BookingStatus } from "@/features/sport-center/types/booking"

export type BookingHistoryStatusFilter = "all" | BookingStatus

export type BookingHistoryPagination = {
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
