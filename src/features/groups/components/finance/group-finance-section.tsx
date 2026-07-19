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
import { useGroupsTranslation } from "@/i18n/use-groups-translation"
import { cn } from "@/lib/utils"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import {
  financeQueryKeys,
  getFinanceSummaryClient,
  getMyDebtClient,
  listCreditBalancesClient,
  listExpensesClient,
  listGroupDebtsClient,
  listTransactionsClient,
} from "../../api/finance-client"
import { getGroupMembersClient, groupQueryKeys } from "../../api/groups-client"
import { useGroupDebts } from "../../hooks/use-group-debts"
import type { Member } from "../../types"
import { isArchivedGroup } from "../../utils/group-status"
import { useGroupDetailActiveTab } from "../details/group-detail-tabs"
import {
  CreateExpenseButton,
  CreateTransactionButton,
  ExpenseRowActions,
  PaymentReceiptPreview,
  RemindDebtButton,
  TransactionRowActions,
} from "./finance-item-actions"

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTransactionStatus(status: string | null | undefined, t: any) {
  const normalized = status?.toUpperCase()
  if (normalized === "VERIFIED")
    return t("transactionStatuses.VERIFIED", "Đã xác nhận")
  if (normalized === "REJECTED")
    return t("transactionStatuses.REJECTED", "Đã từ chối")
  if (normalized === "PENDING_REVIEW")
    return t("transactionStatuses.PENDING_REVIEW", "Chờ duyệt")
  return status ?? "-"
}

export function getStatusBadgeClass(status?: string | null) {
  const normalized = status?.toUpperCase()
  switch (normalized) {
    case "VERIFIED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
    case "PENDING_REVIEW":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800/60"
    case "REJECTED":
      return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDebtStatus(status: string | null | undefined, t: any) {
  const normalized = status?.toUpperCase()
  if (normalized === "PAID") return t("debtStatuses.PAID", "Đã thanh toán")
  if (normalized === "PARTIALLY_PAID")
    return t("debtStatuses.PARTIALLY_PAID", "Thanh toán một phần")
  if (normalized === "UNPAID")
    return t("debtStatuses.UNPAID", "Chưa thanh toán")
  if (normalized === "OVERPAID")
    return t("debtStatuses.OVERPAID", "Thanh toán dư")
  return status ?? "-"
}

function getDebtStatusBadgeClass(status?: string | null) {
  const normalized = status?.toUpperCase()
  switch (normalized) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
    case "PARTIALLY_PAID":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800/60"
    case "UNPAID":
      return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60"
    case "OVERPAID":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
  }
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
  className,
  valueClassName,
}: {
  title: string
  value: string
  description: React.ReactNode
  className?: string
  valueClassName?: string
}) {
  return (
    <Card className={cn("group-feature-root", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${valueClassName || "text-emerald-600 dark:text-emerald-400"}`}
        >
          {value}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
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
  currentUserRole,
  groupStatus,
}: {
  groupId: string
  members: Member[]
  currentUserId: string
  currentUserRole: string | null
  groupStatus?: string | null
}) {
  const { t } = useGroupsTranslation()
  const activeTab = useGroupDetailActiveTab()
  const normalizedRole = currentUserRole?.toLowerCase() ?? ""
  const isOwner = normalizedRole === "owner"
  const canManage = !isArchivedGroup(groupStatus) && normalizedRole === "owner"

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

  const rawMembers = membersQuery.data
  const resolvedMembers: Member[] = Array.isArray(rawMembers)
    ? rawMembers
    : rawMembers &&
        typeof rawMembers === "object" &&
        "data" in rawMembers &&
        Array.isArray((rawMembers as Record<string, unknown>).data)
      ? ((rawMembers as Record<string, unknown>).data as Member[])
      : []

  if (!isFinanceActive) {
    return (
      <Card className="mt-6 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>{t("finance.title")}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("finance.generalOverview", "Tổng quan tài chính nhóm.")}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            {t("finance.openTabNotice", "Mở tab Thu chi để tải dữ liệu.")}
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
            <CardTitle>{t("finance.title")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {canManage
                ? t(
                    "finance.manageDesc",
                    "Tổng quan tài chính, giao dịch và khoản nợ của nhóm."
                  )
                : t(
                    "finance.viewDesc",
                    "Theo dõi các khoản nợ và gửi thông tin thanh toán của bạn."
                  )}
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
          <p className="text-sm text-muted-foreground">
            {t("finance.loadingSummary", "Đang tải tổng quan...")}
          </p>
        ) : summaryQuery.isError ? (
          <ErrorSection
            title={t("finance.loadSummaryError", "Lỗi tải tổng quan")}
            message={getQueryErrorMessage(
              summaryQuery.error,
              t("errors.defaultError", "Thử lại sau.")
            )}
          />
        ) : summary && isOwner ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                title={t("finance.totalSpent", "Tổng chi tiêu")}
                value={formatCurrency(summary.totalExpense)}
                description={
                  <span>
                    {t("finance.netBalancePrefix", "Cân đối: ")}
                    <span
                      className={
                        summary.netBalance > 0
                          ? "font-semibold text-emerald-600 dark:text-emerald-400"
                          : summary.netBalance < 0
                            ? "font-semibold text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                      }
                    >
                      {formatCurrency(summary.netBalance)}
                    </span>
                  </span>
                }
                className=""
                valueClassName="text-emerald-600 dark:text-emerald-400"
              />
              <SummaryCard
                title={t("finance.totalCollected", "Tổng đã thu")}
                value={formatCurrency(summary.totalCollected)}
                description={`${t("finance.pendingReviewPrefix", "Chờ duyệt: ")}${formatCurrency(summary.totalExpectedRevenue - summary.totalCollected)}`}
                className=""
                valueClassName="text-emerald-600 dark:text-emerald-400"
              />
              <SummaryCard
                title={t("finance.debtOutstanding", "Còn nợ")}
                value={formatCurrency(summary.outstandingAmount)}
                description={`${t("finance.expectedRevenuePrefix", "Kỳ vọng thu: ")}${formatCurrency(summary.totalExpectedRevenue)}`}
                className=""
                valueClassName="text-rose-600 dark:text-rose-400"
              />
            </div>

            <div className="rounded-lg border bg-muted/20 p-4">
              <h4 className="mb-3 text-sm font-semibold">
                {t("finance.monthlyStats", "Thống kê tháng")}
              </h4>
              <div
                className={`grid gap-4 sm:grid-cols-3 ${isOwner ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}
              >
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    {t("finance.totalCollected", "Tổng thu")}
                  </p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(monthlyStats.totalCollected)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    {t("finance.totalSpent", "Tổng chi")}
                  </p>
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(monthlyStats.totalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    {t("finance.netBalance", "Chênh lệch")}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      monthlyStats.difference > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : monthlyStats.difference < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {formatCurrency(monthlyStats.difference)}
                  </p>
                </div>
                {isOwner && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">
                        {t("finance.debtorsCount", "Thành viên nợ")}
                      </p>
                      <p className="text-lg font-bold">
                        {monthlyStats.debtorsCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">
                        {t("finance.overpayersCount", "Đóng dư")}
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
              <TabsTrigger value="transactions">
                {t("finance.tabTransactions", "Giao dịch")}
              </TabsTrigger>
            )}
            <TabsTrigger value="my-debt">
              {t("finance.tabMyDebt", "Nợ của tôi")}
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="member-debts">
                {t("finance.tabMemberDebts", "Nợ thành viên")}
              </TabsTrigger>
            )}
            <TabsTrigger value="expenses">
              {t("finance.tabExpenses", "Khoản chi")}
            </TabsTrigger>
            <TabsTrigger value="credits">
              {t("finance.tabCredits", "Tín dụng")}
            </TabsTrigger>
          </TabsList>

          {canManage && (
            <TabsContent value="transactions" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ minWidth: "150px", width: "20%" }}>
                        {t("members")}
                      </TableHead>
                      <TableHead style={{ width: "10%" }}>
                        {t("finance.amount", "Số tiền")}
                      </TableHead>
                      <TableHead style={{ width: "10%" }}>
                        {t("finance.sentDate", "Ngày gửi")}
                      </TableHead>
                      <TableHead style={{ width: "10%" }}>
                        {t("finance.status", "Trạng thái")}
                      </TableHead>
                      <TableHead style={{ width: "10%" }}>
                        {t("finance.receipt", "Chứng từ")}
                      </TableHead>
                      <TableHead style={{ width: "10%" }} />
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
                            variant="secondary"
                            className={getStatusBadgeClass(tx.status)}
                          >
                            {formatTransactionStatus(tx.status, t)}
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
                          {t(
                            "finance.noTransactions",
                            "Chưa có giao dịch nào."
                          )}
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
                  title={t("finance.totalRequired", "Tổng phải đóng")}
                  value={formatCurrency(myDebtQuery.data.totalRequired)}
                  description={t(
                    "finance.totalRequiredDesc",
                    "Tổng các khoản chi được phân bổ"
                  )}
                />
                <SummaryCard
                  title={t("finance.totalPaid", "Đã thanh toán")}
                  value={formatCurrency(myDebtQuery.data.totalPaid)}
                  description={t(
                    "finance.totalPaidDesc",
                    "Tổng số tiền bạn đã đóng"
                  )}
                />
                <SummaryCard
                  title={t("finance.currentDebt", "Công nợ hiện tại")}
                  value={formatCurrency(myDebtQuery.data.debt)}
                  description={t(
                    "finance.currentDebtDesc",
                    "Số tiền còn phải thanh toán"
                  )}
                />
                <SummaryCard
                  title={t("finance.netBalance", "Chênh lệch")}
                  value={formatCurrency(myDebtQuery.data.netBalance)}
                  description={t(
                    "finance.netBalanceDesc",
                    "Số dư tài chính của bạn"
                  )}
                />
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: "20%" }}>
                      {t("finance.expense", "Khoản chi")}
                    </TableHead>
                    <TableHead style={{ width: "10%" }}>
                      {t("finance.guestFee", "Phí khách")}
                    </TableHead>
                    <TableHead style={{ width: "10%" }}>
                      {t("finance.requiredAmount", "Phải đóng")}
                    </TableHead>
                    <TableHead style={{ width: "10%" }}>
                      {t("finance.paidAmount", "Đã đóng")}
                    </TableHead>
                    <TableHead style={{ width: "10%" }}>
                      {t("finance.debtAmount", "Còn nợ")}
                    </TableHead>
                    <TableHead style={{ width: "10%" }}>
                      {t("finance.status", "Trạng thái")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myDebtQuery.data?.unpaidPayments?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate">
                            {item.expenseTitle}
                          </span>
                          {item.isGuestPayment && (
                            <Badge
                              variant="outline"
                              className="h-5 text-[10px]"
                            >
                              {t("finance.guestBadge", "Khách: {{name}}", {
                                name: item.guestName ?? "N/A",
                              })}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.guestCount && item.guestCount > 0 ? (
                          <div className="flex flex-row items-baseline gap-0.5">
                            <span className="text-sm font-semibold">
                              {formatCurrency(item.guestFee || 0)}
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              {t("finance.guestCount", "{{count}} khách", {
                                count: item.guestCount,
                              })}
                            </span>
                          </div>
                        ) : item.isGuestPayment ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              {t("finance.guestCount", "{{count}} khách", {
                                count: 1,
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(item.requiredFee)}</TableCell>
                      <TableCell className="text-success">
                        {formatCurrency(item.amountPaid)}
                      </TableCell>
                      <TableCell className="font-medium text-destructive">
                        {formatCurrency(item.debt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getDebtStatusBadgeClass(item.status)}
                        >
                          {formatDebtStatus(item.status, t)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!myDebtQuery.data?.unpaidPayments?.length && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        {t("finance.noDebts", "Không có khoản công nợ nào.")}
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
                      title={t("finance.totalDebtors", "Tổng số người đang nợ")}
                      value={String(
                        statsDebts.filter((d) => d.debt > 0).length
                      )}
                      description={t(
                        "finance.totalDebtorsDesc",
                        "Thành viên chưa thanh toán đủ"
                      )}
                    />
                    <SummaryCard
                      title={t("finance.totalDebtAmount", "Tổng tiền đang nợ")}
                      value={formatCurrency(
                        statsDebts.reduce(
                          (sum, d) => sum + (d.debt > 0 ? d.debt : 0),
                          0
                        )
                      )}
                      description={t(
                        "finance.totalDebtAmountDesc",
                        "Tổng công nợ còn tồn đọng"
                      )}
                    />
                    <SummaryCard
                      title={t(
                        "finance.totalUnpaidPayments",
                        "Tổng khoản chưa thanh toán"
                      )}
                      value={String(
                        statsDebts.reduce(
                          (sum, d) => sum + (d.unpaidPayments?.length ?? 0),
                          0
                        )
                      )}
                      description={t(
                        "finance.totalUnpaidPaymentsDesc",
                        "Số khoản chi chưa hoàn thành"
                      )}
                    />
                    <SummaryCard
                      title={t("finance.totalCredits", "Tổng credit dư")}
                      value={formatCurrency(
                        statsDebts.reduce(
                          (sum, d) =>
                            sum + (d.creditBalance > 0 ? d.creditBalance : 0),
                          0
                        )
                      )}
                      description={t(
                        "finance.totalCreditsDesc",
                        "Thành viên đóng vượt mức"
                      )}
                    />
                  </div>
                )}

              {/* Search */}
              <div className="flex max-w-sm items-center gap-2">
                <div className="relative w-full">
                  <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t(
                      "finance.searchMembersPlaceholder",
                      "Tìm kiếm thành viên..."
                    )}
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
                  {t("finance.loadingDebts", "Đang tải dữ liệu công nợ...")}
                </div>
              ) : groupDebtsQuery.isError ? (
                <ErrorSection
                  title={t("finance.loadDebtsError", "Lỗi tải dữ liệu")}
                  message={getQueryErrorMessage(
                    groupDebtsQuery.error,
                    t("errors.defaultError", "Thử lại sau.")
                  )}
                />
              ) : !groupDebtsQuery.data?.data?.length ? (
                <div className="rounded-md border bg-muted/5 py-10 text-center text-muted-foreground">
                  {t(
                    "finance.noDebtsFound",
                    "Không tìm thấy thông tin công nợ nào."
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {groupDebtsQuery.data.data.map((item) => {
                    const isExpanded = expandedUsers.includes(item.userId)
                    const statusText =
                      item.debt > 0
                        ? t("finance.debtText", "Nợ {{amount}}", {
                            amount: formatCurrency(item.debt),
                          })
                        : item.creditBalance > 0
                          ? t("finance.creditText", "Dư {{amount}}", {
                              amount: formatCurrency(item.creditBalance),
                            })
                          : t("finance.paidText", "Đã thanh toán")
                    const debtStatus =
                      item.debt > 0
                        ? "UNPAID"
                        : item.creditBalance > 0
                          ? "OVERPAID"
                          : "PAID"

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
                            <Badge
                              variant="outline"
                              className={getDebtStatusBadgeClass(debtStatus)}
                            >
                              {statusText}
                            </Badge>
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
                            <p className="text-sm font-semibold">
                              {t("finance.requiredAmount", "Phải đóng")}
                            </p>
                            <p className="text-sm font-semibold">
                              {formatCurrency(item.totalRequired)}
                            </p>
                          </div>
                          <div className="bg-card px-4 py-2.5">
                            <p className="text-sm font-semibold">
                              {t("finance.paidAmount", "Đã đóng")}
                            </p>
                            <p className="text-sm font-semibold">
                              {formatCurrency(item.totalPaid)}
                            </p>
                          </div>
                          <div className="bg-card px-4 py-2.5">
                            <p className="text-sm font-semibold">
                              {t("finance.creditBalance", "Credit dư")}
                            </p>
                            <p className="text-sm font-semibold">
                              {formatCurrency(item.creditBalance)}
                            </p>
                          </div>
                          <div className="bg-card px-4 py-2.5">
                            <p className="text-sm font-semibold">
                              {t("finance.netBalance", "Cân đối")}
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
                                    {t("finance.hideDetails", "Ẩn chi tiết")}
                                    <ChevronUp className="size-3.5" />
                                  </>
                                ) : (
                                  <>
                                    {t(
                                      "finance.showDetails",
                                      "Xem chi tiết ({{count}} khoản)",
                                      { count: item.unpaidPayments.length }
                                    )}
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
                                      {t(
                                        "finance.expenseName",
                                        "Tên khoản chi"
                                      )}
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      {t("finance.guestFee", "Phí khách")}
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      {t(
                                        "finance.requiredAmount",
                                        "Số cần đóng"
                                      )}
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      {t("finance.paidAmount", "Đã đóng")}
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      {t("finance.debtAmount", "Còn nợ")}
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      {t("finance.status", "Trạng thái")}
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      {t("finance.createdDate", "Ngày tạo")}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {item.unpaidPayments &&
                                  item.unpaidPayments.length > 0 ? (
                                    item.unpaidPayments.map((payment) => (
                                      <TableRow key={payment.id}>
                                        {/* Expense title */}
                                        <TableCell className="text-sm font-medium">
                                          <div className="flex items-center gap-2">
                                            <span>{payment.expenseTitle}</span>
                                            {payment.isGuestPayment && (
                                              <Badge
                                                variant="outline"
                                                className="h-5 text-[10px]"
                                              >
                                                {t(
                                                  "finance.guestBadge",
                                                  "Khách: {{name}}",
                                                  {
                                                    name:
                                                      payment.guestName ??
                                                      "N/A",
                                                  }
                                                )}
                                              </Badge>
                                            )}
                                          </div>
                                        </TableCell>
                                        {/* Guest fee */}
                                        <TableCell>
                                          {payment.guestCount &&
                                          payment.guestCount > 0 ? (
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                {t(
                                                  "finance.guestCount",
                                                  "{{count}} khách",
                                                  { count: payment.guestCount }
                                                )}
                                              </span>
                                              <span className="text-[10px] text-muted-foreground">
                                                (
                                                {formatCurrency(
                                                  payment.guestFee || 0
                                                )}
                                                )
                                              </span>
                                            </div>
                                          ) : payment.isGuestPayment ? (
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                {t(
                                                  "finance.guestCount",
                                                  "{{count}} khách",
                                                  { count: 1 }
                                                )}
                                              </span>
                                            </div>
                                          ) : (
                                            <span className="text-xs text-muted-foreground">
                                              —
                                            </span>
                                          )}
                                        </TableCell>
                                        {/* Required fee */}
                                        <TableCell className="text-sm font-semibold">
                                          {formatCurrency(payment.requiredFee)}
                                        </TableCell>
                                        {/* Amount paid */}
                                        <TableCell className="text-sm font-semibold">
                                          {formatCurrency(payment.amountPaid)}
                                        </TableCell>
                                        {/* Debt */}
                                        <TableCell className="text-sm font-semibold text-destructive tabular-nums">
                                          {formatCurrency(payment.debt)}
                                        </TableCell>
                                        {/* Status */}
                                        <TableCell>
                                          <Badge
                                            variant="outline"
                                            className={getDebtStatusBadgeClass(
                                              payment.status
                                            )}
                                          >
                                            {formatDebtStatus(
                                              payment.status,
                                              t
                                            )}
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
                                        colSpan={7}
                                        className="py-6 text-center text-sm text-muted-foreground"
                                      >
                                        {t(
                                          "finance.noDebts",
                                          "Không có khoản nợ nào."
                                        )}
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
                          {t("pagination.previous")}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {t(
                            "pagination.pageInfo",
                            "Trang {{currentPage}} / {{totalPages}}",
                            {
                              currentPage: page,
                              totalPages: groupDebtsQuery.data.meta.totalPages,
                            }
                          )}
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
                          {t("pagination.next")}
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
                    <TableHead>
                      {t("finance.expenseName", "Tên khoản chi")}
                    </TableHead>
                    <TableHead>{t("finance.amount", "Số tiền")}</TableHead>
                    <TableHead>
                      {t("finance.expenseDate", "Ngày chi")}
                    </TableHead>
                    <TableHead>{t("finance.createdBy", "Người tạo")}</TableHead>
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
                        {t("finance.noExpenses", "Chưa có khoản chi nào.")}
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
                  {t(
                    "finance.noCredits",
                    "Không có thành viên nào có số dư tín dụng."
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
