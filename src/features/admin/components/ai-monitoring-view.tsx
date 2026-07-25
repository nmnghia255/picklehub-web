"use client"

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Cpu,
  DollarSign,
  Layers,
  RefreshCw,
  Zap,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import {
  getAiModelPricings,
  getAiMonitoringLogDetail,
  getAiMonitoringLogs,
  getAiMonitoringOverview,
} from "../api/admin-service"
import type { AiLogItem, AiModelPricing, AiMonitoringOverview } from "../types"

export function AiMonitoringView() {
  const [overview, setOverview] = useState<AiMonitoringOverview | null>(null)
  const [logs, setLogs] = useState<AiLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AiLogItem | null>(null)

  // Pricing Modal state
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [pricings, setPricings] = useState<AiModelPricing[]>([])
  const [loadingPricings, setLoadingPricings] = useState(false)
  const [fetchingDetail, setFetchingDetail] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = useCallback(async () => {
    try {
      const [statsData, logsData] = await Promise.all([
        getAiMonitoringOverview().catch((err) => {
          console.error("Overview Stats Error:", err)
          return null
        }),
        getAiMonitoringLogs(page, limit).catch((err) => {
          console.error("Logs Fetch Error:", err)
          return { data: [], meta: { total: 0, page: 1, limit, totalPages: 0 } }
        }),
      ])
      if (statsData) setOverview(statsData)
      if (logsData?.data) setLogs(logsData.data)
      if (logsData?.meta) {
        setTotal(logsData.meta.total)
        setTotalPages(
          logsData.meta.totalPages ||
            Math.ceil(logsData.meta.total / limit) ||
            1
        )
      } else {
        setTotal(logsData?.data?.length || 0)
        setTotalPages(1)
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ AI Monitoring")
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const handleOpenDetail = async (log: AiLogItem) => {
    setSelectedLog(log)
    setDrawerOpen(true)
    setFetchingDetail(true)
    try {
      const fullDetail = await getAiMonitoringLogDetail(log.id)
      if (fullDetail) {
        setSelectedLog(fullDetail)
      }
    } catch {
      // Fallback to log summary if detail API is pending
    } finally {
      setFetchingDetail(false)
    }
  }

  const handleOpenPricingModal = async () => {
    setPricingModalOpen(true)
    setLoadingPricings(true)
    try {
      const list = await getAiModelPricings()
      setPricings(list)
    } catch (err) {
      console.error("Failed to load AI model pricings:", err)
      toast.error("Không thể tải bảng giá AI Model")
    } finally {
      setLoadingPricings(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Monitoring</h1>
          <p className="text-sm text-muted-foreground">
            Thống kê chỉ số vận hành & lịch sử request gọi AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPricingModal}
            className="w-fit"
          >
            <DollarSign className="mr-1.5 size-4 text-emerald-600" />
            Bảng Giá Model
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="w-fit"
          >
            <RefreshCw
              className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>
      </div>

      {/* 6 Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {loading ? (
                <Spinner className="size-4" />
              ) : (
                (overview?.totalRequests?.toLocaleString() ?? 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Prompt Tokens
            </CardTitle>
            <Layers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {loading ? (
                <Spinner className="size-4" />
              ) : (
                (
                  overview?.promptTokens ??
                  overview?.totalPromptTokens ??
                  0
                ).toLocaleString()
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Completion Tokens
            </CardTitle>
            <Cpu className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {loading ? (
                <Spinner className="size-4" />
              ) : (
                (
                  overview?.completionTokens ??
                  overview?.totalCompletionTokens ??
                  0
                ).toLocaleString()
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Tokens
            </CardTitle>
            <Layers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {loading ? (
                <Spinner className="size-4" />
              ) : (
                (overview?.totalTokens ?? 0).toLocaleString()
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Estimated Cost
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {loading ? (
                <Spinner className="size-4" />
              ) : (
                `$${(overview?.totalCostUsd ?? overview?.estimatedCostUsd ?? 0).toFixed(4)}`
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Average Latency
            </CardTitle>
            <Zap className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {loading ? (
                <Spinner className="size-4" />
              ) : (
                `${overview?.avgLatencyMs ?? overview?.averageLatencyMs ?? 0}ms`
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logs History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : logs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Chưa có log dữ liệu</EmptyTitle>
                <EmptyDescription>
                  Hệ thống chưa ghi nhận lượt gọi AI nào.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="break-words whitespace-normal">
                        Request ID
                      </TableHead>
                      <TableHead className="break-words whitespace-normal">
                        Timestamp
                      </TableHead>
                      <TableHead className="break-words whitespace-normal">
                        Model
                      </TableHead>
                      <TableHead className="break-words whitespace-normal">
                        Tokens (Prompt/Completion)
                      </TableHead>
                      <TableHead className="w-[100px] text-xs whitespace-nowrap">
                        Latency
                      </TableHead>
                      <TableHead className="w-[100px] text-xs whitespace-nowrap">
                        Status
                      </TableHead>
                      <TableHead className="w-[100px] text-right text-xs whitespace-nowrap">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const isSuccess =
                        log.isSuccess !== undefined
                          ? log.isSuccess
                          : log.statusCode
                            ? log.statusCode < 400
                            : true
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="truncate font-mono text-xs">
                            {log.id}
                          </TableCell>
                          <TableCell className="text-xs whitespace-normal">
                            {new Date(log.createdAt).toLocaleString("vi-VN")}
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            <Badge variant="outline">
                              {log.modelName || log.model || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs wrap-break-word whitespace-normal">
                            {log.promptTokens} / {log.completionTokens} (
                            {log.totalTokens})
                          </TableCell>
                          <TableCell className="text-[11px] whitespace-nowrap text-muted-foreground">
                            {log.latencyMs}ms
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              className={cn(
                                "border-0 px-1.5 py-0.5 text-[10px] font-semibold",
                                isSuccess
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-400"
                              )}
                            >
                              {log.statusCode ||
                                (isSuccess ? "Success" : "Error")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleOpenDetail(log)}
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  Hiển thị <span className="font-medium">{logs.length}</span> /{" "}
                  <span className="font-medium">{total}</span> logs
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="mr-1 size-4" /> Trước
                  </Button>
                  <span className="px-2 text-xs font-medium">
                    Trang {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Sau <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Log Details - {selectedLog?.id}</SheetTitle>
            <SheetDescription>
              Chi tiết request payload & response của lượt gọi AI.
            </SheetDescription>
          </SheetHeader>
          {fetchingDetail ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : (
            selectedLog && (
              <div className="mt-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <p className="font-medium">
                      {selectedLog.modelName || selectedLog.model || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-0.5">
                      <Badge
                        className={cn(
                          "border-0 px-1.5 py-0.5 text-[10px] font-semibold",
                          (
                            selectedLog.isSuccess !== undefined
                              ? selectedLog.isSuccess
                              : selectedLog.statusCode
                                ? selectedLog.statusCode < 400
                                : true
                          )
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                        )}
                      >
                        {selectedLog.statusCode !== undefined
                          ? `HTTP ${selectedLog.statusCode}`
                          : (
                                selectedLog.isSuccess !== undefined
                                  ? selectedLog.isSuccess
                                  : true
                              )
                            ? "Success (200)"
                            : "Error (500)"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Latency:</span>
                    <p className="font-medium">{selectedLog.latencyMs}ms</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Tokens:</span>
                    <p className="font-medium">{selectedLog.totalTokens}</p>
                  </div>
                  {(selectedLog.apiEndpoint || selectedLog.endpoint) && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Endpoint:</span>
                      <p className="font-mono text-xs">
                        {selectedLog.apiEndpoint || selectedLog.endpoint}
                      </p>
                    </div>
                  )}
                  {selectedLog.featureModule && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Module:</span>
                      <p className="font-mono text-xs">
                        {selectedLog.featureModule}
                      </p>
                    </div>
                  )}
                  {selectedLog.userId && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">User ID:</span>
                      <p className="font-mono text-xs">{selectedLog.userId}</p>
                    </div>
                  )}
                </div>

                {selectedLog.promptText && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Prompt Text:
                    </label>
                    <pre className="max-h-48 overflow-y-auto rounded-md bg-slate-950 p-3 text-xs whitespace-pre-wrap text-slate-50">
                      {selectedLog.promptText}
                    </pre>
                  </div>
                )}

                {selectedLog.completionText && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Completion Text:
                    </label>
                    <pre className="max-h-48 overflow-y-auto rounded-md bg-slate-950 p-3 text-xs whitespace-pre-wrap text-emerald-400">
                      {selectedLog.completionText}
                    </pre>
                  </div>
                )}

                {selectedLog.errorMessage && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-destructive">
                      Error Message:
                    </label>
                    <pre className="rounded-md bg-red-950 p-3 text-xs whitespace-pre-wrap text-red-200">
                      {selectedLog.errorMessage}
                    </pre>
                  </div>
                )}
              </div>
            )
          )}
        </SheetContent>
      </Sheet>

      {/* AI Model Pricing Table Modal */}
      <Dialog open={pricingModalOpen} onOpenChange={setPricingModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <DollarSign className="size-5 text-emerald-600" />
              Bảng Giá Chi Phí Mô Hình AI (AI Model Pricing)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Định mức giá chi phí Token theo từng dòng Model (Đơn vị: USD / 1
              Triệu Tokens).
            </DialogDescription>
          </DialogHeader>

          {loadingPricings ? (
            <div className="flex h-36 items-center justify-center">
              <Spinner className="size-6 text-emerald-600" />
            </div>
          ) : pricings.length === 0 ? (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyTitle>Chưa có dữ liệu bảng giá</EmptyTitle>
                <EmptyDescription>
                  Hệ thống chưa ghi nhận bảng giá cho các model AI.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      Model Name
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Type</TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Input / 1M Tokens
                    </TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Output / 1M Tokens
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricings.map((p) => {
                    const badgeClass =
                      p.type === "pro"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400"
                        : p.type === "flash"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : p.type === "lite"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"

                    return (
                      <TableRow key={p.modelName}>
                        <TableCell className="text-xs font-semibold whitespace-nowrap">
                          {p.modelName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            className={cn(
                              "border-0 px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                              badgeClass
                            )}
                          >
                            {p.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                          ${p.inputPerMillionUsd}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                          ${p.outputPerMillionUsd}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPricingModalOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
