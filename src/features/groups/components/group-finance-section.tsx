"use client"

import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp, Loader2, Search } from "lucide-react"
import { useState } from "react"

import { ErrorSection } from "@/components/error-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import {
  financeQueryKeys,
  getFinanceSummaryClient,
  getMyDebtClient,
  listCreditBalancesClient,
  listExpensesClient,
  listGroupDebtsClient,
  listTransactionsClient,
} from "../api/finance-client"
import { getGroupMembersClient, groupQueryKeys } from "../api/groups-client"
import { useGroupDebts } from "../hooks/use-group-debts"
import type { Member } from "../types"
import { isArchivedGroup } from "../utils/group-status"
import {
  CreateExpenseButton,
  CreateTransactionButton,
  ExpenseRowActions,
  PaymentReceiptPreview,
  RemindDebtButton,
  TransactionRowActions,
} from "./finance-item-actions"
import { useGroupDetailActiveTab } from "./group-detail-tabs"

function formatCurrency(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "-"
  const numericValue = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(numericValue)) return String(value ?? "-")
  return formatCurrencyVnd(numericValue)
}

function formatDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatTransactionStatus(status?: string | null) {
  const normalized = status?.toUpperCase()
  if (normalized === "VERIFIED") return "Đã xác nhận"
  if (normalized === "REJECTED") return "Đã từ chối"
  if (normalized === "PENDING_REVIEW") return "Chờ duyệt"
  return status ?? "-"
}

function getTransactionStatusVariant(status?: string | null) {
  const normalized = status?.toUpperCase()
  if (normalized === "VERIFIED") return "default" as const
  if (normalized === "PENDING_REVIEW") return "secondary" as const
  if (normalized === "REJECTED") return "destructive" as const
  return "outline" as const
}

function formatDebtStatus(status?: string | null) {
  const normalized = status?.toUpperCase()
  if (normalized === "PAID") return "Đã thanh toán"
  if (normalized === "PARTIALLY_PAID") return "Thanh toán một phần"
  if (normalized === "UNPAID") return "Chưa thanh toán"
  if (normalized === "OVERPAID") return "Thanh toán dư"
  return status ?? "-"
}

function getDebtStatusVariant(status?: string | null) {
  const normalized = status?.toUpperCase()
  if (normalized === "PAID") return "default" as const
  if (normalized === "PARTIALLY_PAID") return "secondary" as const
  if (normalized === "UNPAID") return "destructive" as const
  if (normalized === "OVERPAID") return "outline" as const
  return "outline" as const
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "TV"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function getQueryErrorMessage(error: unknown, fallback: string) {
  if (!error) return fallback
  if (typeof error === "string") return error
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function GroupFinanceSection({
  groupId,
  members,
  currentUserId: _currentUserId,
  currentUserRole,
  groupStatus,
}: {
  groupId: string
  members: Member[]
  currentUserId: string
  currentUserRole: string | null
  groupStatus?: string | null
}) {
  const activeTab = useGroupDetailActiveTab()
  const normalizedRole = currentUserRole?.toLowerCase() ?? ""
  const isOwner = normalizedRole === "owner"
  const canManage =
    !isArchivedGroup(groupStatus) &&
    (normalizedRole === "owner" || normalizedRole === "admin")

  const isFinanceActive = activeTab === "finance"

  const summaryQuery = useQuery({
    queryKey: financeQueryKeys.summary(groupId),
    queryFn: () => getFinanceSummaryClient(groupId),
    enabled: isFinanceActive,
  })

  const transactionsQuery = useQuery({
    queryKey: financeQueryKeys.transactions(groupId),
    queryFn: () => listTransactionsClient(groupId),
    enabled: isFinanceActive && canManage,
  })

  const myDebtQuery = useQuery({
    queryKey: financeQueryKeys.myDebt(groupId),
    queryFn: () => getMyDebtClient(groupId),
    enabled: isFinanceActive,
  })

  const expensesQuery = useQuery({
    queryKey: financeQueryKeys.expenses(groupId),
    queryFn: () => listExpensesClient(groupId),
    enabled: isFinanceActive,
  })

  const creditBalancesQuery = useQuery({
    queryKey: financeQueryKeys.creditBalances(groupId),
    queryFn: () => listCreditBalancesClient(groupId),
    enabled: isFinanceActive,
  })

  const membersQuery = useQuery({
    queryKey: groupQueryKeys.members(groupId),
    queryFn: () => getGroupMembersClient(groupId),
    enabled: isFinanceActive,
    initialData: members.length > 0 ? members : undefined,
  })

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10
  const [expandedUsers, setExpandedUsers] = useState<string[]>([])

  const groupDebtsQuery = useGroupDebts(
    groupId,
    { page, limit, search },
    { enabled: isFinanceActive && isOwner }
  )

  const statsDebtsQuery = useQuery({
    queryKey: financeQueryKeys.debts(groupId, { limit: 1000 }),
    queryFn: () => listGroupDebtsClient(groupId, { limit: 1000 }),
    enabled: isFinanceActive && isOwner,
  })

  const resolvedMembers = membersQuery.data ?? []

  if (!isFinanceActive) {
    return (
      <Card className="mt-6 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>Thu chi nhóm</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng quan tài chính nhóm.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Mở tab Thu chi để tải dữ liệu.
          </p>
        </CardContent>
      </Card>
    )
  }

  const summary = summaryQuery.data

  const statsDebts = statsDebtsQuery.data?.data ?? []
  const debtorsCount = statsDebts.filter((item) => item.debt > 0).length
  const overpayersCount = statsDebts.filter(
    (item) => item.creditBalance > 0
  ).length

  const monthlyStats = {
    totalCollected: summary?.totalCollected ?? 0,
    totalSpent: summary?.totalExpense ?? 0,
    difference: summary?.netBalance ?? 0,
    debtorsCount,
    overpayersCount,
  }

  return (
    <Card className="mt-6 shadow-sm">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Thu chi nhóm</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {canManage
                ? "Tổng quan tài chính, giao dịch và khoản nợ của nhóm."
                : "Theo dõi các khoản nợ và gửi thông tin thanh toán của bạn."}
            </p>
          </div>
          {!isArchivedGroup(groupStatus) && (
            <div className="flex flex-wrap gap-2">
              <CreateTransactionButton groupId={groupId} />
              {canManage && (
                <>
                  <CreateExpenseButton
                    groupId={groupId}
                    members={resolvedMembers}
                  />
                  <RemindDebtButton
                    groupId={groupId}
                    members={resolvedMembers}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {summaryQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Đang tải tổng quan...</p>
        ) : summaryQuery.isError ? (
          <ErrorSection
            title="Lỗi tải tổng quan"
            message={getQueryErrorMessage(summaryQuery.error, "Thử lại sau.")}
          />
        ) : summary ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                title="Tổng chi tiêu"
                value={formatCurrency(summary.totalExpense)}
                description={`Cân đối: ${formatCurrency(summary.netBalance)}`}
              />
              <SummaryCard
                title="Tổng đã thu"
                value={formatCurrency(summary.totalCollected)}
                description={`Chờ duyệt: ${formatCurrency(summary.totalExpectedRevenue - summary.totalCollected)}`}
              />
              <SummaryCard
                title="Còn nợ"
                value={formatCurrency(summary.outstandingAmount)}
                description={`Kỳ vọng thu: ${formatCurrency(summary.totalExpectedRevenue)}`}
              />
            </div>

            <div className="rounded-lg border bg-muted/20 p-4">
              <h4 className="mb-3 text-sm font-semibold">Thống kê tháng</h4>
              <div
                className={`grid gap-4 sm:grid-cols-3 ${isOwner ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}
              >
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Tổng thu
                  </p>
                  <p className="text-success text-lg font-bold">
                    {formatCurrency(monthlyStats.totalCollected)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Tổng chi
                  </p>
                  <p className="text-lg font-bold text-destructive">
                    {formatCurrency(monthlyStats.totalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Chênh lệch
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(monthlyStats.difference)}
                  </p>
                </div>
                {isOwner && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">
                        Thành viên nợ
                      </p>
                      <p className="text-lg font-bold">
                        {monthlyStats.debtorsCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">
                        Đóng dư
                      </p>
                      <p className="text-lg font-bold">
                        {monthlyStats.overpayersCount}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <Tabs defaultValue={canManage ? "transactions" : "my-debt"}>
          <TabsList>
            {canManage && (
              <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
            )}
            <TabsTrigger value="my-debt">Nợ của tôi</TabsTrigger>
            {isOwner && (
              <TabsTrigger value="member-debts">Nợ thành viên</TabsTrigger>
            )}
            <TabsTrigger value="expenses">Khoản chi</TabsTrigger>
            <TabsTrigger value="credits">Tín dụng</TabsTrigger>
          </TabsList>

          {canManage && (
            <TabsContent value="transactions" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thành viên</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Ngày gửi</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Chứng từ</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsQuery.data?.data?.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={tx.user?.avatarUrl || ""} />
                              <AvatarFallback>
                                {getInitials(tx.user?.name || "TV")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {tx.user?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(tx.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getTransactionStatusVariant(tx.status)}
                          >
                            {formatTransactionStatus(tx.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tx.receiptUrl && (
                            <PaymentReceiptPreview receiptUrl={tx.receiptUrl} />
                          )}
                        </TableCell>
                        <TableCell>
                          <TransactionRowActions
                            groupId={groupId}
                            transaction={tx}
                            canManage={canManage}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {!transactionsQuery.data?.data?.length && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-4 text-center text-muted-foreground"
                        >
                          Chưa có giao dịch nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          )}

          <TabsContent value="my-debt" className="mt-4 space-y-4">
            {myDebtQuery.data && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  title="Tổng phải đóng"
                  value={formatCurrency(myDebtQuery.data.totalRequired)}
                  description="Tổng các khoản chi được phân bổ"
                />
                <SummaryCard
                  title="Đã thanh toán"
                  value={formatCurrency(myDebtQuery.data.totalPaid)}
                  description="Tổng số tiền bạn đã đóng"
                />
                <SummaryCard
                  title="Công nợ hiện tại"
                  value={formatCurrency(myDebtQuery.data.debt)}
                  description="Số tiền còn phải thanh toán"
                />
                <SummaryCard
                  title="Chênh lệch"
                  value={formatCurrency(myDebtQuery.data.netBalance)}
                  description="Số dư tài chính của bạn"
                />
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khoản chi</TableHead>
                    <TableHead>Phải đóng</TableHead>
                    <TableHead>Đã đóng</TableHead>
                    <TableHead>Còn nợ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myDebtQuery.data?.unpaidPayments?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.expenseTitle}
                      </TableCell>
                      <TableCell>{formatCurrency(item.requiredFee)}</TableCell>
                      <TableCell className="text-success">
                        {formatCurrency(item.amountPaid)}
                      </TableCell>
                      <TableCell className="font-medium text-destructive">
                        {formatCurrency(item.debt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDebtStatusVariant(item.status)}>
                          {formatDebtStatus(item.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!myDebtQuery.data?.unpaidPayments?.length && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Không có khoản công nợ nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {isOwner && (
            <TabsContent value="member-debts" className="mt-4 space-y-5">
              {/* Debt summary cards */}
              {statsDebtsQuery.data?.data &&
                statsDebtsQuery.data.data.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                      title="Tổng số người đang nợ"
                      value={String(
                        statsDebts.filter((d) => d.debt > 0).length
                      )}
                      description="Thành viên chưa thanh toán đủ"
                    />
                    <SummaryCard
                      title="Tổng tiền đang nợ"
                      value={formatCurrency(
                        statsDebts.reduce(
                          (sum, d) => sum + (d.debt > 0 ? d.debt : 0),
                          0
                        )
                      )}
                      description="Tổng công nợ còn tồn đọng"
                    />
                    <SummaryCard
                      title="Tổng khoản chưa thanh toán"
                      value={String(
                        statsDebts.reduce(
                          (sum, d) => sum + (d.unpaidPayments?.length ?? 0),
                          0
                        )
                      )}
                      description="Số khoản chi chưa hoàn thành"
                    />
                    <SummaryCard
                      title="Tổng credit dư"
                      value={formatCurrency(
                        statsDebts.reduce(
                          (sum, d) =>
                            sum + (d.creditBalance > 0 ? d.creditBalance : 0),
                          0
                        )
                      )}
                      description="Thành viên đóng vượt mức"
                    />
                  </div>
                )}

              {/* Search */}
              <div className="flex max-w-sm items-center gap-2">
                <div className="relative w-full">
                  <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm thành viên..."
                    className="w-full rounded-md border bg-background py-2 pr-4 pl-9 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
              </div>

              {groupDebtsQuery.isPending ? (
                <div className="flex items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  Đang tải dữ liệu công nợ...
                </div>
              ) : groupDebtsQuery.isError ? (
                <ErrorSection
                  title="Lỗi tải dữ liệu"
                  message={getQueryErrorMessage(
                    groupDebtsQuery.error,
                    "Thử lại sau."
                  )}
                />
              ) : !groupDebtsQuery.data?.data?.length ? (
                <div className="rounded-md border bg-muted/5 py-10 text-center text-muted-foreground">
                  Không tìm thấy thông tin công nợ nào.
                </div>
              ) : (
                <div className="space-y-3">
                  {groupDebtsQuery.data.data.map((item) => {
                    const isExpanded = expandedUsers.includes(item.userId)
                    const statusText =
                      item.debt > 0
                        ? `Nợ ${formatCurrency(item.debt)}`
                        : item.creditBalance > 0
                          ? `Dư ${formatCurrency(item.creditBalance)}`
                          : "Đã thanh toán"
                    const statusVariant =
                      item.debt > 0
                        ? ("destructive" as const)
                        : item.creditBalance > 0
                          ? ("secondary" as const)
                          : ("default" as const)

                    return (
                      <Card
                        key={item.userId}
                        className="overflow-hidden border shadow-sm"
                      >
                        {/* Member header row */}
                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={item.user?.avatarUrl || ""} />
                              <AvatarFallback>
                                {getInitials(item.user?.name || "TV")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {item.user?.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {item.user?.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold tabular-nums">
                              {formatCurrency(item.totalRequired)}
                            </span>
                            <Badge variant={statusVariant}>{statusText}</Badge>
                            {item.creditBalance > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Credit: {formatCurrency(item.creditBalance)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Compact stats row */}
                        <div className="grid grid-cols-2 gap-px border-t bg-border md:grid-cols-4">
                          <div className="bg-card px-4 py-2.5">
                            <p className="text-[11px] text-muted-foreground">
                              Phải đóng
                            </p>
                            <p className="text-sm font-medium tabular-nums">
                              {formatCurrency(item.totalRequired)}
                            </p>
                          </div>
                          <div className="bg-card px-4 py-2.5">
                            <p className="text-[11px] text-muted-foreground">
                              Đã đóng
                            </p>
                            <p className="text-success text-sm font-medium tabular-nums">
                              {formatCurrency(item.totalPaid)}
                            </p>
                          </div>
                          <div className="bg-card px-4 py-2.5">
                            <p className="text-[11px] text-muted-foreground">
                              Credit dư
                            </p>
                            <p className="text-sm font-medium text-primary tabular-nums">
                              {formatCurrency(item.creditBalance)}
                            </p>
                          </div>
                          <div className="bg-card px-4 py-2.5">
                            <p className="text-[11px] text-muted-foreground">
                              Cân đối
                            </p>
                            <p className="text-sm font-medium tabular-nums">
                              {formatCurrency(item.netBalance)}
                            </p>
                          </div>
                        </div>

                        {/* Expand/collapse toggle */}
                        {item.unpaidPayments &&
                          item.unpaidPayments.length > 0 && (
                            <div className="border-t px-4 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setExpandedUsers((prev) =>
                                    prev.includes(item.userId)
                                      ? prev.filter((id) => id !== item.userId)
                                      : [...prev, item.userId]
                                  )
                                }}
                              >
                                {isExpanded ? (
                                  <>
                                    Ẩn chi tiết
                                    <ChevronUp className="size-3.5" />
                                  </>
                                ) : (
                                  <>
                                    Xem chi tiết ({item.unpaidPayments.length}{" "}
                                    khoản)
                                    <ChevronDown className="size-3.5" />
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                        {/* Expanded payment details table */}
                        {isExpanded && (
                          <div className="border-t">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/30">
                                    <TableHead className="text-xs">
                                      Tên khoản chi
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Số cần đóng
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Đã đóng
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Còn nợ
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Trạng thái
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Ngày tạo
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {item.unpaidPayments &&
                                  item.unpaidPayments.length > 0 ? (
                                    item.unpaidPayments.map((payment) => (
                                      <TableRow key={payment.id}>
                                        <TableCell className="text-sm font-medium">
                                          {payment.expenseTitle}
                                        </TableCell>
                                        <TableCell className="text-sm tabular-nums">
                                          {formatCurrency(payment.requiredFee)}
                                        </TableCell>
                                        <TableCell className="text-success text-sm tabular-nums">
                                          {formatCurrency(payment.amountPaid)}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-destructive tabular-nums">
                                          {formatCurrency(payment.debt)}
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={getDebtStatusVariant(
                                              payment.status
                                            )}
                                          >
                                            {formatDebtStatus(payment.status)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                          {formatDate(payment.createdAt)}
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell
                                        colSpan={6}
                                        className="py-6 text-center text-sm text-muted-foreground"
                                      >
                                        Không có khoản nợ nào.
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}

                  {/* Pagination */}
                  {groupDebtsQuery.data?.meta &&
                    groupDebtsQuery.data.meta.totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={page === 1}
                        >
                          Trang trước
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Trang {page} / {groupDebtsQuery.data.meta.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((prev) =>
                              Math.min(
                                groupDebtsQuery.data.meta.totalPages,
                                prev + 1
                              )
                            )
                          }
                          disabled={
                            page === groupDebtsQuery.data.meta.totalPages
                          }
                        >
                          Trang sau
                        </Button>
                      </div>
                    )}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="expenses" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khoản chi</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Ngày chi</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expensesQuery.data?.data?.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-medium">{exp.title}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(exp.totalAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(exp.expenseDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {exp.createdBy?.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <ExpenseRowActions
                          groupId={groupId}
                          expense={exp}
                          members={resolvedMembers}
                          canManage={canManage}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!expensesQuery.data?.data?.length && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-4 text-center text-muted-foreground"
                      >
                        Chưa có khoản chi nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="credits" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {creditBalancesQuery.data?.data?.map((entry) => (
                <Card
                  key={entry.userId}
                  className="flex items-center gap-4 p-4"
                >
                  <Avatar>
                    <AvatarImage src={entry.user?.avatarUrl || ""} />
                    <AvatarFallback>
                      {getInitials(entry.user?.name || "TV")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{entry.user?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.user?.email}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {formatCurrency(entry.creditBalance)}
                  </Badge>
                </Card>
              ))}
              {!creditBalancesQuery.data?.data?.length && (
                <div className="col-span-full py-10 text-center text-muted-foreground">
                  Không có thành viên nào có số dư tín dụng.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
