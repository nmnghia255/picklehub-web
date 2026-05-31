"use client"

import { BarChart3, FileDown, RefreshCcw, ShieldAlert } from "lucide-react"
import { useEffect, useMemo } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

import { useRevenueReportStore } from "../store/revenue-store"
import {
  buildExportFilename,
  downloadFromUrl,
  getPresetDateRange,
} from "../utils/format"
import { RevenueCancellationsCards } from "./revenue-cancellations-cards"
import { RevenueDailyChart } from "./revenue-daily-chart"
import { RevenueFiltersBar } from "./revenue-filters"
import { RevenueSummaryCards } from "./revenue-summary-cards"
import { RevenueTransactionDrawer } from "./revenue-transaction-drawer"
import { RevenueTransactionsTable } from "./revenue-transactions-table"

export function RevenueReportPage() {
  const { toast } = useToast()
  const filters = useRevenueReportStore((state) => state.filters)
  const centers = useRevenueReportStore((state) => state.centers)
  const loadingCenters = useRevenueReportStore((state) => state.loadingCenters)
  const summary = useRevenueReportStore((state) => state.summary)
  const statistics = useRevenueReportStore((state) => state.statistics)
  const daily = useRevenueReportStore((state) => state.daily)
  const cancellations = useRevenueReportStore((state) => state.cancellations)
  const transactions = useRevenueReportStore((state) => state.transactions)
  const pagination = useRevenueReportStore((state) => state.pagination)
  const loadingOverview = useRevenueReportStore(
    (state) => state.loadingOverview
  )
  const loadingTransactions = useRevenueReportStore(
    (state) => state.loadingTransactions
  )
  const exporting = useRevenueReportStore((state) => state.exporting)
  const permissionDenied = useRevenueReportStore(
    (state) => state.permissionDenied
  )
  const error = useRevenueReportStore((state) => state.error)
  const detailOpen = useRevenueReportStore((state) => state.detailOpen)
  const selectedTransactionId = useRevenueReportStore(
    (state) => state.selectedTransactionId
  )

  const fetchCenters = useRevenueReportStore((state) => state.fetchCenters)
  const fetchOverview = useRevenueReportStore((state) => state.fetchOverview)
  const fetchTransactions = useRevenueReportStore(
    (state) => state.fetchTransactions
  )
  const refreshAll = useRevenueReportStore((state) => state.refreshAll)
  const exportCsv = useRevenueReportStore((state) => state.exportCsv)
  const setDateRange = useRevenueReportStore((state) => state.setDateRange)
  const setStatus = useRevenueReportStore((state) => state.setStatus)
  const setMethod = useRevenueReportStore((state) => state.setMethod)
  const toggleCenter = useRevenueReportStore((state) => state.toggleCenter)
  const setLimit = useRevenueReportStore((state) => state.setLimit)
  const setOffset = useRevenueReportStore((state) => state.setOffset)
  const resetFilters = useRevenueReportStore((state) => state.resetFilters)
  const openTransaction = useRevenueReportStore(
    (state) => state.openTransaction
  )
  const setDetailOpen = useRevenueReportStore((state) => state.setDetailOpen)
  const clearError = useRevenueReportStore((state) => state.clearError)

  useEffect(() => {
    fetchCenters()
  }, [fetchCenters])

  const overviewKey = useMemo(
    () =>
      JSON.stringify({
        from: filters.from,
        to: filters.to,
        status: filters.status,
        method: filters.method,
        centerIds: filters.centerIds,
      }),
    [
      filters.from,
      filters.to,
      filters.status,
      filters.method,
      filters.centerIds,
    ]
  )

  const transactionsKey = useMemo(
    () =>
      JSON.stringify({
        from: filters.from,
        to: filters.to,
        status: filters.status,
        method: filters.method,
        centerIds: filters.centerIds,
        limit: filters.limit,
        offset: filters.offset,
      }),
    [
      filters.from,
      filters.to,
      filters.status,
      filters.method,
      filters.centerIds,
      filters.limit,
      filters.offset,
    ]
  )

  useEffect(() => {
    fetchOverview()
  }, [overviewKey, fetchOverview])

  useEffect(() => {
    fetchTransactions()
  }, [transactionsKey, fetchTransactions])

  useEffect(() => {
    if (!error) return

    toast({
      title: "Có lỗi xảy ra",
      description: error,
      variant: "destructive",
    })
    clearError()
  }, [error, toast, clearError])

  const selectedTransaction = useMemo(() => {
    if (!selectedTransactionId) return null
    return (
      transactions.find((item) => item.id === selectedTransactionId) ?? null
    )
  }, [selectedTransactionId, transactions])

  const handleExport = async () => {
    const url = await exportCsv()

    if (!url) {
      toast({
        title: "Không thể xuất CSV",
        description: "CSV tạm thời chưa sẵn sàng hoặc bị giới hạn.",
        variant: "destructive",
      })
      return
    }

    const filename = buildExportFilename(filters.from, filters.to)
    downloadFromUrl(url, filename)

    toast({
      title: "Đã tạo báo cáo CSV",
      description: "Đang tải file xuống trình duyệt.",
    })
  }

  const loadingAll = loadingOverview && loadingTransactions

  return (
    <PageContainer variant="wide" className="space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-card/70 px-6 py-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_36%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <BarChart3 className="size-4 text-sky-500" />
              Báo cáo doanh thu
            </div>
            <h1 className="text-2xl font-semibold">Báo cáo doanh thu</h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi doanh thu, giao dịch và tỷ lệ hủy/hoàn tiền theo thời
              gian.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={refreshAll}
              disabled={loadingAll}
            >
              <RefreshCcw className="size-4" />
              Làm mới
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              <FileDown className="size-4" />
              {exporting ? "Đang xuất..." : "Export CSV"}
            </Button>
          </div>
        </div>
      </div>

      {permissionDenied ? (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          <ShieldAlert className="size-5 text-amber-500" />
          Bạn không có quyền truy cập.
        </div>
      ) : null}

      <RevenueFiltersBar
        filters={filters}
        centers={centers}
        loadingCenters={loadingCenters}
        onPreset={(preset) => {
          const range = getPresetDateRange(preset)
          setDateRange(range.from, range.to)
        }}
        onDateChange={(field, value) => {
          setDateRange(
            field === "from" ? value : filters.from,
            field === "to" ? value : filters.to
          )
        }}
        onStatusChange={setStatus}
        onMethodChange={setMethod}
        onCenterToggle={toggleCenter}
        onLimitChange={setLimit}
        onReset={resetFilters}
      />

      {loadingAll ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl border bg-card/60 py-10 text-sm text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          Đang tải dữ liệu...
        </div>
      ) : (
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList>
            <TabsTrigger value="summary">Tổng quan</TabsTrigger>
            <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
            <TabsTrigger value="cancellations">Hủy / Hoàn tiền</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <RevenueSummaryCards summary={summary} loading={loadingOverview} />
            <RevenueDailyChart
              daily={daily}
              statistics={statistics}
              loading={loadingOverview}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <RevenueTransactionsTable
              transactions={transactions}
              pagination={pagination}
              limit={filters.limit}
              offset={filters.offset}
              loading={loadingTransactions}
              onRowClick={openTransaction}
              onOffsetChange={setOffset}
            />
          </TabsContent>

          <TabsContent value="cancellations" className="space-y-4">
            <RevenueCancellationsCards
              cancellations={cancellations}
              loading={loadingOverview}
            />
          </TabsContent>
        </Tabs>
      )}

      <RevenueTransactionDrawer
        transaction={selectedTransaction}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </PageContainer>
  )
}
