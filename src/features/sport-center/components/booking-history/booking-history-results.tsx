import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { BookingResponse } from "@/features/sport-center/types/booking"

import type { BookingHistoryPagination } from "../../../../app/(protected)/sport-center/booking-history/booking-history.types"
import { BookingHistoryEmptyState } from "./booking-history-empty-state"
import { BookingHistorySkeleton } from "./booking-history-skeleton"
import { BookingHistoryTable } from "./booking-history-table"

interface BookingHistoryResultsProps {
  bookings: BookingResponse[]
  isLoading: boolean
  loadError: string | null
  hasActiveFilters: boolean
  pagination: BookingHistoryPagination
  onRetry: () => void
  onResetFilters: () => void
  onPreviousPage: () => void
  onNextPage: () => void
}

export function BookingHistoryResults({
  bookings,
  isLoading,
  loadError,
  hasActiveFilters,
  pagination,
  onRetry,
  onResetFilters,
  onPreviousPage,
  onNextPage,
}: BookingHistoryResultsProps) {
  if (isLoading) {
    return <BookingHistorySkeleton />
  }

  if (loadError) {
    return (
      <BookingHistoryEmptyState
        title="Không thể tải lịch sử đặt sân"
        description={loadError}
        actionLabel="Thử lại"
        onAction={onRetry}
      />
    )
  }

  if (bookings.length === 0) {
    return (
      <BookingHistoryEmptyState
        title={
          hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có lượt đặt nào"
        }
        description={
          hasActiveFilters
            ? "Hãy thử đổi trạng thái hoặc ngày tạo để xem các booking khác."
            : "Các lượt đặt bạn tạo sẽ xuất hiện ở đây để bạn dễ dàng tra cứu lại."
        }
        actionLabel={hasActiveFilters ? "Xóa bộ lọc" : "Làm mới"}
        onAction={hasActiveFilters ? onResetFilters : onRetry}
      />
    )
  }

  return (
    <>
      <BookingHistoryTable bookings={bookings} />

      {pagination.totalPages > 1 && (
        <div className="mt-auto flex justify-center pt-2">
          <Pagination className="w-full">
            <PaginationContent className="justify-center">
              <PaginationItem>
                {pagination.hasPreviousPage ? (
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      onPreviousPage()
                    }}
                  />
                ) : (
                  <span className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2.5 text-sm font-medium opacity-50">
                    Previous
                  </span>
                )}
              </PaginationItem>

              <PaginationItem>
                <PaginationLink isActive size="default" href="#">
                  Trang {pagination.currentPage}
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                {pagination.hasNextPage ? (
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      onNextPage()
                    }}
                  />
                ) : (
                  <span className="inline-flex h-10 items-center justify-center rounded-md border border-transparent px-2.5 text-sm font-medium opacity-50">
                    Next
                  </span>
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  )
}
