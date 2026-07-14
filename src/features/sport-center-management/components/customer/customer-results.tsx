import type { CustomerListItem } from "@/features/sport-center-management/types/customer"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { CustomerEmptyState } from "./customer-empty-state"
import {
  CustomerManagementPagination,
  type CustomerManagementPaginationView,
} from "./customer-pagination"
import { CustomerManagementSkeleton } from "./customer-skeleton"
import { CustomerTable } from "./customer-table"

interface CustomerManagementResultsProps {
  isPageLoading: boolean
  loadError: string | null
  customers: CustomerListItem[]
  hasActiveFilters: boolean
  pagination: CustomerManagementPaginationView
  onRefreshCustomers: () => void
  onResetFilters: () => void
  onPreviousPage: () => void
  onNextPage: () => void
  onCustomerSelect: (customerId: string) => void
}

export function CustomerManagementResults({
  isPageLoading,
  loadError,
  customers,
  hasActiveFilters,
  pagination,
  onRefreshCustomers,
  onResetFilters,
  onPreviousPage,
  onNextPage,
  onCustomerSelect,
}: CustomerManagementResultsProps) {
  const { t } = useSportCenterManagementTranslation()
  if (isPageLoading) {
    return <CustomerManagementSkeleton />
  }

  if (loadError) {
    return (
      <CustomerEmptyState
        title={t("customer.empty.loadErrorTitle")}
        description={loadError}
        actionLabel={t("customer.empty.refresh")}
        onAction={onRefreshCustomers}
      />
    )
  }

  if (customers.length === 0) {
    return (
      <CustomerEmptyState
        title={
          hasActiveFilters
            ? t("customer.empty.noResultsTitle")
            : t("customer.empty.noCustomersTitle")
        }
        description={
          hasActiveFilters
            ? t("customer.empty.noResultsDescription")
            : t("customer.empty.noCustomersDescription")
        }
        actionLabel={
          hasActiveFilters
            ? t("customer.filters.reset")
            : t("customer.empty.refresh")
        }
        onAction={hasActiveFilters ? onResetFilters : onRefreshCustomers}
      />
    )
  }

  return (
    <>
      <CustomerTable
        customers={customers}
        onCustomerSelect={onCustomerSelect}
      />
      <CustomerManagementPagination
        pagination={pagination}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </>
  )
}

export default CustomerManagementResults
