import { Button } from "@/components/ui/button"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

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
  const { t } = useSportCenterManagementTranslation()

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
          {t("customer.pagination.previous")}
        </Button>

        <span className="min-w-28 text-center text-muted-foreground">
          {t("customer.pagination.pageInfo", {
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
          })}
        </span>

        <Button
          variant="ghost"
          size="sm"
          disabled={!pagination.hasNextPage}
          onClick={onNextPage}
        >
          {t("customer.pagination.next")}
        </Button>
      </div>
    </div>
  )
}

export default CustomerManagementPagination
