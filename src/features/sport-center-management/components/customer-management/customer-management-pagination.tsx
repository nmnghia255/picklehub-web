import { Button } from "@/components/ui/button"

export interface CustomerManagementPaginationView {
  currentPage: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

interface CustomerManagementPaginationProps {
  pagination: CustomerManagementPaginationView
  onPreviousPage: () => void
  onNextPage: () => void
}

export function CustomerManagementPagination({
  pagination,
  onPreviousPage,
  onNextPage,
}: CustomerManagementPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-auto flex justify-center pt-2">
      <div className="flex items-center gap-3 rounded-full border bg-background px-3 py-2 text-sm shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          disabled={!pagination.hasPreviousPage}
          onClick={onPreviousPage}
        >
          Trước
        </Button>

        <span className="min-w-28 text-center text-muted-foreground">
          Trang {pagination.currentPage} / {pagination.totalPages}
        </span>

        <Button
          variant="ghost"
          size="sm"
          disabled={!pagination.hasNextPage}
          onClick={onNextPage}
        >
          Sau
        </Button>
      </div>
    </div>
  )
}

export default CustomerManagementPagination
