"use client"

import { useEffect, useMemo } from "react"

import { PageContainer } from "@/components/page-container"
import { CustomerManagementFilters } from "@/features/sport-center-management/components/customer-management/customer-management-filters"
import { CustomerManagementPageHeader } from "@/features/sport-center-management/components/customer-management/customer-management-page-header"
import { CustomerManagementResults } from "@/features/sport-center-management/components/customer-management/customer-management-results"
import { CustomerManagementStatsCards } from "@/features/sport-center-management/components/customer-management/customer-management-stats-cards"
import { useCourtScheduleStore } from "@/features/sport-center-management/stores/court-schedule-store"
import { useCustomerManagementStore } from "@/features/sport-center-management/stores/customer-management-store"

const PAGE_SIZE = 20

export default function CustomerManagementPage() {
  const sportCenters = useCourtScheduleStore((state) => state.sportCenters)
  const centerId = useCourtScheduleStore((state) => state.centerId)
  const loadingSportCenters = useCourtScheduleStore(
    (state) => state.loadingSportCenters
  )
  const fetchSportCenters = useCourtScheduleStore(
    (state) => state.fetchSportCenters
  )
  const customers = useCustomerManagementStore((state) => state.customers)
  const centerFilterId = useCustomerManagementStore(
    (state) => state.centerFilterId
  )
  const isLoading = useCustomerManagementStore((state) => state.isLoading)
  const loadError = useCustomerManagementStore((state) => state.loadError)
  const keyword = useCustomerManagementStore((state) => state.keyword)
  const currentPage = useCustomerManagementStore((state) => state.currentPage)
  const refreshKey = useCustomerManagementStore((state) => state.refreshKey)
  const pagination = useCustomerManagementStore((state) => state.pagination)
  const setCurrentPage = useCustomerManagementStore(
    (state) => state.setCurrentPage
  )
  const setKeyword = useCustomerManagementStore((state) => state.setKeyword)
  const refreshCustomers = useCustomerManagementStore(
    (state) => state.refreshCustomers
  )
  const resetFilters = useCustomerManagementStore((state) => state.resetFilters)
  const loadCustomers = useCustomerManagementStore(
    (state) => state.loadCustomers
  )

  useEffect(() => {
    if (!sportCenters.length) {
      void fetchSportCenters()
    }
  }, [fetchSportCenters, sportCenters.length])

  useEffect(() => {
    void loadCustomers(PAGE_SIZE)
  }, [centerFilterId, currentPage, keyword, refreshKey, loadCustomers])

  const selectedCenter = useMemo(
    () => sportCenters.find((center) => center.id === centerFilterId) ?? null,
    [centerFilterId, sportCenters]
  )

  const paginationView = useMemo(() => {
    const total = pagination?.total ?? customers.length
    const limit = pagination?.limit ?? PAGE_SIZE
    const totalPages = Math.max(1, Math.ceil(total / limit))

    return {
      currentPage,
      totalPages,
      total,
      pageSize: limit,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    }
  }, [customers.length, currentPage, pagination?.limit, pagination?.total])

  const stats = useMemo(() => {
    const totalVisits = customers.reduce(
      (sum, item) => sum + item.summary.visitCount,
      0
    )
    const totalSpend = customers.reduce(
      (sum, item) => sum + item.summary.totalSpend,
      0
    )
    const totalCreditBalance = customers.reduce(
      (sum, item) => sum + item.summary.creditBalance,
      0
    )

    return {
      totalCustomers: pagination?.total ?? customers.length,
      visibleCustomers: customers.length,
      totalVisits,
      totalSpend,
      totalCreditBalance,
    }
  }, [customers, pagination?.total])

  const hasActiveFilters = keyword.trim().length > 0

  const isPageLoading = loadingSportCenters || isLoading
  const selectedCenterName = selectedCenter?.name ?? "Tất cả sân"

  return (
    <PageContainer
      variant="wide"
      className="relative min-h-screen space-y-8 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,0.02),transparent)]" />
      <div className="pointer-events-none absolute top-16 right-0 -z-10 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />

      <CustomerManagementPageHeader selectedCenterName={selectedCenterName} />

      {/* <CustomerManagementStatsCards stats={stats} /> */}

      <section className="space-y-5">
        <CustomerManagementFilters
          keyword={keyword}
          hasActiveFilters={hasActiveFilters}
          onKeywordChange={setKeyword}
          onResetFilters={resetFilters}
          onRefreshCustomers={refreshCustomers}
        />

        <CustomerManagementResults
          isPageLoading={isPageLoading}
          loadError={loadError}
          customers={customers}
          hasActiveFilters={hasActiveFilters}
          pagination={paginationView}
          onRefreshCustomers={refreshCustomers}
          onResetFilters={resetFilters}
          onPreviousPage={() => {
            if (!paginationView.hasPreviousPage) return
            setCurrentPage(Math.max(1, currentPage - 1))
          }}
          onNextPage={() => {
            if (!paginationView.hasNextPage) return
            setCurrentPage(currentPage + 1)
          }}
        />
      </section>
    </PageContainer>
  )
}
