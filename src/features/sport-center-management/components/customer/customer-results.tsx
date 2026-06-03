import type { CustomerListItem } from "@/features/sport-center-management/types/customer"

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
  if (isPageLoading) {
    return <CustomerManagementSkeleton />
  }

  if (loadError) {
    return (
      <CustomerEmptyState
        title="Không thể tải danh sách khách hàng"
        description={loadError}
        actionLabel="Thử lại"
        onAction={onRefreshCustomers}
      />
    )
  }

  if (customers.length === 0) {
    return (
      <CustomerEmptyState
        title={
          hasActiveFilters
            ? "Không có kết quả phù hợp"
            : "Chưa có khách hàng nào"
        }
        description={
          hasActiveFilters
            ? "Hãy thử đổi từ khóa tìm kiếm để xem các khách hàng khác."
            : "Khi sân có khách đặt và ghé thăm, danh sách sẽ xuất hiện ở đây."
        }
        actionLabel={hasActiveFilters ? "Xóa lọc" : "Làm mới"}
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
